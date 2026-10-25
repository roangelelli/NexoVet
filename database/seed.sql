-- NexoVet - Datos iniciales (ejecutar despues de schema.sql)

INSERT INTO configuracion (duracion_turno_min)
SELECT 30 WHERE NOT EXISTS (SELECT 1 FROM configuracion);

INSERT IGNORE INTO especies (nombre) VALUES ('Perro'), ('Gato'), ('Otro');

INSERT IGNORE INTO razas (especie_id, nombre) VALUES
  (1,'Mestizo'),
  (1,'Labrador Retriever'),
  (1,'Golden Retriever'),
  (1,'Pastor Alemán'),
  (1,'Caniche'),
  (1,'Bulldog Francés'),
  (1,'Bulldog Inglés'),
  (1,'Border Collie'),
  (1,'Beagle'),
  (1,'Salchicha (Dachshund)'),
  (1,'Chihuahua'),
  (1,'Yorkshire Terrier'),
  (1,'Shih Tzu'),
  (1,'Pug'),
  (1,'Boxer'),
  (1,'Rottweiler'),
  (1,'Doberman'),
  (1,'Dogo Argentino'),
  (1,'Pitbull'),
  (1,'Siberian Husky'),
  (1,'Cocker Spaniel'),
  (1,'Schnauzer'),
  (1,'Gran Danés'),
  (1,'Maltés'),
  (1,'Pastor Belga'),
  (1,'Ovejero Magallánico'),
  (1,'Cimarrón Uruguayo'),
  (1,'Fox Terrier'),
  (1,'Jack Russell Terrier'),
  (2,'Mestizo'),
  (2,'Siamés'),
  (2,'Persa'),
  (2,'Maine Coon'),
  (2,'Angora'),
  (2,'Bengalí'),
  (2,'Ragdoll'),
  (2,'Británico de pelo corto'),
  (2,'Azul Ruso'),
  (2,'Sphynx'),
  (2,'Bombay'),
  (2,'Birmano'),
  (2,'Abisinio'),
  (2,'Scottish Fold'),
  (2,'Himalayo'),
  (2,'Siberiano'),
  (2,'Exótico de pelo corto');

INSERT IGNORE INTO tipos_vacuna (nombre, intervalo_meses) VALUES
  -- Perros y gatos
  ('Antirrábica', 12),
  -- Perros
  ('Quíntuple canina', 12),
  ('Séxtuple canina', 12),
  ('Moquillo canino', 12),
  ('Parvovirus canino', 12),
  ('Leptospirosis canina', 12),
  ('Tos de las perreras (Bordetella)', 12),
  -- Gatos
  ('Triple felina', 12),
  ('Leucemia felina', 12),
  -- No es vacuna, pero se registra en el mismo lugar
  ('Desparasitación', 3);

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
