import { crearClienteServidor } from "@/lib/supabase/server";
import FormularioResolucion from "./FormularioResolucion";

export default async function PaginaNuevaResolucion({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  const { tipo } = await searchParams;
  const supabase = await crearClienteServidor();

  const { data: tipoResolucion } = await supabase
    .from("tipos_resolucion")
    .select("id, clave, nombre, campos")
    .eq("clave", tipo ?? "reincorporacion")
    .single();

  const { data: carreras } = await supabase
    .from("carreras")
    .select("id, nombre, nivel, modalidad")
    .order("nombre");

  if (!tipoResolucion) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <p className="text-sm text-slate-500">
          No se encontró el tipo de resolución solicitado.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-xl mx-auto">
        <h1 className="text-xl font-semibold text-slate-900 mb-6">
          {tipoResolucion.nombre}
        </h1>
        <FormularioResolucion
          tipoId={tipoResolucion.id}
          tipoClave={tipoResolucion.clave}
          campos={tipoResolucion.campos}
          carreras={carreras ?? []}
        />
      </div>
    </main>
  );
}
