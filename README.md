# Resoluciones FNT

App para generar resoluciones institucionales de la Facultad de Negocios y
Tecnologías (FNT, UGM) en PDF, a partir de formularios configurables por
tipo de resolución.

## Estado de este primer avance

Ya funciona de punta a punta:
- Login con correo/clave y recuperación de contraseña (Supabase Auth).
- Selector de tipo de resolución → formulario dinámico → PDF generado y
  descargado, con numeración correlativa automática.
- Tipo de resolución **"Reincorporación"** ya configurado como ejemplo.
- Estructura organizacional de la FNT (Facultad, 2 Escuelas, 14 carreras,
  Secretaría General) lista para cargar como datos piloto.

Pendiente para siguientes pasos (fuera del alcance de este primer avance):
- Panel de administración visual (roles, estructura organizacional, tipos
  de resolución) — hoy se administra editando directamente en Supabase.
- Políticas de seguridad (RLS) detalladas por rol/carrera en la base de
  datos — hoy el control de permisos vive en el backend (ruta de API).
- Logo institucional embebido en el PDF (hoy hay un espacio reservado).
- Ajuste fino de paginación para resoluciones muy largas.
- Historial de resoluciones (vista y filtros) — quedó pendiente de definir
  a propósito, según lo conversado.

---

## 1. Configurar Supabase

1. Entra a tu proyecto en supabase.com.
2. Ve a **SQL Editor** → pega y ejecuta el contenido de `supabase/schema.sql`.
3. Luego pega y ejecuta el contenido de `supabase/seed.sql` (carga los datos
   piloto de la FNT).
4. Ve a **Authentication → Providers** y confirma que "Email" esté activado.
5. Ve a **Project Settings → API** y copia:
   - Project URL
   - anon public key
   - service_role key (no compartir, no exponer en el navegador)

## 2. Crear el primer Super Administrador

Como el sistema todavía no tiene panel de administración, el primer usuario
se crea manualmente:

1. En Supabase, ve a **Authentication → Users → Add user** y crea tu usuario
   (correo + clave).
2. En **SQL Editor**, ejecuta (reemplazando el UUID por el del usuario creado,
   visible en la lista de usuarios):

```sql
insert into public.perfiles (id, nombre_completo, rol)
values ('UUID-DEL-USUARIO', 'Tu Nombre Completo', 'super_admin');
```

## 3. Variables de entorno

Copia `.env.example` a `.env.local` y completa con los valores de Supabase
del paso 1:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## 4. Probar en local (opcional)

```bash
npm install
npm run dev
```

Abre http://localhost:3000 — te redirige a /login.

## 5. Subir a GitHub

```bash
git init
git add .
git commit -m "Primer avance: login, generacion de PDF, tipo Reincorporacion"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/resoluciones-fnt.git
git push -u origin main
```

## 6. Desplegar en Vercel

1. En vercel.com, **Add New → Project** → importa el repositorio recién subido.
2. En **Environment Variables**, agrega las tres variables del paso 3.
3. Despliega. Cada vez que hagas `git push`, Vercel actualiza la app
   automáticamente.
