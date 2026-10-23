/*
 * config.js — marca, contacto y datos iniciales de la demo. SIN lógica.
 * Es el primer archivo que se edita al personalizar la web para un cliente real.
 */
const CONFIG = {
  marca: {
    nombre: 'Mariana Soto',
    rubro: 'Consultoría Profesional',
    eslogan: 'Asesoría clara y cercana para tomar mejores decisiones.',
    iniciales: 'MS',
    email: 'contacto@marianasoto.example',
    telefono: '+56 9 0000 0000',
    ciudad: 'Santiago, Chile',
    horarioTexto: 'Lunes a viernes, 09:00 a 18:00'
  },

  // ⚠ NÚMERO DE RELLENO: cambiar por el WhatsApp real (código de país, sin "+" ni espacios).
  whatsapp: '56900000000',

  // PIN del panel de administración (solo demo; se muestra en pantalla).
  pinAdmin: '1234',

  // Prefijo de las claves en localStorage (cambiar si se publican dos demos en el mismo dominio).
  prefijoAlmacenamiento: 'pi_demo_v1_',

  // Cuántos días hacia adelante se puede agendar.
  diasAgendables: 14,

  // Disponibilidad inicial. Días: 0 = domingo ... 6 = sábado.
  disponibilidadInicial: {
    dias: [1, 2, 3, 4, 5],
    horas: ['09:00', '10:00', '11:00', '12:00', '15:00', '16:00', '17:00']
  },

  serviciosIniciales: [
    { id: 's1', nombre: 'Primera consulta', descripcion: 'Conversamos sobre tu situación, objetivos y los pasos recomendados. Ideal para empezar.', duracionMin: 45, precio: 25000, activo: true },
    { id: 's2', nombre: 'Asesoría puntual', descripcion: 'Resolvemos una duda o decisión específica con un informe breve de recomendaciones.', duracionMin: 60, precio: 45000, activo: true },
    { id: 's3', nombre: 'Acompañamiento mensual', descripcion: 'Sesiones de seguimiento y soporte continuo para llevar tu proyecto a buen puerto.', duracionMin: 60, precio: 120000, activo: true }
  ],

  testimoniosIniciales: [
    { id: 't1', nombre: 'Carolina Vidal', cargo: 'Emprendedora', foto: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=160&q=70', texto: 'Salí de la primera sesión con un plan concreto. Explica todo con claridad y sin tecnicismos.' },
    { id: 't2', nombre: 'Andrés Fuentes', cargo: 'Dueño de pyme', foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=70', texto: 'Muy puntual y profesional. En una hora resolvimos algo que llevaba meses postergando.' },
    { id: 't3', nombre: 'Paula Herrera', cargo: 'Profesional independiente', foto: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=160&q=70', texto: 'El acompañamiento mensual me dio orden y tranquilidad. Totalmente recomendable.' }
  ],

  // Citas de ejemplo. "diasDesdeHoy" se convierte en fecha real al iniciar la demo.
  citasIniciales: [
    { servicioId: 's1', diasDesdeHoy: 1, hora: '10:00', nombre: 'Javiera Morales', email: 'javiera@ejemplo.test', telefono: '+56 9 1111 2222', mensaje: 'Quiero ordenar mis finanzas personales.', estado: 'confirmada' },
    { servicioId: 's2', diasDesdeHoy: 2, hora: '15:00', nombre: 'Tomás Rivas', email: 'tomas@ejemplo.test', telefono: '+56 9 3333 4444', mensaje: 'Necesito revisar un contrato.', estado: 'pendiente' },
    { servicioId: 's1', diasDesdeHoy: 3, hora: '09:00', nombre: 'Daniela Pino', email: 'daniela@ejemplo.test', telefono: '+56 9 5555 6666', mensaje: '', estado: 'pendiente' }
  ]
};
