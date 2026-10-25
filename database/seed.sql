-- NexoVet - Datos iniciales (ejecutar despues de schema.sql)

INSERT INTO configuracion (duracion_turno_min)
SELECT 30 WHERE NOT EXISTS (SELECT 1 FROM configuracion);

INSERT IGNORE INTO especies (nombre) VALUES ('Perro'), ('Gato'), ('Ave'), ('Conejo'), ('Otro');

INSERT IGNORE INTO razas (especie_id, nombre) VALUES
  (1,'Mestizo'),(1,'Labrador Retriever'),(1,'Golden Retriever'),(1,'Pastor Alemán'),
  (1,'Caniche'),(1,'Bulldog Francés'),(1,'Border Collie'),(1,'Beagle'),(1,'Dachshund'),
  (2,'Mestizo'),(2,'Siamés'),(2,'Persa'),(2,'Maine Coon'),(2,'Angora'),
  (3,'Canario'),(3,'Cotorra'),(3,'Agapornis'),
  (4,'Enano'),(4,'Cabeza de León');

INSERT IGNORE INTO tipos_vacuna (nombre, intervalo_meses) VALUES
  ('Antirrábica', 12),
  ('Quíntuple canina', 12),
  ('Séxtuple canina', 12),
  ('Triple felina', 12),
  ('Leucemia felina', 12),
  ('Tos de las perreras', 12),
  ('Desparasitación', 3),
  ('Dosis inicial de cachorro', NULL);

INSERT IGNORE INTO usuarios (nombre, apellido, email, password_hash, telefono, rol) VALUES
  ('Recepción','Demo','recepcion@nexovet.test','$2b$10$PX5X/HS2N7CJKu8dSSaxGeS7DfqToLK.i0zvdrS2wMaGhwKmVifTu','2235000001','recepcion'),
  ('Vet','Demo','veterinario@nexovet.test','$2b$10$PX5X/HS2N7CJKu8dSSaxGeS7DfqToLK.i0zvdrS2wMaGhwKmVifTu','2235000002','veterinario'),
  ('Cliente','Demo','cliente@nexovet.test','$2b$10$PX5X/HS2N7CJKu8dSSaxGeS7DfqToLK.i0zvdrS2wMaGhwKmVifTu','2235000003','cliente');

-- Horario de ejemplo: lunes a viernes, mañana y tarde
INSERT INTO disponibilidad (dia_semana, hora_inicio, hora_fin)
SELECT * FROM (VALUES
  ROW('lunes','09:00','13:00'),ROW('lunes','16:00','20:00'),
  ROW('martes','09:00','13:00'),ROW('martes','16:00','20:00'),
  ROW('miercoles','09:00','13:00'),ROW('miercoles','16:00','20:00'),
  ROW('jueves','09:00','13:00'),ROW('jueves','16:00','20:00'),
  ROW('viernes','09:00','13:00'),ROW('viernes','16:00','20:00')
) AS v
WHERE NOT EXISTS (SELECT 1 FROM disponibilidad);
