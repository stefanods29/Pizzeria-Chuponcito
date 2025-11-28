function loadCart(containerId = 'cartItemsContainer', isModal = false) {
    fetch('/api/cart')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById(containerId);
            const totalEl = document.getElementById(isModal ? 'modalCartBadge' : 'cartTotal');
            if (data.items.length === 0) {
                container.innerHTML = '<div class="text-center py-5"><i class="bi bi-cart-x fs-1 text-muted"></i><p class="mt-2">Tu carrito está vacío</p><small class="text-muted">Agrega productos del menú para verlos aquí</small></div>';
                if (totalEl) totalEl.textContent = isModal ? '0 items' : 'Total: S/ 0.00';
                
                if (isModal) {
                    const checkoutBtn = document.getElementById('goToCheckoutBtn');
                    const clearBtn = document.getElementById('clearCartBtn');
                    if (checkoutBtn) checkoutBtn.style.display = 'none';
                    if (clearBtn) clearBtn.style.display = 'none';
                }
                return;
            }

            let html = '';
            data.items.forEach(item => {
                const sizeText = item.size ? `<small class="text-muted d-block">Tamaño: ${item.size}</small>` : '';
                const imgSrc = item.imageUrl || '/images/default.png';
                html += `
                    <div class="cart-item row align-items-center mb-3 p-3 border rounded ${isModal ? 'g-2' : ''}" 
                         data-type="${item.type}" 
                         data-id="${item.productId}" 
                         data-size="${item.size || ''}"
                         data-quantity="${item.quantity}">
                        <div class="col-md-2 col-3">
                            <img src="${imgSrc}" alt="${item.name}" class="img-fluid rounded" style="max-height: ${isModal ? '60px' : '80px'};">
                        </div>
                        <div class="col-md-4 col-6">
                            <h6 class="mb-1">${item.name}</h6>
                            ${sizeText}
                            <small class="text-muted">Tipo: ${item.type}</small>
                        </div>
                        <div class="col-md-2 col-1 text-center">
                            <span class="fw-bold">S/ ${ (item.price * item.quantity).toFixed(2) }</span>
                        </div>
                        <div class="col-md-4 col-2">
                            <div class="d-flex align-items-center justify-content-${isModal ? 'evenly' : 'between'}">
                                <button class="btn btn-sm btn-outline-secondary cart-btn-dark btn-decrease" style="background: rgba(201, 148, 62, 0.2); color: #251e73; border: 1px solid rgba(201, 148, 62, 0.4); border-radius: 0.375rem; opacity: 0.9; width: 2.5rem; height: 2.5rem; font-size: 1rem; font-weight: bold;">-</button>
                                <span class="mx-2 fw-bold">${item.quantity}</span>
                                <button class="btn btn-sm btn-outline-secondary cart-btn-dark btn-increase" style="background: rgba(201, 148, 62, 0.2); color: #251e73; border: 1px solid rgba(201, 148, 62, 0.4); border-radius: 0.375rem; opacity: 0.9; width: 2.5rem; height: 2.5rem; font-size: 1rem; font-weight: bold;">+</button>
                                <button class="btn btn-sm btn-danger ms-2 btn-remove" style="background: rgba(220, 53, 69, 0.2); color: #251e73; border: 1px solid rgba(220, 53, 69, 0.3); border-radius: 0.375rem; opacity: 0.9; width: 2rem; height: 2rem; font-size: 1rem;">×</button>
                            </div>
                        </div>
                    </div>
                `;
            });
            container.innerHTML = html;
            if (totalEl) totalEl.textContent = isModal ? `${data.itemCount} items` : `Total: S/ ${data.total.toFixed(2)}`;
            if (!isModal) updateCartBadge(data.itemCount); // Actualiza badge en navbar
            
            // Update modal buttons visibility
            if (isModal) {
                const checkoutBtn = document.getElementById('goToCheckoutBtn');
                const clearBtn = document.getElementById('clearCartBtn');
                const hasItems = data.items.length > 0;
                
                if (checkoutBtn) checkoutBtn.style.display = hasItems ? 'block' : 'none';
                if (clearBtn) clearBtn.style.display = hasItems ? 'inline-block' : 'none';
            }
            
            // Setup event listeners con event delegation
            setupCartEventListeners(containerId, isModal);
        })
        .catch(err => console.error('Error cargando carrito:', err));
}

// Event delegation para botones del carrito
function setupCartEventListeners(containerId, isModal) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Remover listeners anteriores si existen (limpieza)
    const oldListener = container._cartListener;
    if (oldListener) {
        container.removeEventListener('click', oldListener);
    }
    
    // Crear nuevo listener
    const listener = function(e) {
        const target = e.target;
        const cartItem = target.closest('.cart-item');
        if (!cartItem) return;
        
        const type = cartItem.dataset.type;
        const id = parseInt(cartItem.dataset.id);
        const size = cartItem.dataset.size || '';
        const quantity = parseInt(cartItem.dataset.quantity);
        
        if (target.classList.contains('btn-decrease')) {
            updateQuantity(type, id, size, quantity - 1, containerId, isModal);
        } else if (target.classList.contains('btn-increase')) {
            updateQuantity(type, id, size, quantity + 1, containerId, isModal);
        } else if (target.classList.contains('btn-remove')) {
            removeItem(type, id, size, containerId, isModal);
        }
    };
    
    container.addEventListener('click', listener);
    container._cartListener = listener; // Guardar referencia para limpieza futura
}

// Funciones helper
function updateQuantity(type, id, size, qty, containerId, isModal) {
    const item = { type, productId: id, size: size || null, quantity: qty };
    fetch('/api/cart/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
    })
    .then(async response => {
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Error en servidor');
        }
        return loadCart(containerId, isModal);
    })
    .catch(err => alert(err.message));
}

function removeItem(type, id, size, containerId, isModal) {
    if (confirm('¿Eliminar este item?')) {
        const item = { type, productId: id, size: size || null, quantity: 0 };
        fetch('/api/cart/update', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
        })
        .then(() => loadCart(containerId, isModal))
        .catch(err => alert('Error removiendo: ' + err));
    }
}

function clearCartFromPage() {
    if (confirm('¿Limpiar todo el carrito?')) {
        fetch('/api/cart/clear', { method: 'DELETE' })
            .then(() => loadCart('cartItemsContainer', false))
            .catch(err => alert('Error limpiando: ' + err));
    }
}

function proceedToCheckout() {
    alert('Funcionalidad de pago futura. Por ahora, ve a /orders o implementa.');
}

// Cargar al inicio para página cart
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('cartItemsContainer')) {
        loadCart('cartItemsContainer', false);
    }
});