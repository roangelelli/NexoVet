import { useState } from 'react'
import { api } from '../services/api'
import { useCarga } from '../hooks/useCarga'
import { Aviso, Boton, Campo, Celda, Cargando, Estado, Fila, Modal, Select, Tabla, Vacio } from './ui'
import { useToast } from '../context/ToastContext'
import { fechaLegible, hoy } from '../utils'

// Carnet de vacunas de una mascota. El estado (vigente, por vencer, vencida) lo calcula el backend.
// Solo el veterinario puede registrar y corregir aplicaciones.
export default function Vacunas({ mascotaId, puedeEditar }) {
  const { datos, cargando, error, recargar } = useCarga(() => api.get(`/vacunas?mascota_id=${mascotaId}`), [mascotaId])
  const tipos = useCarga(() => (puedeEditar ? api.get('/catalogos/tipos-vacuna') : Promise.resolve(null)), [puedeEditar])
  const [editando, setEditando] = useState(null) // null = cerrado, {} = nueva, {...vacuna} = corrección

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-semibold">Vacunas</h2>
        {puedeEditar && <Boton type="button" onClick={() => setEditando({})}>Registrar vacuna</Boton>}
      </div>

      <Aviso tipo="error">{error}</Aviso>
      {cargando && <Cargando />}
      {datos && datos.vacunas.length === 0 && <Vacio>Todavía no hay vacunas registradas.</Vacio>}

      {datos && datos.vacunas.length > 0 && (
        <Tabla columnas={['Vacuna', 'Aplicada', 'Próxima', 'Estado', ...(puedeEditar ? [''] : [])]}>
          {datos.vacunas.map((v) => (
            <Fila key={v.id}>
              <Celda>
                <span className="font-semibold">{v.tipo}</span>
                {(v.lote || v.observaciones) && (
                  <span className="block text-sm text-tinta/70">{[v.lote && `Lote ${v.lote}`, v.observaciones].filter(Boolean).join(' · ')}</span>
                )}
              </Celda>
              <Celda etiqueta="Aplicada">{fechaLegible(v.fecha_aplicacion)}<span className="block text-sm text-tinta/70">{v.veterinario}</span></Celda>
              <Celda etiqueta="Próxima">{v.proxima_fecha ? fechaLegible(v.proxima_fecha) : 'Dosis única'}</Celda>
              <Celda etiqueta="Estado"><Estado valor={v.estado} /></Celda>
              {puedeEditar && (
                <Celda className="md:text-right">
                  <Boton type="button" variante="secundario" className="mt-2 w-full md:mt-0 md:w-auto" onClick={() => setEditando(v)}>Corregir</Boton>
                </Celda>
              )}
            </Fila>
          ))}
        </Tabla>
      )}

      <Modal abierto={editando !== null} titulo={editando?.id ? 'Corregir vacuna' : 'Registrar vacuna'} onCerrar={() => setEditando(null)}>
        {editando !== null && (
          <FormVacuna
            vacuna={editando}
            mascotaId={mascotaId}
            tipos={tipos.datos?.tipos_vacuna || []}
            onGuardada={() => { setEditando(null); recargar() }}
          />
        )}
      </Modal>
    </section>
  )
}

function FormVacuna({ vacuna, mascotaId, tipos, onGuardada }) {
  const { avisar } = useToast()
  const [form, setForm] = useState({
    tipo_vacuna_id: vacuna.tipo_vacuna_id ? String(vacuna.tipo_vacuna_id) : '',
    fecha_aplicacion: vacuna.fecha_aplicacion ? vacuna.fecha_aplicacion.slice(0, 10) : hoy(),
    lote: vacuna.lote || '',
    observaciones: vacuna.observaciones || '',
  })
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  const cambiar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value })
  const tipo = tipos.find((t) => String(t.id) === form.tipo_vacuna_id)

  const guardar = async (e) => {
    e.preventDefault()
    setError('')
    setGuardando(true)
    const cuerpo = { ...form, tipo_vacuna_id: Number(form.tipo_vacuna_id) }
    try {
      if (vacuna.id) await api.put(`/vacunas/${vacuna.id}`, cuerpo)
      else await api.post('/vacunas', { ...cuerpo, mascota_id: Number(mascotaId) })
      avisar(vacuna.id ? 'Vacuna corregida.' : 'Vacuna registrada.')
      onGuardada()
    } catch (err) {
      setError(err.message)
      setGuardando(false)
    }
  }

  return (
    <form onSubmit={guardar} className="space-y-4">
      <Aviso tipo="error">{error}</Aviso>
      <Select id="tipo" etiqueta="Vacuna" required value={form.tipo_vacuna_id} onChange={cambiar('tipo_vacuna_id')}>
        <option value="">Elegí una vacuna</option>
        {tipos.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
      </Select>
      {tipo && (
        <p className="-mt-2 text-sm text-tinta/70">
          {tipo.intervalo_meses ? `Se repite cada ${tipo.intervalo_meses} ${tipo.intervalo_meses === 1 ? 'mes' : 'meses'}.` : 'Dosis única: no vence.'}
        </p>
      )}
      <Campo id="fecha_aplicacion" etiqueta="Fecha de aplicación" type="date" max={hoy()} required value={form.fecha_aplicacion} onChange={cambiar('fecha_aplicacion')} />
      <Campo id="lote" etiqueta="Lote (opcional)" maxLength={50} value={form.lote} onChange={cambiar('lote')} />
      <Campo id="observaciones" etiqueta="Observaciones (opcional)" maxLength={255} value={form.observaciones} onChange={cambiar('observaciones')} />
      <Boton type="submit" cargando={guardando}>{vacuna.id ? 'Guardar cambios' : 'Registrar vacuna'}</Boton>
    </form>
  )
}
