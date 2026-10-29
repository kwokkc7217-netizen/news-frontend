
import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/news')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`)
        }
        return response.json()
      })
      .then((data) => setNews(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="container">
      <header className="site-header">
        <p className="eyebrow">YOUR DAILY BRIEFING</p>
        <h1>Newsroom</h1>
        <p className="subtitle">每日科技、機械人與金融市場動態</p>
      </header>

      <section>
        <h2>最新新聞</h2>

        {loading && <p>正在載入新聞…</p>}

        {error && (
          <p className="error">
            載入失敗：{error}。請確認 Spring Boot 正在運行。
          </p>
        )}

        {!loading && !error && news.length === 0 && (
          <p>目前沒有新聞。</p>
        )}

        <div className="news-list">
          {news.map((item) => (
            <article className="news-card" key={item.id}>
              <p className="source">{item.source || 'News'}</p>
              <h3>{item.title}</h3>
              <p className="summary">{item.summary}</p>
              <p className="date">
                {item.publishedAt
                  ? new Date(item.publishedAt).toLocaleString()
                  : ''}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default App
