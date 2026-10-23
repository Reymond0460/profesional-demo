/*
 * repo.js — ÚNICO lugar que guarda y lee datos.
 *
 * Para pasar a backend real, cambie la última línea:
 *     const Repo = new LocalRepo();   →   const Repo = new RemoteRepo('https://api.cliente.cl');
 * El contrato de los endpoints está en docs/API.md.
 *
 * Colecciones: 'servicios', 'citas', 'disponibilidad', 'testimonios'.
 */

/** Repositorio de DEMO: guarda en localStorage del navegador (cada visitante ve sus propios datos). */
class LocalRepo {
  constructor() {
    this.memoria = {}; // Respaldo si localStorage no está disponible (modo privado, bloqueado)
  }

  /** Devuelve la colección guardada, o null si aún no existe. */
  async obtener(coleccion) {
    const clave = CONFIG.prefijoAlmacenamiento + coleccion;
    try {
      const crudo = localStorage.getItem(clave);
      return crudo ? JSON.parse(crudo) : null;
    } catch {
      return this.memoria[clave] ?? null;
    }
  }

  /** Reemplaza una colección completa. Lanza Error con aviso claro si el almacenamiento está lleno. */
  async guardar(coleccion, datos) {
    const clave = CONFIG.prefijoAlmacenamiento + coleccion;
    try {
      localStorage.setItem(clave, JSON.stringify(datos));
    } catch (e) {
      const llena = e && (e.name === 'QuotaExceededError' || e.code === 22);
      if (llena) throw new Error('El almacenamiento del navegador está lleno. Restablezca la demo o libere espacio.');
      this.memoria[clave] = datos; // localStorage bloqueado: se mantiene solo mientras la pestaña esté abierta
    }
    return datos;
  }

  /** Agrega una cita. (En un backend real, el servidor valida y asigna el id.) */
  async crearCita(cita) {
    const citas = (await this.obtener('citas')) || [];
    citas.push(cita);
    await this.guardar('citas', citas);
    return cita;
  }

  /** Borra todos los datos de la demo. */
  async borrarTodo() {
    ['servicios', 'citas', 'disponibilidad', 'testimonios'].forEach(c => {
      const clave = CONFIG.prefijoAlmacenamiento + c;
      delete this.memoria[clave];
      try { localStorage.removeItem(clave); } catch { /* sin acceso: nada que borrar */ }
    });
  }
}

/** Repositorio REAL (esqueleto): habla con una API REST. Ver docs/API.md. */
class RemoteRepo {
  constructor(urlBase) { this.urlBase = urlBase.replace(/\/$/, ''); }

  /** Petición genérica con manejo de errores. */
  async _pedir(ruta, opciones = {}) {
    const resp = await fetch(this.urlBase + ruta, {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      ...opciones
    });
    if (!resp.ok) {
      const cuerpo = await resp.json().catch(() => ({}));
      throw new Error(cuerpo.mensaje || `Error del servidor (${resp.status})`);
    }
    return resp.status === 204 ? null : resp.json();
  }

  obtener(coleccion) { return this._pedir(`/${coleccion}`); }
  guardar(coleccion, datos) { return this._pedir(`/${coleccion}`, { method: 'PUT', body: JSON.stringify(datos) }); }
  crearCita(cita) { return this._pedir('/citas', { method: 'POST', body: JSON.stringify(cita) }); }
  borrarTodo() { return Promise.resolve(); } // No aplica en producción
}

const Repo = new LocalRepo();
