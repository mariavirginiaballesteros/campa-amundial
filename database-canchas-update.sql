-- Copia y pega esto en el SQL Editor de tu proyecto Supabase para actualizar la BD

-- 1. Vaciar participaciones antiguas para evitar errores de tipo de dato
TRUNCATE TABLE participations;

-- 2. Crear tabla de Canchas
CREATE TABLE pitches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Crear tabla de Actividades
CREATE TABLE activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pitch_id UUID REFERENCES pitches(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  points INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Actualizar la tabla de participaciones para usar UUID en activity_id
ALTER TABLE participations ALTER COLUMN activity_id TYPE UUID USING activity_id::uuid;
ALTER TABLE participations ADD CONSTRAINT participations_activity_id_fkey FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE;

-- 5. Habilitar RLS
ALTER TABLE pitches ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- 6. Políticas de acceso (Lectura pública, Escritura RRHH)
CREATE POLICY "Lectura publica pitches" ON pitches FOR SELECT USING (true);
CREATE POLICY "Lectura publica activities" ON activities FOR SELECT USING (true);

CREATE POLICY "CRUD pitches auth" ON pitches FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "CRUD activities auth" ON activities FOR ALL TO authenticated USING (true) WITH CHECK (true);