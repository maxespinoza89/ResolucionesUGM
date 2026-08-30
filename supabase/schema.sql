-- =========================================================
-- Esquema: App de Resoluciones FNT
-- =========================================================

-- ---------- Roles ----------
create type public.rol_usuario as enum (
  'super_admin',
  'admin',
  'emisor',
  'solo_lectura'
);

-- ---------- Perfiles de usuario (extiende auth.users de Supabase) ----------
create table public.perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre_completo text not null,
  rol public.rol_usuario not null,
  creado_por uuid references public.perfiles(id),
  creado_en timestamptz not null default now()
);

-- ---------- Facultades ----------
create table public.facultades (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,                          -- "Facultad de Negocios y Tecnologías"
  titular_nombre text not null,
  titular_cargo text not null,                   -- "Decana"
  interino_activo boolean not null default false,
  interino_nombre text,
  interino_cargo text,
  logo_url text
);

-- ---------- Escuelas ----------
create table public.escuelas (
  id uuid primary key default gen_random_uuid(),
  facultad_id uuid not null references public.facultades(id) on delete cascade,
  nombre text not null,                          -- "Escuela de Negocios"
  titular_nombre text,                           -- puede ser null si está vacante
  titular_cargo text not null default 'Director/a de Escuela',
  interino_activo boolean not null default false,
  interino_nombre text,
  interino_cargo text
);

-- ---------- Carreras ----------
create table public.carreras (
  id uuid primary key default gen_random_uuid(),
  escuela_id uuid not null references public.escuelas(id) on delete cascade,
  nombre text not null,                          -- "Ingeniería Civil Informática"
  nivel text not null,                           -- "Pregrado Regular" | "Pregrado Advance"
  modalidad text not null                        -- "Presencial" | "Digital" | "Híbrida"
);

-- ---------- Firmantes fijos (ej. Secretaría General) ----------
create table public.firmantes_fijos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  cargo text not null,
  iniciales text not null                        -- "AEB"
);

-- ---------- Asignación de carreras a Emisores / Solo lectura ----------
create table public.asignaciones_carrera (
  perfil_id uuid not null references public.perfiles(id) on delete cascade,
  carrera_id uuid not null references public.carreras(id) on delete cascade,
  primary key (perfil_id, carrera_id)
);

-- ---------- Tipos de resolución (configuración, no código) ----------
create table public.tipos_resolucion (
  id uuid primary key default gen_random_uuid(),
  clave text not null unique,                    -- "reincorporacion"
  nombre text not null,                          -- "Reincorporación"
  titulo_encabezado text not null,               -- "RESUELVE REINCORPORACIÓN QUE SE INDICA"
  -- Definición de campos del formulario, en JSON:
  -- [{ "clave": "estudiante", "etiqueta": "Nombre del estudiante", "tipo": "texto" }, ...]
  campos jsonb not null,
  -- Plantilla de VISTOS Y CONSIDERANDO y RESUELVO con variables {{campo}}
  plantilla_vistos jsonb not null,               -- array de strings (cada uno, un numeral)
  plantilla_articulos jsonb not null,             -- array de strings (cada uno, un artículo)
  activo boolean not null default true
);

-- ---------- Resoluciones emitidas ----------
create table public.resoluciones (
  id uuid primary key default gen_random_uuid(),
  tipo_id uuid not null references public.tipos_resolucion(id),
  numero int not null,
  anio int not null,
  carrera_id uuid references public.carreras(id),
  datos jsonb not null,                          -- respuestas del formulario
  generado_por uuid not null references public.perfiles(id),
  generado_en timestamptz not null default now(),
  pdf_url text,
  unique (numero, anio)
);

-- ---------- Función: siguiente número correlativo por año ----------
create or replace function public.siguiente_numero_resolucion(anio_param int)
returns int
language sql
as $$
  select coalesce(max(numero), 0) + 1
  from public.resoluciones
  where anio = anio_param;
$$;

-- ---------- Row Level Security ----------
alter table public.perfiles enable row level security;
alter table public.facultades enable row level security;
alter table public.escuelas enable row level security;
alter table public.carreras enable row level security;
alter table public.firmantes_fijos enable row level security;
alter table public.asignaciones_carrera enable row level security;
alter table public.tipos_resolucion enable row level security;
alter table public.resoluciones enable row level security;

-- Nota: las políticas RLS detalladas (quién ve qué carrera, quién genera qué)
-- se definen en un paso siguiente, una vez validado el flujo básico end-to-end.
-- Mientras tanto, el acceso se controla desde el backend (rutas de servidor)
-- usando la service_role key, nunca expuesta al navegador.
