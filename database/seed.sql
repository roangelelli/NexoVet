-- ============================================================
-- NexoVet - Datos iniciales (catalogos + usuarios de prueba)
-- Ejecutar DESPUES de schema.sql.
-- Usuarios de DESARROLLO: contrasena "NexoVet2026" (hash bcrypt).
-- Cambiarlas / borrarlas antes de la entrega final.
-- ============================================================

INSERT INTO configuracion (duracion_turno_min) VALUES (30);

INSERT INTO especies (nombre) VALUES ('Perro'), ('Gato'), ('Ave'), ('Conejo'), ('Otro');

INSERT INTO razas (especie_id, nombre) VALUES
  (1,'Mestizo'),(1,'Labrador Retriever'),(1,'Golden Retriever'),(1,'Pastor Alemán'),
  (1,'Caniche'),(1,'Bulldog Francés'),(1,'Border Collie'),(1,'Beagle'),(1,'Dachshund'),
  (2,'Mestizo'),(2,'Siamés'),(2,'Persa'),(2,'Maine Coon'),(2,'Angora'),
  (3,'Canario'),(3,'Cotorra'),(3,'Agapornis'),
  (4,'Enano'),(4,'Cabeza de León');

INSERT INTO tipos_vacuna (nombre, intervalo_meses) VALUES
  ('Antirrábica', 12),
  ('Quíntuple canina', 12),
  ('Séxtuple canina', 12),
  ('Triple felina', 12),
  ('Leucemia felina', 12),
  ('Tos de las perreras', 12),
  ('Desparasitación', 3),
  ('Dosis inicial de cachorro', NULL);

INSERT INTO usuarios (nombre, apellido, email, password_hash, telefono, rol) VALUES
  ('Recepción','Demo','recepcion@nexovet.test','$2b$10$PX5X/HS2N7CJKu8dSSaxGeS7DfqToLK.i0zvdrS2wMaGhwKmVifTu','2235000001','recepcion'),
  ('Vet','Demo','veterinario@nexovet.test','$2b$10$PX5X/HS2N7CJKu8dSSaxGeS7DfqToLK.i0zvdrS2wMaGhwKmVifTu','2235000002','veterinario'),
  ('Cliente','Demo','cliente@nexovet.test','$2b$10$PX5X/HS2N7CJKu8dSSaxGeS7DfqToLK.i0zvdrS2wMaGhwKmVifTu','2235000003','cliente');

-- Horario de ejemplo: lunes a viernes, mañana y tarde
INSERT INTO disponibilidad (dia_semana, hora_inicio, hora_fin) VALUES
  ('lunes','09:00','13:00'),('lunes','16:00','20:00'),
  ('martes','09:00','13:00'),('martes','16:00','20:00'),
  ('miercoles','09:00','13:00'),('miercoles','16:00','20:00'),
  ('jueves','09:00','13:00'),('jueves','16:00','20:00'),
  ('viernes','09:00','13:00'),('viernes','16:00','20:00');
