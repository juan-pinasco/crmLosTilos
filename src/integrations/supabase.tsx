import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_APP_SUPABASE_URL,
  import.meta.env.VITE_APP_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true, // Renovar automáticamente el token antes de que expire
      persistSession: true,   // Mantener la sesión en localStorage
      detectSessionInUrl: true // Detectar sesión en URL (útil para magic links)
    }
  }
);
