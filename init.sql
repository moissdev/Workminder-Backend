-- Workminder MVP Database Schema
-- 5 Tablas principales

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Tabla 1: Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    nombre_completo VARCHAR(100) NOT NULL,
    correo_electronico VARCHAR(255) NOT NULL UNIQUE,
    contrasena_hash TEXT NOT NULL,
    foto_perfil VARCHAR(500),
    notificaciones_activas BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_correo (correo_electronico)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla 2: Periodos Académicos
CREATE TABLE IF NOT EXISTS periodos_academicos (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    usuario_id CHAR(36) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    es_activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario_activo (usuario_id, es_activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla 3: Materias
CREATE TABLE IF NOT EXISTS materias (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    periodo_id CHAR(36) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    nombre_profesor VARCHAR(100),
    creditos INT DEFAULT 0,
    color_hex VARCHAR(7) DEFAULT '#6B7280',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (periodo_id) REFERENCES periodos_academicos(id) ON DELETE CASCADE,
    INDEX idx_periodo (periodo_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla 4: Tareas (CORE DEL SISTEMA)
CREATE TABLE IF NOT EXISTS tareas (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    materia_id CHAR(36),
    usuario_id CHAR(36) NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    fecha_entrega TIMESTAMP NOT NULL,
    peso_calificacion DECIMAL(5,2) NOT NULL,
    nivel_complejidad INT DEFAULT 3,
    tipo_tarea ENUM('examen', 'proyecto', 'tarea', 'laboratorio', 'presentacion', 'otro') DEFAULT 'tarea',
    horas_estimadas DECIMAL(4,1),
    estado ENUM('pendiente', 'en_progreso', 'completada', 'tarde') DEFAULT 'pendiente',
    completada_en TIMESTAMP NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE SET NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario_estado (usuario_id, estado),
    INDEX idx_fecha_entrega (fecha_entrega)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla 5: Subtareas
CREATE TABLE IF NOT EXISTS subtareas (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    tarea_id CHAR(36) NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    esta_completada BOOLEAN DEFAULT FALSE,
    indice_orden INT DEFAULT 0,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tarea_id) REFERENCES tareas(id) ON DELETE CASCADE,
    INDEX idx_tarea_orden (tarea_id, indice_orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Vista: Tareas con prioridad calculada
CREATE OR REPLACE VIEW vw_tareas_priorizadas AS
SELECT 
    t.*,
    m.nombre AS materia_nombre,
    m.color_hex AS materia_color,
    TIMESTAMPDIFF(DAY, NOW(), t.fecha_entrega) AS dias_restantes,
    (t.peso_calificacion / 100.0) AS importancia,
    (1.0 - (LEAST(GREATEST(TIMESTAMPDIFF(DAY, NOW(), t.fecha_entrega), 0), 30) / 30.0)) AS urgencia,
    ROUND(
        (0.6 * (t.peso_calificacion / 100.0)) + 
        (0.4 * (1.0 - (LEAST(GREATEST(TIMESTAMPDIFF(DAY, NOW(), t.fecha_entrega), 0), 30) / 30.0))),
        4
    ) AS prioridad_calculada,
    CASE 
        WHEN ROUND((0.6 * (t.peso_calificacion / 100.0)) + (0.4 * (1.0 - (LEAST(GREATEST(TIMESTAMPDIFF(DAY, NOW(), t.fecha_entrega), 0), 30) / 30.0))), 4) >= 0.7 THEN 'urgent'
        WHEN ROUND((0.6 * (t.peso_calificacion / 100.0)) + (0.4 * (1.0 - (LEAST(GREATEST(TIMESTAMPDIFF(DAY, NOW(), t.fecha_entrega), 0), 30) / 30.0))), 4) >= 0.4 THEN 'important'
        ELSE 'normal'
    END AS nivel_prioridad
FROM tareas t
LEFT JOIN materias m ON t.materia_id = m.id
WHERE t.estado != 'completada';

-- Datos de prueba (Usuario demo)
INSERT INTO usuarios (id, nombre_completo, correo_electronico, contrasena_hash)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'Usuario Demo',
    'demo@upchiapas.edu.mx',
    '$2b$10$rBV2uHpYZzE.lXMDqKqJa.cEoYv6V5p5BVK9xLK8eFnZqGxqGFhOm'
    -- Password: Demo123!
);

-- Periodo académico de prueba
INSERT INTO periodos_academicos (id, usuario_id, nombre, fecha_inicio, fecha_fin, es_activo)
VALUES (
    '660e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    'Cuatrimestre Mayo-Agosto 2026',
    '2026-05-01',
    '2026-08-31',
    TRUE
);

-- Materias de prueba
INSERT INTO materias (id, periodo_id, nombre, nombre_profesor, creditos, color_hex) VALUES
('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Liderazgo de sistemas', 'Dr. García', 8, '#FFD700'),
('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'Base de Datos Avanzadas', 'Ing. López', 6, '#3B82F6'),
('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', 'Estructuras de Datos', 'M.C. Hernández', 7, '#10B981');

-- Tareas de prueba
INSERT INTO tareas (usuario_id, materia_id, titulo, descripcion, fecha_entrega, peso_calificacion, nivel_complejidad, tipo_tarea, horas_estimadas, estado) VALUES
(
    '550e8400-e29b-41d4-a716-446655440000',
    '770e8400-e29b-41d4-a716-446655440001',
    'Documentación del Proyecto',
    'Entregar documentación completa del proyecto final',
    DATE_ADD(NOW(), INTERVAL 1 DAY),
    40.0,
    4,
    'proyecto',
    3.5,
    'en_progreso'
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    '770e8400-e29b-41d4-a716-446655440002',
    'Cuestionario 1',
    'Cuestionario sobre normalización de bases de datos',
    DATE_ADD(NOW(), INTERVAL 2 DAY),
    15.0,
    2,
    'tarea',
    1.5,
    'pendiente'
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    '770e8400-e29b-41d4-a716-446655440003',
    'Eda Lineales',
    'Implementación de listas y pilas',
    DATE_ADD(NOW(), INTERVAL 5 DAY),
    20.0,
    3,
    'laboratorio',
    2.0,
    'pendiente'
);