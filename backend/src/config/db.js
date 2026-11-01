const fs = require('fs');
const mysql = require('mysql2/promise');

// Aiven exige conexion cifrada (SSL) con su certificado.
// El certificado se indica con una ruta (local) o con su contenido (Render).
let ssl;
if (process.env.DB_SSL_CA_PATH) {
  ssl = { ca: fs.readFileSync(process.env.DB_SSL_CA_PATH, 'utf8') };
} else if (process.env.DB_SSL_CA) {
  ssl = { ca: process.env.DB_SSL_CA.replace(/\\n/g, '\n') };
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl,
  charset: 'utf8mb4',
  dateStrings: true, // fechas y horas como texto, sin conversion de zona horaria
});

module.exports = pool;
