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
        ↓
Gemini 2.5 Flash — Brand Analysis Agent
        ↓
Structured JSON: brand name, colours, pass type, fields, tagline
        ↓
Frontend animates pass card field by field
        ↓
User edits inline → CTA screen → mock send to Romax team
```

---

## File Structure

```
Hackabury-June1-2/
├── backend/
│   ├── main.py              # FastAPI app, /api/scrape endpoint
│   ├── scraper.py           # httpx + BeautifulSoup scrape logic
│   ├── gemini.py            # Gemini prompt, JSON parsing, confidence score
│   ├── requirements.txt
│   ├── start.sh
│   ├── Dockerfile           # multi-stage container build
│   └── .env                 # GEMINI_API_KEY (gitignored)
│
└── frontend/
    ├── Dockerfile           # Vite build -> nginx
    ├── nginx.conf.template  # /api proxy to the backend
    └── src/
        ├── components/
        │   ├── EntryScreen.jsx     # URL input + Preview Pass button
        │   ├── PassCard.jsx        # Animated pass card (Apple + Google Wallet)
        │   ├── EditPanel.jsx       # Inline editing — fields, colours, pass type
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

Gemini infers brand identity from scraped data and fills in realistic pass fields using its own knowledge of the brand when scraping is sparse or blocked. `confidence_score` reflects extraction quality from `0.0` to `1.0`.

---

## Pass Card

Two wallet styles — **Apple Wallet** and **Google Wallet** — toggled live.
Three barcode formats: QR Code, Barcode (linear), PDF417.

**Loading states:**
- **Skeleton phase** — shimmer animation while backend processes
- **Reveal phase** — real data fades in field by field over ~2s
- **Loaded** — static card with cardReveal animation

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
| Dev tooling | Claude Code |

---

## Dependencies

```
fastapi
uvicorn
httpx
beautifulsoup4
colorthief
google-genai
```

```bash
pip install -r requirements.txt
```

---

## Environment Variables

The Gemini key is read at runtime from the `GEMINI_API_KEY` environment variable. It is never baked into the container image.

```
GEMINI_API_KEY=your-key
```

The frontend nginx container reads `BACKEND_URL` at runtime to decide where to proxy `/api` (default `http://backend:8000`).

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

**Backend with Docker**
```bash
docker build -t passpreview-backend ./backend
docker run -p 8000:8000 --env-file ./backend/.env passpreview-backend
```

The container listens on port `8000`. If `GEMINI_API_KEY` is omitted the API still starts and the Gemini step falls back to a generated pass.

**Frontend with Docker**
```bash
docker build -t passpreview-frontend ./frontend
docker run -p 8080:80 -e BACKEND_URL=http://backend:8000 passpreview-frontend
```

The two images are separate containers. For local development link them on a shared Docker network (or use docker-compose) so nginx can reach the backend by hostname. In an ECS task with `awsvpc` networking, set `BACKEND_URL=http://localhost:8000` instead, since the containers in the same task share a network namespace.

**Both services with Docker Compose**
```bash
docker compose up -d --build
```

This starts the backend (port `8000`, key from `backend/.env`) and the frontend (port `8080` by default, proxying `/api` to the backend). Open http://localhost:8080. Stop everything with `docker compose down`.

On the EC2 host, publish the frontend on port `80` instead:
```bash
FRONTEND_PORT=80 docker compose up -d --build
```

---

## Deploying to AWS (EC2 + Terraform)

The `infra/` directory provisions a single free-tier EC2 instance with Docker pre-installed, a security group (HTTP + IP-restricted SSH), and an Elastic IP.

```bash
cd infra
cp terraform.tfvars.example terraform.tfvars   # set your IP/32 and EC2 key pair name
terraform init
terraform plan
terraform apply
```

After `apply`, SSH in and start the stack:

```bash
ssh -i ~/.ssh/<key>.pem ec2-user@<elastic-ip>   # printed as ssh_command
sudo yum install -y git                          # git is preinstalled by user_data
git clone <this-repo>
cd <repo>
echo "GEMINI_API_KEY=your-key" > backend/.env
FRONTEND_PORT=80 docker compose up -d --build
```

The app is then available at `http://<elastic-ip>` (port 80). Check first-boot progress with `sudo tail -f /var/log/cloud-init-output.log`.
