export default function InfoPanel({ data }) {
  if (!data) return null

  const { brand_name, logo_url, colours, pass_type, fields, tagline, confidence_score } = data
  const pct = Math.round((confidence_score ?? 0) * 100)

  return (
    <div className="info-panel">
      <div className="info-section">
        <div className="info-section-title">Pass Summary</div>
        <div className="info-row">
          <span className="info-row-label">Brand</span>
          <span className="info-row-value">{brand_name}</span>
        </div>
        <div className="info-row">
          <span className="info-row-label">Pass Type</span>
          <span className="info-row-value">{pass_type}</span>
        </div>
        <div className="info-row">
          <span className="info-row-label">Tagline</span>
          <span className="info-row-value" style={{ fontStyle: 'italic' }}>{tagline || '—'}</span>
        </div>
        <div className="info-row" style={{ borderBottom: 'none' }}>
          <span className="info-row-label">AI Confidence</span>
          <span className="info-row-value">{pct}%</span>
        </div>
        <div className="confidence-bar">
          <div className="confidence-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="info-section">
        <div className="info-section-title">Brand Colours</div>
        <div className="swatch-row">
          {Object.entries(colours || {}).map(([name, hex]) => (
            <div key={name} className="swatch-item">
              <div className="swatch-dot" style={{ background: hex }} />
              <span className="swatch-name">{name}</span>
              <span style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.05em' }}>{hex}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="info-section">
        <div className="info-section-title">Pass Fields ({(fields || []).length})</div>
        {(fields || []).map((f, i) => (
          <div key={i} className="info-field-item">
            <div className="info-field-label">{f.label}</div>
            <div className="info-field-value">{f.value}</div>
          </div>
        ))}
      </div>

    </div>
  )
}
