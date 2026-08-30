"use client";

import { useState } from "react";
import { crearClienteNavegador } from "@/lib/supabase/client";

export default function PaginaRecuperarClave() {
  const supabase = crearClienteNavegador();
  const [correo, setCorreo] = useState("");
  const [enviado, setEnviado] = useState(false);

  async function manejarSubmit(e: React.FormEvent) {
    e.preventDefault();
    await supabase.auth.resetPasswordForEmail(correo, {
      redirectTo: `${window.location.origin}/login/restablecer`,
    });
    setEnviado(true);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm bg-white p-8 rounded-lg shadow border border-slate-200">
        <h1 className="text-lg font-semibold text-slate-900 mb-1">
          Recuperar clave
        </h1>

        {enviado ? (
          <p className="text-sm text-slate-600 mt-4">
            Si el correo existe en el sistema, te llegará un link para
            restablecer tu clave.
          </p>
        ) : (
          <form onSubmit={manejarSubmit}>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1 mt-4">
              Correo
            </label>
            <input
              type="email"
              required
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2 mb-4 text-sm"
            />
            <button
              type="submit"
              className="w-full bg-slate-900 text-white text-sm font-semibold py-2 rounded hover:bg-slate-800"
            >
              Enviar link de recuperación
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
