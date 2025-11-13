
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('registerForm');
  const submitBtn = document.getElementById('submitBtn');
  const btnText = submitBtn.querySelector('.btn-text');
  const spinner = submitBtn.querySelector('.spinner-border');
  const arrow = submitBtn.querySelector('i');
  const togglePassword = document.getElementById('togglePassword');
  const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
  const termsCheckbox = document.getElementById('terms');

  if (togglePassword) {
    togglePassword.addEventListener('click', function() {
      const passwordInput = form.querySelector('input[name="password"]');
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      this.innerHTML = type === 'password' ? '<i class="bi bi-eye"></i>' : '<i class="bi bi-eye-slash"></i>';
    });
  }

  if (toggleConfirmPassword) {
    toggleConfirmPassword.addEventListener('click', function() {
      const confirmInput = form.querySelector('input[name="confirmPassword"]');
      const type = confirmInput.getAttribute('type') === 'password' ? 'text' : 'password';
      confirmInput.setAttribute('type', type);
      this.innerHTML = type === 'password' ? '<i class="bi bi-eye"></i>' : '<i class="bi bi-eye-slash"></i>';
    });
  }

  const fields = form.querySelectorAll('input[required]');
  fields.forEach(field => {
    field.addEventListener('blur', validateField);
    field.addEventListener('input', clearFieldValidation);
  });

  termsCheckbox.addEventListener('change', function() {
    if (this.checked) {
      this.closest('.form-check').classList.remove('is-invalid');
    } else {
      this.closest('.form-check').classList.add('is-invalid');
    }
  });

  function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    let isValid = true;

    field.classList.remove('is-valid', 'is-invalid');

    switch (field.name) {
      case 'username':
        if (value.length < 3 || value.length > 50) {
          isValid = false;
          showFieldError(field, 'El nombre de usuario debe tener entre 3 y 50 caracteres.');
        }
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value || !emailRegex.test(value)) {
          isValid = false;
          showFieldError(field, 'Por favor ingresa un correo electrónico válido.');
        }
        break;
      case 'password':
        if (value.length < 6) {
          isValid = false;
          showFieldError(field, 'La contraseña debe tener al menos 6 caracteres.');
        }
        break;
      case 'confirmPassword':
        const password = form.querySelector('input[name="password"]').value;
        if (value !== password) {
          isValid = false;
          showFieldError(field, 'Las contraseñas no coinciden.');
        }
        break;
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

    if (!termsCheckbox.checked) {
      termsCheckbox.closest('.form-check').classList.add('is-invalid');
      isValid = false;
      errorMsg = 'Debes aceptar los términos y condiciones.';
    }

    const password = form.querySelector('input[name="password"]').value;
    const confirmPassword = form.querySelector('input[name="confirmPassword"]').value;
    if (password && confirmPassword && password !== confirmPassword) {
      form.querySelector('input[name="confirmPassword"]').classList.add('is-invalid');
      isValid = false;
      errorMsg = 'Las contraseñas no coinciden.';
    }

    if (!isValid) {
      e.preventDefault();
      alert(errorMsg || 'Por favor, corrige los errores en el formulario.');
      return;
    }

    submitBtn.disabled = true;
    btnText.textContent = 'Creando cuenta...';
    spinner.classList.remove('d-none');
    arrow.classList.add('d-none');

  });
});