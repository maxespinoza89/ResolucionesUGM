import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function crearClienteServidor() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignorado: ocurre cuando se llama desde un Server Component.
            // El middleware se encarga de refrescar la sesión en ese caso.
          }
        },
      },
    }
  );
}

// Cliente con permisos elevados (service role). Solo se usa en rutas de
// servidor de confianza (generación de resoluciones, administración).
// NUNCA se debe exponer NEXT_SUPABASE_SERVICE_ROLE_KEY al navegador.
import { createClient } from "@supabase/supabase-js";

export function crearClienteServicio() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
