-- =========================================================
-- Datos piloto: Facultad de Negocios y Tecnologías (FNT)
-- =========================================================

-- ---------- Facultad ----------
insert into public.facultades (id, nombre, titular_nombre, titular_cargo)
values (
  '00000000-0000-0000-0000-000000000001',
  'Facultad de Negocios y Tecnologías',
  'Paula Rodríguez Ossandón',
  'Decana'
);

-- ---------- Escuelas ----------
insert into public.escuelas (id, facultad_id, nombre, titular_nombre, titular_cargo)
values (
  '00000000-0000-0000-0000-000000000011',
  '00000000-0000-0000-0000-000000000001',
  'Escuela de Negocios',
  'Tatiana Gomes Ramires',
  'Directora de Escuela'
);

insert into public.escuelas (id, facultad_id, nombre, titular_nombre, titular_cargo, interino_activo, interino_nombre, interino_cargo)
values (
  '00000000-0000-0000-0000-000000000012',
  '00000000-0000-0000-0000-000000000001',
  'Escuela de Ingenierías y Tecnologías',
  null,
  'Directora de Escuela',
  true,
  'Paula Rodríguez Ossandón',
  'Decana (interina)'
);

-- ---------- Carreras: Escuela de Negocios ----------
insert into public.carreras (escuela_id, nombre, nivel, modalidad) values
('00000000-0000-0000-0000-000000000011', 'Ingeniería Comercial', 'Pregrado Regular', 'Presencial'),
('00000000-0000-0000-0000-000000000011', 'Ingeniería Comercial', 'Pregrado Advance', 'Digital'),
('00000000-0000-0000-0000-000000000011', 'Ingeniería en Administración de Empresas', 'Pregrado Advance', 'Digital'),
('00000000-0000-0000-0000-000000000011', 'Ingeniería en Negocios Digitales', 'Pregrado Advance', 'Digital'),
('00000000-0000-0000-0000-000000000011', 'Ingeniería en Control de Gestión', 'Pregrado Advance', 'Digital'),
('00000000-0000-0000-0000-000000000011', 'Contador Público Auditor', 'Pregrado Advance', 'Digital'),
('00000000-0000-0000-0000-000000000011', 'Administración y Gestión Pública', 'Pregrado Advance', 'Digital');

-- ---------- Carreras: Escuela de Ingenierías y Tecnologías ----------
insert into public.carreras (escuela_id, nombre, nivel, modalidad) values
('00000000-0000-0000-0000-000000000012', 'Ingeniería Civil Industrial', 'Pregrado Regular', 'Presencial'),
('00000000-0000-0000-0000-000000000012', 'Ingeniería Civil Informática', 'Pregrado Regular', 'Presencial'),
('00000000-0000-0000-0000-000000000012', 'Ingeniería Civil Industrial', 'Pregrado Advance', 'Digital'),
('00000000-0000-0000-0000-000000000012', 'Ingeniería Industrial', 'Pregrado Advance', 'Digital'),
('00000000-0000-0000-0000-000000000012', 'Ingeniería Civil Informática', 'Pregrado Advance', 'Digital'),
('00000000-0000-0000-0000-000000000012', 'Ingeniería en Computación e Informática', 'Pregrado Advance', 'Digital'),
('00000000-0000-0000-0000-000000000012', 'Ingeniería en Ciberseguridad', 'Pregrado Advance', 'Digital');

-- ---------- Firmante fijo: Secretaría General ----------
insert into public.firmantes_fijos (nombre, cargo, iniciales)
values ('Antonio Ecclefield Barbera', 'Secretario General', 'AEB');

-- ---------- Tipo de resolución: Reincorporación ----------
insert into public.tipos_resolucion (clave, nombre, titulo_encabezado, campos, plantilla_vistos, plantilla_articulos)
values (
  'reincorporacion',
  'Reincorporación',
  'RESUELVE REINCORPORACIÓN QUE SE INDICA',
  '[
    { "clave": "estudiante", "etiqueta": "Nombre del/la estudiante", "tipo": "texto" },
    { "clave": "rut", "etiqueta": "RUT del/la estudiante", "tipo": "texto" },
    { "clave": "carrera_id", "etiqueta": "Carrera", "tipo": "carrera" },
    { "clave": "estado_estudiante", "etiqueta": "Estado actual del/la estudiante", "tipo": "seleccion",
      "opciones": ["Eliminación por abandono", "Eliminación por deserción", "Eliminación por retiro", "Eliminación académica", "Suspensión", "Renuncia"] }
  ]'::jsonb,
  '[
    "Que la solicitud de reincorporación fuera de plazo presentada por el director de carrera de {{carrera_nombre}}, {{carrera_nivel}} para el/la estudiante {{estudiante}}, RUT {{rut}}, quien se encuentra en estado de {{estado_estudiante}}.",
    "Que se cuenta con el informe fundado y la opinión favorable de la Dirección de Escuela.",
    "Que la facultad que el artículo 35 del Reglamento del Estudiante de Pregrado entrega a la Decanatura de la Facultad, para autorizar la reincorporación de estudiantes en el citado estado."
  ]'::jsonb,
  '[
    "Autorícese la reincorporación del/la estudiante {{estudiante}}, RUT {{rut}}, a la carrera {{carrera_nombre}}, {{carrera_nivel}}, modalidad {{carrera_modalidad}}, plan vigente.",
    "La adscripción se realizará al plan de estudios y arancel vigente para nuevos estudiantes. En caso de aplicar, se realizarán las homologaciones que correspondan conforme al Reglamento sobre Homologación, Convalidación y Reconocimiento de Trayectorias Formativas."
  ]'::jsonb
);
