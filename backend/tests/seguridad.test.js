const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const { iniciar, CLAVE } = require('./entorno');

describe('Autenticación y autorización', () => {
  let t;
  before(async () => { t = await iniciar(); });
  after(async () => { await t.cerrar(); });

  test('login correcto devuelve token y usuario sin el hash de la contraseña', async () => {
    const r = await t.pedir('POST', '/api/auth/login', { cuerpo: { email: 'ana@test.com', password: CLAVE } });
    assert.equal(r.status, 200);
    assert.ok(r.json.token);
    assert.equal(r.json.usuario.rol, 'cliente');
    assert.equal(r.json.usuario.password_hash, undefined);
  });

  test('contraseña incorrecta y email inexistente dan el mismo mensaje (no revela si el email existe)', async () => {
    const a = await t.pedir('POST', '/api/auth/login', { cuerpo: { email: 'ana@test.com', password: 'otra-clave-1' } });
    const b = await t.pedir('POST', '/api/auth/login', { cuerpo: { email: 'nadie@test.com', password: 'otra-clave-1' } });
    assert.equal(a.status, 401);
    assert.equal(b.status, 401);
    assert.equal(a.json.error, b.json.error);
  });

  test('un usuario dado de baja no puede iniciar sesión', async () => {
    const r = await t.pedir('POST', '/api/auth/login', { cuerpo: { email: 'baja@test.com', password: CLAVE } });
    assert.equal(r.status, 401);
  });

  test('el autorregistro siempre crea un cliente, aunque el pedido pida otro rol', async () => {
    const r = await t.pedir('POST', '/api/auth/registro', {
      cuerpo: { nombre: 'Nuevo', apellido: 'Intruso', email: 'nuevo@test.com', password: 'ClaveSegura1', rol: 'veterinario' },
    });
    assert.equal(r.status, 201);
    assert.equal(r.json.usuario.rol, 'cliente');
  });

  test('el registro rechaza contraseñas de menos de 8 caracteres', async () => {
    const r = await t.pedir('POST', '/api/auth/registro', {
      cuerpo: { nombre: 'A', apellido: 'B', email: 'corta@test.com', password: '1234' },
    });
    assert.equal(r.status, 400);
  });

  test('sin token se responde 401', async () => {
    const r = await t.pedir('GET', '/api/mascotas');
    assert.equal(r.status, 401);
  });

  test('un token manipulado o firmado con otro secreto se rechaza', async () => {
    const falso = jwt.sign({ id: 2, rol: 'veterinario' }, 'otro-secreto');
    const r = await t.pedir('GET', '/api/mascotas', { token: falso });
    assert.equal(r.status, 401);
  });

  test('un token vencido se rechaza', async () => {
    const vencido = jwt.sign({ id: 3, rol: 'cliente' }, process.env.JWT_SECRET, { expiresIn: -10 });
    const r = await t.pedir('GET', '/api/mascotas', { token: vencido });
    assert.equal(r.status, 401);
  });

  test('un cliente no puede ver los reportes (solo el personal)', async () => {
    const token = await t.sesion('ana@test.com');
    const r = await t.pedir('GET', '/api/reportes/turnos-del-dia?fecha=2026-11-20', { token });
    assert.equal(r.status, 403);
  });

  test('recepción puede ver los reportes', async () => {
    const token = await t.sesion('recepcion@test.com');
    const r = await t.pedir('GET', '/api/reportes/turnos-del-dia?fecha=2026-11-20', { token });
    assert.equal(r.status, 200);
  });

  test('solo el veterinario carga historia clínica: recepción recibe 403', async () => {
    const token = await t.sesion('recepcion@test.com');
    const r = await t.pedir('POST', '/api/atenciones', { token, cuerpo: { mascota_id: 10, motivo: 'Control' } });
    assert.equal(r.status, 403);
  });

  test('un cliente solo ve sus mascotas', async () => {
    const token = await t.sesion('ana@test.com');
    const r = await t.pedir('GET', '/api/mascotas', { token });
    assert.deepEqual(r.json.mascotas.map((m) => m.nombre), ['Luna']);
  });

  test('un cliente que pide la mascota de otro recibe 404 (no se revela que existe)', async () => {
    const token = await t.sesion('ana@test.com');
    const ajena = await t.pedir('GET', '/api/mascotas/11', { token });
    const inexistente = await t.pedir('GET', '/api/mascotas/999', { token });
    assert.equal(ajena.status, 404);
    assert.equal(inexistente.status, 404);
    assert.equal(ajena.json.error, inexistente.json.error);
  });

  test('un cliente no puede pedir turno para la mascota de otro', async () => {
    const token = await t.sesion('ana@test.com');
    const r = await t.pedir('POST', '/api/turnos', { token, cuerpo: { mascota_id: 11, fecha: t.fechaFutura(10), hora: '09:00' } });
    assert.equal(r.status, 404);
  });

  test('un cliente no puede ver la historia clínica de una mascota ajena', async () => {
    const token = await t.sesion('ana@test.com');
    const r = await t.pedir('GET', '/api/atenciones?mascota_id=11', { token });
    assert.equal(r.status, 404);
  });

  test('una fecha inexistente en un filtro responde 400 con mensaje claro', async () => {
    const token = await t.sesion('recepcion@test.com');
    const r = await t.pedir('GET', '/api/turnos?fecha=2026-02-30', { token });
    assert.equal(r.status, 400);
    assert.match(r.json.error, /AAAA-MM-DD/);
  });

  test('un JSON mal formado responde 400 y no rompe el servidor', async () => {
    const r = await fetch(t.url + '/api/auth/login', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: '{ esto no es json',
    });
    assert.equal(r.status, 400);
    const sano = await t.pedir('GET', '/api/ruta-que-no-existe');
    assert.equal(sano.status, 404);
  });

  test('las respuestas incluyen headers de seguridad (helmet) y no exponen el framework', async () => {
    const r = await t.pedir('GET', '/api/ruta-que-no-existe');
    assert.equal(r.status, 404);
    assert.equal(r.headers.get('x-content-type-options'), 'nosniff');
    assert.ok(r.headers.get('strict-transport-security'));
    assert.equal(r.headers.get('x-powered-by'), null);
  });
});
