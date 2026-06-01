import httpx
from urllib.parse import urljoin

_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-GB,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "DNT": "1",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
}


def _to_hex(rgb: tuple) -> str:
    return "#{:02x}{:02x}{:02x}".format(*rgb)


async def scrape_page(url: str) -> dict:
    from bs4 import BeautifulSoup
    from colorthief import ColorThief
    from io import BytesIO
    async with httpx.AsyncClient(follow_redirects=True, timeout=10) as client:
        resp = await client.get(url, headers=_HEADERS)
        if resp.status_code == 403:
            from urllib.parse import urlparse
            domain = urlparse(url).netloc.replace("www.", "")
            return {"title": domain, "description": "", "logo_url": None, "theme_color": None, "body_text": f"Brand: {domain}. Site blocked scraping — use your knowledge of this brand to generate realistic pass fields.", "image_colors": [], "blocked": True}
        resp.raise_for_status()

    soup = BeautifulSoup(resp.text, "html.parser")

    def meta(prop: str | None = None, name: str | None = None) -> str:
        tag = (
            soup.find("meta", property=prop)
            if prop
            else soup.find("meta", attrs={"name": name})
        )
        return tag.get("content", "").strip() if tag else ""

    title = meta(prop="og:title") or (soup.title.string.strip() if soup.title else "")
    description = meta(prop="og:description") or meta(name="description")
    logo_url: str | None = meta(prop="og:image") or None
    theme_color: str | None = meta(name="theme-color") or None

    if not logo_url:
        favicon = soup.find("link", rel=lambda x: x and "icon" in x)
        if favicon:
            href = favicon.get("href", "")
            logo_url = urljoin(url, href) if href else None

    for tag in soup(["script", "style", "noscript"]):
        tag.decompose()
    body_text = " ".join(soup.get_text(" ", strip=True).split())[:800]

    image_colors: list[str] = []
    if logo_url:
        try:
            async with httpx.AsyncClient(follow_redirects=True, timeout=3) as client:
                img_resp = await client.get(logo_url, headers=_HEADERS)
            if len(img_resp.content) < 200_000:
                ct = ColorThief(BytesIO(img_resp.content))
                palette = ct.get_palette(color_count=3, quality=1)
                image_colors = [_to_hex(c) for c in palette]
        except Exception:
            pass

    return {
        "title": title,
        "description": description,
        "logo_url": logo_url,
        "theme_color": theme_color,
        "body_text": body_text,
        "image_colors": image_colors,
    }
