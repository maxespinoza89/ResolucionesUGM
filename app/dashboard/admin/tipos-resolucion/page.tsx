"use client";

import { useEffect, useState } from "react";

type CampoConfig = {
  clave: string;
  etiqueta: string;
  tipo: "texto" | "seleccion" | "carrera";
  opciones?: string[];
};

type TipoResolucion = {
  id: string;
  clave: string;
  nombre: string;
  titulo_encabezado: string;
  campos: CampoConfig[];
  plantilla_vistos: string[];
  plantilla_articulos: string[];
  activo: boolean;
};

function textoALista(texto: string): string[] {
  return texto
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

export default function PaginaTiposResolucion() {
  const [tipos, setTipos] = useState<TipoResolucion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState<TipoResolucion | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [clave, setClave] = useState("");
  const [nombre, setNombre] = useState("");
  const [tituloEncabezado, setTituloEncabezado] = useState("");
  const [camposTexto, setCamposTexto] = useState(
    '[\n  { "clave": "estudiante", "etiqueta": "Nombre del estudiante", "tipo": "texto" }\n]'
  );
  const [vistosTexto, setVistosTexto] = useState("");
  const [articulosTexto, setArticulosTexto] = useState("");

  async function cargarTipos() {
    setCargando(true);
    const resp = await fetch("/api/admin/tipos-resolucion");
    const data = await resp.json();
    setTipos(data.tipos ?? []);
    setCargando(false);
  }

  useEffect(() => {
    cargarTipos();
  }, []);

  function empezarEdicion(tipo: TipoResolucion) {
    setEditando(tipo);
    setClave(tipo.clave);
    setNombre(tipo.nombre);
    setTituloEncabezado(tipo.titulo_encabezado);
    setCamposTexto(JSON.stringify(tipo.campos, null, 2));
    setVistosTexto(tipo.plantilla_vistos.join("\n"));
    setArticulosTexto(tipo.plantilla_articulos.join("\n"));
  }

  function limpiarFormulario() {
    setEditando(null);
    setClave("");
    setNombre("");
    setTituloEncabezado("");
    setCamposTexto('[\n  { "clave": "estudiante", "etiqueta": "Nombre del estudiante", "tipo": "texto" }\n]');
    setVistosTexto("");
    setArticulosTexto("");
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    let campos;
    try {
      campos = JSON.parse(camposTexto);
    } catch {
      setError('El campo "Campos del formulario" no es un JSON válido. Revisa comas y llaves.');
      return;
    }

    const cuerpo = {
      clave,
      nombre,
      titulo_encabezado: tituloEncabezado,
      campos,
      plantilla_vistos: textoALista(vistosTexto),
      plantilla_articulos: textoALista(articulosTexto),
      activo: true,
    };

    const url = editando
      ? `/api/admin/tipos-resolucion/${editando.id}`
      : "/api/admin/tipos-resolucion";
    const metodo = editando ? "PATCH" : "POST";

    const resp = await fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cuerpo),
    });

    const data = await resp.json();
    if (!resp.ok) {
      setError(data.error ?? "No se pudo guardar.");
      return;
    }

    limpiarFormulario();
    cargarTipos();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-xl font-semibold text-slate-900 mb-6">
          Tipos de resolución
        </h1>

        <form
          onSubmit={guardar}
          className="bg-white border border-slate-200 rounded-lg p-6 grid gap-4 mb-8"
        >
          <h2 className="font-semibold text-slate-800 text-sm">
            {editando ? `Editando: ${editando.nombre}` : "Crear tipo de resolución"}
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Clave interna (sin espacios, ej: homologacion)
              </label>
              <input
                required
                disabled={!!editando}
                value={clave}
                onChange={(e) => setClave(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm disabled:bg-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Nombre visible
              </label>
              <input
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Título fijo del encabezado (ej: RESUELVE HOMOLOGACIÓN QUE SE INDICA)
            </label>
            <input
              required
              value={tituloEncabezado}
              onChange={(e) => setTituloEncabezado(e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Campos del formulario (formato JSON — mismo estilo que Reincorporación)
            </label>
            <textarea
              required
              rows={5}
              value={camposTexto}
              onChange={(e) => setCamposTexto(e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-mono"
            />
            <p className="text-xs text-slate-400 mt-1">
              Tipos disponibles: "texto", "seleccion" (con "opciones": [...]), "carrera".
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              VISTOS Y CONSIDERANDO — un punto por línea
            </label>
            <textarea
              required
              rows={4}
              value={vistosTexto}
              onChange={(e) => setVistosTexto(e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
              placeholder="Que la solicitud presentada por {{estudiante}}..."
            />
            <p className="text-xs text-slate-400 mt-1">
              Usa {"{{clave_del_campo}}"} para insertar las respuestas del formulario.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              RESUELVO — un artículo por línea
            </label>
            <textarea
              required
              rows={4}
              value={articulosTexto}
              onChange={(e) => setArticulosTexto(e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
              placeholder="Autorícese la reincorporación de {{estudiante}}..."
            />
            <p className="text-xs text-slate-400 mt-1">
              Si dejas solo un artículo, el documento dirá "Artículo Único" automáticamente.
            </p>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-slate-900 text-white text-sm font-semibold py-2 px-4 rounded hover:bg-slate-800"
            >
              {editando ? "Guardar cambios" : "Crear tipo de resolución"}
            </button>
            {editando && (
              <button
                type="button"
                onClick={limpiarFormulario}
                className="text-sm text-slate-500 hover:underline"
              >
                Cancelar edición
              </button>
            )}
          </div>
        </form>

        <h2 className="font-semibold text-slate-800 text-sm mb-3">
          Tipos existentes
