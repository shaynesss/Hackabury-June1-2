import { useState } from 'react'
import PassCard from './PassCard'

export default function CTAScreen({ data, onBack, barcodeType = 'qr', walletType = 'apple' }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  function handleSend() {
    if (!email) return
    console.log('[PassDraft] Lead captured:', { email, pass: data })
    setSent(true)
  }

  return (
    <div className="cta-screen">
      <div className="cta-pass-mini">
        <PassCard data={data} walletType={walletType} barcodeType={barcodeType} />
      </div>

      <div>
        <h2 className="cta-heading">Like what you see?<br />This is just the beginning.</h2>
        <p className="cta-sub">
          This is a preview. The full Romax Digital Card Platform lets you manage members, issue passes, push live updates, and connect to Apple Wallet and Google Wallet.
        </p>
      </div>

      {sent ? (
        <div className="cta-success">
          Message sent. The Romax team will be in touch shortly.
        </div>
      ) : (
        <div className="cta-form">
          <input
            className="cta-input"
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoFocus
          />
          <a
            href="https://romax.co.uk/digital/products/digital-membership-cards/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ display: 'block', textDecoration: 'none', textAlign: 'center' }}
          >
            Create this on the Digital Card Platform →
          </a>
          <button className="btn-secondary" onClick={handleSend} disabled={!email}>
            Send to Our Team
          </button>
        </div>
      )}

      <div className="cta-secondary-links">
        <button className="cta-link-btn" onClick={onBack}>← Back to edit</button>
      </div>
    </div>
  )
}
