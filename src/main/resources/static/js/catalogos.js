// Catálogos unificado: render secuencial con paginación (5 por página)
(function(){
  const API_BASE = '/api/catalogos';

  // Datos provenientes del backend
  let marcas = [];
  let materiales = [];
  let unidades = [];
  let tipos = [];
  let modelos = [];

  const PAGE_SIZE = 5;

  // Estado de búsqueda y página
  const state = {
    marcas: { page:1, term:'' },
    modelos: { page:1, term:'' },
    materiales: { page:1, term:'' },
    unidades: { page:1, term:'' },
    tipos: { page:1, term:'' }
  };

  const ESCAPE_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

  const escapeHtml = (value = '') => String(value ?? '')
    .replace(/[&<>"']/g, (match) => ESCAPE_MAP[match] || match);

  // Estado de edición simple
  const editing = { scope:null, id:null };
  const byId = (id) => document.getElementById(id);
  // Cache de altura mínima por tabla para mantener estable la posición de la paginación
  const heightCache = {};

  async function askConfirmation(options){
    if (window.confirmationModal?.confirm){
      return window.confirmationModal.confirm(options);
    }
    const message = options?.message || '¿Deseas continuar con esta acción?';
    return Promise.resolve(window.confirm(message));
  }

  async function apiFetch(path, options = {}){
    const baseHeaders = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
    const opts = { method: options.method || 'GET', headers: baseHeaders, ...options };
    opts.headers = { ...baseHeaders, ...(options.headers || {}) };
    if (opts.body && typeof opts.body !== 'string') {
      opts.body = JSON.stringify(opts.body);
    }
    if (opts.method === 'GET' || opts.method === 'DELETE') {
      delete opts.body;
      delete opts.headers['Content-Type'];
    }
    try {
      const response = await fetch(`${API_BASE}${path}`, opts);
      const contentType = response.headers.get('content-type') || '';
      const raw = await response.text();
      if (!response.ok) {
        let message = 'Ocurrió un error inesperado';
        if (raw) {
          try {
            const parsed = contentType.includes('application/json') ? JSON.parse(raw) : { message: raw };
            message = parsed.message || parsed.error || raw;
          } catch (err) {
            message = raw;
          }
        }
        throw new Error(message);
      }
      if (!raw) return null;
      if (contentType.includes('application/json')) {
        try {
          return JSON.parse(raw);
        } catch (err) {
          console.warn('No se pudo interpretar la respuesta como JSON', err);
          return null;
        }
      }
      return raw;
    } catch (error) {
      throw error;
    }
  }

  function handleError(error, fallbackMessage){
    console.error(error);
    const message = error && error.message ? error.message : fallbackMessage;
    alert(message || fallbackMessage || 'Ocurrió un error inesperado');
  }

  async function loadMarcas(){
    try {
      const data = await apiFetch('/marcas');
      marcas = Array.isArray(data) ? data : [];
      normalizePage('marcas', marcas);
      renderMarcas();
      populateModeloMarcas();
    } catch (error) {
      handleError(error, 'No se pudo cargar la lista de marcas');
    }
  }

  async function loadModelos(){
    try {
      const data = await apiFetch('/modelos');
      modelos = Array.isArray(data) ? data : [];
      normalizePage('modelos', modelos);
      renderModelos();
    } catch (error) {
      handleError(error, 'No se pudo cargar la lista de modelos');
    }
  }

  async function loadMateriales(){
    try {
      const data = await apiFetch('/materiales');
      materiales = Array.isArray(data) ? data : [];
      normalizePage('materiales', materiales);
      renderMateriales();
    } catch (error) {
      handleError(error, 'No se pudo cargar la lista de materiales');
    }
  }

  async function loadUnidades(){
    try {
      const data = await apiFetch('/unidades');
      unidades = Array.isArray(data) ? data : [];
      normalizePage('unidades', unidades);
      renderUnidades();
    } catch (error) {
      handleError(error, 'No se pudo cargar la lista de unidades');
    }
  }

  async function loadTipos(){
    try {
      const data = await apiFetch('/tipos');
      tipos = Array.isArray(data) ? data : [];
      normalizePage('tipos', tipos);
      renderTipos();
    } catch (error) {
      handleError(error, 'No se pudo cargar la lista de tipos');
    }
  }

  async function initialize(){
    await loadMarcas();
    await Promise.all([loadMateriales(), loadUnidades(), loadTipos()]);
    await loadModelos();
  }

  // Utilidades
  function paginate(list, page){
    const start = (page-1)*PAGE_SIZE;
    return list.slice(start, start + PAGE_SIZE);
  }
  function withPreservedSection(anchorEl, fn){
    const anchor = anchorEl || document.body;
    const beforeTop = anchor.getBoundingClientRect().top;
    fn();
    const afterTop = anchor.getBoundingClientRect().top;
    const delta = afterTop - beforeTop;
    if (delta !== 0) window.scrollBy({ top: delta, left: 0, behavior: 'auto' });
  }

  // Ajusta una altura mínima al contenedor de la tabla equivalente a PAGE_SIZE filas
  function setFixedHeightForTable(tableId){
    const table = byId(tableId);
    if (!table) return;
    const container = table.closest('.table-container');
    if (!container) return;
    if (heightCache[tableId]){
      container.style.minHeight = heightCache[tableId] + 'px';
      return;
    }
    const thead = table.tHead;
    const theadH = thead ? thead.getBoundingClientRect().height : 0;
    const tbody = table.tBodies && table.tBodies[0] ? table.tBodies[0] : null;
    let tr = tbody ? tbody.querySelector('tr') : null;
    let created = false;
    if (!tr && tbody){
      const cols = (thead && thead.rows[0]) ? thead.rows[0].cells.length : 1;
      const dummy = document.createElement('tr');
      for (let i=0; i<cols; i++){ const td = document.createElement('td'); td.innerHTML = '\u00a0'; dummy.appendChild(td); }
      tbody.appendChild(dummy);
      tr = dummy;
      created = true;
    }
    let rowH = 44; // valor de respaldo si no se puede medir
    if (tr){
      const rect = tr.getBoundingClientRect();
      if (rect && rect.height) rowH = rect.height;
    }
    if (created && tbody && tr) tbody.removeChild(tr);
    const minH = Math.ceil(theadH + rowH * PAGE_SIZE);
    heightCache[tableId] = minH;
    container.style.minHeight = minH + 'px';
  }

  function renderPagination(containerId, total, currentPage, onGo){
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const host = document.getElementById(containerId);
    if (!host) return;
    host.innerHTML = '';
    const info = document.createElement('div');
    info.className = 'pagination-info';
    const start = total ? ((currentPage-1)*PAGE_SIZE + 1) : 0;
    const end = total ? Math.min(total, currentPage*PAGE_SIZE) : 0;
    info.textContent = total ? `Mostrando ${start}-${end} de ${total}` : 'Sin registros';
    const wrapper = document.createElement('div');
    wrapper.className = 'pagination';

    // Botón anterior (chevron)
    const prevBtn = document.createElement('button');
    prevBtn.className = 'btn-pagination';
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    if (currentPage === 1) {
      prevBtn.disabled = true;
    } else {
      prevBtn.addEventListener('click', () => {
        const section = host.closest('section') || host;
        withPreservedSection(section, () => onGo(currentPage - 1));
      });
    }
    wrapper.appendChild(prevBtn);

    // Único botón activo con el número de página actual
    const currentBtn = document.createElement('button');
    currentBtn.className = 'btn-pagination active';
    currentBtn.textContent = String(currentPage);
    currentBtn.disabled = true; // solo informativo
    wrapper.appendChild(currentBtn);

    // Botón siguiente (chevron)
    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn-pagination';
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    if (currentPage === totalPages) {
      nextBtn.disabled = true;
    } else {
      nextBtn.addEventListener('click', () => {
        const section = host.closest('section') || host;
        withPreservedSection(section, () => onGo(currentPage + 1));
      });
    }
    wrapper.appendChild(nextBtn);
    host.appendChild(info);
    host.appendChild(wrapper);
  }

  // Asegurar que la página actual sea válida tras cambios
  function normalizePage(key, list){
    const term = (state[key].term||'').toLowerCase();
    let filtered = list;
    if (key==='marcas') filtered = list.filter(m=>m.nombre.toLowerCase().includes(term));
    if (key==='modelos') filtered = list.filter(m=>m.nombre.toLowerCase().includes(term) || (m.marca||'').toLowerCase().includes(term));
    if (key==='materiales') filtered = list.filter(m=>m.nombre.toLowerCase().includes(term));
  if (key==='unidades') filtered = list.filter(u=>u.nombre.toLowerCase().includes(term) || (u.abreviatura||'').toLowerCase().includes(term));
    if (key==='tipos') filtered = list.filter(t=>t.nombre.toLowerCase().includes(term));
    const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    if (state[key].page > pages) state[key].page = pages;
    if (state[key].page < 1) state[key].page = 1;
  }

  // Renderers por bloque
  function renderMarcas(){
    const term = state.marcas.term.toLowerCase();
    const filtered = marcas.filter(m => m.nombre.toLowerCase().includes(term));
    const page = state.marcas.page;
    const rows = paginate(filtered, page);
    const tbody = document.getElementById('marcasTableBody');
    tbody.innerHTML = rows.map(r => `
      <tr>
        <td>${r.id}</td>
        <td>${r.nombre}</td>
        <td><div class="action-buttons-cell">
          <button class="btn-icon btn-view" data-scope="marca" data-id="${r.id}"><i class="fas fa-eye"></i></button>
          <button class="btn-icon btn-edit" data-scope="marca" data-id="${r.id}"><i class="fas fa-edit"></i></button>
          <button class="btn-icon btn-delete" data-scope="marca" data-id="${r.id}"><i class="fas fa-trash"></i></button>
        </div></td>
      </tr>`).join('');
    setFixedHeightForTable('marcasTable');
    renderPagination('marcasPagination', filtered.length, page, (p)=>{ state.marcas.page=p; renderMarcas(); });
  }

  function renderModelos(){
    const term = (state.modelos.term || '').toLowerCase();
    const filtered = modelos.filter(m =>{
      const nombre = (m.nombre || '').toLowerCase();
      const marcaNombre = (m.marca || '').toLowerCase();
      return nombre.includes(term) || marcaNombre.includes(term);
    });
    const page = state.modelos.page;
    const rows = paginate(filtered, page);
    const tbody = document.getElementById('modelosTableBody');
    if (!tbody) return;
    tbody.innerHTML = rows.map(renderModeloRow).join('');
    setFixedHeightForTable('modelosTable');
    renderPagination('modelosPagination', filtered.length, page, (p)=>{ state.modelos.page=p; renderModelos(); });
  }

  function renderModeloRow(modelo){
    const id = modelo.id ?? '';
    const idDisplay = escapeHtml(id ?? '-');
    const nombre = escapeHtml(modelo.nombre ?? '');
    const marcaNombre = escapeHtml(modelo.marca ?? '');
    const altText = nombre || 'Modelo sin nombre';
    return `
      <tr>
        <td>${idDisplay}</td>
        <td>${nombre}</td>
        <td>${marcaNombre}</td>
        <td><div class="action-buttons-cell">
          <button class="btn-icon btn-view" data-scope="modelo" data-id="${escapeHtml(id)}"><i class="fas fa-eye"></i></button>
          <button class="btn-icon btn-edit" data-scope="modelo" data-id="${escapeHtml(id)}"><i class="fas fa-edit"></i></button>
          <button class="btn-icon btn-delete" data-scope="modelo" data-id="${escapeHtml(id)}"><i class="fas fa-trash"></i></button>
        </div></td>
      </tr>`;
  }

  function renderMateriales(){
    const term = state.materiales.term.toLowerCase();
    const filtered = materiales.filter(m => m.nombre.toLowerCase().includes(term));
    const page = state.materiales.page;
    const rows = paginate(filtered, page);
    const tbody = document.getElementById('materialesTableBody');
    tbody.innerHTML = rows.map(r => `
      <tr>
        <td>${r.id}</td>
        <td>${r.nombre}</td>
        <td><div class="action-buttons-cell">
          <button class="btn-icon btn-view" data-scope="material" data-id="${r.id}"><i class="fas fa-eye"></i></button>
          <button class="btn-icon btn-edit" data-scope="material" data-id="${r.id}"><i class="fas fa-edit"></i></button>
          <button class="btn-icon btn-delete" data-scope="material" data-id="${r.id}"><i class="fas fa-trash"></i></button>
        </div></td>
      </tr>`).join('');
    setFixedHeightForTable('materialesTable');
    renderPagination('materialesPagination', filtered.length, page, (p)=>{ state.materiales.page=p; renderMateriales(); });
  }

  function renderUnidades(){
    const term = state.unidades.term.toLowerCase();
  const filtered = unidades.filter(u => u.nombre.toLowerCase().includes(term) || (u.abreviatura||'').toLowerCase().includes(term));
    const page = state.unidades.page;
    const rows = paginate(filtered, page);
    const tbody = document.getElementById('unidadesTableBody');
    tbody.innerHTML = rows.map(r => `
      <tr>
        <td>${r.id}</td>
        <td>${r.nombre}</td>
  <td>${r.abreviatura || '-'}</td>
        <td><div class="action-buttons-cell">
          <button class="btn-icon btn-view" data-scope="unidad" data-id="${r.id}"><i class="fas fa-eye"></i></button>
          <button class="btn-icon btn-edit" data-scope="unidad" data-id="${r.id}"><i class="fas fa-edit"></i></button>
          <button class="btn-icon btn-delete" data-scope="unidad" data-id="${r.id}"><i class="fas fa-trash"></i></button>
        </div></td>
      </tr>`).join('');
    setFixedHeightForTable('unidadesTable');
    renderPagination('unidadesPagination', filtered.length, page, (p)=>{ state.unidades.page=p; renderUnidades(); });
  }

  function renderTipos(){
    const term = state.tipos.term.toLowerCase();
    const filtered = tipos.filter(t => t.nombre.toLowerCase().includes(term));
    const page = state.tipos.page;
    const rows = paginate(filtered, page);
    const tbody = document.getElementById('tiposTableBody');
    tbody.innerHTML = rows.map(r => `
      <tr>
        <td>${r.id}</td>
        <td>${r.nombre}</td>
        <td><div class="action-buttons-cell">
          <button class="btn-icon btn-view" data-scope="tipo" data-id="${r.id}"><i class="fas fa-eye"></i></button>
          <button class="btn-icon btn-edit" data-scope="tipo" data-id="${r.id}"><i class="fas fa-edit"></i></button>
          <button class="btn-icon btn-delete" data-scope="tipo" data-id="${r.id}"><i class="fas fa-trash"></i></button>
        </div></td>
      </tr>`).join('');
    setFixedHeightForTable('tiposTable');
    renderPagination('tiposPagination', filtered.length, page, (p)=>{ state.tipos.page=p; renderTipos(); });
  }

  // Buscadores
  document.getElementById('searchMarcaInput')?.addEventListener('input', (e)=>{ state.marcas.term = e.target.value; state.marcas.page = 1; renderMarcas(); });
  document.getElementById('searchModeloInput')?.addEventListener('input', (e)=>{ state.modelos.term = e.target.value; state.modelos.page = 1; renderModelos(); });
  document.getElementById('searchMaterialInput')?.addEventListener('input', (e)=>{ state.materiales.term = e.target.value; state.materiales.page = 1; renderMateriales(); });
  document.getElementById('searchUnidadInput')?.addEventListener('input', (e)=>{ state.unidades.term = e.target.value; state.unidades.page = 1; renderUnidades(); });
  document.getElementById('searchTipoInput')?.addEventListener('input', (e)=>{ state.tipos.term = e.target.value; state.tipos.page = 1; renderTipos(); });

  // Modales: abrir/cerrar
  function openModal(id){ const m = byId(id); if (!m) return; m.style.display = 'block'; }
  function closeModal(id){ const m = byId(id); if (!m) return; m.style.display = 'none'; }
  document.body.addEventListener('click', (e)=>{
    const closeId = e.target?.dataset?.close || e.target?.closest('[data-close]')?.dataset?.close;
    if (closeId) closeModal(closeId);
  });
  document.querySelectorAll('.modal').forEach(m => m.addEventListener('click', (e)=>{ if (e.target===m) closeModal(m.id); }));

  // Nuevo/Guardar: Marcas
  byId('addMarcaBtn')?.addEventListener('click', ()=>{ editing.scope='marca'; editing.id=null; byId('marcaModalTitle').textContent='Nueva Marca'; byId('marcaNombre').value=''; openModal('marcaModal'); });
  byId('saveMarcaBtn')?.addEventListener('click', async ()=>{
    const nombre = (byId('marcaNombre').value||'').trim();
    if (!nombre){ byId('marcaNombre').focus(); return; }
    try {
      if (editing.scope==='marca' && editing.id){
        await apiFetch(`/marcas/${editing.id}`, { method:'PUT', body:{ nombre } });
      } else {
        await apiFetch('/marcas', { method:'POST', body:{ nombre } });
      }
      await loadMarcas();
      await loadModelos();
      closeModal('marcaModal');
      editing.scope = null; editing.id = null;
    } catch (error) {
      handleError(error, 'No se pudo guardar la marca');
    }
  });

  // Nuevo/Guardar: Modelos
  function populateModeloMarcas(){ const sel = byId('modeloMarca'); if (!sel) return; sel.innerHTML = '<option value="">Seleccionar marca</option>' + marcas.map(m=>`<option value="${m.id}">${m.nombre}</option>`).join(''); }

  // Imagen para Modelo: selección y previsualización
  byId('addModeloBtn')?.addEventListener('click', ()=>{
    editing.scope='modelo'; editing.id=null; populateModeloMarcas();
    byId('modeloModalTitle').textContent='Nuevo Modelo';
    byId('modeloNombre').value=''; byId('modeloMarca').value='';
    openModal('modeloModal');
  });
  byId('saveModeloBtn')?.addEventListener('click', async ()=>{
    const nombre = (byId('modeloNombre').value||'').trim();
    const marcaId = Number(byId('modeloMarca').value||0);
    if (!nombre || !marcaId){ byId('modeloNombre').focus(); return; }
    const payload = { nombre, marcaId };
    try {
      if (editing.scope==='modelo' && editing.id){
        await apiFetch(`/modelos/${editing.id}`, { method:'PUT', body: payload });
      } else {
        await apiFetch('/modelos', { method:'POST', body: payload });
      }
      await loadModelos();
      closeModal('modeloModal');
      editing.scope = null; editing.id = null;
    } catch (error) {
      handleError(error, 'No se pudo guardar el modelo');
    }
  });

  // Nuevo/Guardar: Materiales
  byId('addMaterialBtn')?.addEventListener('click', ()=>{ editing.scope='material'; editing.id=null; byId('materialModalTitle').textContent='Nuevo Material'; byId('materialNombre').value=''; openModal('materialModal'); });
  byId('saveMaterialBtn')?.addEventListener('click', async ()=>{
    const nombre = (byId('materialNombre').value||'').trim();
    if (!nombre){ byId('materialNombre').focus(); return; }
    try {
      if (editing.scope==='material' && editing.id){
        await apiFetch(`/materiales/${editing.id}`, { method:'PUT', body:{ nombre } });
      } else {
        await apiFetch('/materiales', { method:'POST', body:{ nombre } });
      }
      await loadMateriales();
      closeModal('materialModal');
      editing.scope = null; editing.id = null;
    } catch (error) {
      handleError(error, 'No se pudo guardar el material');
    }
  });

  // Nuevo/Guardar: Unidades
  byId('addUnidadBtn')?.addEventListener('click', ()=>{ editing.scope='unidad'; editing.id=null; byId('unidadModalTitle').textContent='Nueva Unidad'; byId('unidadNombre').value=''; byId('unidadAbrev').value=''; openModal('unidadModal'); });
  byId('saveUnidadBtn')?.addEventListener('click', async ()=>{
    const nombre = (byId('unidadNombre').value||'').trim();
    const abrev = (byId('unidadAbrev').value||'').trim();
    if (!nombre){ byId('unidadNombre').focus(); return; }
    const payload = { nombre, abreviatura: abrev };
    try {
      if (editing.scope==='unidad' && editing.id){
        await apiFetch(`/unidades/${editing.id}`, { method:'PUT', body: payload });
      } else {
        await apiFetch('/unidades', { method:'POST', body: payload });
      }
      await loadUnidades();
      closeModal('unidadModal');
      editing.scope = null; editing.id = null;
    } catch (error) {
      handleError(error, 'No se pudo guardar la unidad');
    }
  });

  // Nuevo/Guardar: Tipos
  byId('addTipoBtn')?.addEventListener('click', ()=>{ editing.scope='tipo'; editing.id=null; byId('tipoModalTitle').textContent='Nuevo Tipo de Producto'; byId('tipoNombre').value=''; openModal('tipoModal'); });
  byId('saveTipoBtn')?.addEventListener('click', async ()=>{
    const nombre = (byId('tipoNombre').value||'').trim();
    if (!nombre){ byId('tipoNombre').focus(); return; }
    try {
      if (editing.scope==='tipo' && editing.id){
        await apiFetch(`/tipos/${editing.id}`, { method:'PUT', body:{ nombre } });
      } else {
        await apiFetch('/tipos', { method:'POST', body:{ nombre } });
      }
      await loadTipos();
      closeModal('tipoModal');
      editing.scope = null; editing.id = null;
    } catch (error) {
      handleError(error, 'No se pudo guardar el tipo de producto');
    }
  });

  // Ver detalle helpers
  function viewMarca(id){ const it = marcas.find(x=>x.id===id); if (!it) return; byId('marcaDetalleBody').innerHTML = `<p><strong>ID:</strong> ${it.id}</p><p><strong>Marca:</strong> ${it.nombre}</p>`; openModal('marcaDetalleModal'); }
  function viewModelo(id){
    const it = modelos.find(x=>x.id===id);
    if (!it) return;
    const body = byId('modeloDetalleBody');
    if (!body) return;
    const nombre = escapeHtml(it.nombre ?? '');
    const marca = escapeHtml(it.marca ?? '-');
    const identifier = escapeHtml(it.id ?? '-');
    body.innerHTML = `
      <p><strong>ID:</strong> ${identifier}</p>
      <p><strong>Modelo:</strong> ${nombre}</p>
      <p><strong>Marca:</strong> ${marca}</p>
    `;
    openModal('modeloDetalleModal');
  }
  function viewMaterial(id){ const it = materiales.find(x=>x.id===id); if (!it) return; byId('materialDetalleBody').innerHTML = `<p><strong>ID:</strong> ${it.id}</p><p><strong>Material:</strong> ${it.nombre}</p>`; openModal('materialDetalleModal'); }
  function viewUnidad(id){ const it = unidades.find(x=>x.id===id); if (!it) return; byId('unidadDetalleBody').innerHTML = `<p><strong>ID:</strong> ${it.id}</p><p><strong>Unidad:</strong> ${it.nombre}</p><p><strong>Abreviatura:</strong> ${it.abreviatura||'-'}</p>`; openModal('unidadDetalleModal'); }
  function viewTipo(id){ const it = tipos.find(x=>x.id===id); if (!it) return; byId('tipoDetalleBody').innerHTML = `<p><strong>ID:</strong> ${it.id}</p><p><strong>Tipo:</strong> ${it.nombre}</p>`; openModal('tipoDetalleModal'); }

  // Edit helpers
  function editMarca(id){ const it = marcas.find(x=>x.id===id); if (!it) return; editing.scope='marca'; editing.id=id; byId('marcaModalTitle').textContent='Editar Marca'; byId('marcaNombre').value=it.nombre; openModal('marcaModal'); }
  function editModelo(id){
    const it = modelos.find(x=>x.id===id); if (!it) return;
    editing.scope='modelo'; editing.id=id; populateModeloMarcas();
    byId('modeloModalTitle').textContent='Editar Modelo';
    byId('modeloNombre').value=it.nombre;
    byId('modeloMarca').value=String(it.marcaId||'');
    openModal('modeloModal');
  }
  function editMaterial(id){ const it = materiales.find(x=>x.id===id); if (!it) return; editing.scope='material'; editing.id=id; byId('materialModalTitle').textContent='Editar Material'; byId('materialNombre').value=it.nombre; openModal('materialModal'); }
  function editUnidad(id){ const it = unidades.find(x=>x.id===id); if (!it) return; editing.scope='unidad'; editing.id=id; byId('unidadModalTitle').textContent='Editar Unidad'; byId('unidadNombre').value=it.nombre; byId('unidadAbrev').value=it.abreviatura||''; openModal('unidadModal'); }
  function editTipo(id){ const it = tipos.find(x=>x.id===id); if (!it) return; editing.scope='tipo'; editing.id=id; byId('tipoModalTitle').textContent='Editar Tipo de Producto'; byId('tipoNombre').value=it.nombre; openModal('tipoModal'); }

  // Acciones (ver/editar/eliminar) delegadas
  document.body.addEventListener('click', async (e)=>{
    const btn = e.target.closest('.action-buttons-cell .btn-icon');
    if (!btn) return;
    const scope = btn.dataset.scope;
    const rawId = btn.dataset.id;
  const numericId = Number(rawId);
  const idForUrl = Number.isNaN(numericId) ? rawId : numericId;
  const id = Number.isNaN(numericId) ? rawId : numericId;
    const sets = { marca:marcas, modelo:modelos, material:materiales, unidad:unidades, tipo:tipos };
    const list = sets[scope]; if (!list) return;
    const item = list.find(entry => String(entry.id) === String(rawId));
    const itemName = item?.nombre || item?.marca || item?.descripcion || `ID ${rawId}`;
    const scopeTitleMap = {
      marca: 'Marca',
      modelo: 'Modelo',
      material: 'Material',
      unidad: 'Unidad de medida',
      tipo: 'Tipo de producto'
    };
    const scopeTitle = scopeTitleMap[scope] || 'Registro';
    if (btn.classList.contains('btn-view')){
      if (scope==='marca') viewMarca(id);
      if (scope==='modelo') viewModelo(id);
      if (scope==='material') viewMaterial(id);
      if (scope==='unidad') viewUnidad(id);
      if (scope==='tipo') viewTipo(id);
    } else if (btn.classList.contains('btn-edit')){
      const confirmed = await askConfirmation({
        title: `Editar ${scopeTitle.toLowerCase()}`,
        message: `¿Deseas editar ${scopeTitle.toLowerCase()} "${itemName}"?`,
        confirmText: 'Sí, editar',
        cancelText: 'Cancelar'
      });
      if (!confirmed) return;
      if (scope==='marca') editMarca(id);
      if (scope==='modelo') editModelo(id);
      if (scope==='material') editMaterial(id);
      if (scope==='unidad') editUnidad(id);
      if (scope==='tipo') editTipo(id);
    } else if (btn.classList.contains('btn-delete')){
      const confirmed = await askConfirmation({
        title: `Eliminar ${scopeTitle.toLowerCase()}`,
        message: `Esta acción eliminará ${scopeTitle.toLowerCase()} "${itemName}". ¿Deseas continuar?`,
        confirmText: 'Sí, eliminar',
        cancelText: 'Cancelar',
        variant: 'danger'
      });
      if (!confirmed) return;
      try {
        if (scope==='marca'){
          await apiFetch(`/marcas/${idForUrl}`, { method:'DELETE' });
          await loadMarcas();
          await loadModelos();
        } else if (scope==='modelo'){
          await apiFetch(`/modelos/${rawId}`, { method:'DELETE' });
          await loadModelos();
        } else if (scope==='material'){
          await apiFetch(`/materiales/${idForUrl}`, { method:'DELETE' });
          await loadMateriales();
        } else if (scope==='unidad'){
          await apiFetch(`/unidades/${idForUrl}`, { method:'DELETE' });
          await loadUnidades();
        } else if (scope==='tipo'){
          await apiFetch(`/tipos/${idForUrl}`, { method:'DELETE' });
          await loadTipos();
        }
      } catch (error) {
        handleError(error, 'No se pudo eliminar el registro');
      }
    }
  });

  // Inicialización desde backend
  initialize().catch((error)=>{
    handleError(error, 'No se pudo cargar la información inicial de catálogos');
  });
})();
