const fs = require('fs');
const file = 'src/WIP Gamified Design Showcase.jsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  'import { useState, useEffect, useRef } from "react";',
  'import { useState, useEffect, useRef } from "react";\nimport { useAuth } from "./hooks/useAuth";'
);

code = code.replace(
  'const [viewProfile, setViewProfile] = useState(null);',
  'const [viewProfile, setViewProfile] = useState(null);\n  const { user, profile, isLoggedIn, signUp, signIn, signOut, authLoading, authError, clearError } = useAuth();'
);

code = code.replace(
  '<button className="nav-cta">Sign Up</button>',
  '{isLoggedIn ? <button className="nav-cta" onClick={signOut}>{profile?.display_name || "You"}</button> : <button className="nav-cta">Sign Up</button>}'
);

fs.writeFileSync(file, code);
console.log('Done! 3 changes applied.');
