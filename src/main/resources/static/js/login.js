// Login JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const usuarioInput = document.getElementById('usuario');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.querySelector('.login-btn');

    // Validación en tiempo real
    usuarioInput.addEventListener('input', function() {
        validateField(this);
    });

    passwordInput.addEventListener('input', function() {
        validateField(this);
    });

    // Función de validación de campos
    function validateField(field) {
        const value = field.value.trim();
        const isValid = value.length > 0;
        
        if (isValid) {
            field.style.borderColor = '#10b981';
            field.style.backgroundColor = '#f0fdf4';
        } else {
            field.style.borderColor = '#e5e5e5';
            field.style.backgroundColor = '#f9f9f9';
        }
        
        return isValid;
    }

    // Manejo del envío del formulario
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const usuario = usuarioInput.value.trim();
        const password = passwordInput.value.trim();
        
        // Validación básica
        if (!usuario || !password) {
            showMessage('Por favor, completa todos los campos', 'error');
            return;
        }
        
        if (usuario.length < 3) {
            showMessage('El usuario debe tener al menos 3 caracteres', 'error');
            return;
        }
        
        if (password.length < 4) {
            showMessage('La contraseña debe tener al menos 4 caracteres', 'error');
            return;
        }
        
        // Simular proceso de login
        loginBtn.textContent = 'INGRESANDO...';
        loginBtn.disabled = true;
        
        // Simular delay de autenticación
        setTimeout(() => {
            // Aquí iría la lógica real de autenticación
            // Por ahora, redirigimos al dashboard
            window.location.href = '/dashboard';
        }, 1500);
    });

    // Función para mostrar mensajes
    function showMessage(message, type) {
        // Remover mensaje anterior si existe
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Crear nuevo mensaje
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.textContent = message;
        
        // Estilos del mensaje
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
        `;
        
        if (type === 'error') {
            messageDiv.style.backgroundColor = '#dc2626';
        } else if (type === 'success') {
            messageDiv.style.backgroundColor = '#10b981';
        }
        
        // Agregar animación CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(messageDiv);
        
        // Remover mensaje después de 3 segundos
        setTimeout(() => {
            messageDiv.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.remove();
                }
            }, 300);
        }, 3000);
    }

    // Efecto de partículas en el logo (opcional)
    function createParticles() {
        const logoContainer = document.querySelector('.logo-container');
        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: 2px;
                height: 2px;
                background: white;
                border-radius: 50%;
                pointer-events: none;
                animation: float ${2 + Math.random() * 3}s ease-in-out infinite;
                animation-delay: ${Math.random() * 2}s;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
            `;
            
            logoContainer.style.position = 'relative';
            logoContainer.appendChild(particle);
        }
        
        // Agregar animación CSS para las partículas
        const style = document.createElement('style');
        style.textContent = `
            @keyframes float {
                0%, 100% {
                    transform: translateY(0px) scale(1);
                    opacity: 0.7;
                }
                50% {
                    transform: translateY(-10px) scale(1.2);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Inicializar partículas
    createParticles();

    // Efecto de hover en el botón
    loginBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px) scale(1.02)';
    });
    
    loginBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });

    // Manejo del enlace "¿Olvidaste tu contraseña?"
    const forgotLink = document.querySelector('.forgot-link');
    forgotLink.addEventListener('click', function(e) {
        e.preventDefault();
        showMessage('Funcionalidad en desarrollo', 'info');
    });
});
