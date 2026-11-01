import { useEffect, useMemo, useState } from 'react'
import './App.css'

const CATEGORY_META = {
  AI_TECH: { label: 'AI & Technology', color: '#7c3aed' },
  INVESTING: { label: 'Investing', color: '#059669' },
  HEALTH_SCIENCE: { label: 'Health & Science', color: '#e11d48' },
  CAREER_PSYCHOLOGY: { label: 'Career & Psychology', color: '#d97706' },
  HONG_KONG: { label: 'Hong Kong', color: '#dc2626' },
}

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function todayLine() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function App() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL

    fetch(`${API_URL}/api/news`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`)
        }
        return response.json()
      })
      .then((data) => setNews(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const sorted = useMemo(() => {
    return [...news].sort(
      (a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0),
    )
  }, [news])

  const availableCategories = useMemo(() => {
    const codes = new Set()
    for (const item of news) {
      const code = item.category?.code
      if (code) codes.add(code)
    }
    return [...codes]
  }, [news])

  const visible = useMemo(() => {
    if (filter === 'ALL') return sorted
    return sorted.filter((item) => item.category?.code === filter)
  }, [sorted, filter])

  return (
    <main className="container">
      <header className="site-header">
        <p className="eyebrow">Your daily briefing</p>
        <h1>Newsroom</h1>
        <p className="subtitle">
          AI · Investing · Health &amp; Science · Career &amp; Psychology · Hong
          Kong — one exceptional read, every day.
        </p>
        <p className="today">{todayLine()}</p>
      </header>

      <section>
        <div className="section-head">
          <h2>Latest picks</h2>
          {!loading && !error && (
            <p className="count">
              {visible.length} {visible.length === 1 ? 'article' : 'articles'}
            </p>
          )}
        </div>

        {availableCategories.length > 1 && (
          <div className="filters" role="tablist" aria-label="Filter by category">
            <button
              className={filter === 'ALL' ? 'pill active' : 'pill'}
              onClick={() => setFilter('ALL')}
            >
              All
            </button>
            {availableCategories.map((code) => (
              <button
                key={code}
                className={filter === code ? 'pill active' : 'pill'}
                onClick={() => setFilter(code)}
                style={
                  filter === code
                    ? {
                        background: CATEGORY_META[code]?.color || '#334155',
                        borderColor: CATEGORY_META[code]?.color || '#334155',
                      }
                    : undefined
                }
              >
                {CATEGORY_META[code]?.label || code}
              </button>
            ))}
          </div>
        )}

        {loading && <p className="state">Loading today&rsquo;s picks…</p>}

        {error && (
          <p className="error state">
            Failed to load: {error}. Please check the backend is running.
          </p>
        )}

        {!loading && !error && visible.length === 0 && (
          <p className="state">No articles yet — check back tomorrow.</p>
        )}

        <div className="news-list">
          {visible.map((item) => {
            const code = item.category?.code
            const meta = CATEGORY_META[code]
            return (
              <article className="news-card" key={item.id}>
                <div className="card-top">
                  {meta && (
                    <span
                      className="badge"
                      style={{ background: meta.color }}
                    >
                      {meta.label}
                    </span>
                  )}
                  <span className="source">{item.source || 'News'}</span>
                </div>
                <h3>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {item.title}
                  </a>
                </h3>
                {item.summary && <p className="summary">{item.summary}</p>}
                {item.whyRead && (
                  <details className="why">
                    <summary>Why it&rsquo;s worth your time</summary>
                    <p>{item.whyRead}</p>
                  </details>
                )}
                <p className="meta">
                  <span>{formatDate(item.publishedAt)}</span>
                  {item.readingTimeMinutes ? (
                    <span> · {item.readingTimeMinutes} min read</span>
                  ) : null}
                  {item.isFree ? <span className="free"> · Free</span> : null}
                  {item.author ? <span> · By {item.author}</span> : null}
                </p>
              </article>
            )
          })}
        </div>
      </section>

      <footer className="site-footer">
        <p>
          Curated daily by an AI editor — every pick is read and verified before
          it lands here.
        </p>
      </footer>
    </main>
  )
}
