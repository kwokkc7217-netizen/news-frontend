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

const PAGE_SIZE = 10

export default function App() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [page, setPage] = useState(1)

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

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paged = visible.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  function pickFilter(code) {
    setFilter(code)
    setPage(1)
  }

  function goToPage(p) {
    const next = Math.min(Math.max(1, p), totalPages)
    setPage(next)
    document
      .querySelector('.section-head')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // compact page numbers: 1 … window … last
  const pageNumbers = useMemo(() => {
    const pages = []
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        Math.abs(i - safePage) <= 2
      ) {
        pages.push(i)
      } else if (pages[pages.length - 1] !== '…') {
        pages.push('…')
      }
    }
    return pages
  }, [totalPages, safePage])

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
          {!loading && !error && visible.length > 0 && (
            <p className="count">
              Showing {(safePage - 1) * PAGE_SIZE + 1}–
              {Math.min(safePage * PAGE_SIZE, visible.length)} of{' '}
              {visible.length}
            </p>
          )}
        </div>

        {availableCategories.length > 1 && (
          <div className="filters" role="tablist" aria-label="Filter by category">
            <button
              className={filter === 'ALL' ? 'pill active' : 'pill'}
              onClick={() => pickFilter('ALL')}
            >
              All
            </button>
            {availableCategories.map((code) => (
              <button
                key={code}
                className={filter === code ? 'pill active' : 'pill'}
                onClick={() => pickFilter(code)}
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
          {paged.map((item) => {
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

        {!loading && !error && totalPages > 1 && (
          <nav className="pagination" aria-label="Pages">
            <button
              className="page-btn"
              disabled={safePage === 1}
              onClick={() => goToPage(safePage - 1)}
            >
              ← Prev
            </button>
            {pageNumbers.map((p, i) =>
              p === '…' ? (
                <span key={`gap-${i}`} className="page-gap">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  className={p === safePage ? 'page-btn current' : 'page-btn'}
                  onClick={() => goToPage(p)}
                >
                  {p}
                </button>
              ),
            )}
            <button
              className="page-btn"
              disabled={safePage === totalPages}
              onClick={() => goToPage(safePage + 1)}
            >
              Next →
            </button>
          </nav>
        )}
      </section>

    </main>
  )
}
