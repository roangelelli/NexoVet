// Entorno de pruebas: arma la API real (rutas, middlewares, servicios y JWT)
// reemplazando únicamente la capa de acceso a datos por una base en memoria.
// Así se prueban las reglas de negocio sin depender de MySQL ni de internet.
const path = require('path');
const bcrypt = require('bcrypt');

process.env.JWT_SECRET = 'secreto-solo-para-tests';

const CLAVE = 'ClaveSegura1';
const pausa = () => new Promise((r) => setImmediate(r));

// Fecha futura (AAAA-MM-DD) a "dias" días de hoy
function fechaFutura(dias) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

function crearBase() {
  const hash = bcrypt.hashSync(CLAVE, 4);
  const base = {
    usuarios: [
      { id: 1, nombre: 'Rita', apellido: 'Recepción', email: 'recepcion@test.com', rol: 'recepcion', activo: true, password_hash: hash },
      { id: 2, nombre: 'Vera', apellido: 'Veterinaria', email: 'vet@test.com', rol: 'veterinario', activo: true, password_hash: hash },
      { id: 3, nombre: 'Ana', apellido: 'Cliente', email: 'ana@test.com', rol: 'cliente', activo: true, password_hash: hash },
      { id: 4, nombre: 'Beto', apellido: 'Cliente', email: 'beto@test.com', rol: 'cliente', activo: true, password_hash: hash },
      { id: 5, nombre: 'Baja', apellido: 'Usuario', email: 'baja@test.com', rol: 'cliente', activo: false, password_hash: hash },
    ],
    mascotas: [
      { id: 10, cliente_id: 3, nombre: 'Luna', especie_id: 1, activo: true },
      { id: 11, cliente_id: 4, nombre: 'Rocco', especie_id: 1, activo: true },
    ],
    turnos: [],
    atenciones: [],
    tramos: ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'].map((dia, i) => ({
      id: i + 1, dia_semana: dia, hora_inicio: '09:00:00', hora_fin: '11:00:00',
    })),
    bloqueados: [],
    siguienteId: 100,
  };
  return base;
}

function cargarApp() {
  const base = crearBase();
  const src = (...p) => path.join(__dirname, '..', 'src', ...p);
  const falso = (archivo, exportaciones) => {
    const ruta = require.resolve(src(archivo));
    require.cache[ruta] = { id: ruta, filename: ruta, loaded: true, exports: exportaciones };
  };

  falso('config/db.js', {});

  falso('models/usuario.model.js', {
    buscarPorEmail: async (email) => base.usuarios.find((u) => u.email === email),
    buscarPorId: async (id) => {
      const u = base.usuarios.find((x) => x.id === id);
      if (!u) return undefined;
      const { password_hash, ...resto } = u;
      return resto;
    },
    crear: async (u) => {
      const id = base.siguienteId++;
      base.usuarios.push({ id, activo: true, ...u, password_hash: u.passwordHash });
      return id;
    },
    listarPersonal: async () => [], listarClientes: async () => [],
    actualizarDatos: async () => {}, darDeBaja: async () => {}, contarTablas: async () => 12,
  });

  falso('models/mascota.model.js', {
    listar: async ({ clienteId }) => base.mascotas.filter((m) => !clienteId || m.cliente_id === clienteId),
    buscarPorId: async (id) => base.mascotas.find((m) => m.id === id),
    crear: async () => 0, actualizar: async () => {}, darDeBaja: async () => {},
  });

  falso('models/catalogo.model.js', {
    listarEspecies: async () => [], listarRazas: async () => [], listarTiposVacuna: async () => [],
    buscarEspecie: async () => ({ id: 1, nombre: 'Perro' }), buscarRaza: async () => null, buscarTipoVacuna: async () => ({ id: 1 }),
  });

  falso('models/disponibilidad.model.js', {
    obtenerDuracion: async () => 30,
    actualizarDuracion: async () => {},
    listarTramos: async () => base.tramos,
    tramosDelDia: async (dia) => base.tramos.filter((t) => t.dia_semana === dia),
    buscarTramo: async (id) => base.tramos.find((t) => t.id === id),
    crearTramo: async (t) => { base.tramos.push({ id: base.siguienteId++, hora_inicio: t.hora_inicio + ':00', hora_fin: t.hora_fin + ':00', dia_semana: t.dia_semana }); },
    eliminarTramo: async () => {},
    listarDiasBloqueados: async () => base.bloqueados,
    buscarDiaBloqueado: async (f) => base.bloqueados.find((b) => b.fecha === f),
    buscarDiaBloqueadoPorId: async () => undefined,
    crearDiaBloqueado: async (fecha, motivo) => { base.bloqueados.push({ id: base.siguienteId++, fecha, motivo }); },
    eliminarDiaBloqueado: async () => {},
    horasOcupadas: async (fecha) => {
      await pausa(); // deja que otra solicitud "vea" lo mismo antes de guardar
      return base.turnos.filter((t) => t.fecha === fecha && t.estado !== 'cancelado').map((t) => t.hora);
    },
  });

  const conDueno = (t) => {
    const m = base.mascotas.find((x) => x.id === t.mascota_id);
    return { ...t, cliente_id: m.cliente_id, mascota: m.nombre };
  };
  falso('models/turno.model.js', {
    listar: async ({ clienteId, fecha, estado }) =>
      base.turnos.map(conDueno).filter((t) => (!clienteId || t.cliente_id === clienteId) && (!fecha || t.fecha === fecha) && (!estado || t.estado === estado)),
    buscarPorId: async (id) => { const t = base.turnos.find((x) => x.id === id); return t && conDueno(t); },
    crear: async ({ mascota_id, fecha, hora, motivo }) => {
      await pausa();
      // Réplica de la restricción única "franja_activa" de MySQL
      if (base.turnos.some((t) => t.fecha === fecha && t.hora === hora && t.estado !== 'cancelado')) {
        const err = new Error('Duplicate entry'); err.code = 'ER_DUP_ENTRY'; throw err;
      }
      const id = base.siguienteId++;
      base.turnos.push({ id, mascota_id, fecha, hora, motivo, estado: 'solicitado' });
      return id;
    },
    cambiarEstado: async (id, estado) => { base.turnos.find((t) => t.id === id).estado = estado; },
  });

  falso('models/atencion.model.js', {
    listarPorMascota: async (id) => base.atenciones.filter((a) => a.mascota_id === id),
    buscarPorId: async (id) => { const a = base.atenciones.find((x) => x.id === id); return a && { ...a, cliente_id: base.mascotas.find((m) => m.id === a.mascota_id).cliente_id }; },
    crear: async (datos) => {
      if (datos.turno_id && base.atenciones.some((a) => a.turno_id === datos.turno_id)) {
        const err = new Error('Duplicate entry'); err.code = 'ER_DUP_ENTRY'; throw err;
      }
      const id = base.siguienteId++; base.atenciones.push({ id, ...datos }); return id;
    },
    actualizar: async () => {},
  });
  falso('models/imagen.model.js', { listarPorAtencion: async () => [], buscarPorId: async () => undefined, crear: async () => 0, eliminar: async () => {} });
  falso('models/vacuna.model.js', { listarPorMascota: async () => [], buscarPorId: async () => undefined, crear: async () => 0, actualizar: async () => {}, porVencer: async () => [] });

  // Se carga la app real después de instalar los reemplazos
  const app = require(src('app.js'));
  return { app, base };
}

async function iniciar() {
  const { app, base } = cargarApp();
  const servidor = await new Promise((ok) => { const s = app.listen(0, () => ok(s)); });
  const url = `http://127.0.0.1:${servidor.address().port}`;

  async function pedir(metodo, ruta, { token, cuerpo } = {}) {
    const r = await fetch(url + ruta, {
      method: metodo,
      headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
      body: cuerpo ? JSON.stringify(cuerpo) : undefined,
    });
    const texto = await r.text();
    let json; try { json = JSON.parse(texto); } catch { json = texto; }
    return { status: r.status, json, headers: r.headers };
  }

  async function sesion(email) {
    const r = await pedir('POST', '/api/auth/login', { cuerpo: { email, password: CLAVE } });
    return r.json.token;
  }

  return { base, url, pedir, sesion, fechaFutura, cerrar: () => new Promise((ok) => servidor.close(ok)) };
}

module.exports = { iniciar, fechaFutura, CLAVE };
