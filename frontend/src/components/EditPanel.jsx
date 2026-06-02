import { useState } from 'react'
import PassCard from './PassCard'

const PASS_TYPES = [
  'Membership Card',
  'Event Pass',
  'Loyalty Card',
  'Supporter Card',
  'Member ID',
]

export default function EditPanel({ data, onDone, onSend, onBack }) {
  const [draft, setDraft] = useState({
    ...data,
    colours: { ...data.colours },
    fields: data.fields.map(f => ({ ...f })),
    show_strip: data.show_strip ?? false,
  })
  const [walletType, setWalletType] = useState('apple')

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

  return (
    <div className="stage-edit">
      <div className="edit-left">
        <div className="wallet-toggle">
          <button className={walletType === 'apple' ? 'active' : ''} onClick={() => setWalletType('apple')}>Apple</button>
          <button className={walletType === 'google' ? 'active' : ''} onClick={() => setWalletType('google')}>Google</button>
        </div>
        <PassCard data={draft} walletType={walletType} />
        <span className="edit-live-label">Live preview</span>
      </div>

      <div className="edit-right">
        <div className="edit-section">
          <div className="edit-section-title">Brand</div>
          <div className="edit-group">
            <label className="edit-label">Brand Name</label>
            <input className="edit-input" value={draft.brand_name} onChange={e => set('brand_name', e.target.value)} />
          </div>
          <div className="edit-group">
            <label className="edit-label">Tagline</label>
            <input className="edit-input" value={draft.tagline} onChange={e => set('tagline', e.target.value)} />
          </div>
          <div className="edit-group">
            <label className="edit-label">Pass Type</label>
            <select className="edit-select" value={draft.pass_type} onChange={e => set('pass_type', e.target.value)}>
              {PASS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {data.strip_image && (
          <div className="edit-section">
            <div className="edit-section-title">Header Image</div>
            <label className="edit-toggle-row">
              <input
                type="checkbox"
                className="edit-toggle-check"
                checked={!!draft.show_strip}
                onChange={e => set('show_strip', e.target.checked)}
              />
              <span className="edit-toggle-label">Show banner image on card</span>
            </label>
            {draft.show_strip && (
              <img src={data.strip_image} alt="" className="edit-strip-preview" />
            )}
          </div>
        )}

        <div className="edit-section">
          <div className="edit-section-title">Colours</div>
          <div className="colour-picker-row">
            {['primary', 'secondary', 'text'].map(key => (
              <div key={key} className="colour-picker-item">
                <input
                  type="color"
                  value={draft.colours[key]}
                  onChange={e => setColour(key, e.target.value)}
                />
                <span className="colour-picker-label">{key}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="edit-section">
          <div className="edit-section-title">Fields</div>
          {draft.fields.map((f, i) => (
            <div key={i} className="edit-field-row">
              <input
                className="edit-input"
                placeholder="Label"
                value={f.label}
                onChange={e => setField(i, 'label', e.target.value)}
              />
              <input
                className="edit-input"
                placeholder="Value"
                value={f.value}
                onChange={e => setField(i, 'value', e.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="edit-actions">
          <button className="btn-green" onClick={() => onSend(draft)}>
            Looks good →
          </button>
          <button className="btn-primary" onClick={() => onDone(draft)}>
            Done Editing
          </button>
          <button className="btn-secondary" onClick={onBack}>
            ← Back to preview
          </button>
        </div>
      </div>
    </div>
  )
}
