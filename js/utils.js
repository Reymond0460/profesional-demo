/*
 * utils.js — utilidades sin estado: fechas, moneda, escape de HTML y avisos en pantalla.
 * Las fechas se manejan como texto 'AAAA-MM-DD' para evitar problemas de zona horaria.
 */
const Utils = {
  /** Escapa texto del usuario antes de insertarlo en HTML. */
  esc(valor) {
    return String(valor ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  },

  /** Convierte un Date local a 'AAAA-MM-DD'. */
  aTexto(fecha) {
    const m = String(fecha.getMonth() + 1).padStart(2, '0');
    const d = String(fecha.getDate()).padStart(2, '0');
    return `${fecha.getFullYear()}-${m}-${d}`;
  },

  /** Convierte 'AAAA-MM-DD' a Date local (a las 12:00 para esquivar cambios de hora). */
  aFecha(texto) {
    const [a, m, d] = texto.split('-').map(Number);
    return new Date(a, m - 1, d, 12);
  },

  /** Fecha de hoy como 'AAAA-MM-DD'. */
  hoy() { return Utils.aTexto(new Date()); },

  /** Suma (o resta) días a una fecha 'AAAA-MM-DD'. */
  sumarDias(texto, dias) {
    const f = Utils.aFecha(texto);
    f.setDate(f.getDate() + dias);
    return Utils.aTexto(f);
  },

  /** Día de la semana de una fecha 'AAAA-MM-DD' (0 = domingo). */
  diaSemana(texto) { return Utils.aFecha(texto).getDay(); },

  /** Ejemplo: "martes 12 de mayo". */
  fechaLarga(texto) {
    return Utils.aFecha(texto).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
  },

  /** Abreviaturas para la grilla de días. */
  fechaCorta(texto) {
    const f = Utils.aFecha(texto);
    return {
      dia: f.toLocaleDateString('es-CL', { weekday: 'short' }).replace('.', ''),
      numero: f.getDate(),
      mes: f.toLocaleDateString('es-CL', { month: 'short' }).replace('.', '')
    };
  },

  /** Formatea pesos chilenos: 25000 -> "$25.000". */
  moneda(n) {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);
  },

  /** Genera un identificador corto y único. */
  uid(prefijo = 'id') { return `${prefijo}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`; },

  /** Muestra un aviso temporal. tipo: 'info' | 'ok' | 'error'. */
  avisar(texto, tipo = 'info') {
    let cont = document.getElementById('avisos');
    if (!cont) {
      cont = document.createElement('div');
      cont.id = 'avisos';
      cont.className = 'avisos';
      cont.setAttribute('role', 'status');
      document.body.appendChild(cont);
    }
    const el = document.createElement('div');
    el.className = `aviso ${tipo === 'error' ? 'aviso-error' : tipo === 'ok' ? 'aviso-ok' : ''}`;
    if (tipo === 'error') el.setAttribute('role', 'alert');
    el.textContent = texto;
    cont.appendChild(el);
    setTimeout(() => el.remove(), 4500);
  }
};
