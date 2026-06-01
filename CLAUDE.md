# CLAUDE.md — PassDraft

This file defines how Claude Code should behave on the PassDraft project.
Read this before doing anything else. These are not suggestions — they are the process.

---

## What We're Building

PassDraft is a sales and onboarding tool for Romax Digital's hackathon.
The user pastes a client website URL, the backend scrapes it, Gemini analyses the brand identity and returns structured JSON, and a pass card animates into existence in real time on screen. Once rendered, the client can edit the pass inline and send a draft to the Romax sales team.

One sentence: **Turn any website URL into an animated, editable digital wallet pass preview in one click.**

---

## Core Philosophy

- **Plan before code.** Never start writing implementation until the spec is signed off.
- **Small tasks over big ones.** If a task takes more than ~10 minutes, it's too large — break it down.
- **Verify before moving on.** Don't declare a task done without checking it actually works.
- **Systematic over ad-hoc.** When something breaks, diagnose — don't guess and patch.
- **Simplicity wins.** The elegant solution beats the clever one. YAGNI — You Aren't Gonna Need It.
- **24 hours.** Scope ruthlessly. If it isn't in the milestones, it doesn't get built until milestones are done.

---

## Team & Ownership

| Person | Owns |
|---|---|
| Shayne | AI scraping pipeline, Gemini prompt, JSON generation (`/backend`) |
| teammate-ui | Pass card component, animated loading screen, wallet toggle (`/frontend/src/components/PassCard`) |
| teammate-edit | Edit mode, colour picker, field editing, CTA + send flow (`/frontend/src/components/EditPanel`, `CTAScreen`) |

**Rule:** Don't touch another person's ownership area without flagging it first. Merge conflicts in a 24hr hackathon kill time.

---

## Milestones

### Milestone 1 — JSON Pipeline (Shayne's first deliverable)
> The scrape + Gemini analysis endpoint is working and returning valid, structured JSON.
> Nothing else gets built until this is done. UI and edit mode depend on this contract.

Output contract — the `/api/scrape` endpoint must return exactly this shape:

```json
{
  "brand_name": "string",
  "logo_url": "string | null",
  "colours": {
    "primary": "#hex",
    "secondary": "#hex",
    "text": "#hex"
  },
  "pass_type": "Membership Card | Event Pass | Loyalty Card | Supporter Card | Member ID",
  "fields": [
    { "label": "string", "value": "string" }
  ],
  "tagline": "string",
  "confidence_score": 0.0
}
```

**Verified when:** `curl -X POST http://localhost:8000/api/scrape -d '{"url":"https://example.com"}'` returns valid JSON matching the contract above, with no missing fields.

---

### Milestone 2 — Animated Pass Card
> UI teammate renders the pass card component, wired to the JSON contract.
> Card animates in real time as fields arrive. Spin/tilt running throughout load phase.

**Verified when:** Hardcoded mock JSON triggers the full card animation sequence in the browser.

---

### Milestone 3 — Edit Mode
> Edit teammate wires inline editing to the rendered pass.
> Title, fields, colours, QR value, pass type all editable. Preview updates live.

**Verified when:** Changing any field in edit mode updates the card preview without page reload.

---

### Milestone 4 — CTA + Send Flow
> Final screen with email capture. Mock POST fires on submit. Success state shown.

**Verified when:** Submitting the form logs the pass snapshot + email to the console (mock).

---

### Milestone 5 — Integration + Polish
> All three parts wired end-to-end. Real URL → scrape → animate → edit → send.
> Apple Wallet / Google Wallet toggle working.

**Verified when:** Demo flow runs on a real website URL without errors.

---

## Architecture

```
passdraft/
├── backend/
│   ├── main.py              # FastAPI app, /api/scrape endpoint
│   ├── scraper.py           # httpx + BeautifulSoup scrape logic
│   ├── gemini.py            # Gemini prompt, JSON parsing, confidence score
│   ├── requirements.txt
│   └── .env                 # GEMINI_API_KEY (never committed)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── EntryScreen.jsx       # URL input + Preview Pass button
│   │   │   ├── PassCard.jsx          # Animated pass card (UI teammate)
│   │   │   ├── EditPanel.jsx         # Inline editing (edit teammate)
│   │   │   ├── CTAScreen.jsx         # Email capture + send (edit teammate)
│   │   │   └── InfoPanel.jsx         # Pass info breakdown sidebar
│   │   ├── App.jsx                   # Stage router: entry → loading → render → edit → cta
│   │   ├── api.js                    # fetch wrapper for /api/scrape
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js
│
├── .env.example
└── README.md
```

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React + Vite | Team knows it, fast dev server |
| Backend | FastAPI + uvicorn | Shayne knows it, async-friendly |
| Scraping | httpx + BeautifulSoup | Lightweight, no browser overhead |
| Colour extraction | colorthief | Pulls dominant palette from logo/image |
| AI | Gemini 2.5 Flash | Fast, structured output, team has API access |
| Deployment | localhost → Vercel (frontend) + single server (backend) | Demo-first, upgrade if time allows |

---

## App Flow

```
[1] ENTRY
User pastes URL → clicks "Preview Pass"

[2] SCRAPE + EXTRACT (backend — Shayne)
FastAPI hits the URL
httpx fetches raw HTML
BeautifulSoup pulls: title, meta description, og:image,
favicon, theme-color, body text snippets
colorthief extracts dominant colours from logo/image

[3] AI ANALYSIS (backend — Shayne)
Single Gemini prompt fed the scraped data
Returns structured JSON:
  → Brand name, dominant colours, logo URL
  → Pass type classification (Membership / Event / Loyalty / Badge)
  → 3-4 suggested field labels + values
  → Tagline / pass description
  → Confidence score on extraction quality (0.0 – 1.0)

[4] LOADING SCREEN (frontend — UI teammate)
While Gemini processes, pass card is visible — ghosted and incomplete
As each JSON field arrives, the card evolves:
  - Name fades in
  - Colour washes across the card
  - Logo appears
  - Fields populate one by one
  - QR code materialises last
Card has slow continuous spin/tilt (CSS 3D transform) throughout

[5] FULL RENDER (frontend — UI teammate)
Pass snaps into final state
Toggle: Apple Wallet style ↔ Google Wallet style
Side panel shows pass info breakdown
(fields, values, pass type, confidence score)

[6] EDIT MODE (frontend — edit teammate)
Inline editing unlocks:
  - Title, fields, values
  - Colour picker (pre-seeded with extracted palette)
  - QR/barcode value
  - Pass type selector
Preview updates live as edits are made
Card stops spinning — feels "locked in"

[7] CTA + SEND (frontend — edit teammate)
"Like this pass? Create it properly →"
Email capture field
"Send to Romax team" → mock POST, logs snapshot + email
Secondary buttons: Book a demo / Start onboarding
```

---

## Phase 2 — SETUP

Before touching feature code:

- [ ] Confirm GitHub repo shared with all 3 teammates
- [ ] Generate `.env.example` with `GEMINI_API_KEY=`
- [ ] Set up folder structure matching the architecture above
- [ ] Each teammate creates their own branch off `main`
- [ ] `README.md` created with setup instructions
- [ ] Confirm `/api/scrape` JSON contract agreed by all three — this is the team interface

---

## Phase 3 — BUILD

### Implementation Rules

**Test as you go**
- Every endpoint must be curl-tested before handing off to frontend
- Every component must render with mock JSON before wiring to real API
- Don't integrate until both sides are individually verified

**Review gates**
After each milestone, check:
1. Does it match the spec exactly?
2. Are edge cases handled? (bad URL, scrape fails, Gemini returns malformed JSON)

**Debugging protocol**
When something breaks:
1. Reproduce reliably
2. Identify exact failure point (terminal log, network tab, console error)
3. Form one hypothesis
4. Test it — one change at a time
5. Fix root cause, not symptom

**Edge cases to handle (don't skip these)**
- URL is unreachable or returns non-200 → return error JSON with message
- Gemini returns malformed or incomplete JSON → fallback to empty fields, confidence_score: 0
- Logo URL is unreachable → hide logo gracefully, don't break card render
- No theme-color or og:image found → use fallback palette (#1a1a1a, #ffffff)

---

## Phase 4 — FINISH

- [ ] Full demo run on 3 real URLs without errors
- [ ] README updated with setup and run instructions
- [ ] `.env.example` accurate and committed
- [ ] All branches merged to main
- [ ] Demo script written — who says what, which URL gets entered first

---

## Standing Rules

**On writing code**
- One responsibility per function
- Name things clearly — code is read more than it's written
- No commented-out code — delete it
- All secrets in `.env`, never hardcoded, never committed

**On asking questions**
- Ask before assuming on anything that touches the JSON contract
- Don't ask permission for obvious implementation details — make a call and note it
- If something seems wrong with the plan, say so before building it

**On communication**
- Short status update to the team after each milestone
- Flag blockers immediately — don't silently work around them
- If you change the JSON contract shape for any reason, tell the team before pushing

---

## Project-Specific Overrides

<!-- PROJECT OVERRIDES START -->

- **AI model:** Gemini 2.5 Flash only. Do not swap to another model mid-hackathon.
- **No .pkpass generation.** The pass is a UI preview only — not a real wallet file.
- **No real email sending.** The send flow is a mock POST that logs to console.
- **Confidence score** is generated by Gemini as part of the prompt response — it is not calculated separately on the backend.
- **Deployment target:** localhost for the hackathon. Vercel (frontend) + single server (backend) only if Milestone 5 is done with time to spare.
- **JSON contract is frozen after Milestone 1.** No shape changes without full team agreement.

<!-- PROJECT OVERRIDES END -->
