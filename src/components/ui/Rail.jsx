import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { PosterCard } from './PosterCard'
import styles from './Rail.module.css'

const SKELETONS = Array.from({ length: 10 })

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

export function Rail({ title, kicker, linkTo }) {
  const trackRef              = useRef(null)
  const [movies, setMovies]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function run() {
      const { data, error } = await supabase
        .from('movies')
        .select('id, title, year, imdb_rating, genres, poster')
        .limit(20)

      if (error) { console.error(error); return; }
      setMovies(data)
      setLoading(false)
    }

    run()
  }, [])

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
          <Link to={linkTo} className={styles.allLink}>ყველა →</Link>
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
