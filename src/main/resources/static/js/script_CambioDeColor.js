document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.querySelector('.theme-toggle');
  const html = document.documentElement;
  const icon = themeToggle.querySelector('i');

  // Sync icon with current theme
  const syncIcon = () => {
    const currentTheme = html.getAttribute('data-theme');
    if (currentTheme === 'dark') {
      icon.classList.remove('bi-sun-fill');
      icon.classList.add('bi-moon-stars-fill');
    } else {
      icon.classList.remove('bi-moon-stars-fill');
      icon.classList.add('bi-sun-fill');
    }
  };

  // Initialize icon state
  syncIcon();

  // Function to toggle theme
  const toggleTheme = () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    syncIcon();
  };

  // Event listener
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
});