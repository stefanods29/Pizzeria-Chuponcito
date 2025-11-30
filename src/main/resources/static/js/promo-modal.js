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
        const size = it.size ? ` (${it.size})` : '';
        out += `<li>${nombre}${size} <strong>x${cantidad}</strong></li>`;
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

  // Variable para almacenar datos de la promoción actual
  let currentPromoData = null;

  // Función que obtiene detalles desde el backend
  async function fetchAndShowPromo(promoId) {
    try {
      setLoadingState();
      const res = await fetch(`/api/promociones/${promoId}/detalles?t=` + new Date().getTime(), { method: 'GET' });
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
      
      // Actualizar la imagen del modal
      const imageEl = document.getElementById('promoImage');
      if (imageEl) {
        imageEl.src = data.imageUrl || '/images/default-promo.png';
        imageEl.alt = data.name || 'Promoción';
      }
      
      // Guardar datos de la promoción para agregar al carrito
      currentPromoData = {
        id: promoId,
        name: data.name || 'Promoción',
        price: data.promoPrice || 0,
        imageUrl: data.imageUrl || '/images/default-promo.png'
      };
    } catch (err) {
      console.error('[promo-modal] Error en fetch:', err);  // Log catch
      setErrorState();
    }
  }

  // Listener para show.bs.modal (trigger desde data-bs-toggle)
  // NOTA: Se removió el listener directo a .promo-btn para evitar doble agregado al carrito
  modalEl.addEventListener('show.bs.modal', function (event) {
    const trigger = event.relatedTarget;
    if (!trigger) return;
    const promoId = trigger.getAttribute('data-id') || trigger.dataset.id;
    if (!promoId) return;
    fetchAndShowPromo(promoId);
  });

  // Función para agregar al carrito
  function addPromoToCart() {
    if (!currentPromoData) {
      alert('Error: No hay promoción seleccionada.');
      return;
    }

    const item = {
      productId: parseInt(currentPromoData.id),
      name: currentPromoData.name,
      type: 'promo',
      price: parseFloat(currentPromoData.price),
      quantity: 1,
      imageUrl: currentPromoData.imageUrl
    };

    fetch('/api/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    })
      .then(response => {
        if (!response.ok) throw new Error('Error en servidor');
        return response.text();
      })
      .then(message => {
        alert(message);
        // Cierra el modal
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
        // Actualiza el badge del carrito si existe
        if (window.fetchAndUpdateCartBadge) {
          window.fetchAndUpdateCartBadge();
        } else {
          console.warn('fetchAndUpdateCartBadge no está definido');
        }
        // Si existe la función para recargar carrito en modal, llamarla
        if (typeof loadCartInModal === 'function') {
          loadCartInModal();
        }
      })
      .catch(err => {
        alert('Error al agregar al carrito: ' + err.message);
        console.error('Error:', err);
      });
  }

  // Listener para el botón "Agregar al Carrito"
  const addPromoBtn = document.getElementById('addPromo');
  if (addPromoBtn) {
    addPromoBtn.addEventListener('click', function() {
      addPromoToCart();
    });
  } else {
    console.error('[promo-modal] No se encontró el botón #addPromo');
  }
});