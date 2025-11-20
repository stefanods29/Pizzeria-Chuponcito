

document.addEventListener('DOMContentLoaded', function() {
    // Cargar badge inicial del carrito
    fetch('/api/cart')
        .then(response => response.json())
        .then(data => updateCartBadge(data.itemCount))
        .catch(err => console.error('Error cargando badge inicial:', err));

    // Event listener para modal de carrito (cargar al mostrar)
    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
        cartModal.addEventListener('show.bs.modal', loadCartInModal);
    }

    // Theme toggle
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            // Toggle icono (asume bi-moon-stars-fill para dark, bi-sun-fill para light)
            const icon = this.querySelector('i');
            if (newTheme === 'light') {
                icon.className = 'bi bi-sun-fill';
            } else {
                icon.className = 'bi bi-moon-stars-fill';
            }
            // Opcional: guardar en localStorage
            localStorage.setItem('theme', newTheme);
        });
        // Cargar tema guardado al inicio
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        // Ajustar icono inicial
        const icon = themeToggle.querySelector('i');
        if (savedTheme === 'light') {
            icon.className = 'bi bi-sun-fill';
        }
    }

    // Opcional: Buscador en navbar (si hay form)
    const searchForm = document.querySelector('.navbar form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            const query = this.querySelector('input[type="search"]').value.trim();
            if (!query) {
                e.preventDefault();
                alert('Ingresa un término para buscar');
            }
        });
    }
});

// Función para cargar carrito en modal (usa loadCart de cart.js)
function loadCartInModal() {
    loadCart('cartItemsContainer', true);
    // Si no autenticado, opcional: mostrar mensaje de login (basado en var isAuthenticated global)
    if (typeof isAuthenticated !== 'undefined' && !isAuthenticated) {
        const container = document.getElementById('cartItemsContainer');
        // Agrega un div de login si vacío, pero por ahora asume carrito compartido
        console.log('Carrito cargado, pero considera login para persistencia');
    }

}

// Actualizar badge en navbar
function updateCartBadge(count) {
    const badge = document.getElementById('cartBadge');
    if (badge) {
        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }
}

// Limpiar carrito desde modal
function clearCartFromModal() {
    if (confirm('¿Estás seguro de limpiar el carrito?')) {
        fetch('/api/cart/clear', {
            method: 'DELETE'
        })
        .then(response => {
            if (response.ok) {
                loadCartInModal();
                updateCartBadge(0);
            } else {
                alert('Error al limpiar carrito');
            }
        })
        .catch(err => {
            console.error('Error:', err);
            alert('Error al limpiar carrito');
        });
    }
}