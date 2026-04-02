// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string

// Import the supabase client like this:
// import { supabase } from "@/lib/supabase/client";

// Safe localStorage wrapper to prevent crashes in strict privacy modes (e.g. Chrome Incognito)
const safeStorage = {
  getItem: (key: string) => {
    try {
      return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null
    } catch (e) {
      return null
    }
  },
  setItem: (key: string, value: string) => {
    try {
      if (typeof window !== 'undefined') window.localStorage.setItem(key, value)
    } catch (e) {
      /* ignore */
    }
  },
  removeItem: (key: string) => {
    try {
      if (typeof window !== 'undefined') window.localStorage.removeItem(key)
    } catch (e) {
      /* ignore */
    }
  },
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: safeStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
})
