(function(){
  const OVERLAY_ID = 'app-confirmation-overlay';

  function ensureOverlay(){
    let overlay = document.getElementById(OVERLAY_ID);
    if (!overlay){
      overlay = document.createElement('div');
      overlay.id = OVERLAY_ID;
      overlay.className = 'confirmation-overlay';
      overlay.innerHTML = `
        <div class="confirmation-modal" role="dialog" aria-modal="true" aria-labelledby="confirmation-title">
          <div class="confirmation-header">
            <div class="icon"><i class="fas fa-circle-question"></i></div>
            <h3 class="confirmation-title" id="confirmation-title">¿Seguro?</h3>
          </div>
          <div class="confirmation-body">
            <p id="confirmation-message">Confirma la acción</p>
            <div class="confirmation-meta" id="confirmation-meta"></div>
          </div>
          <div class="confirmation-actions">
            <button type="button" class="confirm-btn secondary" data-confirm-role="cancel">Cancelar</button>
            <button type="button" class="confirm-btn primary" data-confirm-role="confirm">Confirmar</button>
          </div>
        </div>`;
      document.body.appendChild(overlay);

      overlay.addEventListener('click', (event)=>{
        if (event.target === overlay){
          hideOverlay();
          resolveCurrent(false);
        }
      });
    }
    return overlay;
  }

  let resolver = null;

  function resolveCurrent(value){
    if (typeof resolver === 'function'){
      resolver(value);
      resolver = null;
    }
  }

  function hideOverlay(){
    const overlay = document.getElementById(OVERLAY_ID);
    if (overlay){
      overlay.classList.remove('is-visible');
      document.body.style.overflow = '';
    }
  }

  async function confirmAction({
    title = 'Confirmar acción',
    message = '¿Deseas continuar con esta acción?',
    meta = '',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'primary'
  } = {}){
    const overlay = ensureOverlay();
    const modal = overlay.querySelector('.confirmation-modal');
    const confirmButton = overlay.querySelector('[data-confirm-role="confirm"]');
    const cancelButton = overlay.querySelector('[data-confirm-role="cancel"]');

  overlay.querySelector('.confirmation-title').textContent = title;
  overlay.querySelector('#confirmation-message').textContent = message;
  const metaEl = overlay.querySelector('#confirmation-meta');
  metaEl.textContent = meta;
  metaEl.style.display = meta ? 'block' : 'none';
    confirmButton.textContent = confirmText;
    cancelButton.textContent = cancelText;

    confirmButton.classList.remove('primary', 'danger');
    confirmButton.classList.add(variant === 'danger' ? 'danger' : 'primary');

    overlay.classList.add('is-visible');
    document.body.style.overflow = 'hidden';

    return new Promise((resolve)=>{
      resolver = resolve;

      const onConfirm = ()=>{
        hideOverlay();
        resolve(true);
      };
      const onCancel = ()=>{
        hideOverlay();
        resolve(false);
      };

      confirmButton.addEventListener('click', onConfirm, { once: true });
      cancelButton.addEventListener('click', onCancel, { once: true });
      document.addEventListener('keydown', function escListener(event){
        if (event.key === 'Escape'){
          document.removeEventListener('keydown', escListener);
          onCancel();
        }
      }, { once: true });

      overlay.addEventListener('click', function overlayListener(event){
        if (event.target === overlay){
          overlay.removeEventListener('click', overlayListener);
          onCancel();
        }
      }, { once: true });
    });
  }

  function confirmWithFallback(options = {}){
    if (window.confirmationModal && window.confirmationModal !== undefined){
      try {
        return confirmAction(options);
      } catch (_){
        // fall back to native confirm below
      }
    }
    const message = options.message || '¿Deseas continuar con esta acción?';
    return Promise.resolve(window.confirm(message));
  }

  window.confirmationModal = {
    confirm: confirmAction,
    confirmWithFallback
  };
})();
