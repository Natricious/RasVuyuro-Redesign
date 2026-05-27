import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const FIELDS = 'id,title,title_ge,year,imdb_rating,genres,themes,timeline,tone,poster,description,description_ka,similar_movies,collections,sources'

export function useMovie(id) {
  const [movie, setMovie]     = useState(null)
  const [loading, setLoading] = useState(!!id)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!id) return

    let cancelled = false
    setLoading(true)
    setError(null)
    setMovie(null)

    supabase
      .from('movies')
      .select(FIELDS)
      .eq('id', id)
      .single()
      .then(({ data, error: err }) => {
        if (cancelled) return
        setLoading(false)
        if (err) {
          console.error('[useMovie] query error:', err)
          setError(err)
        } else {
          setMovie(data)
        }
      })

    return () => { cancelled = true }
  }, [id])

  return { movie, loading, error }
}
