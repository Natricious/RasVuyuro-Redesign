import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const PAGE_SIZE = 60
const FIELDS = 'id,title,title_ge,year,imdb_rating,genres,themes,tone,poster,description,description_ka'

const DEFAULT_SORT = { column: 'imdb_rating', ascending: false }

export function useMovies({ search = '', genre = '', sort = DEFAULT_SORT } = {}) {
  const [movies, setMovies]   = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [page, setPage]       = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const { column: sortCol, ascending: sortAsc } = sort

  const load = useCallback(async (pageNum, append) => {
    setLoading(true)
    setError(null)

    const from = pageNum * PAGE_SIZE
    const to   = from + PAGE_SIZE - 1

    let query = supabase
      .from('movies')
      .select(FIELDS)
      .order(sortCol, { ascending: sortAsc })
      .range(from, to)

    const q = search.trim()
    if (q) {
      query = query.ilike('title', `%${q}%`)
    }

    // Use ilike for genre so it works whether the column is text, text[], or jsonb.
    // The array representation {Drama,Thriller} still matches %Drama%.
    if (genre && genre !== 'ყველა') {
      query = query.ilike('genres', `%${genre}%`)
    }

    const { data, error: err } = await query

    setLoading(false)

    if (err) {
      console.error('[useMovies] query error:', err)
      setError(err)
      return
    }

    setMovies(prev => append ? [...prev, ...(data ?? [])] : (data ?? []))
    setHasMore((data?.length ?? 0) === PAGE_SIZE)
  }, [search, genre, sortCol, sortAsc])

  useEffect(() => {
    setPage(0)
    load(0, false)
  }, [load])

  const fetchMore = useCallback(() => {
    if (loading || !hasMore) return
    const next = page + 1
    setPage(next)
    load(next, true)
  }, [loading, hasMore, page, load])

  return { movies, loading, error, fetchMore, hasMore }
}
