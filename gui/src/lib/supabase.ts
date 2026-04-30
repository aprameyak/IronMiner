import { createClient, SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_KEY as string | undefined

if (!url || !key) {
    console.warn(
        '[supabase.ts] VITE_SUPABASE_URL or VITE_SUPABASE_KEY is not set. ' +
        'Make sure gui/.env exists and the Vite dev server was restarted after creating it.'
    )
}

// Returns null if env vars aren't set
export const supabase: SupabaseClient | null = url && key ? createClient(url, key) : null

interface SupabaseResult<T> {
  data: T | null
  error: string | null
}

/**
 * Fetch the latest safety report for a site directly from Supabase.
 * Returns { data, error } so callers can distinguish "no row" from "auth error".
 */
export async function fetchSafetyReportFromSupabase(siteId: string): Promise<SupabaseResult<unknown>> {
    if (!supabase) {
        return { data: null, error: 'Supabase client not initialised — check VITE_SUPABASE_URL and VITE_SUPABASE_KEY in gui/.env, then restart the dev server.' }
    }
    const { data, error } = await supabase
        .from('safety_reports')
        .select('data')
        .eq('site_id', siteId)
        .single()

    if (error) {
        return { data: null, error: `Supabase: ${(error as { message?: string }).message || JSON.stringify(error)}` }
    }
    if (!data) {
        return { data: null, error: 'No safety report found in Supabase for this site. Run: python scripts/seed_supabase.py' }
    }
    return { data: (data as { data: unknown }).data, error: null }  // data.data = the JSONB SafetyReport blob
}
