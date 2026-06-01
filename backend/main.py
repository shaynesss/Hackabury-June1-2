import os
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from scraper import scrape_page
from gemini import analyse

load_dotenv()


def _prewarm():
    try:
        from google import genai
        from google.genai import types
        from bs4 import BeautifulSoup
        from colorthief import ColorThief
    except Exception:
        pass


@asynccontextmanager
async def lifespan(app: FastAPI):
    loop = asyncio.get_event_loop()
    loop.run_in_executor(None, _prewarm)
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class ScrapeRequest(BaseModel):
    url: str


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
    return result
