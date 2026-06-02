import { useState } from 'react'
import PassCard from './PassCard'

const PASS_TYPES = [
  'Membership Card',
  'Event Pass',
  'Loyalty Card',
  'Supporter Card',
  'Member ID',
]

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

export default function EditPanel({
  data,
  onSend,
  onRestart,
  barcodeType = 'qr',
  onBarcodeTypeChange,
  walletType = 'apple',
  onWalletTypeChange,
}) {
  const [draft, setDraft] = useState({
    ...data,
    colours: { ...data.colours },
    fields: data.fields.map(f => ({ ...f })),
  })
  const [localBarcodeType, setLocalBarcodeType] = useState(barcodeType)

  function set(key, val) {
    setDraft(d => ({ ...d, [key]: val }))
  }

  function setColour(key, val) {
    setDraft(d => ({ ...d, colours: { ...d.colours, [key]: val } }))
  }

  function setField(i, key, val) {
    setDraft(d => ({
      ...d,
      fields: d.fields.map((f, fi) => fi === i ? { ...f, [key]: val } : f),
    }))
  }

  function handleBarcodeChange(val) {
    setLocalBarcodeType(val)
    onBarcodeTypeChange?.(val)
  }

  function handleImageUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => set('image_url', reader.result)
    reader.readAsDataURL(file)
  }

  function handleIconUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => set('logo_url', reader.result)
    reader.readAsDataURL(file)
  }

  function handleFinish() {
    onSend(draft)
  }

  return (
    <div className="stage-edit">
      <div className="edit-header">
        <div className="edit-header-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="3" />
            <circle cx="9" cy="11" r="2.5" />
            <path d="M4 20c0-2 2-3.5 5-3.5s5 1.5 5 3.5" />
            <line x1="16" y1="9" x2="20" y2="9" />
            <line x1="16" y1="13" x2="19" y2="13" />
          </svg>
        </div>
        <div>
          <h1 className="edit-title">Edit Your Card</h1>
          <p className="edit-subtitle">Customise how your card looks</p>
        </div>
      </div>

      <div className="edit-body">
        {/* Column 1 — Card Details */}
        <div className="edit-left-col">
          <div className="edit-panel">
            <div className="edit-panel-title">Card Details</div>
            <div className="edit-group">
              <label className="edit-label">Company Name</label>
              <input
                className="edit-input-pill"
                value={draft.brand_name}
                onChange={e => set('brand_name', e.target.value)}
              />
            </div>
            <div className="edit-group">
              <label className="edit-label">Card type</label>
              <select
                className="edit-select-pill"
                value={draft.pass_type}
                onChange={e => set('pass_type', e.target.value)}
              >
                {PASS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="edit-group">
              <label className="edit-label">Scan type</label>
              <select
                className="edit-select-pill"
                value={localBarcodeType}
                onChange={e => handleBarcodeChange(e.target.value)}
              >
                <option value="qr">QR Code</option>
                <option value="barcode">Barcode</option>
                <option value="pdf417">Barcode #2</option>
              </select>
            </div>
          </div>

          <div className="edit-panel">
            <div className="edit-panel-title">Card Icon</div>
            <label className="edit-upload">
              <input
                className="edit-upload-input"
                type="file"
                accept="image/*"
                onChange={handleIconUpload}
              />
              <span>{draft.logo_url ? 'Replace icon' : 'Upload icon'}</span>
            </label>
          </div>

          <div className="edit-panel">
            <div className="edit-panel-title">Card Image</div>
            <label className="edit-upload">
              <input
                className="edit-upload-input"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
              <span>{draft.image_url ? 'Replace image' : 'Upload image'}</span>
            </label>
          </div>

          <button className="btn-back" onClick={onRestart} type="button">
            Restart
          </button>
        </div>

        {/* Column 2 — Colour + Fields */}
        <div className="edit-middle-col">
          <div className="edit-panel">
            <div className="edit-panel-title">Card Colour</div>
            <div className="colour-swatch-row">
              {['primary', 'secondary', 'text'].map(key => (
                <div key={key} className="colour-swatch-item">
                  <label className="colour-swatch-input-wrap">
                    <input
                      type="color"
                      value={draft.colours[key]}
                      onChange={e => setColour(key, e.target.value)}
                      className="colour-swatch-native"
                    />
                    <div
                      className="colour-swatch-circle"
                      style={{ background: draft.colours[key] }}
                    />
                  </label>
                  <span className="colour-swatch-label">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="edit-panel">
            <div className="edit-panel-title">Fields</div>
            {draft.fields.map((f, i) => (
              <div key={i} className="edit-field-row-new">
                <input
                  className="edit-input-pill edit-input-label"
                  placeholder="Label"
                  value={f.label}
                  onChange={e => setField(i, 'label', e.target.value)}
                />
                <input
                  className="edit-input-pill edit-input-value"
                  placeholder="Value"
                  value={f.value}
                  onChange={e => setField(i, 'value', e.target.value)}
                />
              </div>
            ))}
          </div>

          <button className="btn-finish" onClick={handleFinish}>
            FINISH
          </button>
        </div>

        {/* Column 3 — Live Preview */}
        <div className="edit-preview-col">
          <span className="edit-preview-label">Live Preview</span>
          <div className="phone-frame">
            <div className="wallet-toggle edit-wallet-toggle">
              <button
                className={walletType === 'apple' ? 'active' : ''}
                onClick={() => onWalletTypeChange?.('apple')}
                type="button"
              >
                <AppleIcon /> Apple Wallet
              </button>
              <button
                className={walletType === 'google' ? 'active' : ''}
                onClick={() => onWalletTypeChange?.('google')}
                type="button"
              >
                <GoogleIcon /> Google Wallet
              </button>
            </div>
            <PassCard data={draft} barcodeType={localBarcodeType} walletType={walletType} />
          </div>
        </div>
      </div>
    </div>
  )
}
