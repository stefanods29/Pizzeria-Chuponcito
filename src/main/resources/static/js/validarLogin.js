
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('loginForm');
  const submitBtn = document.getElementById('submitBtn');
  const btnText = submitBtn.querySelector('.btn-text');
  const spinner = submitBtn.querySelector('.spinner-border');
  const arrow = submitBtn.querySelector('i');

  function resetUI() {
    submitBtn.disabled = false;
    btnText.textContent = 'Iniciar Sesión';
    spinner.classList.add('d-none');
    arrow.classList.remove('d-none');
    form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    form.querySelectorAll('.is-valid').forEach(el => el.classList.remove('is-valid'));
  }

  if (window.location.search.includes('error=true') || window.location.search.includes('logout=true')) {
    resetUI();
    const emailInput = form.querySelector('input[name="username"]');
    if (emailInput) {
      emailInput.focus();
    }
  }

  const fields = form.querySelectorAll('input[required]');
  fields.forEach(field => {
    field.addEventListener('blur', validateField);
    field.addEventListener('input', clearFieldValidation); 
  });

  function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    let isValid = true;

    field.classList.remove('is-valid', 'is-invalid');

    if (!value) {
      isValid = false;
      showFieldError(field, field.name === 'username' ? 'El correo es obligatorio.' : 'La contraseña es obligatoria.');
    } else {
      if (field.name === 'username') { 
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          isValid = false;
          showFieldError(field, 'Por favor ingresa un correo electrónico válido.');
        }
      } else if (field.name === 'password') {
        if (value.length < 6) {
          isValid = false;
          showFieldError(field, 'La contraseña debe tener al menos 6 caracteres.');
        }
      }
    }

    if (isValid && value) {
      field.classList.add('is-valid');
    }
  }

  function clearFieldValidation(e) {
    const field = e.target;
    field.classList.remove('is-invalid', 'is-valid');
  }

  function showFieldError(field, message) {
    field.classList.add('is-invalid');
  }

  form.addEventListener('submit', function(e) {
    let isValid = true;
    let errorMsg = '';

    form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    form.querySelectorAll('.is-valid').forEach(el => el.classList.remove('is-valid'));

    fields.forEach(field => validateField({ target: field }));

    if (form.querySelector('.is-invalid')) {
      isValid = false;
      errorMsg = 'Por favor, corrige los errores en el formulario.';
    }

    if (!isValid) {
      e.preventDefault();
      alert(errorMsg);
      return;
    }

    submitBtn.disabled = true;
    btnText.textContent = 'Iniciando sesión...';
    spinner.classList.remove('d-none');
    arrow.classList.add('d-none');

  });

  window.addEventListener('beforeunload', resetUI);
});