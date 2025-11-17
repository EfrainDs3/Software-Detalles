// Login JavaScript
document.addEventListener('DOMContentLoaded', async function() {
    const loginForm = document.getElementById('loginForm');
    const usuarioInput = document.getElementById('usuario');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.querySelector('.login-btn');

    // Verificar si ya hay una sesión activa
    async function checkExistingSession() {
        const usuarioLogueado = localStorage.getItem('usuarioLogueado');
        const nombreMostrado = localStorage.getItem('usuarioNombre') || usuarioLogueado;
        const loginTime = localStorage.getItem('loginTime');
        
        if (usuarioLogueado && loginTime) {
            // Verificar si la sesión no ha expirado (24 horas)
            const now = new Date();
            const loginDate = new Date(loginTime);
            const hoursDiff = (now - loginDate) / (1000 * 60 * 60);
            
            if (hoursDiff >= 24) {
                clearStoredSession();
                return false;
            }

            try {
                const response = await fetch('/api/auth/me', {
                    credentials: 'include',
                    headers: { 'Accept': 'application/json' }
                });
                const contentType = response.headers.get('content-type') || '';
                const redirected = response.redirected && response.url.includes('/login');

                if (!response.ok || redirected || !contentType.toLowerCase().includes('application/json')) {
                    clearStoredSession();
                    return false;
                }

                let payload = null;
                try {
                    payload = await response.json();
                } catch (error) {
                    // Si no hay JSON válido, considerar la sesión inválida
                    clearStoredSession();
                    return false;
                }

                if (!payload || (!payload.username && !payload.nombreCompleto)) {
                    clearStoredSession();
                    return false;
                }

                const nombre = payload?.nombreCompleto || nombreMostrado || usuarioLogueado;
                showMessage(`Bienvenido de nuevo, ${nombre}!`, 'success');
                window.location.href = '/dashboard';
                return true;
            } catch (error) {
                // Ignorar errores de red, se limpiará la sesión local
            }

            clearStoredSession();
        }
        return false;
    }

    // Verificar sesión al cargar la página
    if (await checkExistingSession()) {
        return; // Si hay sesión válida, no continuar
    }

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

    async function authenticateUser(usuario, password) {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                usernameOrEmail: usuario,
                password
            })
        });

        let payload = null;
        try {
            payload = await response.json();
        } catch (error) {
            // Ignorar si no hay cuerpo JSON
        }

        const redirected = response.redirected && response.url.includes('/login');
        const contentType = response.headers.get('content-type') || '';

        if (!response.ok || redirected || !contentType.toLowerCase().includes('application/json')) {
            const message = payload?.error || 'Usuario o contraseña incorrectos';
            throw new Error(message);
        }

        return payload;
    }

    // Manejo del envío del formulario
    loginForm.addEventListener('submit', async function(e) {
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
        
        loginBtn.textContent = 'INGRESANDO...';
        loginBtn.disabled = true;
        
        try {
            const data = await authenticateUser(usuario, password);

            // Login exitoso
            showMessage('¡Bienvenido! Redirigiendo...', 'success');

            const nombreCompleto = data?.nombreCompleto || usuario;
            const roles = data?.roles || [];
            const permisos = data?.permisos || [];
            const modulos = data?.modulos || [];

            // Guardar sesión en localStorage
            localStorage.setItem('usuarioLogueado', data?.username || usuario);
            localStorage.setItem('usuarioNombre', nombreCompleto);
            localStorage.setItem('usuarioRoles', JSON.stringify(roles));
            localStorage.setItem('usuarioPermisos', JSON.stringify(permisos));
            localStorage.setItem('usuarioModulos', JSON.stringify(modulos));
            localStorage.setItem('loginTime', new Date().toISOString());

            // Redirigir al dashboard inmediatamente
            window.location.href = '/dashboard';
        } catch (error) {
            showMessage(error.message || 'No se pudo iniciar sesión', 'error');
            passwordInput.value = '';
            passwordInput.focus();
        } finally {
            loginBtn.textContent = 'INGRESAR';
            loginBtn.disabled = false;
        }
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
        } else if (type === 'info') {
            messageDiv.style.backgroundColor = '#2563eb';
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
    // La navegación al flujo de recuperación se maneja mediante el enlace directo en la vista
});

function clearStoredSession() {
    localStorage.removeItem('usuarioLogueado');
    localStorage.removeItem('usuarioNombre');
    localStorage.removeItem('loginTime');
    localStorage.removeItem('usuarioRoles');
    localStorage.removeItem('usuarioPermisos');
    localStorage.removeItem('usuarioModulos');
}

// Función para limpiar la sesión (disponible globalmente)
function limpiarSesion() {
    clearStoredSession();
    alert('Sesión limpiada. Puedes iniciar sesión nuevamente.');
    location.reload(); // Recargar la página
}
