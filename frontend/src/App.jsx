import { useState } from 'react'
import { scrape, MOCK_DATA } from './api'
import EntryScreen from './components/EntryScreen'
import PassCard from './components/PassCard'
import InfoPanel from './components/InfoPanel'
import EditPanel from './components/EditPanel'
import CTAScreen from './components/CTAScreen'
import BlockedScreen from './components/BlockedScreen'

export default function App() {
  const [stage, setStage] = useState('entry')
  const [passData, setPassData] = useState(null)
  const [isRevealing, setIsRevealing] = useState(false)
  const [walletType, setWalletType] = useState('apple')
  const [error, setError] = useState(null)

  function handleDemo() {
    setError(null)
    setPassData(MOCK_DATA)
    setIsRevealing(true)
    setStage('loading')
    setTimeout(() => {
      setIsRevealing(false)
      setStage('result')
    }, 3900)
  }

  async function handleScrape(url) {
    setError(null)
    setPassData(null)
    setIsRevealing(false)
    setStage('loading')
    try {
      const data = await scrape(url)
      if (data.error) throw new Error(data.error)
      setPassData(data)
      setIsRevealing(true)
      setTimeout(() => {
        setIsRevealing(false)
        setStage(data.blocked ? 'blocked' : 'result')
      }, 3900)
    } catch (e) {
      setError(e.message)
      setStage('entry')
    }
  }

  function handleEditDone(updated) {
    setPassData(updated)
    setStage('result')
  }

  function handleSend(updated) {
    setPassData(updated)
    setStage('cta')
  }

  if (stage === 'entry') {
    return (
      <div className="app">
        <EntryScreen onSubmit={handleScrape} onDemo={handleDemo} error={error} />
      </div>
    )
  }

  if (stage === 'loading') {
    return (
      <div className="app">
        <div className="stage-loading">
          <PassCard
            data={passData}
            walletType="apple"
            isLoading={!passData}
            isRevealing={isRevealing}
          />
          <p className="loading-label">
            {isRevealing ? 'Building your pass…' : 'Analysing brand identity…'}
          </p>
        </div>
      </div>
    )
  }

  if (stage === 'blocked') {
    return (
      <div className="app">
        <BlockedScreen
          data={passData}
          onPreview={() => setStage('result')}
          onBack={() => { setPassData(null); setStage('entry') }}
        />
      </div>
    )
  }

  if (stage === 'result') {
    return (
      <div className="app">
        <div className="stage-result">
          <div className="result-left">
            <div className="wallet-toggle">
              <button
                className={walletType === 'apple' ? 'active' : ''}
                onClick={() => setWalletType('apple')}
              >Apple Wallet</button>
              <button
                className={walletType === 'google' ? 'active' : ''}
                onClick={() => setWalletType('google')}
              >Google Wallet</button>
            </div>
            <PassCard data={passData} walletType={walletType} />
            <div className="result-actions">
              <button className="btn-primary" onClick={() => setStage('edit')}>Edit Pass</button>
              <button className="btn-secondary" onClick={() => { setPassData(null); setStage('entry') }}>
                Try Another URL
              </button>
            </div>
          </div>
          <InfoPanel data={passData} />
        </div>
      </div>
    )
  }

  if (stage === 'edit') {
    return (
      <div className="app" style={{ alignItems: 'flex-start' }}>
        <EditPanel
          data={passData}
          onDone={handleEditDone}
          onSend={handleSend}
          onBack={() => setStage('result')}
        />
      </div>
    )
  }

  if (stage === 'cta') {
    return (
      <div className="app">
        <CTAScreen data={passData} onBack={() => setStage('edit')} />
      </div>
    )
  }
}
