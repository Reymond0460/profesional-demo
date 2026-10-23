/*
 * nucleo.js — estado y reglas de negocio (disponibilidad, validación de citas).
 * No toca el DOM ni el almacenamiento directamente: todo dato pasa por Repo.
 * En un backend real, el servidor DEBE repetir estas validaciones (ver docs/API.md).
 */
const Nucleo = {
  ESTADOS: ['pendiente', 'confirmada', 'cancelada'],

  /** Crea los datos iniciales la primera vez que se abre la demo. */
  async iniciar() {
    if (!(await Repo.obtener('servicios'))) await Repo.guardar('servicios', CONFIG.serviciosIniciales);
    if (!(await Repo.obtener('testimonios'))) await Repo.guardar('testimonios', CONFIG.testimoniosIniciales);
    if (!(await Repo.obtener('disponibilidad'))) await Repo.guardar('disponibilidad', CONFIG.disponibilidadInicial);
    if (!(await Repo.obtener('citas'))) await Repo.guardar('citas', await this._citasDeEjemplo());
  },

  /** Convierte las citas de ejemplo (días relativos) en fechas reales que caigan en días hábiles. */
  async _citasDeEjemplo() {
    const disp = await Repo.obtener('disponibilidad');
    return CONFIG.citasIniciales.map(c => {
      let fecha = Utils.sumarDias(Utils.hoy(), c.diasDesdeHoy);
      while (!disp.dias.includes(Utils.diaSemana(fecha))) fecha = Utils.sumarDias(fecha, 1);
      const { diasDesdeHoy, ...resto } = c;
      return { ...resto, id: Utils.uid('c'), fecha, creada: new Date().toISOString() };
    });
  },

  /** Restablece la demo al estado inicial. */
  async reiniciar() {
    await Repo.borrarTodo();
    await this.iniciar();
  },

  // ---------- Lecturas ----------
  async servicios(soloActivos = false) {
    const lista = (await Repo.obtener('servicios')) || [];
    return soloActivos ? lista.filter(s => s.activo) : lista;
  },
  async testimonios() { return (await Repo.obtener('testimonios')) || []; },
  async disponibilidad() { return (await Repo.obtener('disponibilidad')) || CONFIG.disponibilidadInicial; },
  async citas() {
    const lista = (await Repo.obtener('citas')) || [];
    return lista.sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));
  },

  // ---------- Disponibilidad ----------
  /** Horas libres de una fecha (vacío si el día no se atiende, ya pasó o está fuera de rango). */
  async horasLibres(fecha) {
    const hoy = Utils.hoy();
    const limite = Utils.sumarDias(hoy, CONFIG.diasAgendables);
    if (fecha < hoy || fecha > limite) return [];
    const disp = await this.disponibilidad();
    if (!disp.dias.includes(Utils.diaSemana(fecha))) return [];

    const ocupadas = (await this.citas()).filter(c => c.fecha === fecha && c.estado !== 'cancelada').map(c => c.hora);
    const ahora = new Date().toTimeString().slice(0, 5);
    return disp.horas.filter(h => !ocupadas.includes(h) && (fecha > hoy || h > ahora));
  },

  /** Lista de los próximos días agendables, indicando cuántas horas libres tiene cada uno. */
  async diasAgendables() {
    const hoy = Utils.hoy();
    const dias = [];
    for (let i = 0; i <= CONFIG.diasAgendables; i++) {
      const fecha = Utils.sumarDias(hoy, i);
      dias.push({ fecha, libres: (await this.horasLibres(fecha)).length });
    }
    return dias;
  },

  // ---------- Citas ----------
  /** Valida y crea una cita pendiente. Lanza Error con un mensaje claro si algo no cuadra. */
  async crearCita(datos) {
    const nombre = String(datos.nombre || '').trim();
    const email = String(datos.email || '').trim();
    const telefono = String(datos.telefono || '').trim();
    const mensaje = String(datos.mensaje || '').trim().slice(0, 500);

    const servicio = (await this.servicios(true)).find(s => s.id === datos.servicioId);
    if (!servicio) throw new Error('Elija un servicio válido.');
    if (nombre.length < 2) throw new Error('Ingrese su nombre.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Ingrese un correo válido.');
    if (telefono.replace(/\D/g, '').length < 8) throw new Error('Ingrese un teléfono válido (mínimo 8 dígitos).');
    if (!(await this.horasLibres(datos.fecha)).includes(datos.hora)) {
      throw new Error('Ese horario ya no está disponible. Elija otro.');
    }

    const cita = {
      id: Utils.uid('c'), servicioId: servicio.id, fecha: datos.fecha, hora: datos.hora,
      nombre, email, telefono, mensaje, estado: 'pendiente', creada: new Date().toISOString()
    };
    await Repo.crearCita(cita);
    return cita;
  },

  /** Cambia el estado de una cita (pendiente / confirmada / cancelada). */
  async cambiarEstado(id, estado) {
    if (!this.ESTADOS.includes(estado)) throw new Error('Estado inválido.');
    const lista = (await Repo.obtener('citas')) || [];
    const cita = lista.find(c => c.id === id);
    if (!cita) throw new Error('No se encontró la cita.');
    cita.estado = estado;
    await Repo.guardar('citas', lista);
  },

  async eliminarCita(id) {
    const lista = (await Repo.obtener('citas')) || [];
    await Repo.guardar('citas', lista.filter(c => c.id !== id));
  },

  // ---------- Administración de servicios y horarios ----------
  /** Guarda un servicio nuevo o existente, validando precio y duración. */
  async guardarServicio(datos) {
    const nombre = String(datos.nombre || '').trim();
    const precio = Number(datos.precio);
    const duracionMin = Number(datos.duracionMin);
    if (nombre.length < 2) throw new Error('El servicio necesita un nombre.');
    if (!Number.isFinite(precio) || precio < 0) throw new Error('El precio debe ser un número igual o mayor a 0.');
    if (!Number.isFinite(duracionMin) || duracionMin < 5) throw new Error('La duración mínima es de 5 minutos.');

    const lista = await this.servicios();
    const nuevo = {
      id: datos.id || Utils.uid('s'), nombre, precio, duracionMin,
      descripcion: String(datos.descripcion || '').trim().slice(0, 300), activo: !!datos.activo
    };
    const i = lista.findIndex(s => s.id === nuevo.id);
    if (i >= 0) lista[i] = nuevo; else lista.push(nuevo);
    await Repo.guardar('servicios', lista);
    return nuevo;
  },

  async eliminarServicio(id) {
    const lista = await this.servicios();
    await Repo.guardar('servicios', lista.filter(s => s.id !== id));
  },

  /** Guarda días y horas de atención. */
  async guardarDisponibilidad(dias, horas) {
    const formatoHora = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (!dias.length) throw new Error('Marque al menos un día de atención.');
    if (!horas.length) throw new Error('Agregue al menos una hora de atención.');
    if (horas.some(h => !formatoHora.test(h))) throw new Error('Alguna hora no es válida (use HH:MM).');
    const unicas = [...new Set(horas)].sort();
    await Repo.guardar('disponibilidad', { dias: [...dias].sort(), horas: unicas });
  },

  // ---------- WhatsApp ----------
  /** Enlace de WhatsApp con un mensaje ya escrito. */
  enlaceWhatsApp(texto) {
    return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(texto)}`;
  },

  /** Texto para que el cliente confirme su solicitud de cita por WhatsApp. */
  mensajeCita(cita, servicio) {
    return `Hola ${CONFIG.marca.nombre}, soy ${cita.nombre}. Quiero confirmar mi solicitud de "${servicio.nombre}" para el ${Utils.fechaLarga(cita.fecha)} a las ${cita.hora}.`;
  }
};
