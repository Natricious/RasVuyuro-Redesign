import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './PosterCard.module.css'

export function PosterCard({ movie }) {
  const navigate = useNavigate()
  const [imgFailed, setImgFailed] = useState(false)

  function go() {
    navigate(`/movie/${movie.id}`)
  }

  return (
    <div
      className={styles.card}
      onClick={go}
      onKeyDown={e => e.key === 'Enter' && go()}
      role="button"
      tabIndex={0}
      aria-label={`${movie.title} (${movie.year})`}
    >
      <div className={styles.poster}>
        {movie.poster && !imgFailed
          ? <img src={movie.poster} alt="" loading="lazy" onError={() => setImgFailed(true)} />
          : <div className={styles.fallback}>
              <span className={styles.fallbackIcon} aria-hidden="true">🎬</span>
            </div>
        }
        {movie.imdb_rating != null && (
          <span className={styles.rating}>
            {Number(movie.imdb_rating).toFixed(1)}
          </span>
        )}
      </div>

      <div className={styles.info}>
        <p className={styles.title}>{movie.title}</p>
        {movie.year && <span className={styles.year}>{movie.year}</span>}
      </div>
    </div>
  )
}
