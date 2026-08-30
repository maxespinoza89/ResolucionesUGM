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

  const body = await request.json();
  const supabase = crearClienteServicio();

  const { error } = await supabase
    .from("tipos_resolucion")
    .update({
      nombre: body.nombre,
      titulo_encabezado: body.titulo_encabezado,
      campos: body.campos,
      plantilla_vistos: body.plantilla_vistos,
      plantilla_articulos: body.plantilla_articulos,
      activo: body.activo,
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
