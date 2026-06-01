const REASON_TEXT = {
  cloudflare:   'This site uses Cloudflare bot protection — our scraper was blocked before reaching any content.',
  bot_wall:     'This site uses bot protection (Imperva, PerimeterX, or similar) — our scraper was challenged before reaching any content.',
  captcha:      'This site requires a CAPTCHA challenge that we cannot complete automatically.',
  rate_limited: 'This site rate-limited our request. Try again in a moment.',
  empty_page:   'This site renders entirely in JavaScript — no content was accessible to our scraper.',
  forbidden:    'This site blocked our request outright (403 Forbidden).',
  unknown:      'This site blocked automated access.',
}

export default function BlockedScreen({ data, onPreview, onBack }) {
  const reason = REASON_TEXT[data?.block_reason] || REASON_TEXT.unknown
  const brand  = data?.brand_name || 'this site'

  return (
    <div className="blocked-screen">
      <div className="blocked-badge">Bot Protected</div>

      <div className="blocked-content">
        <h2 className="blocked-title">Couldn't scrape {brand}</h2>
        <p className="blocked-reason">{reason}</p>
      </div>

      <div className="blocked-notice">
        We asked Gemini to generate a pass using its knowledge of this brand instead.
        The result may be less accurate than a live scrape.
      </div>

      <div className="blocked-actions">
        <button className="btn-primary" onClick={onPreview}>View generated pass</button>
        <button className="btn-secondary" onClick={onBack}>Try another URL</button>
      </div>
    </div>
  )
}
