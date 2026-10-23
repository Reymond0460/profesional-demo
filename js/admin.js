/*
 * admin.js — panel de administración (admin.html): citas, servicios, horarios y ajustes.
 * El acceso por PIN es solo de demostración: en producción debe ser autenticación real en el servidor.
 */
(async function () {
  await Nucleo.iniciar();
  const { esc, moneda, fechaLarga } = Utils;
  const el = id => document.getElementById(id);
  const CLAVE_SESION = 'pi_admin_ok';
  const NOMBRES_DIA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const HORAS_POSIBLES = Array.from({ length: 13 }, (_, i) => String(i + 8).padStart(2, '0') + ':00'); // 08:00 a 20:00

  let filtroCitas = 'todas';

  /** Ejecuta una acción y muestra el error como aviso si falla (p. ej. almacenamiento lleno). */
  async function seguro(accion, textoOk) {
    try { await accion(); if (textoOk) Utils.avisar(textoOk, 'ok'); }
    catch (err) { Utils.avisar(err.message, 'error'); }
  }

  // ---------- Acceso por PIN ----------
  function accesoConcedido() {
    try { return sessionStorage.getItem(CLAVE_SESION) === '1'; } catch { return false; }
  }

  function iniciarPin() {
    el('pin-demo').textContent = CONFIG.pinAdmin;
    if (accesoConcedido()) { mostrarPanel(); return; }
    UI.abrirModal('modal-pin', { cerrable: false });
    el('form-pin').addEventListener('submit', e => {
      e.preventDefault();
      if (el('pin').value === CONFIG.pinAdmin) {
        try { sessionStorage.setItem(CLAVE_SESION, '1'); } catch { /* sin sesión persistente */ }
        UI.cerrarModal('modal-pin');
        mostrarPanel();
      } else {
        el('error-pin').hidden = false;
        el('pin').value = '';
        el('pin').focus();
      }
    });
  }

  function mostrarPanel() {
    el('panel').hidden = false;
    dibujarTodo();
  }

  async function dibujarTodo() {
    await Promise.all([dibujarCitas(), dibujarServicios(), dibujarHorarios()]);
  }

  // ---------- Citas ----------
  async function dibujarCitas() {
    const todas = await Nucleo.citas();
    const servicios = await Nucleo.servicios();
    const hoy = Utils.hoy();
    const pendientes = todas.filter(c => c.estado === 'pendiente').length;
    const proximas = todas.filter(c => c.fecha >= hoy && c.estado !== 'cancelada').length;
    el('cifras').innerHTML = [
      [todas.length, 'Citas en total'], [pendientes, 'Por confirmar'], [proximas, 'Próximas']
    ].map(([n, t]) => `<div class="tarjeta cifra"><strong>${n}</strong><span>${t}</span></div>`).join('');

    const lista = todas.filter(c => filtroCitas === 'todas' || c.estado === filtroCitas);
    el('lista-citas').innerHTML = lista.map(c => {
      const s = servicios.find(x => x.id === c.servicioId);
      const wa = Nucleo.enlaceWhatsApp(`Hola ${c.nombre}, te escribo por tu cita de ${s ? s.nombre : 'consulta'} el ${fechaLarga(c.fecha)} a las ${c.hora}.`);
      return `
      <li class="tarjeta cita-fila">
        <div>
          <p class="font-semibold">${esc(fechaLarga(c.fecha))} · ${esc(c.hora)}
            <span class="insignia insignia-${esc(c.estado)} ml-2">${esc(c.estado)}</span></p>
          <p class="text-sm">${esc(s ? s.nombre : 'Servicio eliminado')} — ${esc(c.nombre)}</p>
          <p class="text-sm text-tinta-500">${esc(c.email)} · ${esc(c.telefono)}</p>
          ${c.mensaje ? `<p class="text-sm mt-1 italic text-tinta-500">“${esc(c.mensaje)}”</p>` : ''}
        </div>
        <div class="cita-acciones">
          ${c.estado !== 'confirmada' ? `<button class="btn btn-primario btn-chico" data-accion="estado" data-id="${esc(c.id)}" data-valor="confirmada">Confirmar</button>` : ''}
          ${c.estado !== 'cancelada' ? `<button class="btn btn-secundario btn-chico" data-accion="estado" data-id="${esc(c.id)}" data-valor="cancelada">Cancelar</button>` : ''}
          <a class="btn btn-secundario btn-chico" href="${esc(wa)}" target="_blank" rel="noopener">WhatsApp</a>
          <button class="btn btn-peligro btn-chico" data-accion="borrar-cita" data-id="${esc(c.id)}" aria-label="Eliminar cita de ${esc(c.nombre)}">Eliminar</button>
        </div>
      </li>`;
    }).join('') || '<li class="text-tinta-500 py-6 text-center">No hay citas en esta vista.</li>';
  }

  el('filtro-citas').addEventListener('change', e => { filtroCitas = e.target.value; dibujarCitas(); });

  el('lista-citas').addEventListener('click', e => {
    const b = e.target.closest('[data-accion]');
    if (!b) return;
    if (b.dataset.accion === 'estado') {
      seguro(async () => { await Nucleo.cambiarEstado(b.dataset.id, b.dataset.valor); await dibujarCitas(); }, 'Cita actualizada.');
    } else if (b.dataset.accion === 'borrar-cita' && confirm('¿Eliminar esta cita definitivamente?')) {
      seguro(async () => { await Nucleo.eliminarCita(b.dataset.id); await dibujarCitas(); }, 'Cita eliminada.');
    }
  });

  // ---------- Servicios ----------
  /** Formulario de edición de un servicio (o uno vacío para crear). */
  function formServicio(s = {}) {
    const nuevo = !s.id;
    const p = nuevo ? 'nuevo' : s.id;
    return `
    <form class="tarjeta p-5 grid gap-3 md:grid-cols-2" data-servicio="${esc(s.id || '')}" novalidate>
      <div class="campo"><label for="n-${p}">Nombre</label><input id="n-${p}" name="nombre" value="${esc(s.nombre || '')}" required></div>
      <div class="grid grid-cols-2 gap-3">
        <div class="campo"><label for="p-${p}">Precio (CLP)</label><input id="p-${p}" name="precio" type="number" min="0" step="500" value="${esc(s.precio ?? '')}" required></div>
        <div class="campo"><label for="d-${p}">Duración (min)</label><input id="d-${p}" name="duracionMin" type="number" min="5" step="5" value="${esc(s.duracionMin ?? 60)}" required></div>
      </div>
      <div class="campo md:col-span-2"><label for="t-${p}">Descripción</label><textarea id="t-${p}" name="descripcion" rows="2" maxlength="300">${esc(s.descripcion || '')}</textarea></div>
      <div class="md:col-span-2 flex flex-wrap items-center gap-3 justify-between">
        <label class="interruptor"><input type="checkbox" name="activo" ${s.activo !== false ? 'checked' : ''}> Visible en la web</label>
        <div class="flex gap-2">
          ${nuevo ? '' : `<button type="button" class="btn btn-peligro btn-chico" data-accion="borrar-servicio">Eliminar</button>`}
          <button type="submit" class="btn btn-primario btn-chico">${nuevo ? 'Agregar servicio' : 'Guardar cambios'}</button>
        </div>
      </div>
    </form>`;
  }

  async function dibujarServicios() {
    const lista = await Nucleo.servicios();
    el('lista-servicios').innerHTML = lista.map(formServicio).join('') + `<h3 class="font-semibold mt-4">Nuevo servicio</h3>` + formServicio();
  }

  el('lista-servicios').addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target;
    seguro(async () => {
      await Nucleo.guardarServicio({
        id: f.dataset.servicio || null, nombre: f.nombre.value, precio: f.precio.value,
        duracionMin: f.duracionMin.value, descripcion: f.descripcion.value, activo: f.activo.checked
      });
      await dibujarServicios();
    }, 'Servicio guardado.');
  });

  el('lista-servicios').addEventListener('click', e => {
    const b = e.target.closest('[data-accion="borrar-servicio"]');
    if (!b || !confirm('¿Eliminar este servicio? Las citas existentes se conservan.')) return;
    seguro(async () => { await Nucleo.eliminarServicio(b.closest('form').dataset.servicio); await dibujarServicios(); }, 'Servicio eliminado.');
  });

  // ---------- Horarios ----------
  async function dibujarHorarios() {
    const disp = await Nucleo.disponibilidad();
    el('dias-atencion').innerHTML = [1, 2, 3, 4, 5, 6, 0].map(d =>
      `<label class="dia-chip"><input type="checkbox" name="dia" value="${d}" ${disp.dias.includes(d) ? 'checked' : ''}> ${NOMBRES_DIA[d]}</label>`).join('');
    el('horas-atencion').innerHTML = HORAS_POSIBLES.map(h =>
      `<label class="hora-chip"><input type="checkbox" name="hora" value="${h}" ${disp.horas.includes(h) ? 'checked' : ''}> ${h}</label>`).join('');
  }

  el('form-horarios').addEventListener('submit', e => {
    e.preventDefault();
    const marcados = nombre => [...e.target.querySelectorAll(`[name=${nombre}]:checked`)].map(i => i.value);
    seguro(() => Nucleo.guardarDisponibilidad(marcados('dia').map(Number), marcados('hora')), 'Horarios guardados.');
  });

  // ---------- Pestañas ----------
  document.querySelector('.pestanas').addEventListener('click', e => {
    const b = e.target.closest('[role=tab]');
    if (!b) return;
    document.querySelectorAll('[role=tab]').forEach(t => t.setAttribute('aria-selected', String(t === b)));
    document.querySelectorAll('[role=tabpanel]').forEach(p => { p.hidden = p.id !== b.getAttribute('aria-controls'); });
  });

  // ---------- Ajustes ----------
  el('btn-reiniciar').addEventListener('click', () => {
    if (!confirm('Se borrarán todos los cambios y volverán los datos de ejemplo. ¿Continuar?')) return;
    seguro(async () => { await Nucleo.reiniciar(); await dibujarTodo(); }, 'Demo restablecida.');
  });

  el('btn-salir').addEventListener('click', () => {
    try { sessionStorage.removeItem(CLAVE_SESION); } catch { /* nada que limpiar */ }
    location.reload();
  });

  iniciarPin();
})();
