import { NextRequest, NextResponse } from "next/server";
import { crearClienteServicio } from "@/lib/supabase/server";
import { obtenerPerfilActual } from "@/lib/auth/obtenerPerfilActual";

export async function GET() {
  const perfilActual = await obtenerPerfilActual();
  if (!perfilActual || (perfilActual.rol !== "admin" && perfilActual.rol !== "super_admin")) {
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
  }

  const supabase = crearClienteServicio();
  const { data: tipos } = await supabase
    .from("tipos_resolucion")
    .select("*")
    .order("nombre");

  return NextResponse.json({ tipos });
}

export async function POST(request: NextRequest) {
  const perfilActual = await obtenerPerfilActual();
  if (!perfilActual || (perfilActual.rol !== "admin" && perfilActual.rol !== "super_admin")) {
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
  }

  const body = await request.json();
  const supabase = crearClienteServicio();

  const { error } = await supabase.from("tipos_resolucion").insert({
    clave: body.clave,
    nombre: body.nombre,
    titulo_encabezado: body.titulo_encabezado,
    campos: body.campos,
    plantilla_vistos: body.plantilla_vistos,
    plantilla_articulos: body.plantilla_articulos,
    activo: true,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
