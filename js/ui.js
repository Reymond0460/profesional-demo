/*
 * ui.js — piezas de interfaz comunes a todas las páginas:
 * datos de marca, enlaces de WhatsApp, aviso de cookies, animaciones y modales.
 */
const UI = {
  /** Rellena los textos de marca y los enlaces de WhatsApp del HTML. */
  aplicarMarca() {
    document.querySelectorAll('[data-marca]').forEach(el => {
      const valor = CONFIG.marca[el.dataset.marca];
      if (valor !== undefined) el.textContent = valor;
    });
    document.querySelectorAll('[data-wa]').forEach(el => {
      el.href = Nucleo.enlaceWhatsApp(el.dataset.wa || `Hola ${CONFIG.marca.nombre}, quisiera más información.`);
      el.target = '_blank';
      el.rel = 'noopener';
    });
    document.querySelectorAll('[data-mailto]').forEach(el => { el.href = `mailto:${CONFIG.marca.email}`; });
  },

  /** Aviso de cookies: se recuerda la aceptación en localStorage (con try/catch por si está bloqueado). */
  iniciarCookies() {
    const clave = CONFIG.prefijoAlmacenamiento + 'cookies';
    let aceptado = false;
    try { aceptado = localStorage.getItem(clave) === '1'; } catch { /* sin acceso: se vuelve a preguntar */ }
    if (aceptado) return;

    const aviso = document.createElement('div');
    aviso.className = 'cookies';
    aviso.setAttribute('role', 'region');
    aviso.setAttribute('aria-label', 'Aviso de cookies');
    aviso.innerHTML = `
      <p class="flex-1 min-w-[200px]">Usamos almacenamiento del navegador para que el sitio funcione.
        <a class="underline text-marca-700" href="cookies.html">Más información</a>.</p>
      <button type="button" class="btn btn-primario btn-chico">Aceptar</button>`;
    aviso.querySelector('button').addEventListener('click', () => {
      try { localStorage.setItem(clave, '1'); } catch { /* sin acceso: no se recuerda */ }
      aviso.remove();
    });
    document.body.appendChild(aviso);
  },

  /** Hace aparecer los bloques con clase .aparece al entrar en pantalla. */
  iniciarAnimaciones() {
    const bloques = document.querySelectorAll('.aparece');
    if (!('IntersectionObserver' in window)) { bloques.forEach(b => b.classList.add('visible')); return; }
    const obs = new IntersectionObserver(entradas => {
      entradas.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.12 });
    bloques.forEach(b => obs.observe(b));
  },

  /** Menú móvil del encabezado (botón con aria-expanded). */
  iniciarMenu() {
    const boton = document.getElementById('menu-boton');
    const menu = document.getElementById('menu-movil');
    if (!boton || !menu) return;
    boton.addEventListener('click', () => {
      const abierto = menu.hidden;
      menu.hidden = !abierto;
      boton.setAttribute('aria-expanded', String(abierto));
    });
    menu.addEventListener('click', e => {
      if (e.target.closest('a')) { menu.hidden = true; boton.setAttribute('aria-expanded', 'false'); }
    });
  },

  /**
   * Abre un modal ya presente en el HTML. Por defecto se cierra con Esc y clic afuera;
   * con { cerrable: false } solo se cierra por código (usado por el PIN del panel).
   */
  abrirModal(id, { cerrable = true } = {}) {
    const modal = document.getElementById(id);
    modal.hidden = false;
    const foco = modal.querySelector('[autofocus], input, button');
    if (foco) foco.focus();
    if (cerrable) {
      modal.onclick = e => { if (e.target === modal) UI.cerrarModal(id); };
      modal.onkeydown = e => { if (e.key === 'Escape') UI.cerrarModal(id); };
    } else {
      modal.onclick = null;
      modal.onkeydown = e => { if (e.key === 'Escape') e.preventDefault(); };
    }
  },
  cerrarModal(id) { document.getElementById(id).hidden = true; },

  /** Arranque común de todas las páginas. */
  iniciar() {
    this.aplicarMarca();
    this.iniciarCookies();
    this.iniciarAnimaciones();
    this.iniciarMenu();
  }
};

document.addEventListener('DOMContentLoaded', () => UI.iniciar());
