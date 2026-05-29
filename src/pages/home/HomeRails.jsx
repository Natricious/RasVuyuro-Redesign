import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import styles from './home.module.css'

const CARD_FIELDS = 'id,title,title_ge,year,imdb_rating,poster'

// ── Icons ─────────────────────────────────────────────────────────
function FlameIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
      <path d="M7 13c-2.76 0-5-2.2-5-4.9 0-1.76.9-3.06 2.2-4
        0 .88.44 1.76.88 2.2C5.6 5.1 6.4 3.3 6.4.7
        0 0 2.8 3.08 2.8 5.78c0 .44-.09.88-.27 1.32
        .27-.22.53-.53.62-.88C4.32 7.26 4.32 8.8 3.36 9.62
        c.44.18.88-.18 1.06-.44.36.62.7 1.32.7 2.2
        C5.12 13.2 10.9 13 7 13z" />
    </svg>
  )
}

function ChevLeft() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path d="M8.5 10.5 4 6.5l4.5-4" stroke="currentColor" strokeWidth="1.4"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevRight() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path d="M4.5 2.5 9 6.5l-4.5 4" stroke="currentColor" strokeWidth="1.4"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Deterministic gradient fallback per movie id ──────────────────
function posterFallback(id) {
  const h = ((id * 47) % 360)
  return `linear-gradient(135deg,hsl(${h},32%,16%) 0%,hsl(${(h+55)%360},28%,10%) 100%)`
}

// ── Single movie card ─────────────────────────────────────────────
function MovieCard({ movie }) {
  const navigate = useNavigate()
  return (
    <div
      className={styles.card}
      onClick={() => navigate(`/movie/${movie.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/movie/${movie.id}`)}
      aria-label={movie.title_ge || movie.title}
    >
      <div
        className={styles.cardImg}
        style={movie.poster
          ? { backgroundImage: `url(${movie.poster})` }
          : { background: posterFallback(movie.id) }
        }
      >
        {movie.imdb_rating != null && (
          <span className={styles.ratingPill}>
            ★ {Number(movie.imdb_rating).toFixed(1)}
          </span>
        )}
        <div className={styles.cardGrad} />
        <p className={styles.cardTitleOverlay}>
          {movie.title_ge || movie.title}
        </p>
      </div>
      <p className={styles.cardTitleBelow}>{movie.title_ge || movie.title}</p>
      {movie.year && <span className={styles.cardYear}>{movie.year}</span>}
    </div>
  )
}

// ── Rail layout component ─────────────────────────────────────────
function Rail({ title, subtitle, movies, loading, linkTo, showNote }) {
  const gridRef = useRef(null)

  function scroll(dir) {
    gridRef.current?.scrollBy({ left: dir * 360, behavior: 'smooth' })
  }

  return (
    <section className={styles.railSection}>
      <div className={styles.railHeader}>
        <div className={styles.railLeft}>
          <span className={styles.railFlame}><FlameIcon /></span>
          <div>
            <h2 className={styles.railTitle}>{title}</h2>
            {subtitle && <p className={styles.railSub}>{subtitle}</p>}
          </div>
        </div>
        <div className={styles.railRight}>
          <button type="button" className={styles.arrowBtn}
            onClick={() => scroll(-1)} aria-label="წინა">
            <ChevLeft />
          </button>
          <button type="button" className={styles.arrowBtn}
            onClick={() => scroll(1)} aria-label="შემდეგი">
            <ChevRight />
          </button>
          <Link to={linkTo ?? '/movies'} className={styles.allLink}>
            ყველა ფილმი →
          </Link>
        </div>
      </div>

      {showNote && !loading && (
        <p className={styles.wizardNote}>
          ჯადოქრის გამოყენების შემდეგ აქ გამოჩნდება შენი რეკომენდაციები
        </p>
      )}

      <div className={styles.grid} ref={gridRef}>
        {loading
          ? Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className={styles.cardSkeleton} />
            ))
          : movies.map(m => <MovieCard key={m.id} movie={m} />)
        }
      </div>
    </section>
  )
}

// ── Recent Recommendations ────────────────────────────────────────
function RecentRail() {
  const [movies,     setMovies]     = useState([])
  const [loading,    setLoading]    = useState(true)
  const [hasHistory, setHasHistory] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function run() {
      let ids = []
      try {
        const raw = localStorage.getItem('wizard_recommendations')
        if (raw) {
          const p = JSON.parse(raw)
          if (Array.isArray(p)) ids = p.filter(Number.isFinite)
        }
      } catch {}

      let data    = null
      let history = false

      if (ids.length > 0) {
        const { data: d } = await supabase
          .from('movies').select(CARD_FIELDS).in('id', ids)
        if (d?.length > 0) { data = d; history = true }
      }

      if (!data) {
        const { data: fb } = await supabase
          .from('movies').select(CARD_FIELDS)
          .order('imdb_rating', { ascending: false })
          .range(50, 59)
        data = fb
      }

      if (cancelled) return
      setHasHistory(history)
      setMovies(data ?? [])
      setLoading(false)
    }

    run()
    return () => { cancelled = true }
  }, [])

  return (
    <Rail
      title="ბოლო რეკომენდაციები"
      subtitle={hasHistory ? 'ჯადოქრის შედეგები' : 'ჯადოქარი ჯერ არ გამოიყენია'}
      movies={movies}
      loading={loading}
      showNote={!hasHistory}
      linkTo="/wizard"
    />
  )
}

// ── Trending ──────────────────────────────────────────────────────
function TrendingRail() {
  const [movies,  setMovies]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    supabase
      .from('movies').select(CARD_FIELDS)
      .order('imdb_rating', { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (cancelled) return
        setMovies(data ?? [])
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  return (
    <Rail
      title="ტრენდული ფილმები"
      subtitle="IMDb-ის საუკეთესო"
      movies={movies}
      loading={loading}
      showNote={false}
      linkTo="/movies"
    />
  )
}

// ── HomeRails ─────────────────────────────────────────────────────
export default function HomeRails() {
  return (
    <div className={styles.rails}>
      <RecentRail />
      <TrendingRail />
    </div>
  )
}
