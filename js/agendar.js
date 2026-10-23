/*
 * agendar.js — página agendar.html: el cliente elige servicio, día, hora y deja sus datos.
 * La cita queda "pendiente" y puede enviarse por WhatsApp para confirmarla.
 */
(async function () {
  await Nucleo.iniciar();
  const { esc, moneda, fechaLarga, fechaCorta } = Utils;

  const el = id => document.getElementById(id);
  const estado = { servicioId: null, fecha: null, hora: null };
  let servicios = [];

  /** Bloquea o libera un paso visualmente. */
  function bloquear(id, bloqueado) {
    el(id).classList.toggle('paso-bloqueado', bloqueado);
    el(id).toggleAttribute('inert', bloqueado);
  }

  // ---------- Paso 1: servicio ----------
  function dibujarServicios() {
    el('opciones-servicio').innerHTML = servicios.map(s => `
      <button type="button" class="opcion" data-servicio="${esc(s.id)}" aria-pressed="${s.id === estado.servicioId}">
        <strong class="block">${esc(s.nombre)}</strong>
        <span class="text-sm text-tinta-500">${esc(s.duracionMin)} min · ${moneda(s.precio)}</span>
      </button>`).join('');
  }

  // ---------- Paso 2: día ----------
  async function dibujarDias() {
    const dias = await Nucleo.diasAgendables();
    el('opciones-dia').innerHTML = dias.map(d => {
      const c = fechaCorta(d.fecha);
      return `<button type="button" class="celda" data-fecha="${d.fecha}" aria-pressed="${d.fecha === estado.fecha}"
          ${d.libres ? '' : 'disabled'} aria-label="${esc(fechaLarga(d.fecha))}${d.libres ? '' : ', sin horas disponibles'}">
        <span class="capitalize">${esc(c.dia)}</span><strong>${c.numero}</strong><span>${esc(c.mes)}</span>
      </button>`;
    }).join('');
  }

  // ---------- Paso 3: hora ----------
  async function dibujarHoras() {
    const horas = await Nucleo.horasLibres(estado.fecha);
    el('opciones-hora').innerHTML = horas.map(h => `
      <button type="button" class="celda" data-hora="${h}" aria-pressed="${h === estado.hora}"><strong>${h}</strong></button>`).join('')
      || '<p class="text-tinta-500 col-span-full">No quedan horas libres ese día.</p>';
  }

  /** Muestra el resumen de lo elegido sobre el formulario. */
  function dibujarResumen() {
    const s = servicios.find(x => x.id === estado.servicioId);
    el('resumen').textContent = s && estado.fecha && estado.hora
      ? `${s.nombre} · ${fechaLarga(estado.fecha)} a las ${estado.hora} · ${moneda(s.precio)}`
      : '';
  }

  // ---------- Eventos (delegación) ----------
  el('opciones-servicio').addEventListener('click', async e => {
    const b = e.target.closest('[data-servicio]');
    if (!b) return;
    estado.servicioId = b.dataset.servicio;
    estado.fecha = estado.hora = null;
    dibujarServicios();
    await dibujarDias();
    el('opciones-hora').innerHTML = '';
    bloquear('paso-dia', false);
    bloquear('paso-hora', true);
    bloquear('paso-datos', true);
    dibujarResumen();
  });

  el('opciones-dia').addEventListener('click', async e => {
    const b = e.target.closest('[data-fecha]');
    if (!b || b.disabled) return;
    estado.fecha = b.dataset.fecha;
    estado.hora = null;
    await dibujarDias();
    await dibujarHoras();
    bloquear('paso-hora', false);
    bloquear('paso-datos', true);
    dibujarResumen();
  });

  el('opciones-hora').addEventListener('click', async e => {
    const b = e.target.closest('[data-hora]');
    if (!b) return;
    estado.hora = b.dataset.hora;
    await dibujarHoras();
    bloquear('paso-datos', false);
    dibujarResumen();
  });

  /** Marca un campo con error y lo anuncia a lectores de pantalla. */
  function mostrarError(texto) {
    const caja = el('error-form');
    caja.textContent = texto;
    caja.hidden = !texto;
  }

  el('form-cita').addEventListener('submit', async e => {
    e.preventDefault();
    mostrarError('');
    const f = e.target;
    ['nombre', 'email', 'telefono'].forEach(n => f[n].removeAttribute('aria-invalid'));
    const boton = f.querySelector('[type=submit]');
    boton.disabled = true;
    try {
      const cita = await Nucleo.crearCita({
        servicioId: estado.servicioId, fecha: estado.fecha, hora: estado.hora,
        nombre: f.nombre.value, email: f.email.value, telefono: f.telefono.value, mensaje: f.mensaje.value
      });
      mostrarConfirmacion(cita);
    } catch (err) {
      mostrarError(err.message);
      const campo = { 'nombre': 'nombre', 'correo': 'email', 'teléfono': 'telefono' };
      Object.entries(campo).forEach(([palabra, nombre]) => {
        if (err.message.toLowerCase().includes(palabra)) f[nombre].setAttribute('aria-invalid', 'true');
      });
      // Si el horario se ocupó mientras tanto, se refrescan las horas
      if (err.message.includes('horario')) { estado.hora = null; await dibujarHoras(); bloquear('paso-datos', true); dibujarResumen(); }
    } finally {
      boton.disabled = false;
    }
  });

  function mostrarConfirmacion(cita) {
    const s = servicios.find(x => x.id === cita.servicioId);
    el('flujo').hidden = true;
    el('confirmacion').hidden = false;
    el('confirmacion-detalle').innerHTML = `
      <strong>${esc(s.nombre)}</strong><br>${esc(fechaLarga(cita.fecha))} a las ${esc(cita.hora)}<br>
      <span class="text-tinta-500">${esc(cita.nombre)} · ${esc(cita.email)}</span>`;
    el('btn-confirmar-wa').href = Nucleo.enlaceWhatsApp(Nucleo.mensajeCita(cita, s));
    el('confirmacion').scrollIntoView({ behavior: 'smooth', block: 'start' });
    el('confirmacion').focus();
  }

  // ---------- Arranque ----------
  servicios = await Nucleo.servicios(true);
  const previo = new URLSearchParams(location.search).get('servicio');
  if (servicios.some(s => s.id === previo)) estado.servicioId = previo;
  dibujarServicios();
  bloquear('paso-dia', true);
  bloquear('paso-hora', true);
  bloquear('paso-datos', true);
  if (estado.servicioId) {
    await dibujarDias();
    bloquear('paso-dia', false);
  }
})();
