import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useMovie } from '../hooks/useMovie'
import { PosterCard } from '../components/ui/PosterCard'
import styles from './MovieDetail.module.css'

const SIMILAR_FIELDS = 'id,title,year,imdb_rating,genres,poster'

/* ── localStorage watchlist ────────────────────────────────── */
function useWatchlist() {
  const [watched, setWatched] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('cg_watched') ?? '[]')) }
    catch { return new Set() }
  })
  const [planned, setPlanned] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('cg_planned') ?? '[]')) }
    catch { return new Set() }
  })
  const [ratings, setRatingsMap] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cg_ratings') ?? '{}') }
    catch { return {} }
  })

  function toggleWatched(id) {
    setWatched(prev => {
      const s = new Set(prev)
      s.has(id) ? s.delete(id) : s.add(id)
      localStorage.setItem('cg_watched', JSON.stringify([...s]))
      return s
    })
  }

  function togglePlanned(id) {
    setPlanned(prev => {
      const s = new Set(prev)
      s.has(id) ? s.delete(id) : s.add(id)
      localStorage.setItem('cg_planned', JSON.stringify([...s]))
      return s
    })
  }

  function rate(id, n) {
    setRatingsMap(prev => {
      const next = { ...prev, [id]: n }
      localStorage.setItem('cg_ratings', JSON.stringify(next))
      return next
    })
  }

  return { watched, planned, ratings, toggleWatched, togglePlanned, rate }
}

/* ── Star rating 1–10 ──────────────────────────────────────── */
const STARS = Array.from({ length: 10 }, (_, i) => i + 1)

function StarRating({ movieId, value, onChange }) {
  const [hovered, setHovered] = useState(0)
  const display = hovered || value

  return (
    <div className={styles.starRow}>
      <span className={styles.starLabel}>შენი შეფასება</span>
      <div className={styles.stars} role="group" aria-label="Rate this film">
        {STARS.map(n => (
          <button
            key={n}
            type="button"
            className={`${styles.star} ${display >= n ? styles.starOn : ''}`}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(n === value ? 0 : n)}
            aria-label={`${n} ვარსკვლავი`}
          >
            ★
          </button>
        ))}
      </div>
      {value > 0 && (
        <span className={styles.starValue}>{value}/10</span>
      )}
    </div>
  )
}

/* ── Similar movies rail ────────────────────────────────────── */
function SimilarSection({ currentMovie }) {
  const [movies, setMovies]   = useState([])
  const trackRef              = useRef(null)

  useEffect(() => {
    const firstGenre = Array.isArray(currentMovie?.genres)
      ? currentMovie.genres[0]
      : typeof currentMovie?.genres === 'string'
        ? currentMovie.genres.split(/[,[\]"{}]+/).find(s => s.trim())
        : null

    if (!firstGenre) return

    let cancelled = false
    supabase
      .from('movies')
      .select(SIMILAR_FIELDS)
      .ilike('genres', `%${firstGenre.trim()}%`)
      .neq('id', currentMovie.id)
      .order('imdb_rating', { ascending: false })
      .limit(14)
      .then(({ data, error: err }) => {
        if (cancelled) return
        if (err) console.error('[SimilarSection] query error:', err)
        setMovies(data ?? [])
      })
    return () => { cancelled = true }
  }, [currentMovie?.id, currentMovie?.genres])

  if (!movies.length) return null

  function scroll(dir) {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: el.clientWidth * 0.8 * dir, behavior: 'smooth' })
  }

  return (
    <section aria-label="მსგავსი ფილმები">
      <div className={styles.sectionHeaderRow}>
        <h2 className={styles.sectionTitle}>მსგავსი ფილმები</h2>
        <div className={styles.scrollBtns}>
          <button type="button" className={styles.scrollBtn}
            onClick={() => scroll(-1)} aria-label="წინა">‹</button>
          <button type="button" className={styles.scrollBtn}
            onClick={() => scroll(1)}  aria-label="შემდეგი">›</button>
        </div>
      </div>
      <div className={styles.similarTrack} ref={trackRef}>
        {movies.map(m => (
          <div key={m.id} className={styles.similarItem}>
            <PosterCard movie={m} />
          </div>
        ))}
      </div>
    </section>
  )
}

/* ── Reviews section ────────────────────────────────────────── */
function ReviewsSection() {
  return (
    <section aria-label="მიმოხილვები">
      <div className={styles.sectionHeaderRow}>
        <h2 className={styles.sectionTitle}>მიმოხილვები</h2>
      </div>
      <div className={styles.reviewsEmpty}>
        <p className={styles.reviewsEmptyText}>
          მიმოხილვები ჯერ არ არის. პირველი იყავი!
        </p>
        <button type="button" className={styles.writeReviewBtn}>
          მიმოხილვის დაწერა
        </button>
      </div>
    </section>
  )
}

/* ── Main page ──────────────────────────────────────────────── */
const LOADING_WIDTHS = [28, 70, 45, 90, 78, 55]

export default function MovieDetail() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const { movie, loading, error } = useMovie(id)
  const { watched, planned, ratings, toggleWatched, togglePlanned, rate } = useWatchlist()

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingBackdrop} />
        <div className={styles.loadingGrid}>
          <div className={styles.loadingPoster} />
          <div className={styles.loadingInfo}>
            {LOADING_WIDTHS.map((w, i) => (
              <div key={i} className={styles.loadingLine} style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !movie) {
    return (
      <div className={styles.errorState}>
        <p>ფილმი ვერ მოიძებნა</p>
        <button type="button" className={styles.errorStateBtn} onClick={() => navigate(-1)}>
          ← უკან
        </button>
      </div>
    )
  }

  const key       = String(movie.id)
  const isWatched = watched.has(key)
  const isPlanned = planned.has(key)
  const userRating = ratings[key] ?? 0
  const synopsis   = movie.description_ka || movie.description

  // Normalise genres — Supabase may return text[] as JS array or as a raw string
  const genreList = Array.isArray(movie.genres)
    ? movie.genres
    : typeof movie.genres === 'string'
      ? movie.genres.replace(/[{}"[\]]/g, '').split(',').map(s => s.trim()).filter(Boolean)
      : []

  // Split description into tagline (first sentence) + body for visual hierarchy
  const dotIdx    = synopsis ? synopsis.indexOf('.') : -1
  const tagline   = dotIdx > 20 ? synopsis.slice(0, dotIdx + 1) : null
  const bodyText  = tagline   ? synopsis.slice(dotIdx + 1).trim() : synopsis

  return (
    <div className={styles.page}>

      {/* ── Backdrop ─────────────────────────────────────────── */}
      <div className={styles.backdrop}>
        {movie.poster && <img src={movie.poster} alt="" />}
      </div>

      {/* ── Back button ──────────────────────────────────────── */}
      <button type="button" className={styles.backBtn}
        onClick={() => navigate(-1)}>
        ← უკან
      </button>

      {/* ── Main grid ────────────────────────────────────────── */}
      <div className={styles.mainSection}>
        <div className={styles.grid}>

          {/* Left — poster */}
          <div className={styles.posterCol}>
            <div className={styles.poster}>
              {movie.poster
                ? <img src={movie.poster} alt={movie.title} />
                : null
              }
            </div>
          </div>

          {/* Right — info */}
          <div className={styles.infoCol}>

            <div className={styles.headerGroup}>
              {genreList.length > 0 && (
                <span className={styles.genreKicker}>
                  {genreList.slice(0, 3).join(' · ')}
                </span>
              )}

              <h1 className={styles.title}>{movie.title}</h1>

              {movie.title_ge && (
                <p className={styles.titleEn}>{movie.title_ge}</p>
              )}

              <div className={styles.meta}>
                {movie.imdb_rating != null && (
                  <>
                    <span className={styles.metaRating}>
                      ★ {Number(movie.imdb_rating).toFixed(1)}
                    </span>
                    <span className={styles.metaDot}>·</span>
                  </>
                )}
                {movie.year    && <span>{movie.year}</span>}
              </div>
            </div>

            <div className={styles.actionCard}>
              {/* Watched / Planned toggles */}
              <div className={styles.actions}>
                <button
                  type="button"
                  className={`${styles.actionBtn} ${isWatched ? styles.actionBtnPrimary : styles.actionBtnGhost}`}
                  onClick={() => toggleWatched(key)}
                >
                  {isWatched ? '✓ ნანახია' : 'ნანახად მონიშვნა'}
                </button>
                <button
                  type="button"
                  className={`${styles.actionBtn} ${isPlanned ? styles.actionBtnPrimary : styles.actionBtnGhost}`}
                  onClick={() => togglePlanned(key)}
                >
                  {isPlanned ? '✓ სიაში' : '+ სიაში დამატება'}
                </button>
              </div>

              <StarRating
                movieId={key}
                value={userRating}
                onChange={n => rate(key, n)}
              />
            </div>

            {tagline && (
              <blockquote className={styles.tagline}>{tagline}</blockquote>
            )}

            {bodyText && (
              <p className={styles.synopsis}>{bodyText}</p>
            )}



            {/* Streaming providers */}
            <div className={styles.providers}>
              <span className={styles.providersLabel}>ნახვა</span>
              <span className={styles.providersEmpty}>ინფო მალე</span>
            </div>

          </div>
        </div>
      </div>

      {/* ── Below-fold ───────────────────────────────────────── */}
      <div className={styles.below}>
        <SimilarSection currentMovie={movie} />
        <ReviewsSection />
      </div>

    </div>
  )
}
