import { useState } from 'react'
import PassCard from './PassCard'

const PASS_TYPES = [
  'Membership Card',
  'Event Pass',
  'Loyalty Card',
  'Supporter Card',
  'Member ID',
]

export default function EditPanel({ data, onDone, onSend, onBack, barcodeType = 'qr', onBarcodeTypeChange }) {
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
          <div className="edit-back-link">
            <button className="cta-link-btn" onClick={onBack}>← Back</button>
          </div>
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
            <PassCard data={draft} barcodeType={localBarcodeType} />
          </div>
        </div>
      </div>
    </div>
  )
}
