"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearClienteNavegador } from "@/lib/supabase/client";

export default function PaginaLogin() {
  const router = useRouter();
  const supabase = crearClienteNavegador();
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function manejarSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: correo,
      password: clave,
    });

    setCargando(false);

    if (error) {
      setError("Correo o clave incorrectos.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <form
        onSubmit={manejarSubmit}
        className="w-full max-w-sm bg-white p-8 rounded-lg shadow border border-slate-200"
      >
        <h1 className="text-lg font-semibold text-slate-900 mb-1">
          Resoluciones FNT
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Ingresa con tu cuenta institucional.
        </p>

        <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
          Correo
        </label>
        <input
          type="email"
          required
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          className="w-full border border-slate-300 rounded px-3 py-2 mb-4 text-sm"
        />

        <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
          Clave
        </label>
        <input
          type="password"
          required
          value={clave}
          onChange={(e) => setClave(e.target.value)}
          className="w-full border border-slate-300 rounded px-3 py-2 mb-2 text-sm"
        />

        <a
          href="/login/recuperar"
          className="text-xs text-blue-700 hover:underline"
        >
          ¿Olvidaste tu clave?
        </a>

        {error && (
          <p className="text-sm text-red-600 mt-4">{error}</p>
        )}

        <button
          type="submit"
          disabled={cargando}
          className="w-full mt-6 bg-slate-900 text-white text-sm font-semibold py-2 rounded hover:bg-slate-800 disabled:opacity-50"
        >
          {cargando ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </main>
  );
}
