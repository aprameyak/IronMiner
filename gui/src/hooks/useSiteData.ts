import { useState, useEffect } from 'react'
import { fetchSites } from '../api/sites'
import type { Site } from '../types'

export default function useSiteData() {
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSites()
      .then(setSites)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const refresh = () => {
    setLoading(true)
    fetchSites()
      .then(setSites)
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  return { sites, loading, refresh }
}
