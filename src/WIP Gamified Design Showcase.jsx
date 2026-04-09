import { useState, useEffect, useRef } from "react";
import { useAuth } from "./hooks/useAuth";
import { supabase } from "./lib/supabase";

// ── FONTS ─────────────────────────────────────────────────────────────────────
(() => {
  const l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800;900&family=IBM+Plex+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Syne:wght@700;800&display=swap";
  document.head.appendChild(l);
})();

// ── DATA ──────────────────────────────────────────────────────────────────────
const USERS = {
  "maya.renders":   { name:"Maya Chen",       bio:"Brand + packaging. Ex-IDEO. Based in LA.",        tags:["packaging","branding"],    color:"#8B00FF", joined:"Jan 2025", completions:24, wins:3 },
  "coldtype.co":    { name:"James Kowalski",   bio:"Type-obsessed. Making things ugly on purpose.",    tags:["typography","editorial"],   color:"#FF2D55", joined:"Feb 2025", completions:18, wins:1 },
  "studio_noa":     { name:"Noa Bergström",    bio:"Stockholm-based UI/UX + motion.",                  tags:["UI/UX","motion"],           color:"#00C8FF", joined:"Dec 2024", completions:31, wins:5 },
  "jxnbrennan":     { name:"Jackson Brennan",  bio:"Lettering + illustration. Freelance since 2019.",  tags:["lettering","illustration"], color:"#F5C842", joined:"Mar 2025", completions:11, wins:0 },
  "freeform.lab":   { name:"Priya Anand",      bio:"Product design lead. Moonlighting on WIP.",        tags:["product","UI/UX"],          color:"#FF9500", joined:"Nov 2024", completions:42, wins:7 },
  "tinderbox_st":   { name:"Sam Tinder",       bio:"Print and digital. Swiss grid forever.",           tags:["print","grid"],             color:"#4CAF50", joined:"Apr 2025", completions:9,  wins:0 },
  "rolo.design":    { name:"Rolo Vasquez",     bio:"Motion + branding. Mexico City.",                  tags:["motion","brand"],           color:"#FF2D55", joined:"Jan 2025", completions:20, wins:2 },
  "papertrail_":    { name:"Ines Dubois",      bio:"Systemic design. Not afraid of white space.",      tags:["systems","minimal"],        color:"#E0D7FF", joined:"Feb 2025", completions:15, wins:1 },
  "kode.visual":    { name:"Kai Delacroix",    bio:"Code + design. Building things that move.",        tags:["interactive","motion"],     color:"#00FF88", joined:"Mar 2025", completions:28, wins:4 },
  "blunt.studio":   { name:"Amara Osei",       bio:"Bold. Loud. On purpose. Accra → London.",          tags:["branding","editorial"],     color:"#FF9500", joined:"Dec 2024", completions:33, wins:6 },
};

const GALLERY_ITEMS = [
  { id:1,  user:"maya.renders",  brief:"Punk Beer Can",              time:"1 hour",  diff:"medium", likes:214, tags:["packaging","punk"],        color:"#8B00FF", accentBg:"#1A0030" },
  { id:2,  user:"coldtype.co",   brief:"The Bank That Hates Banks",  time:"4 hours", diff:"hard",   likes:89,  tags:["UI/UX","fintech"],          color:"#FF2D55", accentBg:"#200010" },
  { id:3,  user:"studio_noa",    brief:"Jazz x Metal",               time:"1 hour",  diff:"hard",   likes:441, tags:["album art","music"],        color:"#F0EDE6", accentBg:"#1A1A1A" },
  { id:4,  user:"jxnbrennan",    brief:"Good Morning, Sunshine",     time:"15 min",  diff:"easy",   likes:176, tags:["sticker","illustration"],   color:"#F5C842", accentBg:"#201800" },
  { id:5,  user:"freeform.lab",  brief:"Build a World",              time:"1 day",   diff:"insane", likes:832, tags:["campaign","branding"],      color:"#FF9500", accentBg:"#1E1000" },
  { id:6,  user:"tinderbox_st",  brief:"Ethical Chaos",              time:"15 min",  diff:"insane", likes:55,  tags:["logo","tech"],              color:"#00FF88", accentBg:"#001A0E" },
  { id:7,  user:"rolo.design",   brief:"Summer in a Can",            time:"1 hour",  diff:"easy",   likes:303, tags:["packaging","summer"],       color:"#F5C842", accentBg:"#201800" },
  { id:8,  user:"papertrail_",   brief:"Therapy for the Terminally Online", time:"4 hours", diff:"medium", likes:127, tags:["UI/UX","health"], color:"#E0D7FF", accentBg:"#12103A" },
  { id:9,  user:"kode.visual",   brief:"App Icon Sprint",            time:"15 min",  diff:"medium", likes:98,  tags:["icon","app"],               color:"#00C8FF", accentBg:"#001E28" },
  { id:10, user:"blunt.studio",  brief:"Rise & Bake",                time:"4 hours", diff:"easy",   likes:274, tags:["branding","food"],          color:"#FF9500", accentBg:"#1E1000" },
  { id:11, user:"maya.renders",  brief:"Warm Goodbye",               time:"15 min",  diff:"hard",   likes:389, tags:["wordmark","typography"],    color:"#C4A882", accentBg:"#1A1208" },
  { id:12, user:"studio_noa",    brief:"Luxury from the Gutter",     time:"1 day",   diff:"hard",   likes:601, tags:["e-commerce","fashion"],     color:"#E8E0D8", accentBg:"#141414" },
  { id:13, user:"freeform.lab",  brief:"Plants by Drone",            time:"1 day",   diff:"medium", likes:445, tags:["pitch deck","startup"],     color:"#7AB87A", accentBg:"#0A1A0A" },
  { id:14, user:"kode.visual",   brief:"The Impossible Brief",       time:"1 hour",  diff:"insane", likes:711, tags:["branding","contradiction"], color:"#FF2D55", accentBg:"#200010" },
  { id:15, user:"blunt.studio",  brief:"Corner Store Dreams",        time:"1 day",   diff:"easy",   likes:192, tags:["branding","retail"],        color:"#E8D5C4", accentBg:"#1A1208" },
  { id:16, user:"coldtype.co",   brief:"Ethical Chaos",              time:"15 min",  diff:"insane", likes:330, tags:["logo","paradox"],           color:"#FFCC00", accentBg:"#1A1600" },
  { id:17, user:"rolo.design",   brief:"Jazz x Metal",               time:"1 hour",  diff:"hard",   likes:258, tags:["album art","typography"],   color:"#FF2D55", accentBg:"#200010" },
  { id:18, user:"papertrail_",   brief:"The Impossible Party",       time:"4 hours", diff:"insane", likes:147, tags:["branding","political"],     color:"#4A7C59", accentBg:"#0A120E" },
  { id:19, user:"jxnbrennan",    brief:"App Icon Sprint",            time:"15 min",  diff:"medium", likes:83,  tags:["icon","illustration"],      color:"#7C5CBF", accentBg:"#12083A" },
  { id:20, user:"maya.renders",  brief:"Rise & Bake",                time:"4 hours", diff:"easy",   likes:160, tags:["branding","food"],          color:"#E87722", accentBg:"#200E00" },
];

const ACTIVE_CHALLENGES = [
  { user:"rolo.design",   brief:"Punk Beer Can",           diff:"medium", time:"1 hour",  elapsed:2340, total:3600,  watchers:14 },
  { user:"kode.visual",   brief:"Build a World",           diff:"insane", time:"1 day",   elapsed:28800,total:86400, watchers:31 },
  { user:"papertrail_",   brief:"App Icon Sprint",         diff:"medium", time:"15 min",  elapsed:540,  total:900,   watchers:7  },
  { user:"blunt.studio",  brief:"Luxury from the Gutter",  diff:"hard",   time:"1 day",   elapsed:14400,total:86400, watchers:22 },
  { user:"jxnbrennan",    brief:"Good Morning, Sunshine",  diff:"easy",   time:"15 min",  elapsed:300,  total:900,   watchers:3  },
  { user:"coldtype.co",   brief:"Jazz x Metal",            diff:"hard",   time:"1 hour",  elapsed:1800, total:3600,  watchers:19 },
];

// Playoff bracket — 8 competitors, 3 rounds
const BRACKET = {
  brief: "PUNK BEER CAN — Craft IPA 'Static Noise' · Must use purple · Punk aesthetic",
  sponsor: "Dribbble",
  prize: "$500 Dribbble Pro + Feature",
  rounds: [
    {
      name: "Round of 8",
      matches: [
        { id:"m1", a:{ user:"freeform.lab", score:null, voted:false }, b:{ user:"blunt.studio",  score:null, voted:false }, winner:null },
        { id:"m2", a:{ user:"studio_noa",   score:null, voted:false }, b:{ user:"kode.visual",   score:null, voted:false }, winner:null },
        { id:"m3", a:{ user:"maya.renders", score:null, voted:false }, b:{ user:"rolo.design",   score:null, voted:false }, winner:null },
        { id:"m4", a:{ user:"coldtype.co",  score:null, voted:false }, b:{ user:"papertrail_",   score:null, voted:false }, winner:null },
      ]
    },
    {
      name: "Semifinals",
      matches: [
        { id:"m5", a:null, b:null, winner:null },
        { id:"m6", a:null, b:null, winner:null },
      ]
    },
    {
      name: "Final",
      matches: [
        { id:"m7", a:null, b:null, winner:null },
      ]
    }
  ]
};

const TOTAL_SECS = { "15 min":900, "1 hour":3600, "4 hours":14400, "1 day":86400 };
const DIFF_COLORS = { easy:"#4CAF50", medium:"#FF9500", hard:"#FF2D55", insane:"#8B00FF" };

const BRIEFS = {
  "15 min":{ easy:{ title:"Good Morning, Sunshine", prompt:"Design a sticker for a cozy coffee cart called 'Still Waking Up.' Think sleepy but lovable. Single color preferred.", tags:["sticker","illustration"], moodboard:["#F5C842","#3D1C02","#F0EDE6","#E8A230"], hint:"One strong shape reads better than a dozen details at small size." }, medium:{ title:"App Icon Sprint", prompt:"Design an app icon for a meditation app called 'Drift' targeting teenagers. Calm but not boring. No lotus flowers. No gradients.", tags:["icon","app","branding"], moodboard:["#1A1A2E","#E0D7FF","#7C5CBF","#F0EDE6"], hint:"Teenagers are allergic to 'wellness' clichés. Think unexpected." }, hard:{ title:"Warm Goodbye", prompt:"Create a wordmark for a funeral home called 'Passage.' Genuinely warm and human — not clinical, not grim. No doves, no hands, no candles.", tags:["wordmark","typography"], moodboard:["#E8DDD0","#6B5B4E","#2C2016","#C4A882"], hint:"The hardest design challenge: make death feel like a hug." }, insane:{ title:"Ethical Chaos", prompt:"Logo for 'Ethics AI.' Must feel simultaneously trustworthy AND chaotic. Ethics should feel thrilling, not boring. No shields. No checkmarks.", tags:["logo","tech","paradox"], moodboard:["#FF2D55","#0D0D0D","#F0EDE6","#00FF88"], hint:"Contradiction IS the concept. Lean into the tension." } },
  "1 hour":{ easy:{ title:"Summer in a Can", prompt:"Beer can label for a session lager called 'Slow Burn.' Crack-open-at-3pm-Saturday energy. Warm, unhurried, golden.", tags:["packaging","beverage"], moodboard:["#F5C842","#E87722","#2C1810","#F0EDE6"], hint:"The best beer labels feel like a place, not a product." }, medium:{ title:"Punk Beer Can", prompt:"Beer can label for a craft IPA called 'Static Noise.' Aggressively punk. Must use at least one shade of purple. Made in a basement, not a boardroom.", tags:["packaging","punk"], moodboard:["#2D0045","#FF2D55","#F0EDE6","#8B00FF"], hint:"Punk has a specific kind of anger. Find the right flavor." }, hard:{ title:"Jazz x Metal", prompt:"Album cover for jazz-metal fusion band 'Dissonance Club.' Miles Davis meets Slayer. Must work in B&W first. No skulls. No saxophones.", tags:["album art","music"], moodboard:["#0D0D0D","#F0EDE6","#FF2D55","#1A1A1A"], hint:"Great album covers feel like a world, not decoration." }, insane:{ title:"The Impossible Brief", prompt:"Brand a vegan steakhouse called 'Blood & Soil.' Make carnivores want to eat there. No apologies. They shouldn't realize it's vegan until they sit down.", tags:["branding","food"], moodboard:["#8B1A1A","#2C1A0E","#F0EDE6","#D4A853"], hint:"Fully commit to the carnivore aesthetic. Don't hedge." } },
  "4 hours":{ easy:{ title:"Rise & Bake", prompt:"Brand identity for 'Golden Hour Bakery.' Logo, color palette, 3 social templates. Warm, local, artisanal but not pretentious.", tags:["branding","food"], moodboard:["#F5C842","#E87722","#3D2B1F","#F5EDE0"], hint:"Every bakery brand looks the same. Find what makes Golden Hour different." }, medium:{ title:"Therapy for the Terminally Online", prompt:"Landing page + 2-3 app screens for 'Untangle,' an AI therapy app for Gen Z. Must feel safe and real. Not slick, not corporate.", tags:["UI/UX","health tech"], moodboard:["#E8E0F0","#6B5B9E","#2C1A3E","#F0EDE6"], hint:"Every design choice carries emotional weight here." }, hard:{ title:"The Bank That Hates Banks", prompt:"Mobile banking app 'VAULT.' Anti-bank positioning. No fees, no corporate speak. UI should feel like a tool for people pissed off at traditional finance.", tags:["UI/UX","fintech"], moodboard:["#000000","#F0EDE6","#FF2D55","#FFCC00"], hint:"What does 'honest' look like in a UI? Strip everything that obscures." }, insane:{ title:"The Impossible Party", prompt:"Visual identity for political party 'The Pragmatists.' Must appeal equally to fiscal conservatives AND social progressives. No red, no blue.", tags:["branding","political"], moodboard:["#2C2C2C","#F0EDE6","#4A7C59","#8B6914"], hint:"The word 'pragmatist' is doing a lot of work. Make it do ALL the work." } },
  "1 day":{ easy:{ title:"Corner Store Dreams", prompt:"Complete brand identity for 'Dog-Eared Books.' Logo, color system, tote bag, loyalty card, window display poster. Lived-in, literary, slightly chaotic.", tags:["branding","print","retail"], moodboard:["#2C1A0E","#F5EDE0","#8B4513","#C4A882"], hint:"Independent bookstores have a specific smell. Your design should too." }, medium:{ title:"Plants by Drone", prompt:"Full pitch deck (10-15 slides) for 'Canopy' — startup that delivers live plants by drone. Investors are skeptical. Make them feel the emotional and commercial pull.", tags:["pitch deck","startup"], moodboard:["#1A2C1A","#7AB87A","#F0EDE6","#D4E8D4"], hint:"Pitch decks are a performance genre. Every slide must earn attention." }, hard:{ title:"Luxury from the Gutter", prompt:"E-commerce experience for luxury streetwear brand 'REMNANT.' High-end fashion that looks like it survived something. Homepage, product page, cart, mobile.", tags:["e-commerce","fashion"], moodboard:["#0D0D0D","#E8E0D8","#8B7355","#C4B8A8"], hint:"Hold the tension between aspiration and alienation." }, insane:{ title:"Build a World", prompt:"Invent a product that doesn't exist. Name it. Design its full campaign: logo, brand system, homepage hero, two billboards, three social posts. The product must solve a problem no one has articulated yet.", tags:["campaign","invention"], moodboard:["#FF2D55","#0D0D0D","#F0EDE6","#FF9500","#00C8FF"], hint:"The hardest part isn't the design. It's the idea." } },
};

const TIME_OPTIONS = [{ label:"15 min",sub:"Quick fire"},{ label:"1 hour",sub:"Focus sprint"},{ label:"4 hours",sub:"Half session"},{ label:"1 day",sub:"Deep work"}];
const DIFF_OPTIONS = [{ key:"easy",label:"Easy",desc:"A clear brief. Room to breathe.",color:"#4CAF50"},{ key:"medium",label:"Medium",desc:"Some constraints. Interesting territory.",color:"#FF9500"},{ key:"hard",label:"Hard",desc:"Contradictions. Tight limits. High stakes.",color:"#FF2D55"},{ key:"insane",label:"Insane",desc:"May cause existential crisis. Results vary.",color:"#8B00FF"}];

// ── CSS ───────────────────────────────────────────────────────────────────────
(() => {
  const css = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:#0D0D0D;--sf:#141414;--s2:#1C1C1C;--s3:#222;
    --br:rgba(255,255,255,0.08);--br2:rgba(255,255,255,0.18);
    --tx:#F0EDE6;--dim:rgba(240,237,230,0.45);--gh:rgba(240,237,230,0.18);
    --red:#FF2D55;
    --fd:'Big Shoulders Display',sans-serif;
    --fm:'IBM Plex Mono',monospace;
    --fs:'Syne',sans-serif;
  }
  body{background:var(--bg)}
  @keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.2}}
  @keyframes blink{0%,49%{opacity:1}50%,100%{opacity:0}}
  @keyframes glitch{0%,88%,100%{transform:none;clip-path:none}89%{transform:translate(-2px,1px);clip-path:inset(20% 0 55% 0)}91%{transform:translate(2px,-1px);clip-path:inset(55% 0 20% 0)}93%{transform:none;clip-path:none}}
  @keyframes slam{0%{transform:scaleY(0);opacity:0}65%{transform:scaleY(1.05);opacity:1}100%{transform:scaleY(1);opacity:1}}
  @keyframes countIn{0%{opacity:0;transform:translateY(24px)}15%{opacity:1;transform:none}85%{opacity:1;transform:none}100%{opacity:0;transform:translateY(-24px)}}
  @keyframes liveFlash{0%,100%{opacity:1}50%{opacity:0.3}}
  @keyframes barGrow{from{width:0}to{width:var(--w)}}
  @keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}

  .wip{font-family:var(--fm);background:var(--bg);color:var(--tx);min-height:100vh;overflow-x:hidden}

  /* NAV */
  .nav{display:flex;align-items:center;justify-content:space-between;padding:0 28px;height:52px;border-bottom:1px solid var(--br);position:sticky;top:0;z-index:100;background:rgba(13,13,13,0.96);backdrop-filter:blur(20px)}
  .nav-logo{font-family:var(--fd);font-size:22px;font-weight:900;letter-spacing:0.2em;cursor:pointer;display:flex;align-items:center;gap:10px;color:var(--tx)}
  .nav-dot{width:7px;height:7px;border-radius:50%;background:var(--red);animation:pulse 2s ease-in-out infinite}
  .nav-r{display:flex;align-items:center;gap:22px}
  .nav-lnk{font-family:var(--fm);font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:var(--dim);background:none;border:none;cursor:pointer;transition:color .18s}
  .nav-lnk:hover,.nav-lnk.on{color:var(--tx)}
  .nav-cta{font-family:var(--fm);font-size:10px;letter-spacing:0.14em;text-transform:uppercase;background:var(--red);color:var(--tx);border:none;padding:7px 18px;cursor:pointer;transition:opacity .2s}
  .nav-cta:hover{opacity:.82}

  /* TICKER */
  .ticker{height:30px;background:#111;border-bottom:1px solid var(--br);overflow:hidden;display:flex;align-items:center}
  .tk-track{display:flex;white-space:nowrap;animation:ticker 38s linear infinite;font-size:9px;letter-spacing:0.2em;color:var(--gh)}
  .tk-item{padding:0 32px}
  .tk-dot{color:var(--red);margin-right:8px}

  /* BTNs */
  .btn-p{font-family:var(--fm);font-size:11px;letter-spacing:0.12em;text-transform:uppercase;background:var(--red);color:var(--tx);border:none;padding:13px 28px;cursor:pointer;transition:all .18s}
  .btn-p:hover{opacity:.85;transform:translateY(-1px)}
  .btn-p:disabled{opacity:.3;cursor:default;transform:none}
  .btn-g{font-family:var(--fm);font-size:11px;letter-spacing:0.12em;text-transform:uppercase;background:transparent;color:var(--dim);border:1px solid var(--br);padding:13px 28px;cursor:pointer;transition:all .18s}
  .btn-g:hover{border-color:var(--br2);color:var(--tx)}
  .btn-sm{font-family:var(--fm);font-size:10px;letter-spacing:0.12em;text-transform:uppercase;background:transparent;color:var(--dim);border:1px solid var(--br);padding:7px 14px;cursor:pointer;transition:all .18s}
  .btn-sm:hover{border-color:var(--br2);color:var(--tx)}

  /* HERO */
  .hero{padding:64px 32px 52px;border-bottom:1px solid var(--br);position:relative;overflow:hidden}
  .hero::after{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 50% 60% at 80% 40%,rgba(255,45,85,0.07),transparent);pointer-events:none}
  .hero-ey{font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:var(--dim);margin-bottom:18px}
  .hero-h1{font-family:var(--fd);font-size:clamp(68px,9.5vw,128px);font-weight:900;line-height:0.87;letter-spacing:0.01em;margin-bottom:28px;max-width:780px}
  .hero-h1 em{color:var(--red);font-style:normal;animation:glitch 7s ease-in-out infinite;display:inline-block}
  .hero-p{font-size:13px;line-height:1.75;color:var(--dim);max-width:440px;margin-bottom:40px}
  .hero-ctas{display:flex;gap:12px}
  .hero-stats{display:flex;gap:48px;margin-top:52px;padding-top:28px;border-top:1px solid var(--br)}
  .stat-n{font-family:var(--fd);font-size:44px;font-weight:900;line-height:1}
  .stat-l{font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:var(--dim);margin-top:4px}

  /* ACTIVE CHALLENGES */
  .ac-section{padding:48px 32px;border-bottom:1px solid var(--br)}
  .sec-hdr{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:32px}
  .sec-title{font-family:var(--fd);font-size:44px;font-weight:900;letter-spacing:0.04em}
  .sec-meta{font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:var(--dim)}
  .ac-list{display:flex;flex-direction:column;gap:0;border:1px solid var(--br)}
  .ac-row{display:flex;align-items:center;gap:0;border-bottom:1px solid var(--br);background:var(--sf);transition:background .18s;overflow:hidden;position:relative}
  .ac-row:last-child{border-bottom:none}
  .ac-row:hover{background:var(--s2)}
  .ac-bar-bg{position:absolute;left:0;top:0;bottom:0;background:rgba(255,45,85,0.04);transition:width 1s linear;z-index:0}
  .ac-inner{display:flex;align-items:center;width:100%;padding:16px 20px;gap:20px;position:relative;z-index:1}
  .ac-avatar{width:36px;height:36px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-family:var(--fs);font-size:13px;font-weight:700;color:#000}
  .ac-user-block{flex:0 0 140px}
  .ac-username{font-family:var(--fs);font-size:13px;font-weight:700;margin-bottom:2px}
  .ac-handle{font-size:9px;letter-spacing:0.14em;color:var(--dim);text-transform:uppercase}
  .ac-brief{flex:1;font-size:12px;color:rgba(240,237,230,0.7)}
  .ac-meta-row{display:flex;align-items:center;gap:14px;flex-shrink:0}
  .ac-diff-badge{font-size:9px;letter-spacing:0.14em;text-transform:uppercase;padding:3px 8px;border:1px solid;font-family:var(--fm)}
  .ac-time-block{font-size:10px;letter-spacing:0.1em;color:var(--dim);white-space:nowrap;font-variant-numeric:tabular-nums;min-width:64px;text-align:right}
  .ac-progress{width:80px;height:2px;background:var(--br);position:relative}
  .ac-progress-fill{position:absolute;left:0;top:0;bottom:0;background:var(--red)}
  .ac-watchers{font-size:10px;color:var(--dim);display:flex;align-items:center;gap:5px;white-space:nowrap}
  .ac-watch-btn{font-family:var(--fm);font-size:9px;letter-spacing:0.14em;text-transform:uppercase;background:transparent;color:var(--red);border:1px solid rgba(255,45,85,0.3);padding:5px 12px;cursor:pointer;transition:all .18s;white-space:nowrap}
  .ac-watch-btn:hover{background:rgba(255,45,85,0.08);border-color:var(--red)}
  .live-dot{width:6px;height:6px;border-radius:50%;background:var(--red);animation:liveFlash 1.2s ease-in-out infinite;flex-shrink:0}

  /* WATCH OVERLAY */
  .watch-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.95);z-index:500;display:flex;flex-direction:column;animation:fadeIn .25s ease}
  .watch-bar{height:48px;background:var(--bg);border-bottom:1px solid var(--br);display:flex;align-items:center;padding:0 20px;gap:14px}
  .watch-bar-title{font-family:var(--fs);font-size:13px;font-weight:700;flex:1}
  .watch-badge{font-size:9px;letter-spacing:0.16em;text-transform:uppercase;background:rgba(255,45,85,0.1);border:1px solid rgba(255,45,85,0.3);color:var(--red);padding:4px 10px;display:flex;align-items:center;gap:6px}
  .watch-close{font-family:var(--fm);font-size:10px;letter-spacing:0.12em;text-transform:uppercase;background:transparent;color:var(--dim);border:1px solid var(--br);padding:7px 14px;cursor:pointer;transition:all .18s}
  .watch-close:hover{color:var(--tx)}
  .watch-canvas{flex:1;background:#1A1A1A;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden}
  .watch-canvas-inner{background:#2A2A2A;width:min(80vw,800px);height:min(60vh,500px);position:relative;box-shadow:0 32px 80px rgba(0,0,0,0.6)}
  .watch-canvas-label{font-family:var(--fd);font-size:100px;font-weight:900;color:rgba(255,255,255,0.03);letter-spacing:0.1em;position:absolute;inset:0;display:flex;align-items:center;justify-content:center}
  .watch-canvas-cursor{width:12px;height:12px;border-radius:50%;background:var(--red);position:absolute;top:45%;left:38%;box-shadow:0 0 0 3px rgba(255,45,85,0.2);animation:pulse 1.5s ease-in-out infinite}
  .watch-anon{position:absolute;bottom:20px;right:20px;font-size:10px;letter-spacing:0.12em;color:rgba(255,255,255,0.15);font-family:var(--fm)}
  .watch-info{height:64px;background:var(--sf);border-top:1px solid var(--br);display:flex;align-items:center;padding:0 24px;gap:24px}
  .watch-watcher-count{font-size:11px;color:var(--dim)}

  /* GALLERY */
  .gallery{padding:48px 32px}
  .gallery-filters{display:flex;gap:10px;margin-bottom:28px;flex-wrap:wrap;align-items:center}
  .gallery-search{flex:1;min-width:200px;max-width:340px;position:relative}
  .gallery-search input{width:100%;background:var(--sf);border:1px solid var(--br);color:var(--tx);font-family:var(--fm);font-size:11px;letter-spacing:0.08em;padding:10px 16px 10px 38px;outline:none;transition:border-color .18s}
  .gallery-search input:focus{border-color:var(--br2)}
  .gallery-search input::placeholder{color:var(--dim)}
  .gallery-search-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:12px;color:var(--dim);pointer-events:none}
  .filter-btn{font-family:var(--fm);font-size:10px;letter-spacing:0.12em;text-transform:uppercase;background:var(--sf);color:var(--dim);border:1px solid var(--br);padding:9px 14px;cursor:pointer;transition:all .18s}
  .filter-btn:hover{color:var(--tx)}
  .filter-btn.on{border-color:var(--red);color:var(--tx);background:rgba(255,45,85,0.05)}
  .gal-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(256px,1fr));gap:1px;background:var(--br);border:1px solid var(--br)}
  .gal-card{background:var(--bg);cursor:pointer;transition:background .18s;position:relative;overflow:hidden;animation:fadeUp .3s ease}
  .gal-card:hover{background:var(--sf)}
  .gal-accent{position:absolute;top:0;left:0;right:0;height:3px}
  .gal-thumb{aspect-ratio:4/3;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden}
  .gal-thumb-bg{position:absolute;inset:0;opacity:0.06}
  .gal-thumb-wip{font-family:var(--fd);font-size:52px;font-weight:900;letter-spacing:0.12em;position:relative;z-index:1;opacity:0.15}
  .gal-thumb-ph{font-size:10px;letter-spacing:0.1em;color:var(--gh);position:absolute;z-index:2}
  .gal-body{padding:16px 18px}
  .gal-brief-lbl{font-size:9px;letter-spacing:0.18em;text-transform:uppercase;color:var(--dim);margin-bottom:8px}
  .gal-user-row{display:flex;align-items:center;gap:10px;margin-bottom:8px}
  .gal-avatar{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:var(--fs);font-size:10px;font-weight:700;color:#000;flex-shrink:0}
  .gal-username{font-family:var(--fs);font-size:13px;font-weight:700}
  .gal-meta{display:flex;justify-content:space-between;font-size:10px;color:var(--dim);letter-spacing:0.08em}
  .gal-diff{font-size:9px;letter-spacing:0.12em;text-transform:uppercase;margin-top:5px}
  .gal-tags{display:flex;flex-wrap:wrap;gap:4px;margin-top:8px}
  .gal-tag{font-size:9px;letter-spacing:0.1em;text-transform:uppercase;padding:2px 7px;background:rgba(255,255,255,0.04);border:1px solid var(--br);color:var(--dim)}

  /* PROFILE PANEL */
  .profile-overlay{position:fixed;inset:0;background:rgba(13,13,13,0.85);z-index:300;display:flex;align-items:flex-start;justify-content:flex-end;animation:fadeIn .2s ease}
  .profile-panel{width:min(420px,100vw);height:100vh;background:var(--sf);border-left:1px solid var(--br);overflow-y:auto;animation:slideIn .25s ease;display:flex;flex-direction:column}
  .profile-close{font-family:var(--fm);font-size:10px;letter-spacing:0.14em;text-transform:uppercase;background:transparent;color:var(--dim);border:none;cursor:pointer;padding:16px 20px;text-align:right;width:100%;transition:color .18s}
  .profile-close:hover{color:var(--tx)}
  .profile-hero-area{padding:0 28px 28px;border-bottom:1px solid var(--br)}
  .profile-avatar-lg{width:72px;height:72px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:var(--fs);font-size:26px;font-weight:700;color:#000;margin-bottom:16px}
  .profile-name{font-family:var(--fs);font-size:22px;font-weight:800;margin-bottom:4px}
  .profile-handle{font-size:10px;letter-spacing:0.14em;color:var(--dim);margin-bottom:12px}
  .profile-bio{font-size:12px;line-height:1.75;color:rgba(240,237,230,0.65);margin-bottom:16px}
  .profile-tag-row{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px}
  .profile-tag{font-size:9px;letter-spacing:0.12em;text-transform:uppercase;padding:3px 9px;background:rgba(255,255,255,0.04);border:1px solid var(--br);color:var(--dim)}
  .profile-stats-row{display:flex;gap:28px;margin-top:4px}
  .profile-stat-n{font-family:var(--fd);font-size:28px;font-weight:900}
  .profile-stat-l{font-size:9px;letter-spacing:0.18em;text-transform:uppercase;color:var(--dim);margin-top:2px}
  .profile-work-section{padding:20px 28px;flex:1}
  .profile-work-label{font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:var(--dim);margin-bottom:14px}
  .profile-work-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
  .profile-work-item{aspect-ratio:4/3;border:1px solid var(--br);background:var(--s2);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:border-color .18s;position:relative;overflow:hidden}
  .profile-work-item:hover{border-color:var(--br2)}
  .profile-work-wip{font-family:var(--fd);font-size:22px;font-weight:900;letter-spacing:0.12em;opacity:0.12}
  .profile-joined{font-size:10px;color:var(--dim);padding:16px 28px;border-top:1px solid var(--br);letter-spacing:0.1em}

  /* SETUP */
  .setup{max-width:660px;margin:0 auto;padding:56px 32px;animation:fadeUp .4s ease}
  .setup-step{font-size:9px;letter-spacing:0.26em;text-transform:uppercase;color:var(--dim);margin-bottom:22px}
  .setup-h{font-family:var(--fd);font-size:56px;font-weight:900;line-height:0.9;margin-bottom:12px}
  .setup-sub{font-size:12px;color:var(--dim);line-height:1.7;margin-bottom:36px}
  .time-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:36px}
  .time-card{font-family:var(--fm);border:1px solid var(--br);background:var(--sf);padding:20px 22px;cursor:pointer;transition:all .18s;text-align:left}
  .time-card:hover{border-color:var(--br2);background:var(--s2)}
  .time-card.sel{border-color:var(--red);background:rgba(255,45,85,0.05)}
  .time-n{font-family:var(--fd);font-size:34px;font-weight:900;letter-spacing:0.04em;margin-bottom:4px}
  .time-s{font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:var(--dim)}
  .diff-list{display:flex;flex-direction:column;gap:6px;margin-bottom:36px}
  .diff-card{border:1px solid var(--br);background:var(--sf);padding:16px 22px;cursor:pointer;transition:all .18s;display:flex;align-items:center;gap:18px}
  .diff-card:hover{border-color:var(--br2)}
  .diff-card.sel{background:var(--s2)}
  .d-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
  .d-lbl{font-family:var(--fd);font-size:22px;font-weight:900;letter-spacing:0.06em;flex:0 0 96px}
  .d-desc{font-size:11px;color:var(--dim);line-height:1.5}
  .setup-btns{display:flex;gap:10px}

  /* COUNTDOWN */
  .cd-overlay{position:fixed;inset:0;background:var(--bg);z-index:500;display:flex;flex-direction:column;align-items:center;justify-content:center;animation:fadeIn .25s ease}
  .cd-lbl{font-size:10px;letter-spacing:0.26em;text-transform:uppercase;color:var(--dim);margin-bottom:20px}
  .cd-num{font-family:var(--fd);font-size:220px;font-weight:900;color:var(--red);line-height:1;animation:countIn .95s ease forwards}
  .cd-go{font-family:var(--fd);font-size:110px;font-weight:900;color:var(--red);letter-spacing:0.1em;animation:slam .35s ease forwards}

  /* WORKSPACE */
  .ws{position:fixed;inset:0;background:var(--bg);z-index:200;display:flex;flex-direction:column;animation:fadeIn .3s ease}
  .ws-bar{height:48px;background:var(--bg);border-bottom:1px solid var(--br);display:flex;align-items:center;padding:0 18px;gap:0;flex-shrink:0;position:relative;z-index:10}
  .ws-bl{display:flex;align-items:center;gap:14px;flex:1}
  .ws-bc{position:absolute;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:10px}
  .ws-br{display:flex;align-items:center;gap:8px;margin-left:auto}
  .ws-logo{font-family:var(--fd);font-size:18px;font-weight:900;letter-spacing:0.2em;color:var(--dim)}
  .ws-title{font-family:var(--fs);font-size:12px;font-weight:700;color:var(--dim)}
  .ws-sep{width:1px;height:18px;background:var(--br)}
  .ws-timer{font-family:var(--fd);font-size:24px;font-weight:900;letter-spacing:0.06em;color:var(--tx);background:var(--sf);border:1px solid var(--br);padding:3px 14px;font-variant-numeric:tabular-nums;transition:color .3s,border-color .3s}
  .ws-timer.urg{color:var(--red);border-color:rgba(255,45,85,0.35);animation:pulse .7s ease-in-out infinite}
  .ws-prog-w{display:flex;align-items:center;gap:8px}
  .ws-prog{width:76px;height:3px;background:var(--br);position:relative}
  .ws-prog-f{position:absolute;left:0;top:0;bottom:0;background:var(--red);transition:width 1s linear}
  .ws-pct{font-size:9px;letter-spacing:0.14em;color:var(--dim);width:28px}
  .ws-sub-btn{font-family:var(--fm);font-size:10px;letter-spacing:0.12em;text-transform:uppercase;background:var(--red);color:var(--tx);border:none;padding:7px 16px;cursor:pointer;transition:opacity .2s}
  .ws-sub-btn:hover{opacity:.82}
  .ws-ab-btn{font-family:var(--fm);font-size:10px;letter-spacing:0.12em;text-transform:uppercase;background:transparent;color:var(--dim);border:1px solid var(--br);padding:7px 14px;cursor:pointer;transition:all .2s}
  .ws-ab-btn:hover{color:var(--tx)}
  .ws-canvas{flex:1;position:relative;overflow:hidden}
  .ws-connect{position:absolute;inset:0;background:#1A1A1A;display:flex;align-items:center;justify-content:center}
  .ws-connect-inner{text-align:center;max-width:380px;animation:fadeUp .5s ease}
  .ws-connect-icon{font-size:36px;margin-bottom:18px;opacity:0.28}
  .ws-connect-h{font-family:var(--fd);font-size:26px;font-weight:900;letter-spacing:0.06em;margin-bottom:8px}
  .ws-connect-p{font-size:11px;color:var(--dim);line-height:1.7;margin-bottom:24px}
  .ws-connect-btns{display:flex;gap:10px;justify-content:center}
  .ws-tool-btn{font-family:var(--fm);font-size:10px;letter-spacing:0.12em;text-transform:uppercase;border:1px solid var(--br);background:var(--sf);color:var(--dim);padding:10px 18px;cursor:pointer;transition:all .18s;display:flex;align-items:center;gap:8px}
  .ws-tool-btn:hover{border-color:var(--br2);color:var(--tx)}
  .ws-tool-btn.fig:hover{border-color:#1ABCFE;color:#1ABCFE}
  .ws-tool-btn.aff:hover{border-color:#7C4DFF;color:#7C4DFF}
  .ws-connect-or{font-size:9px;letter-spacing:0.16em;text-transform:uppercase;color:var(--gh);margin-top:16px}
  .ws-mock{position:absolute;inset:0;background:#2A2A2A}
  .ws-mock-bar{position:absolute;top:0;left:0;right:0;height:38px;background:#1A1A1A;border-bottom:1px solid rgba(255,255,255,0.05);display:flex;align-items:center;padding:0 14px;gap:10px}
  .ws-mock-tool{width:28px;height:26px;border-radius:3px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center;font-size:11px;cursor:pointer}
  .ws-mock-tool.on{background:rgba(26,188,254,0.12);border-color:rgba(26,188,254,0.35);color:#1ABCFE}
  .ws-mock-layers{position:absolute;top:38px;left:0;width:220px;bottom:0;background:#1A1A1A;border-right:1px solid rgba(255,255,255,0.05);padding:14px}
  .ws-mock-ll{font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:var(--dim);margin-bottom:10px;font-family:var(--fm)}
  .ws-mock-layer{padding:5px 8px;font-size:10px;color:rgba(240,237,230,0.35);font-family:var(--fm);cursor:pointer;border-radius:2px;display:flex;align-items:center;gap:8px}
  .ws-mock-layer:hover{background:rgba(255,255,255,0.04)}
  .ws-mock-ld{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,0.18)}
  .ws-mock-canvas{position:absolute;top:38px;left:220px;right:0;bottom:0;background:#3C3C3C;display:flex;align-items:center;justify-content:center}
  .ws-mock-artboard{background:white;width:460px;height:320px;box-shadow:0 24px 64px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center}
  .ws-mock-ab-lbl{font-family:var(--fd);font-size:80px;font-weight:900;color:rgba(0,0,0,0.04);letter-spacing:0.1em}
  .ws-badge{position:absolute;top:50px;right:14px;background:rgba(26,188,254,0.1);border:1px solid rgba(26,188,254,0.25);color:#1ABCFE;font-size:9px;letter-spacing:0.14em;text-transform:uppercase;padding:4px 10px;font-family:var(--fm);pointer-events:none}
  .ws-brief{position:absolute;bottom:0;left:0;right:0;background:rgba(10,10,10,0.94);border-top:1px solid var(--br);backdrop-filter:blur(20px);transition:height .28s ease;overflow:hidden}
  .ws-brief-toggle{height:38px;display:flex;align-items:center;justify-content:space-between;padding:0 22px;cursor:pointer;font-family:var(--fm);font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:var(--dim);border:none;background:transparent;width:100%;text-align:left;transition:color .18s}
  .ws-brief-toggle:hover{color:var(--tx)}
  .ws-brief-body{padding:0 22px 22px;display:flex;gap:36px}
  .ws-brief-prompt{font-size:12px;line-height:1.8;color:rgba(240,237,230,0.62);flex:1}
  .ws-brief-side{flex:0 0 200px}
  .ws-hint{font-size:11px;line-height:1.65;color:var(--red);font-style:italic}
  .ws-swatches{display:flex;gap:6px;margin-top:10px}
  .ws-swatch{width:26px;height:26px;border:1px solid rgba(255,255,255,0.06)}
  .ws-tagrow{display:flex;flex-wrap:wrap;gap:5px;margin-top:10px}
  .ws-tag{font-size:9px;letter-spacing:0.12em;text-transform:uppercase;padding:3px 8px;background:rgba(255,255,255,0.04);border:1px solid var(--br);color:var(--dim)}

  /* PLAYOFFS */
  .playoffs{padding:48px 32px}
  .playoff-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:40px;gap:24px;flex-wrap:wrap}
  .playoff-hero-left{}
  .playoff-eyebrow{font-size:9px;letter-spacing:0.24em;text-transform:uppercase;color:var(--red);margin-bottom:10px}
  .playoff-title{font-family:var(--fd);font-size:64px;font-weight:900;line-height:0.9;letter-spacing:0.02em;margin-bottom:12px}
  .playoff-brief-box{background:var(--sf);border:1px solid var(--br);border-left:3px solid var(--red);padding:14px 18px;max-width:520px;margin-bottom:16px}
  .playoff-brief-lbl{font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:var(--dim);margin-bottom:6px}
  .playoff-brief-text{font-size:12px;line-height:1.65;color:rgba(240,237,230,0.7)}
  .playoff-sponsor{background:var(--sf);border:1px solid var(--br);padding:14px 18px;display:inline-flex;flex-direction:column;gap:4px}
  .playoff-sponsor-lbl{font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:var(--dim)}
  .playoff-prize{font-family:var(--fs);font-size:16px;font-weight:700;color:var(--tx)}
  .playoff-sponsor-name{font-size:10px;letter-spacing:0.12em;color:var(--dim)}

  .bracket{display:flex;gap:0;align-items:stretch;overflow-x:auto;border:1px solid var(--br)}
  .bracket-round{flex:1;min-width:200px;border-right:1px solid var(--br);display:flex;flex-direction:column}
  .bracket-round:last-child{border-right:none}
  .bracket-round-hdr{padding:14px 18px;border-bottom:1px solid var(--br);font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:var(--dim);background:var(--sf)}
  .bracket-matches{flex:1;display:flex;flex-direction:column;justify-content:space-around;padding:20px 18px;gap:16px}
  .bracket-match{border:1px solid var(--br);background:var(--bg);overflow:hidden}
  .bracket-match-lbl{font-size:8px;letter-spacing:0.18em;text-transform:uppercase;color:var(--gh);padding:6px 12px;border-bottom:1px solid var(--br);background:var(--sf)}
  .bracket-competitor{display:flex;align-items:center;gap:10px;padding:10px 12px;border-bottom:1px solid var(--br);cursor:pointer;transition:background .18s;position:relative}
  .bracket-competitor:last-child{border-bottom:none}
  .bracket-competitor:hover{background:var(--s2)}
  .bracket-competitor.winner{background:rgba(255,45,85,0.06)}
  .bracket-competitor.voted{background:rgba(76,175,80,0.06)}
  .bracket-comp-avatar{width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:var(--fs);font-size:9px;font-weight:700;color:#000;flex-shrink:0}
  .bracket-comp-name{font-family:var(--fs);font-size:12px;font-weight:700;flex:1}
  .bracket-vote-btn{font-family:var(--fm);font-size:8px;letter-spacing:0.12em;text-transform:uppercase;background:transparent;color:var(--dim);border:1px solid var(--br);padding:3px 8px;cursor:pointer;transition:all .18s}
  .bracket-vote-btn:hover{border-color:var(--red);color:var(--red)}
  .bracket-vote-btn.voted{background:rgba(76,175,80,0.1);border-color:#4CAF50;color:#4CAF50;cursor:default}
  .bracket-tbd{display:flex;align-items:center;justify-content:center;padding:28px;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:var(--gh)}
  .bracket-crown{font-size:16px;margin-right:6px}
  .bracket-winner-badge{display:flex;align-items:center;gap:10px;padding:12px 16px;background:rgba(255,45,85,0.08);border:1px solid rgba(255,45,85,0.2)}
  .bracket-winner-name{font-family:var(--fs);font-size:14px;font-weight:800}
  .bracket-winner-sub{font-size:9px;letter-spacing:0.14em;text-transform:uppercase;color:var(--red)}

  /* MODAL */
  .modal-bg{position:fixed;inset:0;background:rgba(13,13,13,0.92);z-index:400;display:flex;align-items:center;justify-content:center;animation:fadeIn .2s ease}
  .modal{width:100%;max-width:490px;background:var(--sf);border:1px solid var(--br);padding:40px;animation:fadeUp .28s ease}
  .modal-h{font-family:var(--fd);font-size:54px;font-weight:900;line-height:0.9;margin-bottom:8px}
  .modal-p{font-size:12px;color:var(--dim);line-height:1.7;margin-bottom:26px}
  .modal-row{display:flex;align-items:center;gap:14px;padding:13px 18px;border:1px solid var(--br);cursor:pointer;margin-bottom:7px;background:transparent;width:100%;text-align:left;font-family:var(--fm);font-size:12px;color:var(--dim);transition:all .18s}
  .modal-row:hover{border-color:var(--br2);color:var(--tx)}
  .modal-row.on{border-color:var(--red);color:var(--tx)}
  .m-chk{width:15px;height:15px;border:1px solid var(--br);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:9px;transition:all .18s}
  .modal-row.on .m-chk{background:var(--red);border-color:var(--red)}
  .modal-acts{display:flex;gap:10px;margin-top:22px}

  /* SUCCESS */
  .success{max-width:520px;margin:0 auto;padding:96px 32px;text-align:center;animation:fadeUp .5s ease}
  .success-h{font-family:var(--fd);font-size:100px;font-weight:900;color:var(--red);line-height:0.88;margin-bottom:18px}
  .success-p{font-size:13px;color:var(--dim);line-height:1.75;margin-bottom:36px}
  .success-acts{display:flex;gap:12px;justify-content:center}

  /* AUTH MODAL */
  .auth-inp{width:100%;background:var(--s2);border:1px solid var(--br);color:var(--tx);font-family:var(--fm);font-size:12px;letter-spacing:0.05em;padding:11px 14px;outline:none;transition:border-color .18s;margin-bottom:10px;display:block}
  .auth-inp:focus{border-color:var(--br2)}
  .auth-inp::placeholder{color:var(--dim)}
  .auth-tabs{display:flex;margin-bottom:24px;border-bottom:1px solid var(--br)}
  .auth-tab{flex:1;background:none;border:none;border-bottom:2px solid transparent;color:var(--dim);font-family:var(--fm);font-size:11px;letter-spacing:0.1em;padding:10px;cursor:pointer;transition:color .18s;margin-bottom:-1px}
  .auth-tab.on{color:var(--tx);border-bottom-color:var(--red)}
  .auth-err{font-family:var(--fm);font-size:11px;color:var(--red);margin-bottom:10px}
  .auth-confirm{font-family:var(--fm);font-size:12px;color:var(--dim);line-height:1.6;text-align:center;padding:8px 0 4px}
  `;
  const el = document.createElement("style");
  el.textContent = css;
  document.head.appendChild(el);
})();

// ── HELPERS ───────────────────────────────────────────────────────────────────
function fmtTime(s) {
  if (s <= 0) return "00:00";
  if (s >= 86400) return `${Math.floor(s/86400)}d ${String(Math.floor((s%86400)/3600)).padStart(2,"0")}h`;
  const h = Math.floor(s/3600), m = String(Math.floor((s%3600)/60)).padStart(2,"0"), sec = String(s%60).padStart(2,"0");
  return h > 0 ? `${h}:${m}:${sec}` : `${m}:${sec}`;
}
function initials(handle) { const u = USERS[handle]; if (!u) return handle.slice(0,2).toUpperCase(); return u.name.split(" ").map(w=>w[0]).join("").slice(0,2); }
function Avatar({ handle, size=36 }) {
  const u = USERS[handle];
  return <div className={size>30?"ac-avatar":"gal-avatar"} style={{width:size,height:size,background:u?.color||"#888",fontSize:size>30?13:10}}>{initials(handle)}</div>;
}

// ── TICKER ────────────────────────────────────────────────────────────────────
function Ticker() {
  const items = ["NEW BRIEF READY","DESIGN UNDER PRESSURE","15 MIN · 1 HOUR · 4 HOURS · 1 DAY","841 DESIGNERS ACTIVE","WIP / WORK IN PROGRESS","EASY · MEDIUM · HARD · INSANE","PLAYOFFS SEASON 01 LIVE","SUBMIT YOUR WORK"];
  const all = [...items,...items];
  return <div className="ticker"><div className="tk-track">{all.map((t,i)=><span key={i} className="tk-item"><span className="tk-dot">◆</span>{t}</span>)}</div></div>;
}

// ── ACTIVE CHALLENGES ─────────────────────────────────────────────────────────
function ActiveChallenges({ onWatch }) {
  const [challenges, setChallenges] = useState(ACTIVE_CHALLENGES.map(c=>({...c})));
  useEffect(()=>{
    const t = setInterval(()=>setChallenges(cs=>cs.map(c=>({...c,elapsed:Math.min(c.elapsed+1,c.total)}))),1000);
    return ()=>clearInterval(t);
  },[]);

  return (
    <div className="ac-section">
      <div className="sec-hdr">
        <div className="sec-title" style={{display:"flex",alignItems:"center",gap:14}}>
          <div className="live-dot" style={{width:10,height:10}}/>
          Active Challenges
        </div>
        <div className="sec-meta">{challenges.length} designers working now</div>
      </div>
      <div className="ac-list">
        {challenges.map((c,i)=>{
          const pct = (c.elapsed/c.total)*100;
          const rem = c.total - c.elapsed;
          const u = USERS[c.user];
          return (
            <div key={i} className="ac-row">
              <div className="ac-bar-bg" style={{width:`${pct}%`}}/>
              <div className="ac-inner">
                <div className="live-dot"/>
                <Avatar handle={c.user} size={36}/>
                <div className="ac-user-block">
                  <div className="ac-username">{u?.name||c.user}</div>
                  <div className="ac-handle">@{c.user}</div>
                </div>
                <div className="ac-brief">{c.brief}</div>
                <div className="ac-meta-row">
                  <div className="ac-diff-badge" style={{color:DIFF_COLORS[c.diff],borderColor:DIFF_COLORS[c.diff]+"44"}}>{c.diff}</div>
                  <div className="ac-progress"><div className="ac-progress-fill" style={{width:`${pct}%`}}/></div>
                  <div className="ac-time-block">{fmtTime(rem)} left</div>
                  <div className="ac-watchers"><span>👁</span>{c.watchers}</div>
                  <button className="ac-watch-btn" onClick={()=>onWatch(c)}>Watch Now</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── WATCH OVERLAY ─────────────────────────────────────────────────────────────
function WatchOverlay({ challenge, onClose }) {
  const [elapsed, setElapsed] = useState(challenge.elapsed);
  const [watchers] = useState(challenge.watchers + 1);
  const u = USERS[challenge.user];
  useEffect(()=>{const t=setInterval(()=>setElapsed(e=>Math.min(e+1,challenge.total)),1000);return()=>clearInterval(t);},[]);
  const rem = challenge.total - elapsed;

  return (
    <div className="watch-overlay">
      <div className="watch-bar">
        <div className="watch-badge"><div className="live-dot"/><span>LIVE</span></div>
        <div className="watch-bar-title">Watching @{challenge.user} — {challenge.brief}</div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div className={`ws-timer${rem < challenge.total*0.1?" urg":""}`}>{fmtTime(rem)}</div>
          <button className="watch-close" onClick={onClose}>✕ Leave</button>
        </div>
      </div>
      <div className="watch-canvas">
        <div className="watch-canvas-inner">
          <div className="watch-canvas-label">CANVAS</div>
          <div className="watch-canvas-cursor"/>
        </div>
        <div className="watch-anon">anonymous viewer mode — {challenge.user} cannot see you</div>
      </div>
      <div className="watch-info">
        <Avatar handle={challenge.user} size={32}/>
        <div>
          <div style={{fontFamily:"var(--fs)",fontWeight:700,fontSize:13}}>{u?.name}</div>
          <div style={{fontSize:10,color:"var(--dim)",letterSpacing:"0.1em"}}>{challenge.diff} · {challenge.time} challenge</div>
        </div>
        <div style={{marginLeft:"auto"}}>
          <div className="watch-watcher-count">👁 {watchers} watching</div>
        </div>
      </div>
    </div>
  );
}

// ── GALLERY ───────────────────────────────────────────────────────────────────
function GalleryPage({ onViewProfile }) {
  const [search, setSearch] = useState("");
  const [filterDiff, setFilterDiff] = useState(null);
  const [filterTime, setFilterTime] = useState(null);

  const filtered = GALLERY_ITEMS.filter(item => {
    const q = search.toLowerCase();
    const matchSearch = !q || item.brief.toLowerCase().includes(q) || item.user.toLowerCase().includes(q) || item.tags.some(t=>t.toLowerCase().includes(q));
    const matchDiff = !filterDiff || item.diff === filterDiff;
    const matchTime = !filterTime || item.time === filterTime;
    return matchSearch && matchDiff && matchTime;
  });

  return (
    <div className="gallery">
      <div className="sec-hdr">
        <div className="sec-title">Gallery</div>
        <div className="sec-meta">{GALLERY_ITEMS.length} submissions</div>
      </div>
      <div className="gallery-filters">
        <div className="gallery-search">
          <span className="gallery-search-icon">⌕</span>
          <input placeholder="Search briefs, designers, tags…" value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        {["easy","medium","hard","insane"].map(d=>(
          <button key={d} className={`filter-btn${filterDiff===d?" on":""}`} onClick={()=>setFilterDiff(filterDiff===d?null:d)} style={filterDiff===d?{color:DIFF_COLORS[d],borderColor:DIFF_COLORS[d]}:{}}>{d}</button>
        ))}
        {["15 min","1 hour","4 hours","1 day"].map(t=>(
          <button key={t} className={`filter-btn${filterTime===t?" on":""}`} onClick={()=>setFilterTime(filterTime===t?null:t)}>{t}</button>
        ))}
      </div>
      {filtered.length === 0 && <div style={{padding:"48px 0",textAlign:"center",color:"var(--dim)",fontSize:13,letterSpacing:"0.1em"}}>No results found.</div>}
      <div className="gal-grid">
        {filtered.map(item=>(
          <div key={item.id} className="gal-card">
            <div className="gal-accent" style={{background:item.color}}/>
            <div className="gal-thumb">
              <div className="gal-thumb-bg" style={{background:item.accentBg,position:"absolute",inset:0}}/>
              <div className="gal-thumb-wip" style={{color:item.color}}>WIP</div>
              <div className="gal-thumb-ph">[ preview ]</div>
            </div>
            <div className="gal-body">
              <div className="gal-brief-lbl">{item.brief}</div>
              <div className="gal-user-row">
                <div className="gal-avatar" style={{width:26,height:26,background:USERS[item.user]?.color||"#888",fontSize:10,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"50%",fontFamily:"var(--fs)",fontWeight:700,color:"#000",flexShrink:0}}>{initials(item.user)}</div>
                <div className="gal-username" style={{cursor:"pointer"}} onClick={()=>onViewProfile(item.user)}>@{item.user}</div>
              </div>
              <div className="gal-meta">
                <span>{item.time} · <span style={{color:DIFF_COLORS[item.diff]}}>{item.diff}</span></span>
                <span>♥ {item.likes}</span>
              </div>
              <div className="gal-tags">{item.tags.map((t,i)=><span key={i} className="gal-tag">{t}</span>)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── PROFILE PANEL ─────────────────────────────────────────────────────────────
function ProfilePanel({ handle, onClose }) {
  const u = USERS[handle];
  if (!u) return null;
  const works = GALLERY_ITEMS.filter(g=>g.user===handle);
  return (
    <div className="profile-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="profile-panel">
        <button className="profile-close" onClick={onClose}>✕ Close</button>
        <div className="profile-hero-area">
          <div className="profile-avatar-lg" style={{background:u.color}}>{initials(handle)}</div>
          <div className="profile-name">{u.name}</div>
          <div className="profile-handle">@{handle}</div>
          <div className="profile-bio">{u.bio}</div>
          <div className="profile-tag-row">{u.tags.map((t,i)=><span key={i} className="profile-tag">{t}</span>)}</div>
          <div className="profile-stats-row">
            {[[u.completions,"Completions"],[u.wins,"Playoff Wins"],["S01","Season"]].map(([n,l],i)=>(
              <div key={i}><div className="profile-stat-n">{n}</div><div className="profile-stat-l">{l}</div></div>
            ))}
          </div>
        </div>
        <div className="profile-work-section">
          <div className="profile-work-label">Work ({works.length})</div>
          <div className="profile-work-grid">
            {works.map((w,i)=>(
              <div key={i} className="profile-work-item" style={{background:w.accentBg}}>
                <div className="profile-work-wip" style={{color:w.color}}>WIP</div>
              </div>
            ))}
            {works.length===0&&<div style={{gridColumn:"span 2",padding:"24px 0",color:"var(--dim)",fontSize:11,letterSpacing:"0.1em"}}>No submissions yet.</div>}
          </div>
        </div>
        <div className="profile-joined">Member since {u.joined}</div>
      </div>
    </div>
  );
}

// ── PLAYOFFS ──────────────────────────────────────────────────────────────────
function PlayoffsPage({ onViewProfile }) {
  const [bracket, setBracket] = useState(JSON.parse(JSON.stringify(BRACKET)));

  const vote = (roundIdx, matchIdx, side) => {
    setBracket(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const match = next.rounds[roundIdx].matches[matchIdx];
      if (match.winner) return prev; // already decided
      const winner = side === "a" ? match.a : match.b;
      match.winner = winner.user;
      match[side].voted = true;
      // Advance to next round if exists
      if (roundIdx + 1 < next.rounds.length) {
        const nextRound = next.rounds[roundIdx + 1];
        const targetMatchIdx = Math.floor(matchIdx / 2);
        const targetSlot = matchIdx % 2 === 0 ? "a" : "b";
        if (!nextRound.matches[targetMatchIdx]) return next;
        nextRound.matches[targetMatchIdx][targetSlot] = { user: winner.user, voted: false };
      }
      return next;
    });
  };

  const allR1Done = bracket.rounds[0].matches.every(m=>m.winner);
  const allR2Done = bracket.rounds[1].matches.every(m=>m.winner);
  const champion = bracket.rounds[2].matches[0]?.winner;

  return (
    <div className="playoffs">
      <div className="playoff-header">
        <div className="playoff-hero-left">
          <div className="playoff-eyebrow">◆ Season 01 — Now Live</div>
          <div className="playoff-title">Play<br/>offs</div>
          <div className="playoff-brief-box">
            <div className="playoff-brief-lbl">The Brief</div>
            <div className="playoff-brief-text">{BRACKET.brief}</div>
          </div>
          <div style={{fontSize:11,color:"var(--dim)",lineHeight:1.7,maxWidth:480,marginBottom:16}}>
            8 designers. Same brief. You vote on who advances. Winners are determined by community vote — every round is open for 24 hours.
          </div>
        </div>
        <div className="playoff-sponsor">
          <div className="playoff-sponsor-lbl">Sponsored by</div>
          <div className="playoff-prize">🏆 {BRACKET.prize}</div>
          <div className="playoff-sponsor-name">{BRACKET.sponsor}</div>
        </div>
      </div>

      {champion && (
        <div className="bracket-winner-badge" style={{marginBottom:24}}>
          <div className="bracket-crown">🏆</div>
          <div>
            <div className="bracket-winner-name" style={{cursor:"pointer"}} onClick={()=>onViewProfile(champion)}>@{champion} wins Season 01!</div>
            <div className="bracket-winner-sub">Champion · {BRACKET.prize}</div>
          </div>
        </div>
      )}

      <div className="bracket">
        {bracket.rounds.map((round, rIdx) => (
          <div key={rIdx} className="bracket-round">
            <div className="bracket-round-hdr">{round.name}</div>
            <div className="bracket-matches">
              {round.matches.map((match, mIdx) => {
                const hasCompetitors = match.a && match.b;
                const hasEither = match.a || match.b;
                return (
                  <div key={match.id} className="bracket-match">
                    <div className="bracket-match-lbl">Match {mIdx+1}</div>
                    {hasCompetitors ? (
                      [match.a, match.b].map((comp, si) => {
                        const side = si===0?"a":"b";
                        const isWinner = match.winner === comp.user;
                        const u = USERS[comp.user];
                        return (
                          <div key={si} className={`bracket-competitor${isWinner?" winner":""}${comp.voted?" voted":""}`}>
                            <div className="bracket-comp-avatar" style={{width:24,height:24,background:u?.color||"#888",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontFamily:"var(--fs)",fontWeight:700,color:"#000"}}>{initials(comp.user)}</div>
                            <div className="bracket-comp-name" style={{cursor:"pointer"}} onClick={()=>onViewProfile(comp.user)}>@{comp.user}</div>
                            {isWinner && <span style={{fontSize:10,color:DIFF_COLORS.easy,marginRight:6}}>✓</span>}
                            {!match.winner && (
                              <button className={`bracket-vote-btn${comp.voted?" voted":""}`} onClick={()=>vote(rIdx,mIdx,side)}>
                                {comp.voted?"Voted":"Vote"}
                              </button>
                            )}
                          </div>
                        );
                      })
                    ) : hasEither ? (
                      <div>
                        {[match.a, match.b].map((comp, si) => comp ? (
                          <div key={si} className="bracket-competitor">
                            <div className="bracket-comp-avatar" style={{width:24,height:24,background:USERS[comp.user]?.color||"#888",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontFamily:"var(--fs)",fontWeight:700,color:"#000"}}>{initials(comp.user)}</div>
                            <div className="bracket-comp-name">@{comp.user}</div>
                          </div>
                        ) : (
                          <div key={si} className="bracket-competitor" style={{opacity:0.3}}>
                            <div style={{fontSize:10,letterSpacing:"0.1em",color:"var(--dim)"}}>— TBD</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bracket-tbd">Awaiting results</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div style={{marginTop:24,fontSize:11,color:"var(--dim)",lineHeight:1.7}}>
        Vote in Round of 8 to unlock Semifinals. All 8 designers submitted the same brief — results shown above the bracket once voting is complete.
      </div>
    </div>
  );
}

// ── COUNTDOWN ─────────────────────────────────────────────────────────────────
function Countdown({ onDone }) {
  const [n, setN] = useState(3);
  useEffect(()=>{
    if(n>0){const t=setTimeout(()=>setN(n-1),900);return()=>clearTimeout(t);}
    else{const t=setTimeout(onDone,650);return()=>clearTimeout(t);}
  },[n]);
  return <div className="cd-overlay"><div className="cd-lbl">Brief unlocking in</div>{n>0?<div key={n} className="cd-num">{n}</div>:<div className="cd-go">GO</div>}</div>;
}

// ── WORKSPACE ─────────────────────────────────────────────────────────────────
function Workspace({ brief, onSubmit, onAbandon }) {
  const total = TOTAL_SECS[brief._time]||900;
  const [elapsed, setElapsed] = useState(0);
  const [open, setOpen] = useState(true);
  const [tool, setTool] = useState("none");
  const pct = Math.min(100,(elapsed/total)*100);
  const remaining = Math.max(0,total-elapsed);
  const urgent = remaining < total*0.1;
  useEffect(()=>{const t=setInterval(()=>setElapsed(e=>e+1),1000);return()=>clearInterval(t);},[]);
  return (
    <div className="ws">
      <div className="ws-bar">
        <div className="ws-bl"><div className="ws-logo">WIP</div><div className="ws-sep"/><div className="ws-title">{brief.title}</div><div className="ws-sep"/><span style={{fontSize:9,letterSpacing:"0.16em",textTransform:"uppercase",color:DIFF_COLORS[brief._diff]}}>{brief._diff}</span></div>
        <div className="ws-bc"><div className={`ws-timer${urgent?" urg":""}`}>{fmtTime(remaining)}</div><div className="ws-prog-w"><div className="ws-prog"><div className="ws-prog-f" style={{width:`${pct}%`}}/></div><span className="ws-pct">{Math.round(pct)}%</span></div></div>
        <div className="ws-br"><button className="ws-ab-btn" onClick={onAbandon}>Abandon</button><button className="ws-sub-btn" onClick={() => onSubmit(elapsed)}>Submit Work →</button></div>
      </div>
      <div className="ws-canvas">
        {tool==="mock" ? (
          <div className="ws-mock">
            <div className="ws-mock-bar">{["↖","✥","▭","✏","T","⬡"].map((ic,i)=><div key={i} className={`ws-mock-tool${i===0?" on":""}`}>{ic}</div>)}</div>
            <div className="ws-mock-layers"><div className="ws-mock-ll">Layers</div>{["Frame 1","Background","Text Group","Icon","Color Fills","Guides"].map((l,i)=><div key={i} className="ws-mock-layer"><div className="ws-mock-ld"/>{l}</div>)}</div>
            <div className="ws-mock-canvas"><div className="ws-mock-artboard"><div className="ws-mock-ab-lbl">CANVAS</div></div></div>
            <div className="ws-badge">Figma Connected</div>
          </div>
        ) : (
          <div className="ws-connect">
            <div className="ws-connect-inner">
              <div className="ws-connect-icon">⚡</div>
              <div className="ws-connect-h">Open Your Canvas</div>
              <div className="ws-connect-p">Link your design tool and a new file opens automatically.<br/>The timer is already running.</div>
              <div className="ws-connect-btns">
                <button className="ws-tool-btn fig" onClick={()=>setTool("mock")}><span style={{fontSize:14}}>◈</span>Open in Figma</button>
                <button className="ws-tool-btn aff" onClick={()=>setTool("mock")}><span style={{fontSize:14}}>◇</span>Open in Affinity</button>
              </div>
              <div className="ws-connect-or">or work in your own tool and upload at the end</div>
            </div>
          </div>
        )}
      </div>
      <div className="ws-brief" style={{height:open?196:38}}>
        <button className="ws-brief-toggle" onClick={()=>setOpen(o=>!o)}><span>◆ Brief — {brief.title}</span><span>{open?"▼ hide":"▲ show"}</span></button>
        {open && <div className="ws-brief-body"><div className="ws-brief-prompt">{brief.prompt}</div><div className="ws-brief-side"><div style={{fontSize:9,letterSpacing:"0.2em",textTransform:"uppercase",color:"var(--dim)",marginBottom:6}}>Palette</div><div className="ws-swatches">{brief.moodboard.map((c,i)=><div key={i} className="ws-swatch" style={{background:c}}/>)}</div><div style={{marginTop:14}}><div style={{fontSize:9,letterSpacing:"0.2em",textTransform:"uppercase",color:"var(--dim)",marginBottom:6}}>Hint</div><div className="ws-hint">{brief.hint}</div></div><div className="ws-tagrow">{brief.tags.map((t,i)=><span key={i} className="ws-tag">{t}</span>)}</div></div></div>}
      </div>
    </div>
  );
}

// ── AUTH MODAL ────────────────────────────────────────────────────────────────
function AuthModal({ signUp, signIn, authLoading, authError, clearError, onClose }) {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const switchMode = (m) => { setMode(m); clearError(); setConfirmed(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === "signup") {
      const res = await signUp({ email, password, username });
      if (res?.needsConfirmation) setConfirmed(true);
      else if (res?.success) onClose();
    } else {
      const res = await signIn({ email, password });
      if (res?.success) onClose();
    }
  };

  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-h">{mode === "signin" ? "Sign\nIn" : "Sign\nUp"}</div>
        <div className="auth-tabs">
          <button type="button" className={`auth-tab${mode === "signin" ? " on" : ""}`} onClick={() => switchMode("signin")}>SIGN IN</button>
          <button type="button" className={`auth-tab${mode === "signup" ? " on" : ""}`} onClick={() => switchMode("signup")}>SIGN UP</button>
        </div>
        {confirmed ? (
          <div className="auth-confirm">Check your inbox — we sent a confirmation link to <strong>{email}</strong>.</div>
        ) : (
          <form onSubmit={handleSubmit}>
            {mode === "signup" && (
              <input className="auth-inp" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required autoComplete="username"/>
            )}
            <input className="auth-inp" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email"/>
            <input className="auth-inp" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete={mode === "signup" ? "new-password" : "current-password"} minLength={6}/>
            {authError && <div className="auth-err">{authError}</div>}
            <div className="modal-acts">
              <button className="btn-p" style={{flex:1}} type="submit" disabled={authLoading}>
                {authLoading ? "…" : mode === "signin" ? "Sign In →" : "Create Account →"}
              </button>
              <button className="btn-g" type="button" onClick={onClose}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [step, setStep] = useState(1);
  const [selTime, setSelTime] = useState(null);
  const [selDiff, setSelDiff] = useState(null);
  const [counting, setCounting] = useState(false);
  const [brief, setBrief] = useState(null);
  const [modal, setModal] = useState(false);
  const [sharePub, setSharePub] = useState(true);
  const [addProf, setAddProf] = useState(true);
  const [watching, setWatching] = useState(null);
  const [viewProfile, setViewProfile] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [challengeElapsed, setChallengeElapsed] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const { user, profile, isLoggedIn, signUp, signIn, signOut, authLoading, authError, clearError } = useAuth();

  const reset = () => { setStep(1); setSelTime(null); setSelDiff(null); setBrief(null); setCounting(false); setChallengeElapsed(0); };

  const handleConfirm = async () => {
    setSubmitting(true);
    setSubmitError(null);
    const { error } = await supabase.from("submissions").insert({
      user_id:     user.id,
      brief_title: brief.title,
      brief_body:  brief.prompt,
      time_limit:  brief._time,
      difficulty:  brief._diff,
      timelapse:   challengeElapsed,
      is_public:   sharePub,
    });
    setSubmitting(false);
    if (error) { setSubmitError(error.message); return; }
    setModal(false);
    reset();
    setPage("gallery");
  };

  const handleCountDone = () => {
    const b = BRIEFS[selTime]?.[selDiff];
    if (b) { setBrief({...b,_diff:selDiff,_time:selTime}); setCounting(false); setPage("challenge"); }
  };

  return (
    <div className="wip">
      {page==="challenge" && brief && <Workspace brief={brief} onSubmit={(secs)=>{ setChallengeElapsed(secs); setModal(true); }} onAbandon={()=>{ reset(); setPage("home"); }}/>}
      {counting && <Countdown onDone={handleCountDone}/>}
      {watching && <WatchOverlay challenge={watching} onClose={()=>setWatching(null)}/>}
      {viewProfile && <ProfilePanel handle={viewProfile} onClose={()=>setViewProfile(null)}/>}

      {page!=="challenge" && !counting && (
        <>
          <nav className="nav">
            <div className="nav-logo" onClick={()=>{ setPage("home"); reset(); }}>WIP <div className="nav-dot"/></div>
            <div className="nav-r">
              {[["home","Briefs"],["gallery","Gallery"],["playoffs","Playoffs"]].map(([p,l])=>(
                <button key={p} className={`nav-lnk${page===p||page==="setup"&&p==="home"?" on":""}`} onClick={()=>{ setPage(p); if(p!=="setup") reset(); }}>{l}</button>
              ))}
              {isLoggedIn ? <button className="nav-cta" onClick={signOut}>{profile?.display_name || "You"}</button> : <button className="nav-cta" onClick={() => setShowAuthModal(true)}>Sign Up</button>}
            </div>
          </nav>
          <Ticker/>

          {page==="home" && (
            <>
              <div className="hero">
                <div className="hero-ey">◆ The designer's arena</div>
                <h1 className="hero-h1">Design<br/>under<br/><em>pressure.</em></h1>
                <p className="hero-p">Pick your time. Pick your difficulty. Get a brief you've never seen before. Build something. Ship it. Repeat.</p>
                <div className="hero-ctas">
                  <button className="btn-p" onClick={()=>setPage("setup")}>Start a Challenge →</button>
                  <button className="btn-g" onClick={()=>setPage("gallery")}>Browse Gallery</button>
                </div>
                <div className="hero-stats">
                  {[["12,841","Designers"],["3,204","Briefs Completed"],["841","Active Now"]].map(([n,l],i)=>(
                    <div key={i}><div className="stat-n">{n}</div><div className="stat-l">{l}</div></div>
                  ))}
                </div>
              </div>
              <ActiveChallenges onWatch={setWatching}/>
            </>
          )}

          {page==="setup" && step===1 && (
            <div className="setup">
              <div className="setup-step">◆ Step 1 of 2 — Time limit</div>
              <div className="setup-h">How long<br/>do you have?</div>
              <div className="setup-sub">Brief is matched to your time and revealed only when the challenge begins.</div>
              <div className="time-grid">
                {TIME_OPTIONS.map(o=><div key={o.label} className={`time-card${selTime===o.label?" sel":""}`} onClick={()=>setSelTime(o.label)}><div className="time-n">{o.label}</div><div className="time-s">{o.sub}</div></div>)}
              </div>
              <button className="btn-p" disabled={!selTime} onClick={()=>selTime&&setStep(2)}>Next: Choose Difficulty →</button>
            </div>
          )}

          {page==="setup" && step===2 && (
            <div className="setup">
              <div className="setup-step">◆ Step 2 of 2 — Difficulty · {selTime}</div>
              <div className="setup-h">How hard<br/>do you want it?</div>
              <div className="setup-sub">Your brief is waiting. You won't see it until the countdown hits zero.</div>
              <div className="diff-list">
                {DIFF_OPTIONS.map(o=><div key={o.key} className={`diff-card${selDiff===o.key?" sel":""}`} onClick={()=>setSelDiff(o.key)} style={selDiff===o.key?{borderColor:o.color}:{}}><div className="d-dot" style={{background:o.color}}/><div className="d-lbl">{o.label}</div><div className="d-desc">{o.desc}</div></div>)}
              </div>
              <div className="setup-btns">
                <button className="btn-g" onClick={()=>setStep(1)}>← Back</button>
                <button className="btn-p" disabled={!selDiff} onClick={()=>selDiff&&setCounting(true)}>Begin — Brief Unlocks Now</button>
              </div>
            </div>
          )}

          {page==="gallery" && <GalleryPage onViewProfile={setViewProfile}/>}
          {page==="playoffs" && <PlayoffsPage onViewProfile={setViewProfile}/>}

          {page==="success" && (
            <div className="success">
              <div className="success-h">Submitted.</div>
              <p style={{fontSize:13,color:"var(--dim)",lineHeight:1.75,marginBottom:36}}>Your work is in the gallery. Come back for another round.</p>
              <div className="success-acts">
                <button className="btn-p" onClick={()=>setPage("gallery")}>View Gallery →</button>
                <button className="btn-g" onClick={()=>{ reset(); setPage("setup"); }}>New Brief</button>
              </div>
            </div>
          )}
        </>
      )}

      {showAuthModal && (
        <AuthModal
          signUp={signUp}
          signIn={signIn}
          authLoading={authLoading}
          authError={authError}
          clearError={clearError}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {modal && brief && (
        <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div className="modal">
            <div className="modal-h">Submit<br/>Work</div>
            <p className="modal-p">Submitting for <strong>{brief.title}</strong>. Choose how to share.</p>
            <button className={`modal-row${sharePub?" on":""}`} onClick={()=>setSharePub(p=>!p)}><div className="m-chk">{sharePub?"✓":""}</div>Share publicly in the WIP gallery</button>
            <button className={`modal-row${addProf?" on":""}`} onClick={()=>setAddProf(p=>!p)}><div className="m-chk">{addProf?"✓":""}</div>Add to my profile</button>
            {submitError && <div className="auth-err">{submitError}</div>}
            <div className="modal-acts">
              <button className="btn-p" style={{flex:1}} onClick={handleConfirm} disabled={submitting}>{submitting ? "…" : "Confirm →"}</button>
              <button className="btn-g" onClick={()=>{ setModal(false); setSubmitError(null); }} disabled={submitting}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
