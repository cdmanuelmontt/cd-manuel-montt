-- Insert sample teams for all series
INSERT INTO public.teams (name, series) VALUES
('Real Madrid CF', 'Adultos A'),
('FC Barcelona', 'Adultos A'),
('Atlético Madrid', 'Adultos A'),
('Sevilla FC', 'Adultos A'),
('Valencia CF', 'Adultos A'),
('Real Sociedad', 'Adultos A'),

('Athletic Bilbao', 'Adultos B'),
('Real Betis', 'Adultos B'),
('Villarreal CF', 'Adultos B'),
('Celta de Vigo', 'Adultos B'),
('Espanyol', 'Adultos B'),
('Getafe CF', 'Adultos B'),

('Deportivo La Coruña', 'Senior'),
('Racing Santander', 'Senior'),
('Real Oviedo', 'Senior'),
('Sporting Gijón', 'Senior'),
('CD Tenerife', 'Senior'),
('UD Las Palmas', 'Senior'),

('CD Mirandés', 'Super Senior'),
('Ponferradina', 'Super Senior'),
('Real Zaragoza', 'Super Senior'),
('CD Lugo', 'Super Senior'),
('Albacete Balompié', 'Super Senior'),
('FC Cartagena', 'Super Senior')

ON CONFLICT (id) DO NOTHING;

-- Insert sample matches
WITH team_ids AS (
  SELECT id, name, series FROM public.teams
)
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, series, status, home_score, away_score) 
SELECT 
  h.id as home_team_id,
  a.id as away_team_id,
  '2025-01-15 16:00:00+00'::timestamptz,
  'Estadio Municipal',
  'Adultos A',
  'completed',
  2,
  1
FROM team_ids h, team_ids a 
WHERE h.name = 'Real Madrid CF' AND a.name = 'FC Barcelona' AND h.series = 'Adultos A'

UNION ALL

SELECT 
  h.id as home_team_id,
  a.id as away_team_id,
  '2025-01-22 18:00:00+00'::timestamptz,
  'Campo de Fútbol Norte',
  'Adultos A',
  'completed',
  1,
  3
FROM team_ids h, team_ids a 
WHERE h.name = 'Atlético Madrid' AND a.name = 'Sevilla FC' AND h.series = 'Adultos A'

UNION ALL

SELECT 
  h.id as home_team_id,
  a.id as away_team_id,
  '2025-02-05 17:00:00+00'::timestamptz,
  'Polideportivo Central',
  'Adultos A',
  'scheduled',
  NULL,
  NULL
FROM team_ids h, team_ids a 
WHERE h.name = 'Valencia CF' AND a.name = 'Real Sociedad' AND h.series = 'Adultos A'

UNION ALL

SELECT 
  h.id as home_team_id,
  a.id as away_team_id,
  '2025-01-18 15:30:00+00'::timestamptz,
  'Campo Municipal Sur',
  'Adultos B',
  'completed',
  0,
  2
FROM team_ids h, team_ids a 
WHERE h.name = 'Athletic Bilbao' AND a.name = 'Real Betis' AND h.series = 'Adultos B'

UNION ALL

SELECT 
  h.id as home_team_id,
  a.id as away_team_id,
  '2025-02-08 16:30:00+00'::timestamptz,
  'Estadio Municipal',
  'Adultos B',
  'scheduled',
  NULL,
  NULL
FROM team_ids h, team_ids a 
WHERE h.name = 'Villarreal CF' AND a.name = 'Celta de Vigo' AND h.series = 'Adultos B'

UNION ALL

SELECT 
  h.id as home_team_id,
  a.id as away_team_id,
  '2025-01-20 14:00:00+00'::timestamptz,
  'Campo Veteranos',
  'Senior',
  'completed',
  1,
  1
FROM team_ids h, team_ids a 
WHERE h.name = 'Deportivo La Coruña' AND a.name = 'Racing Santander' AND h.series = 'Senior'

UNION ALL

SELECT 
  h.id as home_team_id,
  a.id as away_team_id,
  '2025-02-12 15:00:00+00'::timestamptz,
  'Polideportivo Este',
  'Senior',
  'scheduled',
  NULL,
  NULL
FROM team_ids h, team_ids a 
WHERE h.name = 'Real Oviedo' AND a.name = 'Sporting Gijón' AND h.series = 'Senior'

UNION ALL

SELECT 
  h.id as home_team_id,
  a.id as away_team_id,
  '2025-01-25 13:00:00+00'::timestamptz,
  'Campo Veteranos Plus',
  'Super Senior',
  'completed',
  3,
  0
FROM team_ids h, team_ids a 
WHERE h.name = 'CD Mirandés' AND a.name = 'Ponferradina' AND h.series = 'Super Senior'

UNION ALL

SELECT 
  h.id as home_team_id,
  a.id as away_team_id,
  '2025-02-15 12:00:00+00'::timestamptz,
  'Estadio Municipal',
  'Super Senior',
  'scheduled',
  NULL,
  NULL
FROM team_ids h, team_ids a 
WHERE h.name = 'Real Zaragoza' AND a.name = 'CD Lugo' AND h.series = 'Super Senior';

-- Insert sample standings
WITH team_ids AS (
  SELECT id, name, series FROM public.teams
)
INSERT INTO public.standings (team_id, series, position, matches_played, wins, draws, losses, goals_for, goals_against, points)
SELECT 
  t.id,
  t.series,
  ROW_NUMBER() OVER (PARTITION BY t.series ORDER BY 
    CASE 
      WHEN t.name = 'Real Madrid CF' THEN 1
      WHEN t.name = 'FC Barcelona' THEN 2
      WHEN t.name = 'Atlético Madrid' THEN 3
      WHEN t.name = 'Sevilla FC' THEN 4
      WHEN t.name = 'Valencia CF' THEN 5
      WHEN t.name = 'Real Sociedad' THEN 6
      WHEN t.name = 'Real Betis' THEN 1
      WHEN t.name = 'Athletic Bilbao' THEN 2
      WHEN t.name = 'Villarreal CF' THEN 3
      WHEN t.name = 'Celta de Vigo' THEN 4
      WHEN t.name = 'Espanyol' THEN 5
      WHEN t.name = 'Getafe CF' THEN 6
      WHEN t.name = 'Racing Santander' THEN 1
      WHEN t.name = 'Deportivo La Coruña' THEN 2
      WHEN t.name = 'Real Oviedo' THEN 3
      WHEN t.name = 'Sporting Gijón' THEN 4
      WHEN t.name = 'CD Tenerife' THEN 5
      WHEN t.name = 'UD Las Palmas' THEN 6
      WHEN t.name = 'CD Mirandés' THEN 1
      WHEN t.name = 'Real Zaragoza' THEN 2
      WHEN t.name = 'Ponferradina' THEN 3
      WHEN t.name = 'CD Lugo' THEN 4
      WHEN t.name = 'Albacete Balompié' THEN 5
      WHEN t.name = 'FC Cartagena' THEN 6
    END
  ) as position,
  CASE 
    WHEN t.series = 'Adultos A' THEN
      CASE 
        WHEN t.name = 'Real Madrid CF' THEN 8
        WHEN t.name = 'FC Barcelona' THEN 7
        WHEN t.name = 'Atlético Madrid' THEN 8
        WHEN t.name = 'Sevilla FC' THEN 7
        WHEN t.name = 'Valencia CF' THEN 6
        ELSE 6
      END
    WHEN t.series = 'Adultos B' THEN
      CASE 
        WHEN t.name = 'Real Betis' THEN 7
        WHEN t.name = 'Athletic Bilbao' THEN 6
        WHEN t.name = 'Villarreal CF' THEN 7
        WHEN t.name = 'Celta de Vigo' THEN 6
        ELSE 5
      END
    WHEN t.series = 'Senior' THEN
      CASE 
        WHEN t.name = 'Racing Santander' THEN 6
        WHEN t.name = 'Deportivo La Coruña' THEN 5
        ELSE 5
      END
    ELSE 4
  END as matches_played,
  CASE 
    WHEN t.series = 'Adultos A' THEN
      CASE 
        WHEN t.name = 'Real Madrid CF' THEN 6
        WHEN t.name = 'FC Barcelona' THEN 5
        WHEN t.name = 'Atlético Madrid' THEN 5
        WHEN t.name = 'Sevilla FC' THEN 4
        WHEN t.name = 'Valencia CF' THEN 3
        ELSE 2
      END
    WHEN t.series = 'Adultos B' THEN
      CASE 
        WHEN t.name = 'Real Betis' THEN 5
        WHEN t.name = 'Athletic Bilbao' THEN 4
        WHEN t.name = 'Villarreal CF' THEN 4
        WHEN t.name = 'Celta de Vigo' THEN 3
        ELSE 2
      END
    WHEN t.series = 'Senior' THEN
      CASE 
        WHEN t.name = 'Racing Santander' THEN 4
        WHEN t.name = 'Deportivo La Coruña' THEN 3
        ELSE 2
      END
    ELSE 2
  END as wins,
  CASE 
    WHEN t.series = 'Adultos A' THEN
      CASE 
        WHEN t.name IN ('Real Madrid CF', 'FC Barcelona') THEN 2
        WHEN t.name IN ('Atlético Madrid', 'Sevilla FC') THEN 1
        ELSE 1
      END
    ELSE 1
  END as draws,
  CASE 
    WHEN t.series = 'Adultos A' THEN
      CASE 
        WHEN t.name = 'Real Madrid CF' THEN 0
        WHEN t.name = 'FC Barcelona' THEN 0
        WHEN t.name = 'Atlético Madrid' THEN 2
        WHEN t.name = 'Sevilla FC' THEN 2
        WHEN t.name = 'Valencia CF' THEN 2
        ELSE 3
      END
    WHEN t.series = 'Adultos B' THEN
      CASE 
        WHEN t.name = 'Real Betis' THEN 1
        WHEN t.name = 'Athletic Bilbao' THEN 2
        ELSE 2
      END
    ELSE 1
  END as losses,
  CASE 
    WHEN t.series = 'Adultos A' THEN
      CASE 
        WHEN t.name = 'Real Madrid CF' THEN 18
        WHEN t.name = 'FC Barcelona' THEN 15
        WHEN t.name = 'Atlético Madrid' THEN 12
        WHEN t.name = 'Sevilla FC' THEN 11
        WHEN t.name = 'Valencia CF' THEN 8
        ELSE 6
      END
    WHEN t.series = 'Adultos B' THEN
      CASE 
        WHEN t.name = 'Real Betis' THEN 14
        WHEN t.name = 'Athletic Bilbao' THEN 10
        ELSE 8
      END
    ELSE 6
  END as goals_for,
  CASE 
    WHEN t.series = 'Adultos A' THEN
      CASE 
        WHEN t.name = 'Real Madrid CF' THEN 4
        WHEN t.name = 'FC Barcelona' THEN 6
        WHEN t.name = 'Atlético Madrid' THEN 8
        WHEN t.name = 'Sevilla FC' THEN 9
        WHEN t.name = 'Valencia CF' THEN 12
        ELSE 15
      END
    WHEN t.series = 'Adultos B' THEN
      CASE 
        WHEN t.name = 'Real Betis' THEN 6
        WHEN t.name = 'Athletic Bilbao' THEN 8
        ELSE 10
      END
    ELSE 4
  END as goals_against,
  CASE 
    WHEN t.series = 'Adultos A' THEN
      CASE 
        WHEN t.name = 'Real Madrid CF' THEN 20
        WHEN t.name = 'FC Barcelona' THEN 17
        WHEN t.name = 'Atlético Madrid' THEN 16
        WHEN t.name = 'Sevilla FC' THEN 13
        WHEN t.name = 'Valencia CF' THEN 10
        ELSE 7
      END
    WHEN t.series = 'Adultos B' THEN
      CASE 
        WHEN t.name = 'Real Betis' THEN 16
        WHEN t.name = 'Athletic Bilbao' THEN 12
        WHEN t.name = 'Villarreal CF' THEN 13
        WHEN t.name = 'Celta de Vigo' THEN 10
        ELSE 7
      END
    WHEN t.series = 'Senior' THEN
      CASE 
        WHEN t.name = 'Racing Santander' THEN 13
        WHEN t.name = 'Deportivo La Coruña' THEN 10
        ELSE 7
      END
    ELSE 7
  END as points
FROM team_ids t
ON CONFLICT (id) DO NOTHING;

-- Insert sample suspended players
INSERT INTO public.suspended_players (name, series, reason, remaining_matches)
VALUES
('Carlos Martínez', 'Adultos A', 'Doble tarjeta amarilla', 1),
('Miguel Rodríguez', 'Adultos A', 'Conducta antideportiva', 2),
('José García', 'Adultos B', 'Tarjeta roja directa', 3),
('Antonio López', 'Adultos B', 'Acumulación de tarjetas', 1),
('Francisco Sánchez', 'Senior', 'Protesta al árbitro', 1),
('Manuel González', 'Senior', 'Agresión a rival', 4),
('Juan Pérez', 'Super Senior', 'Doble tarjeta amarilla', 1),
('David Fernández', 'Super Senior', 'Conducta antideportiva', 2)
ON CONFLICT (id) DO NOTHING;

-- Insert sample gallery items
INSERT INTO public.gallery (title, description, image_url, match_date, series)
VALUES
('Victoria frente al Barcelona', 'Gran partido disputado en el Estadio Municipal con una asistencia récord.', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop', '2025-01-15', 'Adultos A'),
('Entrenamiento intensivo', 'Sesión de preparación física en las instalaciones del club.', 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop', '2025-01-10', 'Adultos A'),
('Derbi local emocionante', 'Partido muy disputado que terminó en empate a dos goles.', 'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=800&h=600&fit=crop', '2025-01-18', 'Adultos B'),
('Celebración del gol', 'Momento de alegría tras el gol de la victoria en el minuto 90.', 'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=800&h=600&fit=crop', '2025-01-20', 'Senior'),
('Equipo veterano en acción', 'Los jugadores más experimentados demostrando su calidad.', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop', '2025-01-25', 'Super Senior'),
('Preparación táctica', 'El entrenador explicando la estrategia antes del partido.', 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800&h=600&fit=crop', '2025-01-12', 'Adultos A'),
('Ambiente en las gradas', 'Aficionados apoyando al equipo durante todo el encuentro.', 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&h=600&fit=crop', '2025-01-22', 'Adultos B'),
('Jugada de peligro', 'Acción cerca del área rival en busca del gol decisivo.', 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=800&h=600&fit=crop', '2025-01-16', 'Senior')
ON CONFLICT (id) DO NOTHING;

-- Insert sample club information
INSERT INTO public.club_info (section, title, content)
VALUES
('historia', 'Historia del Club', 'Fundado en 1985, nuestro club ha sido un pilar fundamental en el desarrollo del fútbol amateur de la región. Durante casi cuatro décadas, hemos formado jugadores y promovido los valores del deporte en todas nuestras categorías, desde los más jóvenes hasta nuestros veteranos más experimentados.'),
('historia', 'Primeros Años', 'Los primeros años del club estuvieron marcados por la pasión y el esfuerzo de un grupo de entusiastas del fútbol que vieron la necesidad de crear un espacio donde los aficionados pudieran practicar este deporte de manera organizada y competitiva.'),
('logros', 'Campeonatos Conseguidos', 'A lo largo de nuestra historia, hemos conquistado 12 campeonatos de liga regional, 8 copas locales y 3 torneos interprovinciales. Nuestro equipo de Adultos A ha sido especialmente exitoso, manteniéndose en las primeras posiciones durante las últimas cinco temporadas.'),
('logros', 'Reconocimientos', 'El club ha recibido múltiples reconocimientos por su labor formativa y su contribución al deporte amateur. En 2020 fuimos galardonados con el Premio a la Excelencia Deportiva por parte de la Federación Regional.'),
('filosofia', 'Misión', 'Promover la práctica del fútbol como herramienta de desarrollo personal y social, fomentando valores como el respeto, la solidaridad, el trabajo en equipo y la superación personal en todas nuestras categorías.'),
('filosofia', 'Visión', 'Ser reconocidos como el club de referencia en nuestra región, destacando por la calidad de nuestro fútbol, la formación integral de nuestros jugadores y nuestro compromiso con la comunidad.'),
('instalaciones', 'Campo Principal', 'Nuestro campo principal cuenta con césped natural de alta calidad, gradas con capacidad para 500 espectadores, vestuarios completamente equipados y sistema de iluminación para partidos nocturnos.'),
('instalaciones', 'Instalaciones Complementarias', 'Disponemos de dos campos de entrenamiento adicionales, gimnasio, sala de fisioterapia, oficinas administrativas y cafetería para socios y visitantes.'),
('categorias', 'Adultos A', 'Nuestro equipo más competitivo, compuesto por jugadores entre 18 y 35 años. Participa en la liga regional de primera división y representa la máxima expresión del fútbol del club.'),
('categorias', 'Adultos B', 'Equipo que combina jugadores experimentados con nuevos talentos. Compite en segunda división regional y sirve como escalón formativo hacia el primer equipo.'),
('categorias', 'Senior', 'Categoría para jugadores de 35 a 45 años que mantienen su pasión por el fútbol. Participan en la liga de veteranos con un enfoque más recreativo pero sin perder la competitividad.'),
('categorias', 'Super Senior', 'Nuestros jugadores más experimentados, mayores de 45 años, que demuestran que la edad no es impedimento para disfrutar del fútbol. Su sabiduría y experiencia son un ejemplo para las generaciones más jóvenes.')
ON CONFLICT (section, title) DO NOTHING;