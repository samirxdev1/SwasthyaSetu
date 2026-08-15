# SwasthyaSetu — Static Design System Prompt

**Usage:** Har naye component ya page banate waqt, is poore block ko apne actual 
component request ke UPAR paste karo (Antigravity/Cursor/Claude Code mein). 
Isse har page/component visually consistent banega, alag-alag nahi lagega.

---

## COPY FROM HERE ↓

```
Follow this design system strictly for every component/page you build in this 
project. Do not deviate from these tokens, and do not fall back to generic 
Tailwind defaults (no default blue-600 buttons, no default gray cards, no 
generic shadow-md everywhere).

=== COLOR PALETTE (use these exact hex values via Tailwind config, not raw defaults) ===

Primary Palette — "Clinical Calm" (healthcare-appropriate, not cliché hospital-blue):
- Deep Teal (Primary):        #0F6E5C   — main brand color, primary buttons, active nav, headers
- Soft Sage (Primary Light):  #E7F3EF   — light backgrounds, hover states, subtle highlights
- Ink Slate (Text/Dark):      #1C2B2A   — primary text, headings (NOT pure black)
- Warm Fog (Neutral BG):      #F7F6F3   — page background (warm off-white, not stark white)
- Muted Clay (Accent):        #C9754A   — alerts, warnings, drug-interaction flags, urgent states
- Signal Blue (Info):         #3B7A9E   — lab/report status, informational badges, links

Role-Specific Accent Usage:
- Doctor Dashboard  → Deep Teal (#0F6E5C) as dominant accent
- Laboratory Dashboard → Signal Blue (#3B7A9E) as dominant accent
- Warnings / Drug-Interaction Alerts → Muted Clay (#C9754A), never harsh red — this is a 
  clinical-assist tool, not a panic siren
- Success / Confirmed states → Deep Teal at 15% opacity background + Deep Teal text

Never use: default Tailwind blue-500/600, default red-500 for warnings, pure 
#000000 or #FFFFFF, or purple/violet gradients (reads as generic AI-tool template).

=== TYPOGRAPHY ===

- Display/Headings: "Sora" or "Manrope" (geometric, clean, confident — NOT Inter 
  for headings, it's the default everywhere)
- Body text: "Inter" (fine for body copy, readable at small sizes for data-dense 
  dashboards)
- Data/Numbers (patient IDs, dosages, report values): "IBM Plex Mono" — gives 
  medical data a precise, tabular feel and visually distinguishes data from prose
- Type scale: use restrained sizes — headings should feel calm and clinical, not 
  loud. Avoid oversized hero-style headings inside dashboards; save size 
  contrast for empty-states and key alerts only.

=== LAYOUT & SPACING ===

- Base spacing unit: 4px grid (Tailwind default spacing scale is fine here)
- Card radius: 12px (rounded-xl) — soft but not overly playful (avoid rounded-3xl)
- Card style: 1px solid border in Soft Sage (#E7F3EF) + very subtle shadow 
  (shadow-sm only) — avoid heavy drop shadows, this is a clinical tool, not a 
  marketing site
- Dashboard layout: persistent left sidebar (icons + labels) + top-right role/user 
  indicator, content area uses generous whitespace (dense medical data needs 
  breathing room to stay scannable)
- Data tables: zebra-striping using Warm Fog (#F7F6F3) on alternate rows, never 
  heavy grid lines — use hairline dividers (border-slate-100 equivalent) only

=== ANIMATION & MOTION (use sparingly — this is a trust-first clinical tool) ===

- Page/route transitions: simple 150–200ms fade + 4px slide-up on route change 
  (subtle, not bouncy)
- Card/list item entry: staggered fade-in (30–50ms delay between items) when a 
  dashboard loads data — signals "live data," not decoration
- Button interactions: 100ms ease-out scale (0.98) on click, background color 
  transition 150ms on hover — no bounce, no spring physics (springs feel playful, 
  wrong tone for medical data)
- AI-processing states (e.g., prescription scan, drug-interaction check running): 
  use a calm pulsing dot/skeleton loader in Soft Sage — never a spinning generic 
  loader icon, and never fake "typing" animation longer than the actual wait
- Alerts (drug-interaction warning appearing): slide-in from top, 200ms, with a 
  soft Muted Clay left-border accent — draws attention without alarm
- AVOID: confetti, bounce effects, gradient-shifting backgrounds, glassmorphism/
  blur-heavy cards, anything that feels "startup landing page" rather than 
  "clinical software"

=== COMPONENT PERSONALITY ===

This is a tool doctors and lab technicians will use during real consultations — 
design for speed, clarity, and trust, not delight-first. Every screen should 
answer "what do I need to know/do right now" in under 2 seconds of scanning. 
Prioritize information hierarchy over visual flourish. One deliberate accent 
moment per screen is enough (e.g., the drug-interaction alert, or the QR health 
ID) — keep everything else quiet and disciplined around it.

Ensure: responsive down to tablet width (doctors may use this on a tablet during 
rounds), visible keyboard focus states, and reduced-motion support (respect 
prefers-reduced-motion — disable non-essential transitions for users who have 
this set).
```

## ↑ COPY UNTIL HERE

---

**Kaise use karo:** Antigravity mein jab bhi bologe "DoctorDashboard.jsx banao" ya 
"ReportUploadForm banao," pehle yeh poora block paste karo, phir uske neeche apna 
actual component request likho. Isse:
- Har page same color/font/spacing use karega
- Random animations nahi aayenge jo AI khud decide kar leta hai
- Poora app ek hi hath se design kiya hua lagega, patchwork nahi lagega