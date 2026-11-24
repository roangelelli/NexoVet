const { test, describe } = require('node:test');
const assert = require('node:assert/strict');

// Se evita crear el pool de MySQL: estas pruebas son de lógica pura
const path = require('path');
const ruta = require.resolve(path.join(__dirname, '..', 'src', 'config', 'db.js'));
require.cache[ruta] = { id: ruta, filename: ruta, loaded: true, exports: {} };

const v = require('../src/middlewares/validaciones');
const { calcularEstado } = require('../src/services/vacuna.service');

describe('Validaciones de entrada', () => {
  test('esFecha acepta fechas reales y rechaza las que no existen', () => {
    assert.equal(v.esFecha('2026-11-21'), true);
    assert.equal(v.esFecha('2026-02-30'), false);
    assert.equal(v.esFecha('21/11/2026'), false);
    assert.equal(v.esFecha(20261121), false);
  });

  test('esHora valida el formato HH:MM de 24 horas', () => {
    assert.equal(v.esHora('09:30'), true);
    assert.equal(v.esHora('24:00'), false);
    assert.equal(v.esHora('9:30'), false);
    assert.equal(v.esHora('10:75'), false);
  });

  test('leerId solo acepta enteros positivos', () => {
    assert.equal(v.leerId('7'), 7);
    for (const malo of ['0', '-3', 'abc', '1.5', '']) assert.throws(() => v.leerId(malo));
  });

  test('esTexto rechaza vacíos, solo espacios, no-strings y textos demasiado largos', () => {
    assert.equal(v.esTexto('Hola', 10), true);
    assert.equal(v.esTexto('   ', 10), false);
    assert.equal(v.esTexto(null, 10), false);
    assert.equal(v.esTexto('x'.repeat(11), 10), false);
  });

  test('sumarDias cruza correctamente el fin de mes y de año', () => {
    assert.equal(v.sumarDias('2026-11-30', 1), '2026-12-01');
    assert.equal(v.sumarDias('2026-12-31', 1), '2027-01-01');
  });

  test('validarNuevoCliente exige nombre, email válido y contraseña de 8 o más caracteres', () => {
    assert.throws(() => v.validarNuevoCliente({ nombre: 'A', apellido: 'B', email: 'sin-arroba', password: '12345678' }));
    assert.throws(() => v.validarNuevoCliente({ nombre: 'A', apellido: 'B', email: 'a@b.com', password: '123' }));
    assert.doesNotThrow(() => v.validarNuevoCliente({ nombre: 'A', apellido: 'B', email: 'a@b.com', password: '12345678' }));
  });
});

describe('Estado de las vacunas (dato derivado)', () => {
  const hoy = v.ahoraArgentina().fecha;

  test('una vacuna sin próxima fecha (dosis única) siempre está vigente', () => {
    assert.equal(calcularEstado(null), 'vigente');
  });
  test('con próxima fecha pasada está vencida', () => {
    assert.equal(calcularEstado(v.sumarDias(hoy, -1)), 'vencida');
  });
  test('vence dentro de los próximos 30 días: por vencer', () => {
    assert.equal(calcularEstado(v.sumarDias(hoy, 30)), 'por_vencer');
    assert.equal(calcularEstado(hoy), 'por_vencer');
  });
  test('vence en más de 30 días: vigente', () => {
    assert.equal(calcularEstado(v.sumarDias(hoy, 31)), 'vigente');
  });
});
