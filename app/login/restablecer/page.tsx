"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearClienteNavegador } from "@/lib/supabase/client";

export default function PaginaRestablecerClave() {
  const router = useRouter();
  const supabase = crearClienteNavegador();
  const [clave, setClave] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [listo, setListo] = useState(false);

  async function manejarSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const { error } = await supabase.auth.updateUser({ password: clave });

    if (error) {
      setError("No se pudo actualizar la clave. Pide un nuevo link de recuperación e intenta de nuevo.");
      return;
    }

    setListo(true);
    setTimeout(() => router.push("/login"), 2000);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm bg-white p-8 rounded-lg shadow border border-slate-200">
        <h1 className="text-lg font-semibold text-slate-900 mb-1">
          Definir clave nueva
        </h1>

        {listo ? (
          <p className="text-sm text-slate-600 mt-4">
            Clave actualizada. Te llevamos al login...
          </p>
        ) : (
          <form onSubmit={manejarSubmit}>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1 mt-4">
              Clave nueva
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2 mb-4 text-sm"
            />
            {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
            <button
              type="submit"
              className="w-full bg-slate-900 text-white text-sm font-semibold py-2 rounded hover:bg-slate-800"
            >
              Guardar clave
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
