import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

async function ensureProfile(user) {
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  if (existing) return

  const username =
    user.user_metadata?.username ||
    user.email?.split('@')[0]?.replace(/[^a-z0-9_]/gi, '_') ||
    `designer_${user.id.slice(0, 6)}`

  await supabase.from('profiles').insert({
    id:           user.id,
    email:        user.email,
    username,
    display_name: user.user_metadata?.full_name || username,
    avatar_url:   user.user_metadata?.avatar_url || null,
    is_pro:       false,
    streak:       0,
    created_at:   new Date().toISOString(),
  })
}

export function useAuth() {
  const [user,        setUser]        = useState(null)
  const [profile,     setProfile]     = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError,   setAuthError]   = useState(null)

  const loadProfile = useCallback(async (authUser) => {
    if (!authUser) { setProfile(null); return }
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single()
    setProfile(data || null)
  }, [])

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      const authUser = session?.user ?? null
      setUser(authUser)
      loadProfile(authUser).finally(() => setLoading(false))
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const authUser = session?.user ?? null
        setUser(authUser)
        if (authUser) await ensureProfile(authUser)
        await loadProfile(authUser)
      }
    )
    return () => { mounted = false; subscription.unsubscribe() }
  }, [loadProfile])

  const signUp = useCallback(async ({ email, password, username }) => {
    setAuthLoading(true); setAuthError(null)
    try {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { username }, emailRedirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) throw error
      if (data.user && !data.session) return { needsConfirmation: true }
      return { success: true }
    } catch (err) {
      const msg = err.message || 'Sign up failed'
      setAuthError(msg); return { error: msg }
    } finally { setAuthLoading(false) }
  }, [])

  const signIn = useCallback(async ({ email, password }) => {
    setAuthLoading(true); setAuthError(null)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      return { success: true }
    } catch (err) {
      const msg = err.message || 'Sign in failed'
      setAuthError(msg); return { error: msg }
    } finally { setAuthLoading(false) }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null); setProfile(null)
  }, [])

  const updateProfile = useCallback(async (updates) => {
    if (!user) return { error: 'Not logged in' }
    const { data, error } = await supabase
      .from('profiles').update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id).select().single()
    if (error) return { error: error.message }
    setProfile(data)
    return { success: true, profile: data }
  }, [user])

  return {
    user, profile, loading, authLoading, authError,
    isLoggedIn: !!user,
    signUp, signIn, signOut, updateProfile,
    clearError: () => setAuthError(null),
  }
}
