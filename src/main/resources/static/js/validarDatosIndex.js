document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('contactForm');
  const telefonoInput = document.getElementById('telefono');

  // Expresión regular para permitir solo números (y formatos como +51 999 888 777)
  const telefonoRegex = /^[0-9+\-\s]+$/;

  // Validar teléfono mientras se escribe
  telefonoInput.addEventListener('input', function() {
    // Eliminar caracteres no permitidos
    this.value = this.value.replace(/[^0-9+\-\s]/g, '');
    
    // Validar longitud si tiene valor (9 dígitos exactos, ignorando + y espacios)
    const cleanPhone = this.value.replace(/[\+\-\s]/g, '');  
    if (this.value && (cleanPhone.length !== 9 || !telefonoRegex.test(this.value))) {
      this.classList.add('is-invalid');
      this.classList.remove('is-valid');
    } else {
      this.classList.remove('is-invalid');
      if (this.value) {
        this.classList.add('is-valid');
      } else {
        this.classList.remove('is-valid');
      }
    }
  });

  // Validar teléfono al perder foco
  telefonoInput.addEventListener('blur', function() {
    const cleanPhone = this.value.replace(/[\+\-\s]/g, '');
    if (this.value && (cleanPhone.length !== 9 || !telefonoRegex.test(this.value))) {
      this.classList.add('is-invalid');
      this.classList.remove('is-valid');
    } else {
      this.classList.remove('is-invalid');
      if (this.value) {
        this.classList.add('is-valid');
      } else {
        this.classList.remove('is-valid');
      }
    }
  });

  // Validar otros campos al perder foco (nombre, email, mensaje)
  const campos = form.querySelectorAll('input[required], textarea[required]');
  campos.forEach(campo => {
    if (campo !== telefonoInput) {
      campo.addEventListener('blur', function() {
        if (!this.value.trim()) {
          this.classList.add('is-invalid');
          this.classList.remove('is-valid');
        } else {
          this.classList.remove('is-invalid');
          if (this.type === 'email' && !this.validity.valid) {
            this.classList.add('is-invalid');
          } else if (this.tagName === 'TEXTAREA' && this.value.trim().length < 10) {
            this.classList.add('is-invalid');
          } else {
            this.classList.add('is-valid');
          }
        }
      });
    }
  });

  // Validar el formulario al enviar 
  form.addEventListener('submit', function(e) {
    let isValid = true;
    let errorMessage = '';

    // Validar nombre 
    const nombreInput = form.querySelector('input[type="text"]');
    if (!nombreInput.value.trim()) {
      nombreInput.classList.add('is-invalid');
      isValid = false;
      errorMessage = 'El nombre es obligatorio.';
    } else if (nombreInput.value.trim().length < 2) {  
      nombreInput.classList.add('is-invalid');
      isValid = false;
      errorMessage = 'El nombre debe tener al menos 2 caracteres.';
    } else {
      nombreInput.classList.remove('is-invalid');
      nombreInput.classList.add('is-valid');
    }

    // Validar email
    const emailInput = form.querySelector('input[type="email"]');
    if (!emailInput.value.trim()) {
      emailInput.classList.add('is-invalid');
      isValid = false;
      errorMessage = 'El correo es obligatorio.';
    } else if (!emailInput.validity.valid) {
      emailInput.classList.add('is-invalid');
      isValid = false;
      errorMessage = 'El correo debe ser válido.';
    } else {
      emailInput.classList.remove('is-invalid');
      emailInput.classList.add('is-valid');
    }

    // Validar teléfono (si tiene valor)
    const cleanPhone = telefonoInput.value.replace(/[\+\-\s]/g, '');
    if (telefonoInput.value && (cleanPhone.length !== 9 || !telefonoRegex.test(telefonoInput.value))) {
      telefonoInput.classList.add('is-invalid');
      isValid = false;
      errorMessage = 'El teléfono debe tener exactamente 9 dígitos.';
    } else {
      telefonoInput.classList.remove('is-invalid');
      if (telefonoInput.value) {
        telefonoInput.classList.add('is-valid');
      }
    }

    // Validar mensaje (no vacío, min 10 chars)
    const mensajeTextarea = form.querySelector('textarea');
    if (!mensajeTextarea.value.trim()) {
      mensajeTextarea.classList.add('is-invalid');
      isValid = false;
      errorMessage = 'El mensaje es obligatorio.';
    } else if (mensajeTextarea.value.trim().length < 10) {
      mensajeTextarea.classList.add('is-invalid');
      isValid = false;
      errorMessage = 'El mensaje debe tener al menos 10 caracteres.';
    } else {
      mensajeTextarea.classList.remove('is-invalid');
      mensajeTextarea.classList.add('is-valid');
    }

    // Si frontend falla, previene envío y muestra alert
    if (!isValid) {
      e.preventDefault();  
      alert(errorMessage || 'Por favor, corrige los errores en el formulario.');
      return;  // No envía
    }

  });
});