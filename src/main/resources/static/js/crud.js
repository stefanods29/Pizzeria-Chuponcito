let editModal;
let priceRowCounter = 0;
let promoRowCounter = 0;

document.addEventListener('DOMContentLoaded', function () {
    editModal = new bootstrap.Modal(document.getElementById('editModal'));
});

// --- Logica de tamanos de la pizza ---
function addPriceRow(size, price) {
    size = size || '';
    price = price || '';
    const priceList = document.getElementById('priceList');
    const rowId = 'priceRow_' + priceRowCounter++;

    const row = document.createElement('div');
    row.className = 'row g-2 mb-2 align-items-end';
    row.id = rowId;
    row.innerHTML = '<div class="col-md-5"><label class="form-label small">Tamaño</label><input type="text" class="form-control form-control-sm price-size" value="' + size + '" placeholder="Ej. Personal, Mediana"></div><div class="col-md-5"><label class="form-label small">Precio (S/)</label><input type="number" step="0.1" class="form-control form-control-sm price-value" value="' + price + '" placeholder="0.00"></div><div class="col-md-2"><button type="button" class="btn btn-sm btn-outline-danger w-100" onclick="removePriceRow(\'' + rowId + '\')"><i class="bi bi-trash"></i></button></div>';
    priceList.appendChild(row);
    updatePricesJson();
}

function removePriceRow(rowId) {
    const row = document.getElementById(rowId);
    if (row) {
        row.remove();
        updatePricesJson();
    }
}

function updatePricesJson() {
    const priceList = document.getElementById('priceList');
    if (!priceList) return;

    const sizes = priceList.querySelectorAll('.price-size');
    const values = priceList.querySelectorAll('.price-value');
    const pricesObj = {};

    sizes.forEach(function (sizeInput, index) {
        const size = sizeInput.value.trim();
        const price = parseFloat(values[index].value) || 0;
        if (size) {
            pricesObj[size] = price;
        }
    });

    document.getElementById('pizzaSizes').value = JSON.stringify(pricesObj);
}

// --- Logica de items de la promocion ---
function addPromoRow(type, itemId, quantity, size) {
    type = type || 'pizza';
    itemId = itemId || '';
    quantity = quantity || 1;
    size = size || '';

    const promoList = document.getElementById('promoItemsList');
    const rowId = 'promoRow_' + promoRowCounter++;

    const row = document.createElement('div');
    row.className = 'row g-2 mb-2 align-items-end promo-item-row';
    row.id = rowId;

    // Poner opciones de items
    let optionsHtml = '<option value="">Seleccionar Item...</option>';
    let itemsToLoop = [];
    if (type === 'pizza') itemsToLoop = allPizzas;
    else if (type === 'bebida') itemsToLoop = allBebidas;
    else if (type === 'extra') itemsToLoop = allExtras;

    itemsToLoop.forEach(item => {
        const selected = (item.id == itemId) ? 'selected' : '';
        optionsHtml += '<option value="' + item.id + '" ' + selected + '>' + item.name + '</option>';
    });

    row.innerHTML = 
        '<div class="col-md-2">' +
            '<label class="form-label small">Tipo</label>' +
            '<select class="form-select form-select-sm promo-type" onchange="updatePromoItemOptions(\'' + rowId + '\')">' +
                '<option value="pizza" ' + (type === 'pizza' ? 'selected' : '') + '>Pizza</option>' +
                '<option value="bebida" ' + (type === 'bebida' ? 'selected' : '') + '>Bebida</option>' +
                '<option value="extra" ' + (type === 'extra' ? 'selected' : '') + '>Extra</option>' +
            '</select>' +
        '</div>' +
        '<div class="col-md-4">' +
            '<label class="form-label small">Item</label>' +
            '<select class="form-select form-select-sm promo-item-select" onchange="updatePromoItemSizes(\'' + rowId + '\')">' +
                optionsHtml +
            '</select>' +
        '</div>' +
        '<div class="col-md-3">' +
            '<label class="form-label small">Tamaño</label>' +
            '<select class="form-select form-select-sm promo-item-size" onchange="updatePromoItemsJson()" ' + (type !== 'pizza' ? 'disabled' : '') + '>' +
                '<option value="">N/A</option>' +
            '</select>' +
        '</div>' +
        '<div class="col-md-2">' +
            '<label class="form-label small">Cant.</label>' +
            '<input type="number" min="1" class="form-control form-control-sm promo-quantity" value="' + quantity + '" onchange="updatePromoItemsJson()" oninput="updatePromoItemsJson()">' +
        '</div>' +
        '<div class="col-md-1">' +
            '<button type="button" class="btn btn-sm btn-outline-danger w-100" onclick="removePromoRow(\'' + rowId + '\')">' +
                '<i class="bi bi-trash"></i>' +
            '</button>' +
        '</div>';
    promoList.appendChild(row);

    // Si es una pizza y se selecciona un item, poblar tamanos
    if (type === 'pizza' && itemId) {
        updatePromoItemSizes(rowId, size);
    } else {
        updatePromoItemsJson();
    }
}

function updatePromoItemOptions(rowId) {
    const row = document.getElementById(rowId);
    const typeSelect = row.querySelector('.promo-type');
    const itemSelect = row.querySelector('.promo-item-select');
    const sizeSelect = row.querySelector('.promo-item-size');
    const type = typeSelect.value;

    let itemsToLoop = [];
    if (type === 'pizza') itemsToLoop = allPizzas;
    else if (type === 'bebida') itemsToLoop = allBebidas;
    else if (type === 'extra') itemsToLoop = allExtras;

    let optionsHtml = '<option value="">Seleccionar Item...</option>';
    itemsToLoop.forEach(item => {
        optionsHtml += '<option value="' + item.id + '">' + item.name + '</option>';
    });
    itemSelect.innerHTML = optionsHtml;
    
    // Reset y deshabilitar size select si no es pizza
    sizeSelect.innerHTML = '<option value="">N/A</option>';
    sizeSelect.disabled = (type !== 'pizza');

    updatePromoItemsJson();
}

function updatePromoItemSizes(rowId, selectedSize) {
    const row = document.getElementById(rowId);
    const typeSelect = row.querySelector('.promo-type');
    const itemSelect = row.querySelector('.promo-item-select');
    const sizeSelect = row.querySelector('.promo-item-size');
    
    if (typeSelect.value !== 'pizza') {
        sizeSelect.innerHTML = '<option value="">N/A</option>';
        sizeSelect.disabled = true;
        updatePromoItemsJson();
        return;
    }

    const pizzaId = itemSelect.value;
    if (!pizzaId) {
        sizeSelect.innerHTML = '<option value="">Seleccionar...</option>';
        sizeSelect.disabled = true;
        updatePromoItemsJson();
        return;
    }

    const pizza = allPizzas.find(p => p.id == pizzaId);
    let optionsHtml = '<option value="">Seleccionar Tamaño...</option>';
    
    if (pizza && pizza.sizes) {
        Object.keys(pizza.sizes).forEach(size => {
            const isSelected = (size === selectedSize) ? 'selected' : '';
            optionsHtml += '<option value="' + size + '" ' + isSelected + '>' + size + '</option>';
        });
        sizeSelect.disabled = false;
    } else {
        optionsHtml = '<option value="">Sin tamaños</option>';
        sizeSelect.disabled = true;
    }
    
    sizeSelect.innerHTML = optionsHtml;
    updatePromoItemsJson();
}

function removePromoRow(rowId) {
    const row = document.getElementById(rowId);
    if (row) {
        row.remove();
        updatePromoItemsJson();
    }
}

function updatePromoItemsJson() {
    const promoList = document.getElementById('promoItemsList');
    if (!promoList) return;

    const rows = promoList.querySelectorAll('.promo-item-row');
    const itemsArray = [];

    rows.forEach(row => {
        const type = row.querySelector('.promo-type').value;
        const itemId = row.querySelector('.promo-item-select').value;
        const quantity = parseInt(row.querySelector('.promo-quantity').value) || 1;
        const size = row.querySelector('.promo-item-size').value;

        if (itemId) {
            const itemObj = { quantity: quantity };
            if (type === 'pizza') {
                itemObj.pizza_id = parseInt(itemId);
            }
            else if (type === 'bebida') itemObj.bebida_id = parseInt(itemId);
            else if (type === 'extra') itemObj.extra_id = parseInt(itemId);
            itemsArray.push(itemObj);
        }
    });

    document.getElementById('promoItems').value = JSON.stringify(itemsArray);
}

// --- Logica de envio del formulario ---
function prepareFormSubmit() {
    const priceList = document.getElementById('priceList');
    if (priceList) {
        updatePricesJson();
    }
    const promoList = document.getElementById('promoItemsList');
    if (promoList) {
        updatePromoItemsJson();
    }
    return true;
}

function clearForm() {
    document.getElementById('itemId').value = '';
    document.getElementById('itemName').value = '';
    document.getElementById('itemImage').value = '';
    document.getElementById('itemDescription').value = '';
    document.getElementById('itemStock').value = '0';
    document.getElementById('itemLowStock').value = '5';
    document.getElementById('modalTitle').innerText = 'Agregar Nuevo';

    if (document.getElementById('pizzaIngredients')) document.getElementById('pizzaIngredients').value = '';
    if (document.getElementById('priceList')) {
        document.getElementById('priceList').innerHTML = '';
        priceRowCounter = 0;
        addPriceRow('Personal', '0.0');
        addPriceRow('Mediana', '0.0');
        addPriceRow('Familiar', '0.0');
    }
    if (document.getElementById('bebidaPrice')) document.getElementById('bebidaPrice').value = '';
    if (document.getElementById('bebidaSize')) document.getElementById('bebidaSize').value = '';
    if (document.getElementById('extraPrice')) document.getElementById('extraPrice').value = '';

    // Promo campos
    if (document.getElementById('promoPrice')) document.getElementById('promoPrice').value = '';
    if (document.getElementById('promoActive')) document.getElementById('promoActive').checked = true;
    if (document.getElementById('promoValidFrom')) document.getElementById('promoValidFrom').value = '';
    if (document.getElementById('promoValidTo')) document.getElementById('promoValidTo').value = '';
    if (document.getElementById('promoItems')) document.getElementById('promoItems').value = '';
    if (document.getElementById('promoItemsList')) {
        document.getElementById('promoItemsList').innerHTML = '';
        promoRowCounter = 0;
    }
}

function editItem(id, type) {
    document.getElementById('modalTitle').innerText = 'Editar Item';

    fetch('/admin/settings/get?type=' + type + '&id=' + id)
        .then(function (response) {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(function (data) {
            if (!data) {
                alert('Error: No se encontraron datos para este ítem.');
                return;
            }

            document.getElementById('itemId').value = data.id || '';
            document.getElementById('itemName').value = data.name || '';
            document.getElementById('itemImage').value = data.imageUrl || '';
            document.getElementById('itemDescription').value = data.description || '';
            document.getElementById('itemStock').value = data.stockQuantity || 0;
            document.getElementById('itemLowStock').value = data.lowStockThreshold || 5;

            if (type === 'pizza') {
                document.getElementById('pizzaIngredients').value = data.ingredients ? data.ingredients.join(', ') : '';

                const priceList = document.getElementById('priceList');
                priceList.innerHTML = '';
                priceRowCounter = 0;

                if (data.sizes && typeof data.sizes === 'object') {
                    Object.entries(data.sizes).forEach(function (entry) {
                        addPriceRow(entry[0], entry[1]);
                    });
                } else {
                    addPriceRow('Personal', '0.0');
                    addPriceRow('Mediana', '0.0');
                    addPriceRow('Familiar', '0.0');
                }

                priceList.addEventListener('input', updatePricesJson);
            } else if (type === 'bebida') {
                document.getElementById('bebidaPrice').value = data.price || '';
                document.getElementById('bebidaSize').value = data.size || '';
            } else if (type === 'extra') {
                document.getElementById('extraPrice').value = data.price || '';
            } else if (type === 'promo') {
                document.getElementById('promoPrice').value = data.promoPrice || '';
                document.getElementById('promoActive').checked = true; 
                document.getElementById('promoValidFrom').value = data.validFrom || '';
                document.getElementById('promoValidTo').value = data.validTo || '';

                // Cargar items de la promocion
                const promoList = document.getElementById('promoItemsList');
                promoList.innerHTML = '';
                promoRowCounter = 0;
                document.getElementById('promoItems').value = data.items || '';

                if (data.items) {
                    try {
                        const items = JSON.parse(data.items);
                        if (Array.isArray(items)) {
                            items.forEach(item => {
                                let type = 'pizza';
                                let itemId = '';
                                if (item.pizza_id) { type = 'pizza'; itemId = item.pizza_id; }
                                else if (item.bebida_id) { type = 'bebida'; itemId = item.bebida_id; }
                                else if (item.extra_id) { type = 'extra'; itemId = item.extra_id; }

                                addPromoRow(type, itemId, item.quantity, item.size);
                            });
                        }
                    } catch (e) {
                        console.error('Error parsing promo items JSON', e);
                    }
                }
            }

            editModal.show();
        })
        .catch(function (error) {
            console.error('Error:', error);
            alert('Hubo un error al cargar los datos del ítem.');
        });
}
