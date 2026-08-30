import { NextResponse } from "next/server";
import { crearClienteServidor } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { data: carreras } = await supabase
    .from("carreras")
    .select("id, nombre, nivel, modalidad")
    .order("nombre");

  return NextResponse.json({ carreras: carreras ?? [] });
}
