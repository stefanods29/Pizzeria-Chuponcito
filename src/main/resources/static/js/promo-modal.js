document.addEventListener('DOMContentLoaded', () => {
  const modalEl = document.getElementById('promoModal');
  if (!modalEl) {
    console.error('[promo-modal] no existe #promoModal en el DOM');
    return;
  }
  const titleEl = modalEl.querySelector('#promoTitle');
  const descEl = modalEl.querySelector('#promoDesc');
  const listEl = modalEl.querySelector('#promoIngredients');

  if (!listEl) {
    console.error('[promo-modal] Agrega <ul id="promoIngredients"></ul> en el modal HTML');
    return;
  }

  function setLoadingState() {
    titleEl.textContent = 'Cargando...';
    descEl.textContent = 'Cargando descripción...';
    listEl.innerHTML = '<li>Cargando contenido...</li>';
  }

  function setErrorState() {
    titleEl.textContent = 'Error';
    descEl.textContent = 'No se pudo cargar la promoción';
    listEl.innerHTML = '<li>Error cargando contenido</li>';
  }

  // Renderizar lista agrupada (pizzas, bebidas, extras)
  function renderDetalles(detalles) {
    const pizzas = detalles.filter(d => d.tipo === 'pizza');
    const bebidas = detalles.filter(d => d.tipo === 'bebida');
    const extras = detalles.filter(d => d.tipo === 'extra');

    let html = '';

    function renderGroup(title, items) {
      if (!items || items.length === 0) return '';
      let out = `<li class="categoria">${title}</li>`;
      out += '<ul class="sublista">';
      items.forEach(it => {
        const nombre = it.nombre || 'Desconocido';
        const cantidad = it.cantidad ?? 1;
        out += `<li>${nombre} <strong>x${cantidad}</strong></li>`;
      });
      out += '</ul>';
      return out;
    }

    html += renderGroup('Pizzas:', pizzas);
    html += renderGroup('Bebidas:', bebidas);
    html += renderGroup('Extras:', extras);

    if (!html) html = '<li>No hay contenido disponible</li>';
    listEl.innerHTML = html;
  }

  // Función que obtiene detalles desde el backend
  async function fetchAndShowPromo(promoId) {
    try {
      setLoadingState();
      const res = await fetch(`/api/promociones/${promoId}/detalles`, { method: 'GET' });
      if (!res.ok) {
        console.error('[promo-modal] Fetch fallo, status:', res.status);  // Log mínimo para debug
        setErrorState();
        return;
      }
      const data = await res.json();
      titleEl.textContent = data.name || 'Sin nombre';
      descEl.textContent = data.description || 'Sin descripción';
      const detalles = Array.isArray(data.detalles) ? data.detalles : [];
      renderDetalles(detalles);
    } catch (err) {
      console.error('[promo-modal] Error en fetch:', err);  // Log catch
      setErrorState();
    }
  }

  // Listener para botones .promo-btn (click directo)
  document.querySelectorAll('.promo-btn').forEach(btn => {
    btn.addEventListener('click', function (evt) {
      evt.preventDefault();
      evt.stopPropagation();

      const promoId = btn.getAttribute('data-id') || btn.dataset.id;
      if (!promoId) {
        console.warn('[promo-modal] Botón sin data-id:', btn);
        return;
      }

      fetchAndShowPromo(promoId).then(() => {
        try {
          const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
          bsModal.show();
        } catch (err) {
          console.error('[promo-modal] Error abriendo modal:', err);
        }
      });
    }, { capture: true });
  });

  // Listener para show.bs.modal (trigger desde data-bs-toggle)
  modalEl.addEventListener('show.bs.modal', function (event) {
    const trigger = event.relatedTarget;
    if (!trigger) return;
    const promoId = trigger.getAttribute('data-id') || trigger.dataset.id;
    if (!promoId) return;
    fetchAndShowPromo(promoId);
  });
});