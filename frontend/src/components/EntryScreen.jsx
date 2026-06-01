import { useState } from 'react'

export default function EntryScreen({ onSubmit, onDemo, error }) {
  const [url, setUrl] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = url.trim()
    if (!trimmed) return
    const withProtocol = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`
    onSubmit(withProtocol)
  }

  return (
    <div className="entry-screen">
      <div className="entry-brand">
        <img
          src="https://romax.co.uk/wp-content/uploads/2021/09/Romax-logo.svg"
          alt="Romax"
          className="entry-romax-logo"
        />
        <div className="entry-product-name">PassPreview — Romax</div>
        <p className="entry-desc">
          Paste any website URL and preview it as a digital wallet pass in seconds.
        </p>
      </div>

      <form className="entry-form" onSubmit={handleSubmit}>
        <div className="entry-input-row">
          <input
            className="entry-input"
            type="text"
            placeholder="https://client-website.com"
            value={url}
            onChange={e => setUrl(e.target.value)}
            autoFocus
          />
          <button className="entry-submit" type="submit" disabled={!url.trim()}>
            Preview Pass →
          </button>
        </div>
        {error && <div className="entry-error">{error}</div>}
      </form>

      <button className="demo-btn" type="button" onClick={onDemo}>
        Try demo pass →
      </button>
    </div>
  )
}
