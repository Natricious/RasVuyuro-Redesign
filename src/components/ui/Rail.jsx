import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { PosterCard } from './PosterCard'
import styles from './Rail.module.css'

const FIELDS = 'id,title,year,imdb_rating,genres,poster'
const SKELETONS = Array.from({ length: 10 })

// PostgREST contains-set filter on movies.collections (text[]).
// Also accepts underscore variant for legacy slug data (ancient-rome → ancient_rome).
function buildCollectionFilter(slug) {
  const under = slug.replace(/-/g, '_')
  const parts = [`collections.cs.{"${slug}"}`]
  if (under !== slug) parts.push(`collections.cs.{"${under}"}`)
  return parts.join(',')
}

function ChevronLeft() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path d="M9.5 12 5 7.5 9.5 3" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path d="M5.5 3 10 7.5 5.5 12" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Rail({ title, kicker, collectionSlug, linkTo }) {
  const trackRef              = useRef(null)
  const [movies, setMovies]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setMovies([])

    async function run() {
      let data = null

      if (collectionSlug) {
        const { data: filtered, error } = await supabase
          .from('movies')
          .select(FIELDS)
          .or(buildCollectionFilter(collectionSlug))
          .order('imdb_rating', { ascending: false })
          .limit(20)

        if (!error && filtered?.length > 0) {
          data = filtered
        } else if (error) {
          console.warn(`[Rail "${title}"] collection filter error:`, error.message)
        }
      }

      // Fallback: top-rated movies when collection is empty or not specified
      if (!data) {
        const { data: fb } = await supabase
          .from('movies')
          .select(FIELDS)
          .order('imdb_rating', { ascending: false })
          .limit(20)
        data = fb
      }

      if (cancelled) return
      setMovies(data ?? [])
      setLoading(false)
    }

    run()
    return () => { cancelled = true }
  }, [collectionSlug, title])

  function scroll(dir) {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: el.clientWidth * 0.8 * dir, behavior: 'smooth' })
  }

  if (!loading && movies.length === 0) return null

  return (
    <section className={styles.rail} aria-label={title}>
      <div className={styles.header}>
        <div className={styles.titles}>
          {kicker && <span className={styles.kicker}>{kicker}</span>}
          <h2 className={styles.title}>{title}</h2>
        </div>

        <div className={styles.controls}>
          <button type="button" className={styles.arrow}
            onClick={() => scroll(-1)} aria-label="წინა">
            <ChevronLeft />
          </button>
          <button type="button" className={styles.arrow}
            onClick={() => scroll(1)} aria-label="შემდეგი">
            <ChevronRight />
          </button>
          {linkTo && <Link to={linkTo} className={styles.allLink}>ყველა →</Link>}
        </div>
      </div>

      <div className={styles.track} ref={trackRef}>
        {loading
          ? SKELETONS.map((_, i) => <div key={i} className={styles.skeleton} />)
          : movies.map(movie => (
              <div key={movie.id} className={styles.item}>
                <PosterCard movie={movie} />
              </div>
            ))
        }
      </div>
    </section>
  )
}
