import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import dotenv_values, load_dotenv

from scraper import scrape_page
from gemini import analyse

_ENV_PATH = Path(__file__).with_name(".env")
load_dotenv(dotenv_path=_ENV_PATH, override=True)

if "GEMINI_API_KEY" not in os.environ:
    env_values = dotenv_values(_ENV_PATH)
    if env_values.get("GEMINI_API_KEY"):
        os.environ["GEMINI_API_KEY"] = env_values["GEMINI_API_KEY"]

print(f"[env] path={_ENV_PATH} exists={_ENV_PATH.exists()}")
print(f"[env] GEMINI_API_KEY set={bool(os.getenv('GEMINI_API_KEY'))}")

app = FastAPI()

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

    if scraped.get("blocked"):
        result["blocked"] = True
        result["block_reason"] = scraped.get("block_reason", "unknown")

    return result
