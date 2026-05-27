import { useNavigate } from 'react-router-dom'
import styles from './PosterCard.module.css'

export function PosterCard({ movie }) {
  const navigate = useNavigate()

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
        {movie.poster
          ? <img src={movie.poster} alt="" loading="lazy" />
          : <div className={styles.fallback} />
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
