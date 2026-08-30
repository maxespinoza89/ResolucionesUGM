import { crearClienteServidor, crearClienteServicio } from "@/lib/supabase/server";

export type Perfil = {
  id: string;
  nombre_completo: string;
  rol: "super_admin" | "admin" | "emisor" | "solo_lectura";
};

export async function obtenerPerfilActual(): Promise<Perfil | null> {
  const supabaseSesion = await crearClienteServidor();
  const {
    data: { user },
  } = await supabaseSesion.auth.getUser();

  if (!user) return null;

  const supabase = crearClienteServicio();
  const { data: perfil } = await supabase
    .from("perfiles")
    .select("id, nombre_completo, rol")
    .eq("id", user.id)
    .single();

  return perfil as Perfil | null;
}

export function esAdministrador(perfil: Perfil | null): boolean {
  return perfil?.rol === "admin" || perfil?.rol === "super_admin";
}
