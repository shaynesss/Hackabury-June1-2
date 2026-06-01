export const MOCK_DATA = {
  brand_name: 'Romax Digital',
  logo_url: 'https://romax.co.uk/wp-content/uploads/2021/09/Romax-logo.svg',
  colours: { primary: '#6366f1', secondary: '#f0f0ff', text: '#ffffff' },
  pass_type: 'Member ID',
  fields: [
    { label: 'Member', value: 'Maurice Koby' },
    { label: 'Tier', value: 'Founding Partner' },
    { label: 'Since', value: 'June 2025' },
    { label: 'ID', value: 'RMX-0001' },
  ],
  tagline: 'Your digital pass to the Romax network.',
  confidence_score: 0.97,
}

export async function scrape(url) {
  const res = await fetch('/api/scrape', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })
  if (!res.ok) throw new Error(`Server error ${res.status}`)
  return res.json()
}
