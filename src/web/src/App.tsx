import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [health, setHealth] = useState<{ status: string; timestamp: string } | null>(null)

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(setHealth)
      .catch(() => setHealth(null))
  }, [])

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>MN Chemical CRM</h1>
      <p>Management system for MN Chemical Georgia LLC</p>

      <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', maxWidth: '400px' }}>
        <h3>API Status</h3>
        {health ? (
          <p style={{ color: 'green' }}>
            {health.status} — {new Date(health.timestamp).toLocaleString()}
          </p>
        ) : (
          <p style={{ color: '#999' }}>Connecting to API...</p>
        )}
      </div>
    </div>
  )
}

export default App
