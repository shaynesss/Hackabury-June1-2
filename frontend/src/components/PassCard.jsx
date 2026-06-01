import { useState, useEffect } from 'react'

const QR_DATA = [
  [6,8],[6,10],[6,12],[8,6],[10,6],[12,6],
  [8,8],[9,9],[11,8],[12,9],[13,8],
  [8,10],[10,10],[11,11],[12,10],[13,11],
  [9,12],[11,12],[12,11],[13,12],
  [8,13],[10,13],[11,13],[13,13],
  [15,8],[16,8],[17,9],[18,8],[19,9],[20,8],
  [15,10],[17,10],[18,11],[19,10],[20,11],
  [16,11],[17,11],[19,11],
  [15,12],[16,12],[18,12],[20,12],
  [15,13],[17,13],[18,13],[20,13],
  [8,15],[9,15],[11,15],[12,15],[14,15],[16,15],[17,15],[19,15],[20,15],
  [8,16],[10,16],[13,16],[15,16],[18,16],[20,16],
  [9,17],[10,17],[12,17],[14,17],[16,17],[17,17],[19,17],
  [8,18],[11,18],[13,18],[15,18],[18,18],[20,18],
  [9,19],[10,19],[12,19],[14,19],[16,19],[17,19],[19,19],
  [8,20],[13,20],[15,20],[16,20],[18,20],[20,20],
]

function QRCode({ fill = 'black', bgFill = 'white' }) {
  return (
    <svg width="76" height="76" viewBox="0 0 21 21">
      <rect width="21" height="21" fill={bgFill} />
      <g fill={fill}>
        <rect x="0" y="0" width="7" height="7" rx="0.8" />
        <rect x="1" y="1" width="5" height="5" rx="0.4" fill={bgFill} />
        <rect x="2" y="2" width="3" height="3" rx="0.3" fill={fill} />
        <rect x="14" y="0" width="7" height="7" rx="0.8" />
        <rect x="15" y="1" width="5" height="5" rx="0.4" fill={bgFill} />
        <rect x="16" y="2" width="3" height="3" rx="0.3" fill={fill} />
        <rect x="0" y="14" width="7" height="7" rx="0.8" />
        <rect x="1" y="15" width="5" height="5" rx="0.4" fill={bgFill} />
        <rect x="2" y="16" width="3" height="3" rx="0.3" fill={fill} />
        {QR_DATA.map(([x, y], i) => (
          <rect key={i} x={x} y={y} width="1" height="1" />
        ))}
      </g>
    </svg>
  )
}

function show(step, threshold) {
  return {
    opacity: step >= threshold ? 1 : 0,
    transition: 'opacity 0.5s ease',
  }
}

// Pure skeleton — shown while the API call is still in flight
function LoadingCard() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 300),
      setTimeout(() => setStep(2), 750),
      setTimeout(() => setStep(3), 1150),
      setTimeout(() => setStep(4), 1600),
      setTimeout(() => setStep(5), 2000),
      setTimeout(() => setStep(6), 2400),
      setTimeout(() => setStep(7), 2800),
      setTimeout(() => setStep(8), 3300),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  const headerBg = step >= 1 ? '#182535' : '#1c1c2a'

  return (
    <div className="pass-card is-loading pass-apple">
      <div className="pass-header" style={{
        background: headerBg,
        minHeight: 72,
        transition: 'background 1.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '18px 18px 14px',
      }}>
        <div style={show(step, 2)}>
          <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 8 }} />
        </div>
        <div style={show(step, 3)}>
          <div className="skeleton" style={{ width: 96, height: 12, marginBottom: 6 }} />
          <div className="skeleton" style={{ width: 64, height: 9 }} />
        </div>
      </div>
      <div className="pass-body" style={{ background: '#e8e8ee', padding: '14px 18px 12px' }}>
        <div className="pass-fields">
          {[4, 5, 6, 7].map((threshold, i) => (
            <div key={i} style={show(step, threshold)}>
              <div className="skeleton" style={{ width: 52, height: 9, marginBottom: 5 }} />
              <div className="skeleton" style={{ width: 76, height: 14 }} />
            </div>
          ))}
        </div>
        <div style={{ ...show(step, 7), marginTop: 12 }}>
          <div className="skeleton" style={{ width: '75%', height: 10 }} />
        </div>
      </div>
      <div className="pass-footer" style={{ background: '#e8e8ee', borderTop: '1px solid rgba(0,0,0,0.07)' }}>
        <div style={show(step, 8)}>
          <div className="skeleton" style={{ width: 76, height: 76, borderRadius: 4 }} />
        </div>
      </div>
    </div>
  )
}

// Real content revealing progressively — shown for demo and after API returns
function RevealingCard({ data }) {
  const [step, setStep] = useState(0)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 300),
      setTimeout(() => setStep(2), 750),
      setTimeout(() => setStep(3), 1150),
      setTimeout(() => setStep(4), 1600),
      setTimeout(() => setStep(5), 2000),
      setTimeout(() => setStep(6), 2400),
      setTimeout(() => setStep(7), 2800),
      setTimeout(() => setStep(8), 3300),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  const { brand_name, logo_url, colours, pass_type, fields, tagline } = data
  const primary = colours?.primary || '#1a1a1a'
  const textCol  = colours?.text    || '#ffffff'
  const visibleFields = (fields || []).slice(0, 4)
  const headerBg = step >= 1 ? primary : '#1c1c2a'

  const logoFilter = textCol === '#ffffff' || textCol === '#fff' ? 'brightness(0) invert(1)' : 'none'
  const logoEl = logo_url && !imgError
    ? <img src={logo_url} alt={brand_name} className="pass-logo" style={{ filter: logoFilter }} onError={() => setImgError(true)} />
    : <div className="pass-logo-fallback" style={{ color: textCol }}>{brand_name?.[0]?.toUpperCase() || '?'}</div>

  return (
    <div className="pass-card pass-apple is-loading">
      <div className="pass-header" style={{
        background: headerBg,
        color: textCol,
        minHeight: 72,
        transition: 'background 1.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '18px 18px 14px',
      }}>
        <div style={show(step, 2)}>{logoEl}</div>
        <div className="pass-brand" style={{ color: textCol, ...show(step, 3) }}>
          <div className="pass-brand-name">{brand_name}</div>
          <div className="pass-type-label">{pass_type}</div>
        </div>
      </div>
      <div className="pass-body">
        <div className="pass-fields">
          {visibleFields.map((f, i) => (
            <div key={i} className="pass-field" style={show(step, 4 + i)}>
              <div className="pass-field-label">{f.label}</div>
              <div className="pass-field-value">{f.value}</div>
            </div>
          ))}
        </div>
        {tagline && <div className="pass-tagline" style={show(step, 7)}>{tagline}</div>}
      </div>
      <div className="pass-footer">
        <div className="qr-wrap" style={show(step, 8)}>
          <div className="qr-box">
            <QRCode fill="#1a1a1a" bgFill="#ffffff" />
          </div>
          <span className="qr-scan-label">Scan to activate</span>
        </div>
      </div>
    </div>
  )
}

export default function PassCard({ data, walletType = 'apple', isLoading = false, isRevealing = false }) {
  const [imgError, setImgError] = useState(false)

  if (isLoading || !data) {
    return (
      <div className="pass-card-wrap">
        <LoadingCard />
      </div>
    )
  }

  if (isRevealing) {
    return (
      <div className="pass-card-wrap">
        <RevealingCard data={data} />
      </div>
    )
  }

  const { brand_name, logo_url, colours, pass_type, fields, tagline } = data
  const primary   = colours?.primary   || '#1a1a1a'
  const secondary = colours?.secondary || '#ffffff'
  const textCol   = colours?.text      || '#ffffff'

  const logoFilter = textCol === '#ffffff' || textCol === '#fff' ? 'brightness(0) invert(1)' : 'none'
  const logoEl = logo_url && !imgError
    ? <img src={logo_url} alt={brand_name} className="pass-logo" style={{ filter: logoFilter }} onError={() => setImgError(true)} />
    : <div className="pass-logo-fallback" style={{ color: textCol }}>{brand_name?.[0]?.toUpperCase() || '?'}</div>

  const visibleFields = (fields || []).slice(0, 4)

  if (walletType === 'apple') {
    return (
      <div className="pass-card-wrap">
        <div className="pass-card pass-apple is-loaded">
          <div className="pass-header" style={{ background: primary, color: textCol }}>
            {logoEl}
            <div className="pass-brand" style={{ color: textCol }}>
              <div className="pass-brand-name">{brand_name}</div>
              <div className="pass-type-label">{pass_type}</div>
            </div>
          </div>
          <div className="pass-body">
            <div className="pass-fields">
              {visibleFields.map((f, i) => (
                <div key={i} className="pass-field">
                  <div className="pass-field-label">{f.label}</div>
                  <div className="pass-field-value">{f.value}</div>
                </div>
              ))}
            </div>
            {tagline && <div className="pass-tagline">{tagline}</div>}
          </div>
          <div className="pass-footer">
            <div className="qr-wrap">
              <div className="qr-box">
                <QRCode fill="#1a1a1a" bgFill="#ffffff" />
              </div>
              <span className="qr-scan-label">Scan to activate</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const isLightSecondary = secondary === '#ffffff' || secondary === '#fff'

  return (
    <div className="pass-card-wrap">
      <div className="pass-card pass-google is-loaded">
        <div className="pass-header" style={{ background: primary }}>
          <div className="pass-logo-fallback" style={{ background: 'rgba(255,255,255,0.18)', color: textCol }}>
            {logo_url && !imgError
              ? <img src={logo_url} alt={brand_name} className="pass-logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 8 }} onError={() => setImgError(true)} />
              : brand_name?.[0]?.toUpperCase() || '?'
            }
          </div>
          <div className="pass-brand-name" style={{ color: textCol, marginTop: 10 }}>{brand_name}</div>
          <div className="pass-type-label" style={{ color: textCol, opacity: 0.65 }}>{pass_type}</div>
        </div>
        <div className="pass-body" style={{ background: secondary, padding: '14px 18px 12px' }}>
          <div className="pass-fields">
            {visibleFields.map((f, i) => (
              <div key={i} className="pass-field">
                <div className="pass-field-label" style={{ color: isLightSecondary ? '#86868b' : 'rgba(255,255,255,0.5)' }}>{f.label}</div>
                <div className="pass-field-value" style={{ color: isLightSecondary ? '#1d1d1f' : '#fff' }}>{f.value}</div>
              </div>
            ))}
          </div>
          {tagline && (
            <div className="pass-tagline" style={{ color: isLightSecondary ? '#6e6e73' : 'rgba(255,255,255,0.5)' }}>
              {tagline}
            </div>
          )}
        </div>
        <div className="pass-footer" style={{ background: secondary, borderTop: `1px solid ${isLightSecondary ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'}` }}>
          <div className="qr-wrap">
            <div className="qr-box">
              <QRCode fill="#1a1a1a" bgFill="#ffffff" />
            </div>
            <span className="qr-scan-label" style={{ color: isLightSecondary ? '#86868b' : 'rgba(255,255,255,0.5)' }}>
              Scan to activate
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
