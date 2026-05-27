import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMovies } from '../hooks/useMovies'
import { GENRES } from '../lib/constants'
import { PosterCard } from '../components/ui/PosterCard'
import styles from './Browse.module.css'

const BROWSE_SORTS = [
  { value: 'rating',     label: 'რეიტინგით',   column: 'imdb_rating', ascending: false },
  { value: 'newest',     label: 'სიახლით',      column: 'year',        ascending: false },
  { value: 'popularity', label: 'პოპულარობით',  column: 'imdb_rating', ascending: false },
]

const GRID_SKELETONS = Array.from({ length: 18 })
const LIST_SKELETONS = Array.from({ length: 8 })

function GridIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor" aria-hidden="true">
      <rect x="1"   y="1"   width="5.5" height="5.5" rx="1" />
      <rect x="8.5" y="1"   width="5.5" height="5.5" rx="1" />
      <rect x="1"   y="8.5" width="5.5" height="5.5" rx="1" />
      <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1" />
    </svg>
  )
}

function ListIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor" aria-hidden="true">
      <rect x="1" y="1.5"  width="13" height="2" rx="1" />
      <rect x="1" y="6.5"  width="13" height="2" rx="1" />
      <rect x="1" y="11.5" width="13" height="2" rx="1" />
    </svg>
  )
}

function ListRow({ movie, index }) {
  const navigate = useNavigate()
  const synopsis = movie.description_ka || movie.description

  function go() { navigate(`/movie/${movie.id}`) }

  return (
    <div
      className={styles.listRow}
      onClick={go}
      onKeyDown={e => e.key === 'Enter' && go()}
      role="button"
      tabIndex={0}
      aria-label={`${movie.title}${movie.year ? `, ${movie.year}` : ''}`}
    >
      <span className={styles.listNum}>
        {String(index + 1).padStart(2, '0')}
      </span>

      <div className={styles.listPoster}>
        {movie.poster && (
          <img src={movie.poster} alt="" loading="lazy" />
        )}
      </div>

      <div className={styles.listMeta}>
        <h3 className={styles.listTitle}>{movie.title}</h3>
        {synopsis && (
          <p className={styles.listSynopsis}>{synopsis}</p>
        )}
        {Array.isArray(movie.themes) && movie.themes.length > 0 && (
          <div className={styles.listTags}>
            {movie.themes.slice(0, 4).map(t => (
              <span key={t} className={styles.listTag}>{t}</span>
            ))}
          </div>
        )}
      </div>

      <div className={styles.listStats}>
        {movie.imdb_rating != null && (
          <span className={styles.listRating}>
            ★ {Number(movie.imdb_rating).toFixed(1)}
          </span>
        )}
        {movie.year && <span className={styles.listYear}>{movie.year}</span>}
      </div>
    </div>
  )
}

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [view, setView]                 = useState('grid')
  const [sortValue, setSortValue]       = useState('rating')

  const q           = searchParams.get('q')     || ''
  const activeGenre = searchParams.get('genre') || 'ყველა'

  const sortOpt = BROWSE_SORTS.find(s => s.value === sortValue) ?? BROWSE_SORTS[0]

  const { movies, loading, fetchMore, hasMore } = useMovies({
    search: q,
    genre:  activeGenre,
    sort:   { column: sortOpt.column, ascending: sortOpt.ascending },
  })

  function selectGenre(g) {
    const next = new URLSearchParams(searchParams)
    if (g === 'ყველა') next.delete('genre')
    else               next.set('genre', g)
    setSearchParams(next)
  }

  function clearFilters() {
    setSearchParams({})
    setSortValue('rating')
  }

  const hasResults = movies.length > 0
  const isEmpty    = !loading && !hasResults
  const countLabel = hasResults
    ? `${movies.length}${hasMore ? '+' : ''} ფილმი`
    : loading ? '' : '0 ფილმი'

  return (
    <div className={styles.page}>

      {/* ── Header ────────────────────────────────────────────── */}
      <div className={styles.header}>
        <div className={styles.titleBlock}>
          <span className={styles.kicker}>კატალოგი</span>
          <h1 className={styles.h1}>ფილმები</h1>
          <span className={styles.count}>{countLabel}</span>
        </div>

        <div className={styles.viewToggle}>
          <button
            type="button"
            className={`${styles.viewBtn} ${view === 'grid' ? styles.viewBtnActive : ''}`}
            onClick={() => setView('grid')}
            aria-label="Grid view"
            aria-pressed={view === 'grid'}
          >
            <GridIcon />
          </button>
          <button
            type="button"
            className={`${styles.viewBtn} ${view === 'list' ? styles.viewBtnActive : ''}`}
            onClick={() => setView('list')}
            aria-label="List view"
            aria-pressed={view === 'list'}
          >
            <ListIcon />
          </button>
        </div>
      </div>

      {/* ── Filters ───────────────────────────────────────────── */}
      <div className={styles.filters}>
        <div className={styles.genreChips} role="group" aria-label="Filter by genre">
          {GENRES.map(g => (
            <button
              key={g}
              type="button"
              className={`${styles.chip} ${activeGenre === g ? styles.chipActive : ''}`}
              onClick={() => selectGenre(g)}
              aria-pressed={activeGenre === g}
            >
              {g}
            </button>
          ))}
        </div>

        <div className={styles.sortWrap}>
          <select
            className={styles.sortSelect}
            value={sortValue}
            onChange={e => setSortValue(e.target.value)}
            aria-label="Sort movies"
          >
            {BROWSE_SORTS.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <span className={styles.sortCaret} aria-hidden="true">▾</span>
        </div>
      </div>

      {/* ── Grid view ─────────────────────────────────────────── */}
      {view === 'grid' && (
        <div className={styles.grid}>
          {loading && !hasResults
            ? GRID_SKELETONS.map((_, i) => (
                <div key={i} className={styles.gridSkeleton} />
              ))
            : movies.map(m => <PosterCard key={m.id} movie={m} />)
          }
        </div>
      )}

      {/* ── List view ─────────────────────────────────────────── */}
      {view === 'list' && (
        <div className={styles.list} role="list" aria-label="Movies">
          {loading && !hasResults
            ? LIST_SKELETONS.map((_, i) => (
                <div key={i} className={styles.listSkeleton} />
              ))
            : movies.map((m, i) => (
                <ListRow key={m.id} movie={m} index={i} />
              ))
          }
        </div>
      )}

      {/* ── Empty state ───────────────────────────────────────── */}
      {isEmpty && (
        <div className={styles.empty} role="status">
          <span className={styles.emptyIcon} aria-hidden="true">◌</span>
          <p className={styles.emptyText}>შედეგი ვერ მოიძებნა</p>
          <button type="button" className={styles.clearBtn} onClick={clearFilters}>
            ფილტრების გასუფთავება
          </button>
        </div>
      )}

      {/* ── Load more ─────────────────────────────────────────── */}
      {hasResults && hasMore && !loading && (
        <div className={styles.loadMore}>
          <button type="button" className={styles.loadMoreBtn} onClick={fetchMore}>
            მეტის ჩატვირთვა
          </button>
        </div>
      )}

    </div>
  )
}
