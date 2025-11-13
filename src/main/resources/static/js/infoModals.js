document.addEventListener('DOMContentLoaded', function () {
    const pizzaModal = document.getElementById('pizzaModal');
    const extraModal = document.getElementById('extraModal');
    const bebidaModal = document.getElementById('bebidaModal');
    const promoModal = document.getElementById('promoModal'); // Asumiendo modal para promos
    const pizzaTitle = document.getElementById('pizzaTitle');
    const pizzaDesc = document.getElementById('pizzaDesc');
    const pizzaIngredients = document.getElementById('pizzaIngredients');
    const pizzaSizeSelect = document.getElementById('pizzaSize');  // Select de tamaños
    const extraTitle = document.getElementById('extraTitle');
    const extraDesc = document.getElementById('extraDesc');
    const extraIngredients = document.getElementById('extraIngredients');
    const bebidaTitle = document.getElementById('bebidaTitle');
    const bebidaDesc = document.getElementById('bebidaDesc');
    const bebidaIngredients = document.getElementById('bebidaIngredients');
    const bebidaPrice = document.getElementById('bebidaPrice');
    const bebidaSize = document.getElementById('bebidaSize');

    // FUNCIÓN: Parsea ingredients (JSON array o comma-delimited)
    function parseIngredients(ingredientsStr) {
        if (!ingredientsStr) return [];
        try {
            // Primero intenta como JSON array
            return JSON.parse(ingredientsStr);
        } catch (e) {
            // Fallback a comma-split
            return ingredientsStr.split(',').map(item => item.trim()).filter(item => item.length > 0);
        }
    }

    // FUNCIÓN: Parsea sizes Map toString() a objeto {key: value}
    function parseSizes(sizesStr) {
        if (!sizesStr || sizesStr === '{}') return {};
        try {
            const clean = sizesStr.replace(/[{}]/g, '').trim();
            return clean.split(',').reduce((acc, pair) => {
                const [key, valueStr] = pair.split('=').map(s => s.trim());
                if (key && valueStr) {
                    acc[key] = parseFloat(valueStr);
                }
                return acc;
            }, {});
        } catch (e) {
            console.error('Error parsing sizes:', e);
            return {};
        }
    }

    // FUNCIÓN: Actualizar badge en navbar
    function updateCartBadge(count) {
        const badge = document.getElementById('cartBadge');
        if (badge) {
            if (count > 0) {
                badge.textContent = count;
                badge.style.display = 'inline';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    // FUNCIÓN GENERAL: Agrega al carrito via AJAX (actualizado)
    function addToCart(item) {
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
            // Cierra el modal actual
            const modal = bootstrap.Modal.getInstance(document.querySelector('.modal.show'));
            if (modal) modal.hide();
            // Recarga badge y modal si está abierto
            fetch('/api/cart')
                .then(r => r.json())
                .then(data => updateCartBadge(data.itemCount));
            // Si el modal del carrito está abierto, recárgalo (asumiendo loadCartInModal existe)
            if (typeof loadCartInModal === 'function') {
                loadCartInModal();
            }
        })
        .catch(err => alert('Error al agregar al carrito: ' + err));
    }

    // Variable para almacenar relatedTarget en modales
    let currentRelatedTarget = null;

    // Para modal de pizzas
    pizzaModal.addEventListener('show.bs.modal', function (event) {
        currentRelatedTarget = event.relatedTarget;
        if (!currentRelatedTarget) return;

        const name = currentRelatedTarget.getAttribute('data-name') || 'Nombre desconocido';
        const desc = currentRelatedTarget.getAttribute('data-desc') || 'Descripción no disponible';
        const ingredientsStr = currentRelatedTarget.getAttribute('data-ingredients') || '';
        const sizesStr = currentRelatedTarget.getAttribute('data-sizes') || '{}';
        const id = currentRelatedTarget.getAttribute('data-id') || 0;

        pizzaTitle.textContent = name;
        pizzaDesc.textContent = desc;

        const ingredients = parseIngredients(ingredientsStr);
        pizzaIngredients.innerHTML = ingredients.length > 0 
            ? ingredients.map(ing => `<li>${ing}</li>`).join('') 
            : '<li>No hay ingredientes disponibles</li>';

        const sizes = parseSizes(sizesStr);
        pizzaSizeSelect.innerHTML = '<option value="">Selecciona un tamaño...</option>';
        Object.entries(sizes).forEach(([sizeName, price]) => {
            const option = document.createElement('option');
            option.value = sizeName;
            option.setAttribute('data-price', price);
            option.textContent = `${sizeName} - S/ ${price.toFixed(2)}`;
            pizzaSizeSelect.appendChild(option);
        });
    });

    // Evento para agregar pizza al carrito (usa currentRelatedTarget)
    document.getElementById('addPizza').addEventListener('click', function() {
        const size = pizzaSizeSelect.value;
        if (!size) {
            alert('¡Selecciona un tamaño para la pizza!');
            return;
        }
        const selectedOption = pizzaSizeSelect.selectedOptions[0];
        const price = parseFloat(selectedOption.getAttribute('data-price'));
        const name = currentRelatedTarget.getAttribute('data-name');
        const id = currentRelatedTarget.getAttribute('data-id') || 0;

        const item = {
            productId: parseInt(id),
            name: name,
            type: 'pizza',
            price: price,
            size: size,
            quantity: 1
        };

        addToCart(item);
    });

    // Para modal de extras
    extraModal.addEventListener('show.bs.modal', function (event) {
        currentRelatedTarget = event.relatedTarget;
        if (!currentRelatedTarget) return;

        const name = currentRelatedTarget.getAttribute('data-name') || 'Nombre desconocido';
        const desc = currentRelatedTarget.getAttribute('data-desc') || 'Descripción no disponible';
        const ingredientsStr = currentRelatedTarget.getAttribute('data-ingredients') || '';
        const price = parseFloat(currentRelatedTarget.getAttribute('data-price') || '0');

        extraTitle.textContent = name;
        extraDesc.textContent = desc;

        const ingredients = parseIngredients(ingredientsStr);
        extraIngredients.innerHTML = ingredients.length > 0 
            ? ingredients.map(ing => `<li>${ing}</li>`).join('') 
            : '<li>No hay ingredientes disponibles</li>';

        const extraPriceEl = document.getElementById('extraPrice');
        if (extraPriceEl) extraPriceEl.textContent = `S/ ${price.toFixed(2)}`;
    });

    // Evento para agregar extra al carrito
    document.getElementById('addExtra').addEventListener('click', function() {
        const name = currentRelatedTarget.getAttribute('data-name');
        const id = currentRelatedTarget.getAttribute('data-id') || 0;
        const price = parseFloat(currentRelatedTarget.getAttribute('data-price'));

        const item = {
            productId: parseInt(id),
            name: name,
            type: 'extra',
            price: price,
            quantity: 1
        };

        addToCart(item);
    });

    // Para modal de bebidas
    bebidaModal.addEventListener('show.bs.modal', function (event) {
        currentRelatedTarget = event.relatedTarget;
        if (!currentRelatedTarget) return;

        const name = currentRelatedTarget.getAttribute('data-name') || 'Nombre desconocido';
        const desc = currentRelatedTarget.getAttribute('data-desc') || 'Descripción no disponible';
        const ingredientsStr = currentRelatedTarget.getAttribute('data-ingredients') || '';
        const price = parseFloat(currentRelatedTarget.getAttribute('data-price') || '0');
        const size = currentRelatedTarget.getAttribute('data-size') || 'N/A';

        bebidaTitle.textContent = name;
        bebidaDesc.textContent = desc;

        const ingredients = parseIngredients(ingredientsStr);
        bebidaIngredients.innerHTML = ingredients.length > 0 
            ? ingredients.map(ing => `<li>${ing}</li>`).join('') 
            : '<li>No hay ingredientes disponibles</li>';

        bebidaPrice.textContent = `S/ ${price.toFixed(2)}`;
        bebidaSize.textContent = `(${size})`;
    });

    // Evento para agregar bebida al carrito
    document.getElementById('addBebida').addEventListener('click', function() {
        const name = currentRelatedTarget.getAttribute('data-name');
        const id = currentRelatedTarget.getAttribute('data-id') || 0;
        const price = parseFloat(currentRelatedTarget.getAttribute('data-price'));

        const item = {
            productId: parseInt(id),
            name: name,
            type: 'bebida',
            price: price,
            quantity: 1
        };

        addToCart(item);
    });

    // Para modal de promos (asumiendo show.bs.modal y data-attributes en botón que abre modal)
    if (promoModal) {
        promoModal.addEventListener('show.bs.modal', function (event) {
            currentRelatedTarget = event.relatedTarget;
            if (!currentRelatedTarget) return;

            // Llena modal con data del botón (ajusta según tu HTML)
            const name = currentRelatedTarget.getAttribute('data-name') || 'Promo desconocida';
            const desc = currentRelatedTarget.getAttribute('data-desc') || '';
            const price = parseFloat(currentRelatedTarget.getAttribute('data-price') || '0');
            const id = currentRelatedTarget.getAttribute('data-id') || 0;

            document.getElementById('promoTitle').textContent = name;
            document.getElementById('promoDesc').textContent = desc;
            // Actualiza botón addPromo con data
            const addPromoBtn = document.getElementById('addPromo');
            addPromoBtn.setAttribute('data-promo-id', id);
            addPromoBtn.setAttribute('data-price', price);
        });

        // Evento para agregar promo
        document.getElementById('addPromo').addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-promo-id') || 0);
            const name = currentRelatedTarget.getAttribute('data-name');
            const price = parseFloat(this.getAttribute('data-price') || 0);

            const item = {
                productId: id,
                name: name,
                type: 'promo',
                price: price,
                quantity: 1
            };

            addToCart(item);
        });
    }
});