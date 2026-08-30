"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type CampoConfig = {
  clave: string;
  etiqueta: string;
  tipo: "texto" | "seleccion" | "carrera";
  opciones?: string[];
};

type Carrera = {
  id: string;
  nombre: string;
  nivel: string;
  modalidad: string;
};

export default function FormularioResolucion({
  tipoId,
  tipoClave,
  campos,
  carreras,
}: {
  tipoId: string;
  tipoClave: string;
  campos: CampoConfig[];
  carreras: Carrera[];
}) {
  const router = useRouter();
  const [valores, setValores] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function actualizar(clave: string, valor: string) {
    setValores((prev) => ({ ...prev, [clave]: valor }));
  }

  async function manejarSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError(null);

    const respuesta = await fetch("/api/generar-resolucion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipoId, tipoClave, datos: valores }),
    });

    if (!respuesta.ok) {
      setError("No se pudo generar la resolución. Intenta nuevamente.");
      setEnviando(false);
      return;
    }

    const blob = await respuesta.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resolucion-${tipoClave}.pdf`;
    a.click();

    setEnviando(false);
    router.push("/dashboard");
  }

  return (
    <form
      onSubmit={manejarSubmit}
      className="bg-white border border-slate-200 rounded-lg p-6 grid gap-4"
    >
      {campos.map((campo) => (
        <div key={campo.clave}>
          <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
            {campo.etiqueta}
          </label>

          {campo.tipo === "texto" && (
            <input
              required
              value={valores[campo.clave] ?? ""}
              onChange={(e) => actualizar(campo.clave, e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
            />
          )}

          {campo.tipo === "seleccion" && (
            <select
              required
              value={valores[campo.clave] ?? ""}
              onChange={(e) => actualizar(campo.clave, e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white"
            >
              <option value="">Selecciona una opción</option>
              {campo.opciones?.map((op) => (
                <option key={op} value={op}>
                  {op}
                </option>
              ))}
            </select>
          )}

          {campo.tipo === "carrera" && (
            <select
              required
              value={valores[campo.clave] ?? ""}
              onChange={(e) => actualizar(campo.clave, e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white"
            >
              <option value="">Selecciona una carrera</option>
              {carreras.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} — {c.nivel} ({c.modalidad})
                </option>
              ))}
            </select>
          )}
        </div>
      ))}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={enviando}
        className="bg-slate-900 text-white text-sm font-semibold py-2 rounded hover:bg-slate-800 disabled:opacity-50"
      >
        {enviando ? "Generando..." : "Generar resolución"}
      </button>
    </form>
  );
}
