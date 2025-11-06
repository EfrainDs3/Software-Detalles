document.addEventListener('DOMContentLoaded', () => {
    const step1Form = document.getElementById('step1Form');
    const step2Form = document.getElementById('step2Form');
    const step3Form = document.getElementById('step3Form');
    const stepIndicators = document.querySelectorAll('.step-indicator span');
    const usernameInput = document.getElementById('usernameStep1');
    const nombresInput = document.getElementById('nombres');
    const apellidosInput = document.getElementById('apellidos');
    const emailInput = document.getElementById('email');
    const dniInput = document.getElementById('dni');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    let username = '';
    let identityPayload = null;

    const updateStep = (step) => {
        [step1Form, step2Form, step3Form].forEach((form, index) => {
            if (form) {
                form.classList.toggle('hidden', index !== step - 1);
            }
        });
        stepIndicators.forEach((indicator) => {
            const indicatorStep = Number(indicator.dataset.step);
            indicator.classList.toggle('active', indicatorStep === step);
        });
    };

    const handleErrorResponse = async (response) => {
        let message = 'Ha ocurrido un error inesperado';
        try {
            const payload = await response.json();
            message = payload?.error || payload?.message || message;
        } catch (error) {
            // Ignorado: la respuesta no contenía cuerpo JSON
        }
        throw new Error(message);
    };

    const postJson = async (url, payload) => {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            await handleErrorResponse(response);
        }

        try {
            return await response.json();
        } catch (error) {
            return {};
        }
    };

    if (step1Form) {
        step1Form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const value = usernameInput.value.trim();
            if (!value) {
                showMessage('Ingresa tu usuario para continuar', 'error');
                usernameInput.focus();
                return;
            }

            step1Form.querySelector('.login-btn').disabled = true;
            step1Form.querySelector('.login-btn').textContent = 'Validando...';

            try {
                await postJson('/api/auth/forgot-password/check-user', { username: value });
                username = value;
                showMessage('Usuario encontrado. Completa tus datos para validarte.', 'success');
                updateStep(2);
                nombresInput.focus();
            } catch (error) {
                showMessage(error.message, 'error');
            } finally {
                step1Form.querySelector('.login-btn').disabled = false;
                step1Form.querySelector('.login-btn').textContent = 'Validar usuario';
            }
        });
    }

    if (step2Form) {
        step2Form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const nombres = nombresInput.value.trim();
            const apellidos = apellidosInput.value.trim();
            const email = emailInput.value.trim();
            const numeroDocumento = dniInput.value.trim();

            if (!nombres || !apellidos || !email || !numeroDocumento) {
                showMessage('Completa todos los campos solicitados', 'error');
                return;
            }

            const payload = {
                username,
                nombres,
                apellidos,
                email,
                numeroDocumento
            };

            step2Form.querySelector('.login-btn').disabled = true;
            step2Form.querySelector('.login-btn').textContent = 'Validando...';

            try {
                await postJson('/api/auth/forgot-password/verify', payload);
                identityPayload = payload;
                showMessage('Datos validados. Ingresa tu nueva contraseña.', 'success');
                updateStep(3);
                newPasswordInput.focus();
            } catch (error) {
                showMessage(error.message, 'error');
            } finally {
                step2Form.querySelector('.login-btn').disabled = false;
                step2Form.querySelector('.login-btn').textContent = 'Confirmar datos';
            }
        });
    }

    if (step3Form) {
        step3Form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const newPassword = newPasswordInput.value.trim();
            const confirmPassword = confirmPasswordInput.value.trim();

            if (!identityPayload) {
                showMessage('Valida primero tus datos personales', 'error');
                updateStep(1);
                return;
            }

            if (newPassword.length < 6) {
                showMessage('La nueva contraseña debe tener al menos 6 caracteres', 'error');
                newPasswordInput.focus();
                return;
            }

            if (newPassword !== confirmPassword) {
                showMessage('Las contraseñas no coinciden', 'error');
                confirmPasswordInput.focus();
                return;
            }

            const payload = {
                ...identityPayload,
                newPassword
            };

            step3Form.querySelector('.login-btn').disabled = true;
            step3Form.querySelector('.login-btn').textContent = 'Actualizando...';

            try {
                await postJson('/api/auth/forgot-password/reset', payload);
                showMessage('Contraseña actualizada correctamente. Redirigiendo...', 'success');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 1800);
            } catch (error) {
                showMessage(error.message, 'error');
            } finally {
                step3Form.querySelector('.login-btn').disabled = false;
                step3Form.querySelector('.login-btn').textContent = 'Actualizar contraseña';
            }
        });
    }

    document.querySelectorAll('.button-secondary').forEach((button) => {
        button.addEventListener('click', () => {
            const action = button.dataset.action;
            switch (action) {
                case 'back-login':
                    window.location.href = '/login';
                    break;
                case 'back-step1':
                    identityPayload = null;
                    updateStep(1);
                    usernameInput.focus();
                    break;
                default:
                    break;
            }
        });
    });

    updateStep(1);
});

function showMessage(message, type) {
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
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
        max-width: 320px;
        word-wrap: break-word;
    `;

    if (type === 'error') {
        messageDiv.style.backgroundColor = '#dc2626';
    } else if (type === 'success') {
        messageDiv.style.backgroundColor = '#10b981';
    } else {
        messageDiv.style.backgroundColor = '#2563eb';
    }

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

    setTimeout(() => {
        messageDiv.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 300);
    }, 3500);
}
