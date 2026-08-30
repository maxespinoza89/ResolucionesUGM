import { NextRequest, NextResponse } from "next/server";
import { crearClienteServidor, crearClienteServicio } from "@/lib/supabase/server";
import { generarPdfResolucion } from "@/lib/resoluciones/generarPdf";

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function fechaLargaHoy(): string {
  const hoy = new Date();
  return `${hoy.getDate()} de ${MESES[hoy.getMonth()]} de ${hoy.getFullYear()}`;
}

function reemplazarVariables(texto: string, variables: Record<string, string>): string {
  return texto.replace(/{{(.*?)}}/g, (_, clave) => variables[clave.trim()] ?? "");
}

function inicialesDeNombre(nombre: string): string {
  return nombre
    .split(" ")
    .filter(Boolean)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase();
}

export async function POST(request: NextRequest) {
  const { tipoId, datos } = await request.json();

  const supabaseSesion = await crearClienteServidor();
  const {
    data: { user },
  } = await supabaseSesion.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // Se usa el cliente de servicio para las lecturas de configuración
  // (estructura organizacional, tipos de resolución) — el control de
  // permisos por rol se valida aquí antes de continuar.
  const supabase = crearClienteServicio();

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("nombre_completo, rol")
    .eq("id", user.id)
    .single();

  if (!perfil || perfil.rol === "solo_lectura") {
    return NextResponse.json({ error: "Sin permiso para generar resoluciones" }, { status: 403 });
  }

  const { data: tipo } = await supabase
    .from("tipos_resolucion")
    .select("*")
    .eq("id", tipoId)
    .single();

  if (!tipo) {
    return NextResponse.json({ error: "Tipo de resolución no encontrado" }, { status: 404 });
  }

  // Si el formulario pidió una carrera, se resuelve su nombre/nivel/modalidad
  // y se agregan como variables adicionales para la plantilla.
  let variables: Record<string, string> = { ...datos };
  let carreraId: string | null = null;

  if (datos.carrera_id) {
    const { data: carrera } = await supabase
      .from("carreras")
      .select("id, nombre, nivel, modalidad, escuela_id")
      .eq("id", datos.carrera_id)
      .single();

    if (carrera) {
      carreraId = carrera.id;
      variables = {
        ...variables,
        carrera_nombre: carrera.nombre,
        carrera_nivel: carrera.nivel,
        carrera_modalidad: carrera.modalidad,
      };
    }
  }

  // ---------- Firmante emisor (titular o interino de la Facultad) ----------
  const { data: facultad } = await supabase.from("facultades").select("*").limit(1).single();

  const firmaEmisor = facultad?.interino_activo
    ? { nombre: facultad.interino_nombre, cargo: facultad.interino_cargo, unidad: facultad.nombre }
    : { nombre: facultad?.titular_nombre, cargo: facultad?.titular_cargo, unidad: facultad?.nombre };

  // ---------- Firmante fijo: Secretaría General ----------
  const { data: secretaria } = await supabase.from("firmantes_fijos").select("*").limit(1).single();

  // ---------- Número correlativo ----------
  const anio = new Date().getFullYear();
  const { data: numeroData } = await supabase.rpc("siguiente_numero_resolucion", { anio_param: anio });
  const numero = numeroData as number;

  // ---------- Armar textos con variables reemplazadas ----------
  const vistos = (tipo.plantilla_vistos as string[]).map((t) => reemplazarVariables(t, variables));
  const articulos = (tipo.plantilla_articulos as string[]).map((t) => reemplazarVariables(t, variables));

  const pdfBytes = await generarPdfResolucion({
    unidadEmisora: (facultad?.nombre ?? "").toUpperCase(),
    tituloEncabezado: tipo.titulo_encabezado,
    fechaLarga: fechaLargaHoy(),
    numero,
    anio,
    vistos,
    articulos,
    firmaEmisor: {
      nombre: firmaEmisor?.nombre ?? "",
      cargo: firmaEmisor?.cargo ?? "",
      unidad: firmaEmisor?.unidad ?? "",
    },
    firmaSecretaria: {
      nombre: secretaria?.nombre ?? "",
      cargo: secretaria?.cargo ?? "",
      iniciales: secretaria?.iniciales ?? "",
    },
    distribucion: [
      "Vicerrectoría Académica",
      "Dirección de Procesos y Registros Académicos",
      facultad?.nombre ?? "",
    ],
    inicialesTipeo: inicialesDeNombre(perfil.nombre_completo),
  });

  // ---------- Guardar registro de la resolución ----------
  await supabase.from("resoluciones").insert({
    tipo_id: tipo.id,
    numero,
    anio,
    carrera_id: carreraId,
    datos,
    generado_por: user.id,
  });

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="resolucion-${numero}-${anio}.pdf"`,
    },
  });
}
