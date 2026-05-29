import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { PosterCard } from '../components/ui/PosterCard'
import styles from './CollectionDetail.module.css'

const FIELDS    = 'id,title,year,imdb_rating,genres,poster'
const PAGE_SIZE = 40
const SKELETONS = Array.from({ length: 20 })

// PostgREST contains-set filter — same as Rail.jsx
function buildCollectionFilter(slug) {
  const under = slug.replace(/-/g, '_')
  const parts = [`collections.cs.{"${slug}"}`]
  if (under !== slug) parts.push(`collections.cs.{"${under}"}`)
  return parts.join(',')
}

export default function CollectionDetail() {
  const { slug } = useParams()

  const [collection,   setCollection]   = useState(null)
  const [movies,       setMovies]       = useState([])
  const [loading,      setLoading]      = useState(true)
  const [loadingMore,  setLoadingMore]  = useState(false)
  const [hasMore,      setHasMore]      = useState(false)
  const [page,         setPage]         = useState(0)
  const [notFound,     setNotFound]     = useState(false)

  // Fetch collection metadata
  useEffect(() => {
    setCollection(null)
    setNotFound(false)

    supabase
      .from('collections')
      .select('id,slug,title_ka,title_en,image_url,color')
      .eq('slug', slug)
      .single()
      .then(({ data, error }) => {
        if (error || !data) setNotFound(true)
        else setCollection(data)
      })
  }, [slug])

  // Fetch first page of movies for this collection
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setMovies([])
    setPage(0)
    setHasMore(false)

    supabase
      .from('movies')
      .select(FIELDS)
      .or(buildCollectionFilter(slug))
      .order('imdb_rating', { ascending: false })
      .range(0, PAGE_SIZE - 1)
      .then(({ data, error }) => {
        if (cancelled) return
        if (!error && data) {
          setMovies(data)
          setHasMore(data.length === PAGE_SIZE)
        }
        setLoading(false)
      })

    return () => { cancelled = true }
  }, [slug])

  function loadMore() {
    const nextPage = page + 1
    const from     = nextPage * PAGE_SIZE
    setLoadingMore(true)

    supabase
      .from('movies')
      .select(FIELDS)
      .or(buildCollectionFilter(slug))
      .order('imdb_rating', { ascending: false })
      .range(from, from + PAGE_SIZE - 1)
      .then(({ data, error }) => {
        if (!error && data) {
          setMovies(prev => [...prev, ...data])
          setHasMore(data.length === PAGE_SIZE)
          setPage(nextPage)
        }
        setLoadingMore(false)
      })
  }

  if (notFound) {
    return (
      <div className={styles.notFound}>
        <p className={styles.notFoundText}>კოლექცია ვერ მოიძებნა</p>
        <Link to="/collections" className={styles.notFoundBack}>← კოლექციები</Link>
      </div>
    )
  }

  const title = collection?.title_ka || collection?.title_en || slug

  return (
    <div className={styles.page}>

      {/* ── Header ───────────────────────────────────────────── */}
      <div
        className={styles.header}
        style={collection?.image_url
          ? { backgroundImage: `url(${collection.image_url})` }
          : {}
        }
      >
        {collection?.image_url && <div className={styles.headerOverlay} />}
        <div className={styles.headerContent}>
          <Link to="/collections" className={styles.backBtn}>
            ← კოლექციები
          </Link>
          {collection?.color && (
            <span className={styles.accentBar} style={{ background: collection.color }} />
          )}
          {collection?.title_en && (
            <span className={styles.kicker}>{collection.title_en}</span>
          )}
          <h1 className={styles.h1}>{title}</h1>
          {!loading && (
            <p className={styles.count}>
              {movies.length}{hasMore ? '+' : ''} ფილმი
            </p>
          )}
        </div>
      </div>

      {/* ── Movie grid ───────────────────────────────────────── */}
      <div className={styles.grid}>
        {loading
          ? SKELETONS.map((_, i) => <div key={i} className={styles.skeleton} />)
          : movies.map((m, i) => (
              <div
                key={m.id}
                className={styles.gridItem}
                style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
              >
                <PosterCard movie={m} />
              </div>
            ))
        }
      </div>

      {/* ── Load more ────────────────────────────────────────── */}
      {!loading && hasMore && (
        <div className={styles.loadMore}>
          <button
            type="button"
            className={styles.loadMoreBtn}
            onClick={loadMore}
            disabled={loadingMore}
          >
            {loadingMore ? 'იტვირთება...' : 'მეტის ჩატვირთვა'}
          </button>
        </div>
      )}

    </div>
  )
}
