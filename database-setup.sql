-- Copia y pega esto en el SQL Editor de tu proyecto Supabase para inicializar las tablas

-- 1. Crear tabla de Equipos
CREATE TABLE teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  ambassador TEXT NOT NULL,
  headquarters TEXT NOT NULL,
  area TEXT NOT NULL,
  logo_url TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear tabla de Participantes
CREATE TABLE participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  area TEXT,
  headquarters TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Crear tabla de Participaciones (para guardar los puntos)
CREATE TABLE participations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id TEXT NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  quantity INTEGER,
  points INTEGER NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Habilitar RLS (Row Level Security) para proteger los datos
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE participations ENABLE ROW LEVEL SECURITY;

-- 5. Crear Políticas de Acceso:
-- LECTURA PÚBLICA: Cualquiera puede ver el Ranking (Tablero)
CREATE POLICY "Lectura pública para todos en teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Lectura pública para todos en participants" ON participants FOR SELECT USING (true);
CREATE POLICY "Lectura pública para todos en participations" ON participations FOR SELECT USING (true);

-- ESCRITURA/MODIFICACIÓN: Solo personal de RRHH autenticado puede editar
CREATE POLICY "Escritura autenticada teams" ON teams FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Modificacion autenticada teams" ON teams FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Borrado autenticado teams" ON teams FOR DELETE TO authenticated USING (true);

CREATE POLICY "Escritura autenticada participants" ON participants FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Borrado autenticado participants" ON participants FOR DELETE TO authenticated USING (true);

CREATE POLICY "Escritura autenticada participations" ON participations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Modificacion autenticada participations" ON participations FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Borrado autenticado participations" ON participations FOR DELETE TO authenticated USING (true);