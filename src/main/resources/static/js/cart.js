// Función global para cargar y renderizar carrito (para modal y página)
function loadCart(containerId = 'cartItemsContainer', isModal = false) {
    fetch('/api/cart')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById(containerId);
            const totalEl = document.getElementById(isModal ? 'modalCartBadge' : 'cartTotal');
            if (data.items.length === 0) {
                container.innerHTML = '<div class="text-center py-5"><i class="bi bi-cart-x fs-1 text-muted"></i><p class="mt-2">Tu carrito está vacío</p><small class="text-muted">Agrega productos del menú para verlos aquí</small></div>';
                if (totalEl) totalEl.textContent = isModal ? '0 items' : 'Total: S/ 0.00';
                return;
            }

            let html = '';
            data.items.forEach(item => {
                const sizeText = item.size ? `<small class="text-muted d-block">Tamaño: ${item.size}</small>` : '';
                const imgSrc = item.imageUrl || '/images/default.png';
                html += `
                    <div class="cart-item row align-items-center mb-3 p-3 border rounded ${isModal ? 'g-2' : ''}">
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
                                <button class="btn btn-sm btn-outline-secondary" onclick="updateQuantity('${item.type}', ${item.productId}, '${item.size || ''}', ${item.quantity - 1}, '${containerId}', ${isModal})">-</button>
                                <span class="mx-2 fw-bold">${item.quantity}</span>
                                <button class="btn btn-sm btn-outline-secondary" onclick="updateQuantity('${item.type}', ${item.productId}, '${item.size || ''}', ${item.quantity + 1}, '${containerId}', ${isModal})">+</button>
                                <button class="btn btn-sm btn-danger ms-2" onclick="removeItem('${item.type}', ${item.productId}, '${item.size || ''}', '${containerId}', ${isModal})">×</button>
                            </div>
                        </div>
                    </div>
                `;
            });
            container.innerHTML = html;
            if (totalEl) totalEl.textContent = isModal ? `${data.itemCount} items` : `Total: S/ ${data.total.toFixed(2)}`;
            if (!isModal) updateCartBadge(data.itemCount); // Actualiza badge en navbar
        })
        .catch(err => console.error('Error cargando carrito:', err));
}

// Funciones helper
function updateQuantity(type, id, size, qty, containerId, isModal) {
    const item = { type, productId: id, size: size || null, quantity: qty };
    fetch('/api/cart/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
    })
    .then(() => loadCart(containerId, isModal))
    .catch(err => alert('Error actualizando: ' + err));
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