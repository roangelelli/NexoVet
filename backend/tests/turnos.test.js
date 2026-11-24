const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { iniciar } = require('./entorno');

describe('Turnos y disponibilidad', () => {
  let t, ana, beto, recepcion, vet;
  before(async () => {
    t = await iniciar();
    [ana, beto, recepcion, vet] = await Promise.all(
      ['ana@test.com', 'beto@test.com', 'recepcion@test.com', 'vet@test.com'].map((e) => t.sesion(e))
    );
  });
  after(async () => { await t.cerrar(); });

  const franjas = (fecha, token) => t.pedir('GET', `/api/disponibilidad/franjas?fecha=${fecha}`, { token });
  const pedirTurno = (token, mascota_id, fecha, hora) =>
    t.pedir('POST', '/api/turnos', { token, cuerpo: { mascota_id, fecha, hora, motivo: 'Control' } });

  test('las franjas se calculan a partir del tramo y la duración (09:00-11:00 / 30 min = 4 franjas)', async () => {
    const r = await franjas(t.fechaFutura(5), ana);
    assert.equal(r.status, 200);
    assert.deepEqual(r.json.franjas, ['09:00', '09:30', '10:00', '10:30']);
  });

  test('un día bloqueado no tiene franjas', async () => {
    const fecha = t.fechaFutura(6);
    await t.pedir('POST', '/api/disponibilidad/dias-bloqueados', { token: recepcion, cuerpo: { fecha, motivo: 'Feriado' } });
    const r = await franjas(fecha, ana);
    assert.deepEqual(r.json.franjas, []);
  });

  test('un día pasado no tiene franjas', async () => {
    const r = await franjas('2020-01-06', ana);
    assert.deepEqual(r.json.franjas, []);
  });

  test('un tramo que se superpone con otro del mismo día se rechaza', async () => {
    const r = await t.pedir('POST', '/api/disponibilidad/tramos', {
      token: recepcion, cuerpo: { dia_semana: 'lunes', hora_inicio: '10:00', hora_fin: '12:00' },
    });
    assert.equal(r.status, 409);
  });

  test('un tramo con hora de inicio posterior a la de fin se rechaza', async () => {
    const r = await t.pedir('POST', '/api/disponibilidad/tramos', {
      token: recepcion, cuerpo: { dia_semana: 'lunes', hora_inicio: '15:00', hora_fin: '14:00' },
    });
    assert.equal(r.status, 400);
  });

  test('el cliente solicita un turno y queda en estado "solicitado"', async () => {
    const fecha = t.fechaFutura(8);
    const r = await pedirTurno(ana, 10, fecha, '09:00');
    assert.equal(r.status, 201);
    assert.equal(r.json.turno.estado, 'solicitado');
  });

  test('una franja ocupada desaparece de las franjas libres y no se puede volver a reservar', async () => {
    const fecha = t.fechaFutura(9);
    assert.equal((await pedirTurno(ana, 10, fecha, '09:30')).status, 201);
    const libres = (await franjas(fecha, beto)).json.franjas;
    assert.ok(!libres.includes('09:30'));
    const segundo = await pedirTurno(beto, 11, fecha, '09:30');
    assert.equal(segundo.status, 409);
  });

  test('una hora que no está en la agenda se rechaza', async () => {
    const r = await pedirTurno(ana, 10, t.fechaFutura(11), '15:00');
    assert.equal(r.status, 409);
  });

  test('CONCURRENCIA: dos clientes piden la misma franja a la vez, uno la obtiene y el otro recibe 409', async () => {
    const fecha = t.fechaFutura(12);
    const [a, b] = await Promise.all([pedirTurno(ana, 10, fecha, '10:00'), pedirTurno(beto, 11, fecha, '10:00')]);
    assert.deepEqual([a.status, b.status].sort(), [201, 409]);
    const turnos = t.base.turnos.filter((x) => x.fecha === fecha && x.hora === '10:00');
    assert.equal(turnos.length, 1, 'en la base debe quedar un único turno en esa franja');
  });

  test('un turno cancelado libera la franja para otro cliente', async () => {
    const fecha = t.fechaFutura(13);
    const original = await pedirTurno(ana, 10, fecha, '09:00');
    const cancelar = await t.pedir('PATCH', `/api/turnos/${original.json.turno.id}/cancelar`, { token: ana });
    assert.equal(cancelar.json.turno.estado, 'cancelado');
    const nuevo = await pedirTurno(beto, 11, fecha, '09:00');
    assert.equal(nuevo.status, 201);
  });

  test('ciclo completo: solicitado → confirmado → atendido', async () => {
    const fecha = t.fechaFutura(14);
    const id = (await pedirTurno(ana, 10, fecha, '09:00')).json.turno.id;
    const conf = await t.pedir('PATCH', `/api/turnos/${id}/confirmar`, { token: recepcion });
    assert.equal(conf.json.turno.estado, 'confirmado');
    const aten = await t.pedir('PATCH', `/api/turnos/${id}/atender`, { token: vet });
    assert.equal(aten.json.turno.estado, 'atendido');
  });

  test('transiciones inválidas: no se puede atender un turno solicitado ni cancelar uno atendido', async () => {
    const fecha = t.fechaFutura(15);
    const id = (await pedirTurno(ana, 10, fecha, '09:00')).json.turno.id;
    assert.equal((await t.pedir('PATCH', `/api/turnos/${id}/atender`, { token: vet })).status, 409);
    await t.pedir('PATCH', `/api/turnos/${id}/confirmar`, { token: recepcion });
    await t.pedir('PATCH', `/api/turnos/${id}/atender`, { token: vet });
    assert.equal((await t.pedir('PATCH', `/api/turnos/${id}/cancelar`, { token: recepcion })).status, 409);
  });

  test('un cliente no puede confirmar turnos (solo el personal)', async () => {
    const id = (await pedirTurno(ana, 10, t.fechaFutura(16), '09:00')).json.turno.id;
    assert.equal((await t.pedir('PATCH', `/api/turnos/${id}/confirmar`, { token: ana })).status, 403);
  });

  test('un cliente no puede cancelar el turno de otro cliente', async () => {
    const id = (await pedirTurno(ana, 10, t.fechaFutura(17), '09:00')).json.turno.id;
    assert.equal((await t.pedir('PATCH', `/api/turnos/${id}/cancelar`, { token: beto })).status, 404);
  });

  test('un cliente solo lista sus turnos; el personal ve todos', async () => {
    const fecha = t.fechaFutura(18);
    await pedirTurno(ana, 10, fecha, '09:00');
    await pedirTurno(beto, 11, fecha, '09:30');
    const deBeto = await t.pedir('GET', `/api/turnos?fecha=${fecha}`, { token: beto });
    assert.equal(deBeto.json.turnos.length, 1);
    const personal = await t.pedir('GET', `/api/turnos?fecha=${fecha}`, { token: recepcion });
    assert.equal(personal.json.turnos.length, 2);
  });

  test('atender desde un turno confirmado registra la atención y pasa el turno a "atendido"', async () => {
    const id = (await pedirTurno(ana, 10, t.fechaFutura(19), '09:00')).json.turno.id;
    await t.pedir('PATCH', `/api/turnos/${id}/confirmar`, { token: recepcion });
    const r = await t.pedir('POST', '/api/atenciones', {
      token: vet, cuerpo: { mascota_id: 10, turno_id: id, motivo: 'Control anual', peso: 12.5 },
    });
    assert.equal(r.status, 201);
    assert.equal(t.base.turnos.find((x) => x.id === id).estado, 'atendido');
  });

  test('no se puede registrar una atención sobre un turno solicitado (sin confirmar)', async () => {
    const id = (await pedirTurno(ana, 10, t.fechaFutura(20), '09:00')).json.turno.id;
    const r = await t.pedir('POST', '/api/atenciones', { token: vet, cuerpo: { mascota_id: 10, turno_id: id, motivo: 'Control' } });
    assert.equal(r.status, 409);
  });

  test('un mismo turno no puede originar dos atenciones', async () => {
    const id = (await pedirTurno(ana, 10, t.fechaFutura(21), '09:00')).json.turno.id;
    await t.pedir('PATCH', `/api/turnos/${id}/confirmar`, { token: recepcion });
    const cuerpo = { mascota_id: 10, turno_id: id, motivo: 'Control' };
    assert.equal((await t.pedir('POST', '/api/atenciones', { token: vet, cuerpo })).status, 201);
    assert.equal((await t.pedir('POST', '/api/atenciones', { token: vet, cuerpo })).status, 409);
  });
});
