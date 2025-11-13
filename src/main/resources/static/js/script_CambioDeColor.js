 document.addEventListener('DOMContentLoaded', () => {
      const themeToggle = document.querySelector('.theme-toggle');
      const body = document.body;
      const icon = themeToggle.querySelector('i');

      // Función para alternar tema
      const toggleTheme = () => {
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        // Actualizar icono del botón
        icon.classList.toggle('bi-moon-stars-fill', newTheme === 'dark');
        icon.classList.toggle('bi-sun-fill', newTheme === 'light');
      };

      // Cargar tema guardado de localStorage
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        body.setAttribute('data-theme', savedTheme);
        // Ajustar icono inicial
        icon.classList.add(savedTheme === 'dark' ? 'bi-moon-stars-fill' : 'bi-sun-fill');
      } else {
        // Por defecto dark, icono moon
        icon.classList.add('bi-moon-stars-fill');
      }

      // Evento click en el botón
      themeToggle.addEventListener('click', toggleTheme);
    });