-- NexoVet - Esquema de base de datos (MySQL 8)

-- ---------- Catalogos ----------
CREATE TABLE IF NOT EXISTS especies (
  id     INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  UNIQUE KEY uq_especies_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS razas (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  especie_id INT NOT NULL,
  nombre     VARCHAR(80) NOT NULL,
  UNIQUE KEY uq_razas_especie_nombre (especie_id, nombre),
  CONSTRAINT fk_razas_especie FOREIGN KEY (especie_id) REFERENCES especies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tipos_vacuna (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  nombre          VARCHAR(80) NOT NULL,
  intervalo_meses INT NULL COMMENT 'NULL = dosis unica',
  UNIQUE KEY uq_tipos_vacuna_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- Usuarios y mascotas ----------
CREATE TABLE IF NOT EXISTS usuarios (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  nombre        VARCHAR(80)  NOT NULL,
  apellido      VARCHAR(80)  NOT NULL,
  email         VARCHAR(150) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  telefono      VARCHAR(30)  NULL,
  rol           ENUM('recepcion','veterinario','cliente') NOT NULL,
  activo        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_usuarios_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS mascotas (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id       INT NOT NULL,
  nombre           VARCHAR(80) NOT NULL,
  especie_id       INT NOT NULL,
  raza_id          INT NULL,
  especie_otra     VARCHAR(80) NULL COMMENT 'Texto libre, solo si la especie es Otro',
  sexo             ENUM('macho','hembra') NOT NULL,
  fecha_nacimiento DATE NULL,
  microchip        VARCHAR(50) NULL,
  color            VARCHAR(50) NULL,
  esterilizado     BOOLEAN NOT NULL DEFAULT FALSE,
  activo           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_mascotas_microchip (microchip),
  KEY idx_mascotas_cliente (cliente_id),
  CONSTRAINT fk_mascotas_cliente FOREIGN KEY (cliente_id) REFERENCES usuarios(id),
  CONSTRAINT fk_mascotas_especie FOREIGN KEY (especie_id) REFERENCES especies(id),
  CONSTRAINT fk_mascotas_raza    FOREIGN KEY (raza_id)    REFERENCES razas(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- Agenda ----------
CREATE TABLE IF NOT EXISTS configuracion (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  duracion_turno_min INT NOT NULL DEFAULT 30
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS disponibilidad (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  dia_semana  ENUM('lunes','martes','miercoles','jueves','viernes','sabado','domingo') NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin    TIME NOT NULL,
  activo      BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT ck_disponibilidad_horas CHECK (hora_fin > hora_inicio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS dias_bloqueados (
  id     INT AUTO_INCREMENT PRIMARY KEY,
  fecha  DATE NOT NULL,
  motivo VARCHAR(150) NULL,
  UNIQUE KEY uq_dias_bloqueados_fecha (fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- Turnos ----------
-- franja_activa: fecha+hora mientras el turno NO este cancelado; NULL si esta cancelado.
-- El UNIQUE sobre esa columna impide dos turnos activos en la misma franja
-- (ultima barrera contra la doble reserva) y un cancelado libera la franja.
CREATE TABLE IF NOT EXISTS turnos (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  mascota_id    INT NOT NULL,
  fecha         DATE NOT NULL,
  hora          TIME NOT NULL,
  motivo        VARCHAR(255) NULL,
  estado        ENUM('solicitado','confirmado','atendido','cancelado') NOT NULL DEFAULT 'solicitado',
  franja_activa DATETIME GENERATED ALWAYS AS (
                  IF(estado = 'cancelado', NULL, TIMESTAMP(fecha, hora))
                ) STORED,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_turnos_franja_activa (franja_activa),
  KEY idx_turnos_mascota (mascota_id),
  KEY idx_turnos_fecha (fecha),
  CONSTRAINT fk_turnos_mascota FOREIGN KEY (mascota_id) REFERENCES mascotas(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- Historia clinica ----------
CREATE TABLE IF NOT EXISTS atenciones (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  mascota_id     INT NOT NULL,
  turno_id       INT NULL,
  veterinario_id INT NOT NULL,
  fecha          DATE NOT NULL,
  motivo         VARCHAR(255) NULL,
  diagnostico    TEXT NULL,
  tratamiento    TEXT NULL,
  peso           DECIMAL(5,2) NULL COMMENT 'kg',
  observaciones  TEXT NULL,
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_atenciones_turno (turno_id),
  KEY idx_atenciones_mascota (mascota_id),
  CONSTRAINT fk_atenciones_mascota     FOREIGN KEY (mascota_id)     REFERENCES mascotas(id),
  CONSTRAINT fk_atenciones_turno       FOREIGN KEY (turno_id)       REFERENCES turnos(id),
  CONSTRAINT fk_atenciones_veterinario FOREIGN KEY (veterinario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS imagenes (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  atencion_id INT NOT NULL,
  url         VARCHAR(500) NOT NULL COMMENT 'URL en Cloudinary',
  descripcion VARCHAR(255) NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_imagenes_atencion (atencion_id),
  CONSTRAINT fk_imagenes_atencion FOREIGN KEY (atencion_id) REFERENCES atenciones(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- Vacunas ----------
CREATE TABLE IF NOT EXISTS vacunas (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  mascota_id       INT NOT NULL,
  tipo_vacuna_id   INT NOT NULL,
  fecha_aplicacion DATE NOT NULL,
  veterinario_id   INT NOT NULL,
  lote             VARCHAR(50) NULL,
  observaciones    VARCHAR(255) NULL,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_vacunas_mascota (mascota_id),
  CONSTRAINT fk_vacunas_mascota      FOREIGN KEY (mascota_id)     REFERENCES mascotas(id),
  CONSTRAINT fk_vacunas_tipo         FOREIGN KEY (tipo_vacuna_id) REFERENCES tipos_vacuna(id),
  CONSTRAINT fk_vacunas_veterinario  FOREIGN KEY (veterinario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
