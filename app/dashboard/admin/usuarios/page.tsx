"use client";

import { useEffect, useState } from "react";

type Carrera = { id: string; nombre: string; nivel: string };
type Usuario = {
  id: string;
  correo: string;
  nombre_completo: string;
  rol: string;
  asignaciones_carrera: { carrera_id: string; carreras: { nombre: string } }[];
};

const ROLES = [
  { valor: "super_admin", etiqueta: "Super Administrador" },
  { valor: "admin", etiqueta: "Administrador" },
  { valor: "emisor", etiqueta: "Emisor de resoluciones" },
  { valor: "solo_lectura", etiqueta: "Solo lectura" },
];

export default function PaginaUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [correo, setCorreo] = useState("");
  const [nombre, setNombre] = useState("");
  const [rol, setRol] = useState("emisor");
  const [carreraIds, setCarreraIds] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);

  async function cargarTodo() {
    setCargando(true);
    const [respUsuarios, respCarreras] = await Promise.all([
      fetch("/api/admin/usuarios"),
      fetch("/api/carreras"),
    ]);
    const dataUsuarios = await respUsuarios.json();
    const dataCarreras = await respCarreras.json();
    setUsuarios(dataUsuarios.usuarios ?? []);
    setCarreras(dataCarreras.carreras ?? []);
    setCargando(false);
  }

  useEffect(() => {
    cargarTodo();
  }, []);

  function alternarCarrera(id: string) {
    setCarreraIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  async function crearUsuario(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError(null);

    const resp = await fetch("/api/admin/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        correo,
        nombre_completo: nombre,
        rol,
        carrera_ids: carreraIds,
      }),
    });

    const data = await resp.json();
    setEnviando(false);

    if (!resp.ok) {
      setError(data.error ?? "No se pudo crear el usuario.");
      return;
    }

    setCorreo("");
    setNombre("");
    setRol("emisor");
    setCarreraIds([]);
    cargarTodo();
  }

  async function cambiarRol(id: string, nuevoRol: string) {
    await fetch(`/api/admin/usuarios/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rol: nuevoRol }),
    });
    cargarTodo();
  }

  async function eliminarUsuario(id: string) {
    if (!confirm("¿Eliminar este usuario? Esta acción no se puede deshacer.")) return;
    await fetch(`/api/admin/usuarios/${id}`, { method: "DELETE" });
    cargarTodo();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-xl font-semibold text-slate-900 mb-6">Usuarios</h1>

        <form
          onSubmit={crearUsuario}
          className="bg-white border border-slate-200 rounded-lg p-6 grid gap-4 mb-8"
        >
          <h2 className="font-semibold text-slate-800 text-sm">Crear usuario</h2>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Correo
            </label>
            <input
              type="email"
              required
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Nombre completo
            </label>
            <input
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Rol
            </label>
            <select
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white"
            >
              {ROLES.map((r) => (
                <option key={r.valor} value={r.valor}>
                  {r.etiqueta}
                </option>
              ))}
            </select>
          </div>

          {(rol === "emisor" || rol === "solo_lectura") && (
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Carreras asignadas
              </label>
              <div className="grid gap-1 max-h-40 overflow-y-auto border border-slate-200 rounded p-2">
                {carreras.map((c) => (
                  <label key={c.id} className="text-sm flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={carreraIds.includes(c.id)}
                      onChange={() => alternarCarrera(c.id)}
                    />
                    {c.nombre} — {c.nivel}
                  </label>
                ))}
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={enviando}
            className="bg-slate-900 text-white text-sm font-semibold py-2 rounded hover:bg-slate-800 disabled:opacity-50"
          >
            {enviando ? "Creando..." : "Crear usuario"}
          </button>
        </form>

        <h2 className="font-semibold text-slate-800 text-sm mb-3">
          Usuarios existentes
        </h2>

        {cargando ? (
          <p className="text-sm text-slate-500">Cargando...</p>
        ) : (
          <div className="grid gap-2">
            {usuarios.map((u) => (
              <div
                key={u.id}
                className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="font-semibold text-slate-900 text-sm">
                    {u.nombre_completo}
                  </p>
                  <p className="text-xs text-slate-500">{u.correo}</p>
                  {u.asignaciones_carrera?.length > 0 && (
                    <p className="text-xs text-slate-400 mt-1">
                      {u.asignaciones_carrera.map((a) => a.carreras.nombre).join(", ")}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={u.rol}
                    onChange={(e) => cambiarRol(u.id, e.target.value)}
                    className="border border-slate-300 rounded px-2 py-1 text-xs bg-white"
                  >
                    {ROLES.map((r) => (
                      <option key={r.valor} value={r.valor}>
                        {r.etiqueta}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => eliminarUsuario(u.id)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
