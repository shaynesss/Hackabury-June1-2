import { useState } from 'react'
import PassCard from './PassCard'

export default function CTAScreen({ data, onBack }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    console.log('[PassDraft] Lead captured:', { email, pass: data })
    setSent(true)
  }

  return (
    <div className="cta-screen">
      <div className="cta-pass-mini">
        <PassCard data={data} walletType="apple" />
      </div>

      <div>
        <h2 className="cta-heading">Like this pass?<br />Let's make it real.</h2>
        <p className="cta-sub">
          Send a draft to the Romax team and we'll build the real wallet pass for your client.
        </p>
      </div>

      {sent ? (
        <div className="cta-success">
          Pass snapshot sent. The Romax team will reach out shortly.
        </div>
      ) : (
        <form className="cta-form" onSubmit={handleSubmit}>
          <input
            className="cta-input"
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
          />
          <button className="btn-primary" type="submit">
            Send to Romax team →
          </button>
        </form>
      )}

      <div className="cta-secondary-links">
        <button className="cta-link-btn" onClick={onBack}>← Back to edit</button>
        <button className="cta-link-btn">Book a demo</button>
        <button className="cta-link-btn">Start onboarding</button>
      </div>
    </div>
  )
}
