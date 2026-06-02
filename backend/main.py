import base64
import os
from urllib.parse import quote, urlparse

import httpx
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from dotenv import load_dotenv

from scraper import scrape_page
from gemini import analyse

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_PROXY_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
}


class ScrapeRequest(BaseModel):
    url: str


@app.get("/api/proxy")
async def proxy_image(url: str = Query(...)):
    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=8) as client:
            r = await client.get(url, headers=_PROXY_HEADERS)
        ct = r.headers.get("content-type", "image/jpeg").split(";")[0].strip()
        return Response(
            content=r.content,
            media_type=ct,
            headers={"Cache-Control": "public, max-age=86400"},
        )
    except Exception:
        return Response(status_code=404)


@app.post("/api/scrape")
async def scrape(req: ScrapeRequest):
    import time
    t0 = time.time()
    try:
        scraped = await scrape_page(req.url)
        print(f"[scrape] {time.time()-t0:.2f}s")
    except Exception as exc:
        return {"error": f"Failed to fetch URL: {exc}"}

    t1 = time.time()
    result = await analyse(scraped)
    print(f"[gemini] {time.time()-t1:.2f}s  [total] {time.time()-t0:.2f}s")

    if scraped.get("logo_b64"):
        result["logo_url"] = scraped["logo_b64"]

    strip_url = scraped.get("strip_image_url")
    if strip_url:
        result["strip_image"] = f"/api/proxy?url={quote(strip_url, safe='')}"
        result["show_strip"] = True
    else:
        result["strip_image"] = None
        result["show_strip"] = False

    if scraped.get("blocked"):
        result["blocked"] = True
        result["block_reason"] = scraped.get("block_reason", "unknown")
        if not result.get("logo_url"):
            try:
                domain = urlparse(req.url).netloc.lstrip("www.")
                async with httpx.AsyncClient(follow_redirects=True, timeout=4) as client:
                    r = await client.get(f"https://logo.clearbit.com/{domain}")
                if r.status_code == 200 and len(r.content) > 100:
                    mime = r.headers.get("content-type", "image/png").split(";")[0].strip()
                    result["logo_url"] = f"data:{mime};base64,{base64.b64encode(r.content).decode()}"
            except Exception:
                pass

    return result
