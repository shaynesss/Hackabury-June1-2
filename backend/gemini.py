import json
import os
import re

_PASS_TYPES = ("Membership Card", "Event Pass", "Loyalty Card", "Supporter Card", "Member ID")

_FALLBACK_COLOURS = {"primary": "#1a1a1a", "secondary": "#ffffff", "text": "#ffffff"}

_PROMPT = """\
You are a digital pass design expert. Produce a JSON object for a digital wallet pass preview.

## Website Data
Title: {title}
Description: {description}
Logo URL: {logo_url}
Theme colour: {theme_color}
Dominant image colours: {image_colors}
Body text snippet: {body_text}

## Instructions
1. Infer brand_name from the title and body text. If the body text says "use your knowledge", rely on what you know about that brand.
2. Set logo_url to the provided Logo URL if it looks like a valid image (png, jpg, webp, svg, ico), otherwise null.
3. Choose primary, secondary, and text hex colours that match this brand. Use the theme/image colours if available; otherwise use your knowledge of the brand's real colours.
4. Classify pass_type as exactly one of: "Membership Card", "Event Pass", "Loyalty Card", "Supporter Card", "Member ID".
5. Produce exactly 4 field objects with realistic label and value pairs for this brand (e.g. Member ID, Tier, Points, Expiry, Store, Club). Use your knowledge of the brand if scraped data is sparse.
6. Write a tagline of at most 8 words capturing what this pass represents.
7. Set confidence_score between 0.0 and 1.0 reflecting extraction quality.

Return ONLY a JSON object with exactly these keys:
{{
  "brand_name": "string",
  "logo_url": "string or null",
  "colours": {{"primary": "#hex", "secondary": "#hex", "text": "#hex"}},
  "pass_type": "one of the five types",
  "fields": [{{"label": "string", "value": "string"}}],
  "tagline": "string",
  "confidence_score": 0.0
}}
"""


def _build_prompt(scraped: dict) -> str:
    return _PROMPT.format(
        title=scraped.get("title") or "(none)",
        description=scraped.get("description") or "(none)",
        logo_url=scraped.get("logo_url") or "(none)",
        theme_color=scraped.get("theme_color") or "(none)",
        image_colors=", ".join(scraped.get("image_colors") or []) or "(none)",
        body_text=scraped.get("body_text") or "(none)",
    )


def _normalize_hex(value: str | None, fallback: str) -> str:
    if not value:
        return fallback
    match = re.fullmatch(r"#?([0-9a-fA-F]{6})", value.strip())
    if not match:
        return fallback
    return f"#{match.group(1).lower()}"


def _hex_to_rgb(value: str) -> tuple[int, int, int] | None:
    match = re.fullmatch(r"#?([0-9a-fA-F]{6})", value.strip())
    if not match:
        return None
    hex_value = match.group(1)
    return tuple(int(hex_value[i:i+2], 16) for i in (0, 2, 4))


def _is_light(hex_value: str) -> bool:
    rgb = _hex_to_rgb(hex_value)
    if not rgb:
        return False
    r, g, b = rgb
    luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
    return luminance > 0.8


def _colors_from_scraped(scraped: dict) -> dict:
    image_colors = [c for c in (scraped.get("image_colors") or []) if _hex_to_rgb(c)]
    theme_color = scraped.get("theme_color")

    primary = None
    for color in image_colors:
        if not _is_light(color):
            primary = color
            break
    if not primary and theme_color:
        primary = _normalize_hex(theme_color, None)
    if not primary and image_colors:
        primary = image_colors[0]
    if not primary:
        return _FALLBACK_COLOURS

    secondary = image_colors[1] if len(image_colors) > 1 else _FALLBACK_COLOURS["secondary"]
    text = "#ffffff" if not _is_light(primary) else "#111111"

    return {
        "primary": _normalize_hex(primary, _FALLBACK_COLOURS["primary"]),
        "secondary": _normalize_hex(secondary, _FALLBACK_COLOURS["secondary"]),
        "text": _normalize_hex(text, _FALLBACK_COLOURS["text"]),
    }


def _default_fields(scraped: dict) -> list[dict]:
    title = (scraped.get("title") or "Member")[:32]
    return [
        {"label": "Member", "value": title},
        {"label": "Tier", "value": "Standard"},
        {"label": "Since", "value": "2025"},
        {"label": "ID", "value": "PASS-0001"},
    ]


def _normalize_pass_type(value: str | None) -> str:
    if not value:
        return "Membership Card"
    if value in _PASS_TYPES:
        return value
    low = value.lower()
    if "event" in low:
        return "Event Pass"
    if "loyal" in low:
        return "Loyalty Card"
    if "support" in low or "fan" in low:
        return "Supporter Card"
    if "id" in low or "member" in low:
        return "Member ID"
    return "Membership Card"


def _normalize_fields(fields) -> list[dict]:
    if isinstance(fields, dict):
        return [{"label": str(k), "value": str(v)} for k, v in fields.items()]
    if not isinstance(fields, list):
        return []

    normalized = []
    for item in fields:
        if isinstance(item, dict) and "label" in item and "value" in item:
            normalized.append({"label": str(item["label"]), "value": str(item["value"])})
            continue
        if isinstance(item, (list, tuple)) and len(item) == 2:
            normalized.append({"label": str(item[0]), "value": str(item[1])})
            continue
        if isinstance(item, str):
            normalized.append({"label": "Field", "value": item})
    return normalized


def _normalize(data: dict, scraped: dict) -> dict:
    if not isinstance(data, dict):
        raise ValueError("response is not an object")

    if "colours" not in data and "colors" in data:
        data["colours"] = data.pop("colors")

    scraped_colours = _colors_from_scraped(scraped)
    colours = data.get("colours") if isinstance(data.get("colours"), dict) else {}
    colours = {
        "primary": _normalize_hex(colours.get("primary"), scraped_colours["primary"]),
        "secondary": _normalize_hex(colours.get("secondary"), scraped_colours["secondary"]),
        "text": _normalize_hex(colours.get("text"), scraped_colours["text"]),
    }

    fields = _normalize_fields(data.get("fields"))
    if len(fields) < 4:
        fields = (fields + _default_fields(scraped))[:4]
    else:
        fields = fields[:4]

    confidence = data.get("confidence_score")
    try:
        confidence = float(confidence)
    except Exception:
        confidence = 0.0
    confidence = max(0.0, min(1.0, confidence))

    return {
        "brand_name": str(data.get("brand_name") or scraped.get("title") or ""),
        "logo_url": data.get("logo_url") or scraped.get("logo_url"),
        "colours": colours,
        "pass_type": _normalize_pass_type(data.get("pass_type")),
        "fields": fields,
        "tagline": str(data.get("tagline") or ""),
        "confidence_score": confidence,
    }


def _validate(data: dict) -> dict:
    required = {"brand_name", "logo_url", "colours", "pass_type", "fields", "tagline", "confidence_score"}
    if not required.issubset(data.keys()):
        raise ValueError(f"missing keys: {required - data.keys()}")
    colours = data["colours"]
    if not {"primary", "secondary", "text"}.issubset(colours.keys()):
        raise ValueError("missing colour keys")
    if data["pass_type"] not in _PASS_TYPES:
        raise ValueError(f"invalid pass_type: {data['pass_type']}")
    return data


def _fallback(scraped: dict) -> dict:
    return {
        "brand_name": scraped.get("title") or "",
        "logo_url": scraped.get("logo_url"),
        "colours": _colors_from_scraped(scraped),
        "pass_type": "Membership Card",
        "fields": _default_fields(scraped),
        "tagline": "",
        "confidence_score": 0.0,
    }


def _extract_json(text: str) -> dict:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        parts = cleaned.split("```")
        if len(parts) >= 3:
            cleaned = parts[1].strip()
    match = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if match:
        cleaned = match.group(0)
    return json.loads(cleaned)


async def analyse(scraped: dict) -> dict:
    import asyncio
    from google import genai
    from google.genai import types

    prompt = _build_prompt(scraped)

    try:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY is not set")
        client = genai.Client(api_key=api_key)
        response = await asyncio.wait_for(
            client.aio.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    thinking_config=types.ThinkingConfig(thinking_budget=0),
                ),
            ),
            timeout=25,
        )
        data = _extract_json(response.text)
        data = _normalize(data, scraped)
        return _validate(data)
    except Exception:
        return _fallback(scraped)
