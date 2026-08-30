import { NextRequest, NextResponse } from "next/server";
import { crearClienteServicio } from "@/lib/supabase/server";
import { obtenerPerfilActual } from "@/lib/auth/obtenerPerfilActual";

export async function GET() {
  const perfilActual = await obtenerPerfilActual();
  if (!perfilActual || (perfilActual.rol !== "admin" && perfilActual.rol !== "super_admin")) {
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
  }

  const supabase = crearClienteServicio();

  const { data: perfiles } = await supabase
    .from("perfiles")
    .select("id, nombre_completo, rol, asignaciones_carrera(carrera_id, carreras(nombre))")
    .order("nombre_completo");

  const { data: usuariosAuth } = await supabase.auth.admin.listUsers();
  const correoPorId = new Map(usuariosAuth?.users.map((u) => [u.id, u.email]) ?? []);

  const usuarios = (perfiles ?? []).map((p) => ({
    ...p,
    correo: correoPorId.get(p.id) ?? "",
  }));

  return NextResponse.json({ usuarios });
}

export async function POST(request: NextRequest) {
  const perfilActual = await obtenerPerfilActual();
  if (!perfilActual || (perfilActual.rol !== "admin" && perfilActual.rol !== "super_admin")) {
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
  }

  const { correo, nombre_completo, rol, carrera_ids } = await request.json();

  if ((rol === "admin" || rol === "super_admin") && perfilActual.rol !== "super_admin") {
    return NextResponse.json(
      { error: "Solo un Super Administrador puede crear ese rol" },
      { status: 403 }
    );
  }

  const supabase = crearClienteServicio();
  const claveTemporal = crypto.randomUUID();

  const { data: nuevoUsuario, error: errorCreacion } = await supabase.auth.admin.createUser({
    email: correo,
    password: claveTemporal,
    email_confirm: true,
  });

  if (errorCreacion || !nuevoUsuario.user) {
    return NextResponse.json(
      { error: errorCreacion?.message ?? "No se pudo crear el usuario" },
      { status: 400 }
    );
  }

  await supabase.from("perfiles").insert({
    id: nuevoUsuario.user.id,
    nombre_completo,
    rol,
    creado_por: perfilActual.id,
  });

  if (Array.isArray(carrera_ids) && carrera_ids.length > 0 && (rol === "emisor" || rol === "solo_lectura")) {
    await supabase.from("asignaciones_carrera").insert(
      carrera_ids.map((carrera_id: string) => ({ perfil_id: nuevoUsuario.user.id, carrera_id }))
    );
  }

  await supabase.auth.resetPasswordForEmail(correo);

  return NextResponse.json({ ok: true });
}
