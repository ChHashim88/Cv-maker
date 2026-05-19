import { createClient } from '@supabase/supabase-js';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
  source: 'env' | 'local' | 'none';
}

/**
 * Retrieves the current Supabase configuration.
 * Prioritizes local settings pasted into the UI, falling back to .env variables.
 */
export const getSupabaseConfig = (): SupabaseConfig => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const localUrl = localStorage.getItem('skillsync_supabase_url');
  const localKey = localStorage.getItem('skillsync_supabase_anon_key');

  if (localUrl && localKey) {
    return {
      url: localUrl.trim(),
      anonKey: localKey.trim(),
      isConfigured: true,
      source: 'local'
    };
  }

  if (envUrl && envKey) {
    return {
      url: envUrl.trim(),
      anonKey: envKey.trim(),
      isConfigured: true,
      source: 'env'
    };
  }

  return {
    url: '',
    anonKey: '',
    isConfigured: false,
    source: 'none'
  };
};

// Singleton Supabase Client
let supabaseInstance: ReturnType<typeof createClient> | null = null;

/**
 * Dynamically initializes/re-initializes the Supabase client.
 * Called on startup or when the user updates credentials in the UI.
 */
export const initSupabase = (): ReturnType<typeof createClient> | null => {
  const { url, anonKey, isConfigured } = getSupabaseConfig();

  if (isConfigured && url && anonKey) {
    try {
      supabaseInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
    } catch (e) {
      console.error("Supabase Initialization Error:", e);
      supabaseInstance = null;
    }
  } else {
    supabaseInstance = null;
  }

  return supabaseInstance;
};

// Initial load
initSupabase();

/**
 * Export getter function for the active client instance
 */
export const getSupabaseClient = () => {
  if (!supabaseInstance) {
    // Attempt re-init in case localStorage was set since module load
    return initSupabase();
  }
  return supabaseInstance;
};
