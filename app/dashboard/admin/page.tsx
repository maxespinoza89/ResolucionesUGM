import { redirect } from "next/navigation";
import Link from "next/link";
import { obtenerPerfilActual, esAdministrador } from "@/lib/auth/obtenerPerfilActual";

export default async function PaginaAdmin() {
  const perfil = await obtenerPerfilActual();
  if (!esAdministrador(perfil)) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-xl mx-auto">
        <h1 className="text-xl font-semibold text-slate-900 mb-6">
          Administración
        </h1>
        <div className="grid gap-3">
          <Link
            href="/dashboard/admin/usuarios"
            className="block bg-white border border-slate-200 rounded-lg p-4 hover:border-slate-400 transition"
          >
            <p className="font-semibold text-slate-900">Usuarios</p>
            <p className="text-xs text-slate-500 mt-1">
              Crear usuarios, asignar roles y carreras
            </p>
          </Link>
          <Link
            href="/dashboard/admin/tipos-resolucion"
            className="block bg-white border border-slate-200 rounded-lg p-4 hover:border-slate-400 transition"
          >
            <p className="font-semibold text-slate-900">Tipos de resolución</p>
            <p className="text-xs text-slate-500 mt-1">
              Crear y editar los tipos de resolución disponibles
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
