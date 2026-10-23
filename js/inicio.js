/*
 * inicio.js — página pública index.html: dibuja servicios y testimonios.
 */
(async function () {
  await Nucleo.iniciar();
  const { esc, moneda } = Utils;

  // Servicios activos
  const servicios = await Nucleo.servicios(true);
  document.getElementById('lista-servicios').innerHTML = servicios.map(s => `
    <article class="tarjeta p-6 flex flex-col aparece">
      <h3 class="text-xl font-semibold text-marca-800">${esc(s.nombre)}</h3>
      <p class="mt-2 text-tinta-500 flex-1">${esc(s.descripcion)}</p>
      <p class="mt-4 text-sm text-tinta-500">${esc(s.duracionMin)} min</p>
      <p class="text-2xl font-titulo font-semibold text-marca-700">${moneda(s.precio)}</p>
      <a class="btn btn-secundario mt-4" href="agendar.html?servicio=${encodeURIComponent(s.id)}">Agendar este servicio</a>
    </article>`).join('') || '<p class="text-tinta-500">Próximamente publicaremos nuestros servicios.</p>';

  // Testimonios
  const testimonios = await Nucleo.testimonios();
  document.getElementById('lista-testimonios').innerHTML = testimonios.map(t => `
    <figure class="tarjeta p-6 aparece">
      <blockquote class="text-tinta-700">“${esc(t.texto)}”</blockquote>
      <figcaption class="mt-4 flex items-center gap-3">
        <img src="${esc(t.foto)}" alt="" width="44" height="44" loading="lazy" class="w-11 h-11 rounded-full object-cover">
        <span><strong class="block text-sm">${esc(t.nombre)}</strong><span class="text-xs text-tinta-500">${esc(t.cargo)}</span></span>
      </figcaption>
    </figure>`).join('');

  UI.iniciarAnimaciones();
})();
