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

const PDF417_IMAGE_URL = '/31506377-88f45d4c-af77-11e7-9604-9d8035a56654.png'

function QRCode({ fill = 'black', bgFill = 'white' }) {
  return (
    <svg width="100" height="100" viewBox="0 0 21 21" style={{ display: 'block' }}>
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
    [4,2],[8,1],[12,2],[16,1],[20,3],[24,1],[28,1],[32,2],
    [36,1],[40,1],[44,2],[48,2],[53,3],[58,1],[62,1],[66,1],
    [70,2],[74,1],[78,3],[83,1],[87,2],[91,1],[95,2],[99,2],
    [104,1],[108,3],[113,1],[117,1],[121,2],[126,1],[130,3],
  ]
  return (
    <svg width="180" height="64" viewBox="0 0 140 64" style={{ display: 'block' }}>
      <rect width="140" height="64" fill="white" />
      {bars.map(([x, w], i) => (
        <rect key={i} x={x} y="6" width={w} height="44" fill="#111" />
      ))}
      <text x="70" y="58" textAnchor="middle" fontSize="6" fontFamily="monospace" fill="#555">
        RMX-2025-001
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
    <svg width="180" height="64" viewBox="0 0 120 64" style={{ display: 'block' }}>
      <rect width="120" height="64" fill="white" />
      {rows.map((row, r) =>
        row.map(([x, w], c) => (
          <rect key={`${r}-${c}`} x={x} y={4 + r * 10} width={w} height={8} fill="#111" />
        ))
      )}
    </svg>
  )
}

function BarcodeDisplay({ type = 'qr' }) {
  if (type === 'barcode') return <LinearBarcode />
  if (type === 'pdf417') {
    return <img className="barcode-image" src={PDF417_IMAGE_URL} alt="PDF417 barcode" />
  }
  return <QRCode fill="#1a1a1a" bgFill="#ffffff" />
}

function show(step, threshold) {
  return {
    opacity: step >= threshold ? 1 : 0,
    transition: 'opacity 0.5s ease',
  }
}

function clampTitle(value) {
  if (!value) return ''
  const words = String(value).trim().split(/\s+/).filter(Boolean).slice(0, 2)
  const joined = words.join(' ').slice(0, 18)
  return joined.trim()
}

function clampField(value) {
  if (!value) return ''
  const words = String(value).trim().split(/\s+/).filter(Boolean).slice(0, 2)
  const joined = words.join(' ').slice(0, 18)
  return joined.trim()
}

function LoadingCard({ walletType = 'apple' }) {
  const [step, setStep] = useState(0)
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const isFirst = phase === 0
    if (!isFirst) setStep(3)
    const delays = isFirst
      ? [[1,300],[2,750],[3,1150],[4,1600],[5,2000],[6,2400],[7,2800],[8,3300]]
      : [[4,400],[5,800],[6,1200],[7,1600],[8,2000]]
    const timers = delays.map(([s, t]) => setTimeout(() => setStep(s), t))
    const loop = setTimeout(() => setPhase(p => p + 1), 5200)
    return () => { timers.forEach(clearTimeout); clearTimeout(loop) }
  }, [phase])

  return (
    <div className={`pass-card is-loading wallet-${walletType}`} style={{ background: '#152237' }}>
      <div className="pass-top" style={show(step, 2)}>
        <div className="skeleton skel-white" style={{ width: 80, height: 11, borderRadius: 4 }} />
      </div>
      <div className="pass-divider" style={{ opacity: step >= 2 ? 0.3 : 0, transition: 'opacity 0.5s' }} />
      <div className="pass-body">
        <div style={show(step, 3)}>
          <div className="skeleton skel-white" style={{ width: '62%', height: 22, borderRadius: 5, marginBottom: 18 }} />
        </div>
        <div className="pass-fields">
          {[4, 5, 6, 7].map((threshold, i) => (
            <div key={i} style={show(step, threshold)}>
              <div className="skeleton skel-white" style={{ width: 44, height: 9, borderRadius: 3, marginBottom: 6 }} />
              <div className="skeleton skel-white" style={{ width: 68, height: 15, borderRadius: 4 }} />
            </div>
          ))}
        </div>
      </div>
      <div className="pass-divider" style={{ opacity: step >= 7 ? 0.3 : 0, transition: 'opacity 0.5s' }} />
      <div className="pass-footer" style={show(step, 8)}>
        <div className="skeleton skel-white" style={{ width: '100%', height: 88, borderRadius: 12 }} />
      </div>
    </div>
  )
}

function RevealingCard({ data, barcodeType = 'qr', walletType = 'apple' }) {
  const [step, setStep] = useState(0)

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

  const { brand_name, logo_url, colours, pass_type, fields, image_url, image_position, image_stretch } = data
  const displayBrand = clampTitle(brand_name)
  const displayType = clampTitle(pass_type)
  const primary = colours?.primary || '#2d5a8e'
  const textColor = colours?.text || '#ffffff'
  const secondaryColor = colours?.secondary || '#ffffff'
  const visibleFields = (fields || []).slice(0, 4)
  const imagePosition = image_position || 'bottom'
  const imageStretch = Boolean(image_stretch)
  const imageMarkup = image_url ? (
    <div className={`pass-image-wrap${imageStretch ? ' pass-image-wrap--stretch' : ''}`}>
      <img className="pass-image" src={image_url} alt="" />
    </div>
  ) : null

  return (
    <div className={`pass-card is-loading wallet-${walletType}`} style={{ background: primary, opacity: step >= 1 ? 1 : 0, transition: 'opacity 0.4s ease', '--pass-text': textColor, '--pass-secondary': secondaryColor }}>
      <div className="pass-top" style={show(step, 2)}>
        {logo_url && <img className="pass-logo-img" src={logo_url} alt="" onError={e => { e.target.style.display = 'none' }} />}
        <span className="pass-company">{displayBrand}</span>
      </div>
      <div className="pass-divider" style={{ opacity: step >= 2 ? 0.3 : 0, transition: 'opacity 0.5s' }} />
      <div className="pass-body">
        <div style={show(step, 3)}>
          <div className="pass-type-heading">{displayType}</div>
        </div>
        {imagePosition === 'top' && imageMarkup && (
          <div style={show(step, 4)}>
            {imageMarkup}
          </div>
        )}
        <div className="pass-fields">
          {visibleFields.map((f, i) => (
            <div key={i} className="pass-field" style={show(step, 4 + i)}>
              <div className="pass-field-label">{clampField(f.label)}</div>
              <div className="pass-field-value">{clampField(f.value)}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="pass-divider" style={{ opacity: step >= 7 ? 0.3 : 0, transition: 'opacity 0.5s' }} />
      <div className="pass-footer" style={show(step, 8)}>
        {imagePosition === 'bottom' && imageMarkup}
        <div className="barcode-box">
          <BarcodeDisplay type={barcodeType} />
        </div>
      </div>
    </div>
  )
}

function StaticCard({ data, barcodeType = 'qr', className = '', walletType = 'apple' }) {
  const { brand_name, logo_url, colours, pass_type, fields, image_url, image_position, image_stretch } = data
  const displayBrand = clampTitle(brand_name)
  const displayType = clampTitle(pass_type)
  const primary = colours?.primary || '#2d5a8e'
  const textColor = colours?.text || '#ffffff'
  const secondaryColor = colours?.secondary || '#ffffff'
  const visibleFields = (fields || []).slice(0, 4)
  const imagePosition = image_position || 'bottom'
  const imageStretch = Boolean(image_stretch)
  const imageMarkup = image_url ? (
    <div className={`pass-image-wrap${imageStretch ? ' pass-image-wrap--stretch' : ''}`}>
      <img className="pass-image" src={image_url} alt="" />
    </div>
  ) : null

  return (
    <div className={`pass-card ${className} wallet-${walletType}`} style={{ background: primary, '--pass-text': textColor, '--pass-secondary': secondaryColor }}>
      <div className="pass-top">
        {logo_url && <img className="pass-logo-img" src={logo_url} alt="" onError={e => { e.target.style.display = 'none' }} />}
        <span className="pass-company">{displayBrand}</span>
      </div>
      <div className="pass-divider" />
      <div className="pass-body">
        <div className="pass-type-heading">{displayType}</div>
        {imagePosition === 'top' && imageMarkup}
        <div className="pass-fields">
          {visibleFields.map((f, i) => (
            <div key={i} className="pass-field">
              <div className="pass-field-label">{clampField(f.label)}</div>
              <div className="pass-field-value">{clampField(f.value)}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="pass-divider" />
      <div className="pass-footer">
        {imagePosition === 'bottom' && imageMarkup}
        <div className="barcode-box">
          <BarcodeDisplay type={barcodeType} />
        </div>
      </div>
    </div>
  )
}

export default function PassCard({ data, isLoading = false, isRevealing = false, barcodeType = 'qr', walletType = 'apple' }) {
  if (isLoading || !data) {
    return <div className="pass-card-wrap"><LoadingCard walletType={walletType} /></div>
  }
  if (isRevealing) {
    return (
      <div className="pass-card-wrap">
        <RevealingCard data={data} barcodeType={barcodeType} walletType={walletType} />
      </div>
    )
  }
  return (
    <div className="pass-card-wrap">
      <StaticCard data={data} barcodeType={barcodeType} className="is-loaded" walletType={walletType} />
    </div>
  )
}
