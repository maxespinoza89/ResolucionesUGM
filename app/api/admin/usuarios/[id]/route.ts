import { NextRequest, NextResponse } from "next/server";
import { crearClienteServicio } from "@/lib/supabase/server";
import { obtenerPerfilActual } from "@/lib/auth/obtenerPerfilActual";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const perfilActual = await obtenerPerfilActual();
  if (!perfilActual || (perfilActual.rol !== "admin" && perfilActual.rol !== "super_admin")) {
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
  }

  const { rol, carrera_ids } = await request.json();
  const supabase = crearClienteServicio();

  if (rol) {
    if ((rol === "admin" || rol === "super_admin") && perfilActual.rol !== "super_admin") {
      return NextResponse.json(
        { error: "Solo un Super Administrador puede asignar ese rol" },
        { status: 403 }
      );
    }
    await supabase.from("perfiles").update({ rol }).eq("id", id);
  }

  if (Array.isArray(carrera_ids)) {
    await supabase.from("asignaciones_carrera").delete().eq("perfil_id", id);
    if (carrera_ids.length > 0) {
      await supabase
        .from("asignaciones_carrera")
        .insert(carrera_ids.map((carrera_id: string) => ({ perfil_id: id, carrera_id })));
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const perfilActual = await obtenerPerfilActual();
  if (!perfilActual || (perfilActual.rol !== "admin" && perfilActual.rol !== "super_admin")) {
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
  }

  const supabase = crearClienteServicio();

  const { data: perfilObjetivo } = await supabase
    .from("perfiles")
    .select("rol")
    .eq("id", id)
    .single();

  if (
    perfilObjetivo &&
    (perfilObjetivo.rol === "admin" || perfilObjetivo.rol === "super_admin") &&
    perfilActual.rol !== "super_admin"
  ) {
    return NextResponse.json(
      { error: "Solo un Super Administrador puede eliminar ese rol" },
      { status: 403 }
    );
  }

  await supabase.auth.admin.deleteUser(id);
  await supabase.from("perfiles").delete().eq("id", id);

  return NextResponse.json({ ok: true });
}
