# GMI's PassPreview — Hackabury 2026

A sales and onboarding tool for Romax Digital. Paste any client website URL and the backend scrapes it, Gemini analyses the brand identity, and an animated digital wallet pass preview builds itself in real time. The pass can be edited inline and sent to the Romax team via a CTA flow.

---

## Architecture

```
User pastes a website URL
        ↓
React + Vite frontend (localhost:5173)
        ↓
FastAPI backend (localhost:8000)
        ↓
httpx fetches raw HTML → BeautifulSoup extracts
title, description, og:image, favicon, theme-color, body text
        ↓
colorthief pulls dominant colour palette from logo
logo fetched as base64 — og:image saved as strip_image_url
        ↓
Gemini 2.5 Flash — Brand Analysis Agent
        ↓
Structured JSON: brand name, colours, pass type, fields, tagline
        ↓
Frontend animates pass card field by field
Strip/banner image loades 
        ↓
User edits inline → CTA screen → mock send to Romax team
```

---

## File Structure

```
Hackabury-June1-2/
├── backend/
│   ├── main.py              # FastAPI app, /api/scrape + /api/proxy endpoints
│   ├── scraper.py           # httpx + BeautifulSoup scrape logic
│   ├── gemini.py            # Gemini prompt, JSON parsing, confidence score
│   ├── requirements.txt
│   ├── start.sh
│   └── .env                 # GEMINI_API_KEY
│
└── frontend/
    └── src/
        ├── components/
        │   ├── EntryScreen.jsx     # URL input + Preview Pass button
        │   ├── PassCard.jsx        # Animated pass card (Apple + Google Wallet)
        │   ├── EditPanel.jsx       # Inline editing — fields, colours, pass type, strip toggle
        │   ├── CTAScreen.jsx       # Email capture + platform link + mock send
        │   ├── InfoPanel.jsx       # Confidence score + pass info sidebar
        │   └── BlockedScreen.jsx   # Shown when site uses bot protection
        ├── App.jsx
        ├── api.js
        └── index.css
```

---

## Gemini Agent

**Model:** Gemini 2.5 Flash

**Input:** Scraped page data — title, description, body text, logo URL, theme colour, dominant image colours

**Output:** Structured JSON

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

Gemini infers brand identity from scraped data and fills in realistic pass fields using its own knowledge of the brand when scraping is sparse or blocked. `confidence_score` reflects extraction quality from 0.0 to 1.0.

---

## Pass Card

Two wallet styles — **Apple Wallet** and **Google Wallet** — toggled live. Three barcode formats: QR Code, Barcode (linear), PDF417.

**Loading states:**
- **Skeleton phase** — wobble animation while backend processes
- **Reveal phase** — real data fades in field by field over ~2s
- **Loaded** — static card with `cardReveal` animation

**Strip / Banner Image**

When a site's `og:image` is found during scraping, it is used as a header banner on the pass card. The image is fetched server-side via `/api/proxy` to avoid browser CORS restrictions and cached for 24 hours.


---

## Bot Protection Handling

The scraper detects blocked sites via response headers and HTML patterns:

| Reason | Detection |
|---|---|
| `cloudflare` | `cf-ray` header or "Just a moment" page |
| `bot_wall` | Imperva `x-iinfo` header, DataDome, PerimeterX markers |
| `captcha` | reCAPTCHA, hCaptcha strings in HTML |
| `forbidden` | HTTP 403 |
| `empty_page` | Response body under 1000 characters |

When blocked, Gemini falls back to brand knowledge and a `BlockedScreen` is shown with a preview option.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React + Vite |
| Backend | FastAPI + uvicorn |
| Scraping | httpx + BeautifulSoup |
| Colour extraction | colorthief |
| AI | Gemini 2.5 Flash |
| Dev tooling | Claude |

---

## Dependencies

```
fastapi
uvicorn
httpx
beautifulsoup4
colorthief
google-genai
python-dotenv
```

```bash
pip install -r requirements.txt
```

---

## Environment Variables

```
GEMINI_API_KEY=your-key
```

---

## Running Locally

**Backend**
```bash
cd backend
./start.sh
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `localhost:5173`, proxies `/api` to `localhost:8000`.
