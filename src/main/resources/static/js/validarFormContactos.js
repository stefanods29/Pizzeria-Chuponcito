document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('contactForm');
  const telefonoInput = document.getElementById('phone');

  // Validar teléfono mientras se escribe (solo dígitos)
  telefonoInput.addEventListener('input', function() {
    // Permitir solo dígitos
    this.value = this.value.replace(/[^0-9]/g, '');
    
    // Validar longitud si tiene valor
    if (this.value && this.value.length !== 9) {
      this.classList.add('is-invalid');
      this.classList.remove('is-valid');
    } else {
      this.classList.remove('is-invalid');
      if (this.value) {
        this.classList.add('is-valid');
      }
    }
  });

  // Validar teléfono al perder el foco
  telefonoInput.addEventListener('blur', function() {
    if (this.value && this.value.length !== 9) {
      this.classList.add('is-invalid');
      this.classList.remove('is-valid');
    } else {
      this.classList.remove('is-invalid');
      if (this.value) {
        this.classList.add('is-valid');
      }
    }
  });

  // Validar el formulario al enviar
  form.addEventListener('submit', function(e) {
    let isValid = true;

    // Validar nombre
    const nombreInput = form.querySelector('input[th:field="*{name}"], input[name="name"]');
    if (!nombreInput.value.trim()) {
      nombreInput.classList.add('is-invalid');
      isValid = false;
    } else {
      nombreInput.classList.remove('is-invalid');
      nombreInput.classList.add('is-valid');
    }

    // Validar email
    const emailInput = form.querySelector('input[th:field="*{email}"], input[name="email"]');
    if (!emailInput.value.trim()) {
      emailInput.classList.add('is-invalid');
      isValid = false;
    } else {
      emailInput.classList.remove('is-invalid');
      if (!emailInput.validity.valid) {
        emailInput.classList.add('is-invalid');
        isValid = false;
      } else {
        emailInput.classList.add('is-valid');
      }
    }

    // Validar teléfono (si tiene valor, debe ser exactamente 9 dígitos)
    if (telefonoInput.value && telefonoInput.value.length !== 9) {
      telefonoInput.classList.add('is-invalid');
      isValid = false;
    } else {
      telefonoInput.classList.remove('is-invalid');
      if (telefonoInput.value) {
        telefonoInput.classList.add('is-valid');
      }
    }

    // Validar mensaje
    const mensajeTextarea = form.querySelector('textarea[th:field="*{message}"], textarea[name="message"]');
    if (!mensajeTextarea.value.trim()) {
      mensajeTextarea.classList.add('is-invalid');
      isValid = false;
    } else {
      mensajeTextarea.classList.remove('is-invalid');
      mensajeTextarea.classList.add('is-valid');
    }

    // Si no es válido, prevenir envío
    if (!isValid) {
      e.preventDefault();
    }
  });
});