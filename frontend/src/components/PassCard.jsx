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
    <svg width="76" height="76" viewBox="0 0 21 21" style={{ display: 'block' }}>
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

function LinearBarcode() {
  const bars = [
    [6,2],[10,1],[13,2],[17,1],[21,3],[26,1],[29,1],[32,2],
    [36,1],[39,1],[42,2],[46,2],[51,3],[57,1],[60,1],[63,1],
    [67,2],[71,1],[75,3],[80,1],[83,2],[87,1],[91,2],[95,2],
    [100,1],[103,3],[108,1],[111,1],[115,2],[119,1],[122,3],
  ]
  return (
    <svg width="130" height="72" viewBox="0 0 130 72" style={{ display: 'block' }}>
      <rect width="130" height="72" fill="white" rx="3" />
      {bars.map(([x, w], i) => (
        <rect key={i} x={x} y="6" width={w} height="48" fill="#111" />
      ))}
      <text x="65" y="66" textAnchor="middle" fontSize="6" fontFamily="monospace" fill="#555">
        RMX-PASS-2025-001
      </text>
    </svg>
  )
}

function PDF417Barcode() {
  const rows = [
    [[4,2],[8,1],[12,3],[17,2],[22,1],[26,2],[31,1],[35,2],[39,3],[45,1],[49,2],[54,1],[58,3],[64,2],[68,1],[73,2],[78,3],[84,1],[88,2],[93,1],[97,2],[102,1],[106,2]],
    [[4,2],[8,2],[13,1],[17,2],[22,3],[28,1],[32,1],[36,2],[41,3],[47,2],[52,1],[56,2],[61,1],[65,3],[71,2],[76,1],[80,2],[85,1],[89,3],[95,2],[100,1],[104,2],[109,1]],
    [[4,2],[8,1],[12,2],[16,3],[22,2],[27,1],[31,2],[36,1],[40,3],[46,1],[50,2],[54,3],[60,2],[65,1],[69,2],[74,3],[80,1],[84,2],[89,1],[93,3],[99,2],[104,1],[108,2]],
    [[4,2],[8,3],[14,1],[18,2],[23,1],[27,3],[33,2],[38,1],[42,2],[47,1],[51,3],[57,2],[62,1],[66,2],[71,1],[75,2],[80,3],[86,2],[91,1],[95,3],[101,1],[105,2],[110,1]],
    [[4,2],[8,2],[13,3],[19,1],[23,2],[28,1],[32,3],[38,1],[42,2],[47,3],[53,2],[58,1],[62,2],[67,1],[71,3],[77,2],[82,1],[86,2],[91,1],[95,2],[100,3],[106,2],[111,1]],
  ]
  return (
    <svg width="130" height="72" viewBox="0 0 130 72" style={{ display: 'block' }}>
      <rect width="130" height="72" fill="white" rx="3" />
      {rows.map((row, r) =>
        row.map(([x, w], c) => (
          <rect key={`${r}-${c}`} x={x} y={4 + r * 12} width={w} height={9} fill="#111" />
        ))
      )}
    </svg>
  )
}

function BarcodeDisplay({ type = 'qr' }) {
  if (type === 'barcode') return <LinearBarcode />
  if (type === 'pdf417') return <PDF417Barcode />
  return <QRCode fill="#1a1a1a" bgFill="#ffffff" />
}

function show(step, threshold) {
  return {
    opacity: step >= threshold ? 1 : 0,
    transition: 'opacity 0.5s ease',
  }
}

function LoadingCard() {
  const [step, setStep] = useState(0)
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    // First pass: reveal everything from scratch
    // Subsequent passes: header/logo/name stay, fields fade out then back in
    const isFirst = phase === 0
    if (!isFirst) setStep(3)

    const delays = isFirst
      ? [[1,300],[2,750],[3,1150],[4,1600],[5,2000],[6,2400],[7,2800],[8,3300]]
      : [[4,400],[5,800],[6,1200],[7,1600],[8,2000]]

    const timers = delays.map(([s, t]) => setTimeout(() => setStep(s), t))
    const loop = setTimeout(() => setPhase(p => p + 1), 5200)

    return () => { timers.forEach(clearTimeout); clearTimeout(loop) }
  }, [phase])

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

function RevealingCard({ data, barcodeType = 'qr' }) {
  const [step, setStep] = useState(0)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 150),
      setTimeout(() => setStep(2), 400),
      setTimeout(() => setStep(3), 650),
      setTimeout(() => setStep(4), 900),
      setTimeout(() => setStep(5), 1100),
      setTimeout(() => setStep(6), 1300),
      setTimeout(() => setStep(7), 1500),
      setTimeout(() => setStep(8), 1750),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  const { brand_name, logo_url, colours, pass_type, fields, tagline, strip_image, show_strip } = data
  const primary  = colours?.primary || '#1a1a1a'
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
      {show_strip && strip_image && (
        <div className="pass-strip" style={show(step, 3)}>
          <img src={strip_image} alt="" className="pass-strip-img" onError={e => { e.target.parentElement.style.display = 'none' }} />
        </div>
      )}
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
            <BarcodeDisplay type={barcodeType} />
          </div>
          <span className="qr-scan-label">Scan to activate</span>
        </div>
      </div>
    </div>
  )
}

export default function PassCard({ data, walletType = 'apple', isLoading = false, isRevealing = false, barcodeType = 'qr' }) {
  const [imgError, setImgError] = useState(false)

  if (isLoading || !data) {
    return <div className="pass-card-wrap"><LoadingCard /></div>
  }

  if (isRevealing) {
    return (
      <div className="pass-card-wrap">
        <RevealingCard data={data} barcodeType={barcodeType} />
      </div>
    )
  }

  const { brand_name, logo_url, colours, pass_type, fields, tagline, strip_image, show_strip } = data
  const primary  = colours?.primary  || '#1a1a1a'
  const textCol  = colours?.text     || '#ffffff'
  const logoFilter = textCol === '#ffffff' || textCol === '#fff' ? 'brightness(0) invert(1)' : 'none'

  const logoEl = logo_url && !imgError
    ? <img src={logo_url} alt={brand_name} className="pass-logo" style={{ filter: logoFilter }} onError={() => setImgError(true)} />
    : <div className="pass-logo-fallback" style={{ color: textCol }}>{brand_name?.[0]?.toUpperCase() || '?'}</div>

  const visibleFields = (fields || []).slice(0, 4)
  const stripEl = show_strip && strip_image
    ? <div className="pass-strip"><img src={strip_image} alt="" className="pass-strip-img" onError={e => { e.target.parentElement.style.display = 'none' }} /></div>
    : null

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
          {stripEl}
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
                <BarcodeDisplay type={barcodeType} />
              </div>
              <span className="qr-scan-label">Scan to activate</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Google Wallet — white card body, brand colour only in header
  return (
    <div className="pass-card-wrap">
      <div className="pass-card pass-google is-loaded">
        <div className="pass-header" style={{ background: primary }}>
          {logo_url && !imgError
            ? <img src={logo_url} alt={brand_name} className="pass-google-logo" style={{ filter: logoFilter }} onError={() => setImgError(true)} />
            : <div className="pass-logo-fallback" style={{ background: 'rgba(255,255,255,0.18)', color: textCol }}>
                {brand_name?.[0]?.toUpperCase() || '?'}
              </div>
          }
          <div className="pass-brand-name" style={{ color: textCol, marginTop: 8 }}>{brand_name}</div>
          <div className="pass-type-label" style={{ color: textCol, opacity: 0.7 }}>{pass_type}</div>
        </div>
        {stripEl}
        <div className="pass-body" style={{ background: '#ffffff', padding: '14px 18px 12px' }}>
          <div className="pass-fields">
            {visibleFields.map((f, i) => (
              <div key={i} className="pass-field">
                <div className="pass-field-label" style={{ color: '#86868b' }}>{f.label}</div>
                <div className="pass-field-value" style={{ color: '#1d1d1f' }}>{f.value}</div>
              </div>
            ))}
          </div>
          {tagline && <div className="pass-tagline" style={{ color: '#6e6e73' }}>{tagline}</div>}
        </div>
        <div className="pass-footer" style={{ background: '#f5f5f7', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
          <div className="qr-wrap">
            <div className="qr-box">
              <BarcodeDisplay type={barcodeType} />
            </div>
            <span className="qr-scan-label" style={{ color: '#86868b' }}>Scan to activate</span>
          </div>
        </div>
      </div>
    </div>
  )
}
