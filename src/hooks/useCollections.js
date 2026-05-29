import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// Session-scoped cache — survives re-renders, cleared on page refresh
let _cache = null

export function useCollections() {
  const [collections, setCollections] = useState(_cache ?? [])
  const [loading, setLoading]         = useState(!_cache)

  useEffect(() => {
    if (_cache) return

    supabase
      .from('collections')
      .select('id,slug,title_ka,title_en,image_url,color,display_order')
      .eq('is_visible', true)
      .order('display_order')
      .then(({ data, error }) => {
        if (!error && data) {
          _cache = data
          setCollections(data)
        }
        setLoading(false)
      })
  }, [])

  return { collections, loading }
}
