# database/

Scripts SQL de NexoVet (MySQL 8).

| Archivo | Qué hace |
|---|---|
| `schema.sql` | Crea las 12 tablas (borra y recrea si ya existen). |
| `seed.sql` | Catálogos (especies, razas, tipos de vacuna), configuración, horario de ejemplo y 3 usuarios de prueba (contraseña `NexoVet2026`). |

## Cómo ejecutarlos contra Aiven

1. En Aiven: servicio MySQL → pestaña **Overview** → copiar Host, Port, User, Password y descargar el **CA certificate** (`ca.pem`).
2. Desde la terminal (o MySQL Workbench / DBeaver con SSL activado):

```bash
mysql -h <HOST> -P <PORT> -u avnadmin -p --ssl-ca=ca.pem --ssl-mode=VERIFY_CA defaultdb < schema.sql
mysql -h <HOST> -P <PORT> -u avnadmin -p --ssl-ca=ca.pem --ssl-mode=VERIFY_CA defaultdb < seed.sql
```
