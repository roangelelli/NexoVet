const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { iniciar } = require('./entorno');

// Archivo aparte: el contador de intentos vive en memoria y es por proceso
describe('Límite de intentos (rate limiting)', () => {
  let t;
  before(async () => { t = await iniciar(); });
  after(async () => { await t.cerrar(); });

  test('después de 10 logins fallidos seguidos, el 11.º recibe 429', async () => {
    const estados = [];
    for (let i = 0; i < 11; i++) {
      const r = await t.pedir('POST', '/api/auth/login', { cuerpo: { email: 'ana@test.com', password: 'incorrecta-1' } });
      estados.push(r.status);
    }
    assert.deepEqual(estados.slice(0, 10), Array(10).fill(401));
    assert.equal(estados[10], 429);
  });

  test('el mensaje de bloqueo es claro y usa el formato { error }', async () => {
    const r = await t.pedir('POST', '/api/auth/login', { cuerpo: { email: 'ana@test.com', password: 'incorrecta-1' } });
    assert.equal(r.status, 429);
    assert.match(r.json.error, /Demasiados intentos/);
  });

  test('el bloqueo no afecta al resto de la API', async () => {
    const r = await t.pedir('GET', '/api/ruta-que-no-existe');
    assert.equal(r.status, 404);
  });
});
