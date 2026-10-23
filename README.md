# Demo TiforTi · Profesional independiente

Maqueta genérica de sitio web para profesionales independientes (abogados, psicólogos, contadores, consultores…).
Capta clientes con una agenda de consultas en línea y confirmación por WhatsApp. Incluye panel de administración.
Sitio estático, sin frameworks: HTML + Tailwind 3 (compilado) + JavaScript simple.

## Estructura

```
index.html                    Sitio público (portada, servicios, testimonios, FAQ, contacto)
agendar.html                  Reserva de consultas (servicio → día → hora → datos)
admin.html                    Panel (PIN de demo: 1234): citas, servicios, horarios, ajustes
politica-de-privacidad.html   Páginas legales (texto de ejemplo)
cookies.html
terminos.html
css/estilos.css               Importa los módulos 01..04 (tiene el índice "qué cambia qué")
css/tailwind.css              GENERADO (npm run css). No editar.
js/config.js                  Marca, WhatsApp, PIN y datos iniciales (sin lógica)
js/utils.js                   Fechas, moneda, escape de HTML, avisos
js/repo.js                    ÚNICO lugar que guarda/lee datos (LocalRepo / RemoteRepo)
js/nucleo.js                  Reglas de negocio (disponibilidad, validación de citas)
js/ui.js                      Cookies, menú, animaciones, modales
js/inicio.js · agendar.js · admin.js    Un archivo por página
docs/API.md                   Contrato del backend
docs/logos.html               Propuestas de logo (A, B, C)
```

## Cómo probar

```bash
npm install        # una sola vez
npm run css        # compila Tailwind
npm run servir     # http://localhost:5500
```

Mientras diseña: `npm run css:watch`.

## Cómo cambiar estilos

- Colores y tipografías de marca: `tailwind.config.js` y las variables de `css/01-base.css`; luego `npm run css`.
- Componentes (botones, tarjetas, modal): `css/02-componentes.css`. Secciones: `css/03-secciones.css`. Panel: `css/04-admin.css`.
- Logo: `img/logo.svg` y `img/favicon.svg` (alternativas en `docs/logos.html`).

## Antes de entregar a un cliente real

- [ ] Cambiar `whatsapp` en `js/config.js` (hoy es el número de relleno `56900000000`).
- [ ] Reemplazar nombre, rubro, contacto, textos, servicios, fotos y logo.
- [ ] Hacer revisar los textos legales por un abogado.
- [ ] Reemplazar el PIN `1234` por autenticación real y pasar a backend (`docs/API.md`, una línea en `js/repo.js`).
- [ ] Definir el id del proyecto en `.firebaserc`.
- [ ] Quitar el botón "Restablecer demo" y el enlace "Panel (demo)" del pie.

## Datos de la demo

Viven en el `localStorage` de cada visitante; "Restablecer demo" (panel → Ajustes) los devuelve al estado inicial.
Las fechas de las citas de ejemplo se calculan respecto a hoy.
