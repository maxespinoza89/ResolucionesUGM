import { crearClienteServidor } from "@/lib/supabase/server";
import Link from "next/link";

export default async function PaginaDashboard() {
  const supabase = await crearClienteServidor();

  const { data: tipos } = await supabase
    .from("tipos_resolucion")
    .select("id, clave, nombre, titulo_encabezado")
    .eq("activo", true)
    .order("nombre");

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold text-slate-900 mb-1">
          ¿Qué resolución necesitas generar?
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Selecciona el tipo de resolución para continuar.
        </p>

        <div className="grid gap-3">
          {(tipos ?? []).map((tipo) => (
            <Link
              key={tipo.id}
              href={`/dashboard/nueva-resolucion?tipo=${tipo.clave}`}
              className="block bg-white border border-slate-200 rounded-lg p-4 hover:border-slate-400 transition"
            >
              <p className="font-semibold text-slate-900">{tipo.nombre}</p>
              <p className="text-xs text-slate-500 mt-1">
                {tipo.titulo_encabezado}
              </p>
            </Link>
          ))}

          {(!tipos || tipos.length === 0) && (
            <p className="text-sm text-slate-500">
              Aún no hay tipos de resolución configurados.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
