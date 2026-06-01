import { useState } from 'react'

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

function SkeletonCard() {
  return (
    <div className="pass-card is-loading pass-apple">
      <div className="pass-header" style={{ background: '#1c1c2a', minHeight: 72 }}>
        <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 8 }} />
        <div>
          <div className="skeleton" style={{ width: 90, height: 12, marginBottom: 6 }} />
          <div className="skeleton" style={{ width: 60, height: 9 }} />
        </div>
      </div>
      <div className="pass-body" style={{ background: '#e8e8ee', padding: '14px 18px 12px' }}>
        <div className="pass-fields">
          {[0, 1, 2, 3].map(i => (
            <div key={i}>
              <div className="skeleton" style={{ width: 48, height: 9, marginBottom: 5 }} />
              <div className="skeleton" style={{ width: 72, height: 14 }} />
            </div>
          ))}
        </div>
        <div className="skeleton" style={{ width: '80%', height: 10, marginTop: 12 }} />
      </div>
      <div className="pass-footer" style={{ background: '#e8e8ee', borderTop: '1px solid rgba(0,0,0,0.07)' }}>
        <div className="skeleton" style={{ width: 76, height: 76, borderRadius: 4 }} />
      </div>
    </div>
  )
}

export default function PassCard({ data, walletType = 'apple', isLoading = false }) {
  const [imgError, setImgError] = useState(false)

  if (isLoading || !data) {
    return (
      <div className="pass-card-wrap">
        <SkeletonCard />
      </div>
    )
  }

  const { brand_name, logo_url, colours, pass_type, fields, tagline } = data
  const primary   = colours?.primary   || '#1a1a1a'
  const secondary = colours?.secondary || '#ffffff'
  const textCol   = colours?.text      || '#ffffff'

  const logoImg = logo_url && !imgError
    ? <img src={logo_url} alt={brand_name} className="pass-logo" onError={() => setImgError(true)} />
    : <div className="pass-logo-fallback" style={{ color: textCol }}>{brand_name?.[0]?.toUpperCase() || '?'}</div>

  const visibleFields = (fields || []).slice(0, 4)

  if (walletType === 'apple') {
    return (
      <div className="pass-card-wrap">
        <div className="pass-card pass-apple is-loaded">
          <div className="pass-header" style={{ background: primary, color: textCol }}>
            {logoImg}
            <div className="pass-brand" style={{ color: textCol }}>
              <div className="pass-brand-name">{brand_name}</div>
              <div className="pass-type-label">{pass_type}</div>
            </div>
          </div>
          <div className="pass-body">
            <div className="pass-fields">
              {visibleFields.map((f, i) => (
                <div
                  key={i}
                  className="pass-field"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
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
              <div key={i} className="pass-field" style={{ animationDelay: `${i * 0.1}s` }}>
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
