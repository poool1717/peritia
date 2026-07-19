-- Bucket "anexos" en Supabase Storage: sustituye el almacenamiento de
-- archivos como data URIs base64 dentro de public.informes.anexos (JSONB)
-- por objetos en Storage, guardando en el JSONB solo la URL pública.
--
-- Ruta de cada objeto: {user_id}/{informe_id}/{tab}/{timestamp}-{nombre_sanitizado}
-- El primer segmento de la ruta (carpeta) debe coincidir con auth.uid()
-- para que las políticas de INSERT/DELETE puedan restringir por propietario.

insert into storage.buckets (id, name, public)
values ('anexos', 'anexos', true)
on conflict (id) do nothing;

-- INSERT: solo usuarios autenticados, y solo dentro de su propia carpeta
-- (primer segmento de la ruta = su auth.uid()).
create policy "anexos_insert_own_folder"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'anexos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- SELECT: lectura pública (necesaria para que los exports a PDF y Word
-- puedan cargar las imágenes sin sesión).
create policy "anexos_select_public"
on storage.objects for select
to public
using (bucket_id = 'anexos');

-- DELETE: solo el propietario de la ruta puede borrar sus propios objetos.
create policy "anexos_delete_own_folder"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'anexos'
  and (storage.foldername(name))[1] = auth.uid()::text
);
