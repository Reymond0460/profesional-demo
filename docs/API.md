# Contrato del backend (docs/API.md)

La demo guarda todo en `localStorage` mediante `LocalRepo`. Para producción, `js/repo.js` incluye `RemoteRepo`
(esqueleto). Se activa cambiando **una línea**: `const Repo = new RemoteRepo('https://api.cliente.cl');`

## Endpoints

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/servicios` | público | Lista de servicios (solo los `activo: true` para visitantes). |
| PUT | `/servicios` | admin | Reemplaza la lista completa. |
| GET | `/testimonios` | público | Testimonios publicados. |
| GET | `/disponibilidad` | público | `{ dias: [1..5], horas: ["09:00", ...] }` |
| PUT | `/disponibilidad` | admin | Guarda días y horas de atención. |
| GET | `/citas` | admin | Lista completa de citas (con datos personales). |
| POST | `/citas` | público | Crea una cita `pendiente`. |
| PUT | `/citas` | admin | Reemplaza la lista (cambios de estado, eliminaciones). |

Errores: respuesta con código HTTP 4xx/5xx y cuerpo `{ "mensaje": "texto para mostrar al usuario" }`.

## Modelos

```json
// Servicio
{ "id": "s1", "nombre": "Primera consulta", "descripcion": "...", "duracionMin": 45, "precio": 25000, "activo": true }

// Cita (fecha como texto AAAA-MM-DD, hora HH:MM)
{ "id": "c_x", "servicioId": "s1", "fecha": "2026-05-12", "hora": "10:00",
  "nombre": "...", "email": "...", "telefono": "...", "mensaje": "...",
  "estado": "pendiente | confirmada | cancelada", "creada": "ISO-8601" }
```

## Qué debe validar el servidor (nunca confiar en el navegador)

- **Servicio:** que exista y esté activo; el **precio y la duración los define el servidor**, no el cliente.
- **Disponibilidad:** que el día esté habilitado, dentro del rango de días agendables y que la hora no esté ocupada
  por otra cita no cancelada (transacción para evitar doble reserva). Una hora ocupada es `[fecha, hora]`.
- **Datos:** nombre (mín. 2 caracteres), correo con formato válido, teléfono con al menos 8 dígitos, mensaje máx. 500.
- **Id y estado:** el servidor asigna `id`, `creada` y fuerza `estado = "pendiente"` en `POST /citas`.
- **Pagos (si se agregan):** confirmar siempre por **webhook** del proveedor de pago, nunca por lo que informe el navegador.
- Limitar la frecuencia de `POST /citas` (anti-spam) y sanitizar los textos.

## Privacidad

- Los datos de clientes (`/citas`) **jamás** deben estar en la web pública: solo accesibles con autenticación de administrador.
- El PIN `1234` del panel es solo de demostración. En producción se reemplaza por autenticación real en el servidor
  (sesión o token), y `admin.html` debe protegerse con ella.
- No guardar claves ni tokens en el código del navegador.
