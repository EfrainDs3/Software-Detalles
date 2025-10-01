// Catálogos unificado: render secuencial con paginación (5 por página)
(function(){
  // Demo data en memoria
  let marcas = [ {id:1,nombre:'Nike'},{id:2,nombre:'Adidas'},{id:3,nombre:'Puma'},{id:4,nombre:'Reebok'},{id:5,nombre:'Vans'},{id:6,nombre:'Converse'} ];
  let materiales = [ {id:1,nombre:'Cuero'},{id:2,nombre:'Textil'},{id:3,nombre:'Sintético'},{id:4,nombre:'Lona'},{id:5,nombre:'Gamuza'},{id:6,nombre:'Metal'} ];
  let unidades = [ {id:1,nombre:'Par',abrev:'par'},{id:2,nombre:'Unidad',abrev:'und'},{id:3,nombre:'Caja',abrev:'caja'},{id:4,nombre:'Kit',abrev:'kit'},{id:5,nombre:'Docena',abrev:'dz'},{id:6,nombre:'Pack',abrev:'pack'} ];
  let tipos = [ {id:1,nombre:'Deportivo'},{id:2,nombre:'Formal'},{id:3,nombre:'Casual'},{id:4,nombre:'Outdoor'},{id:5,nombre:'Urbano'},{id:6,nombre:'Sandalias'} ];
  let modelos = [
    {id:1,nombre:'Air Max 270', marcaId:1, marca:'Nike', imagen:''},
    {id:2,nombre:'UltraBoost', marcaId:2, marca:'Adidas', imagen:''},
    {id:3,nombre:'Roma', marcaId:3, marca:'Puma', imagen:''},
    {id:4,nombre:'Classic', marcaId:4, marca:'Reebok', imagen:''},
    {id:5,nombre:'Old Skool', marcaId:5, marca:'Vans', imagen:''},
    {id:6,nombre:'Chuck 70', marcaId:6, marca:'Converse', imagen:''}
  ];

  const PAGE_SIZE = 5;

  // Estado de búsqueda y página
  const state = {
    marcas: { page:1, term:'' },
    modelos: { page:1, term:'' },
    materiales: { page:1, term:'' },
    unidades: { page:1, term:'' },
    tipos: { page:1, term:'' }
  };

  // Estado de edición simple
  const editing = { scope:null, id:null };
  const byId = (id) => document.getElementById(id);
  const nextId = (list) => list.length ? Math.max(...list.map(i=>i.id)) + 1 : 1;
  // Cache de altura mínima por tabla para mantener estable la posición de la paginación
  const heightCache = {};

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
    if (key==='unidades') filtered = list.filter(u=>u.nombre.toLowerCase().includes(term) || (u.abrev||'').toLowerCase().includes(term));
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
    const term = state.modelos.term.toLowerCase();
    const filtered = modelos.filter(m => m.nombre.toLowerCase().includes(term) || m.marca.toLowerCase().includes(term));
    const page = state.modelos.page;
    const rows = paginate(filtered, page);
    const tbody = document.getElementById('modelosTableBody');
    tbody.innerHTML = rows.map(r => `
      <tr>
        <td>${r.id}</td>
        <td>${r.nombre}</td>
        <td>${r.marca}</td>
        <td>
          ${r.imagen
            ? `<div class="product-image"><a href="${r.imagen}" target="_blank" title="Ver imagen"><img class="calzado-img" src="${r.imagen}" alt="${r.nombre}"></a></div>`
            : `<div class="product-image"><div class="placeholder-image"><i class="fas fa-image"></i></div></div>`}
        </td>
        <td><div class="action-buttons-cell">
          <button class="btn-icon btn-view" data-scope="modelo" data-id="${r.id}"><i class="fas fa-eye"></i></button>
          <button class="btn-icon btn-edit" data-scope="modelo" data-id="${r.id}"><i class="fas fa-edit"></i></button>
          <button class="btn-icon btn-delete" data-scope="modelo" data-id="${r.id}"><i class="fas fa-trash"></i></button>
        </div></td>
      </tr>`).join('');
    setFixedHeightForTable('modelosTable');
    renderPagination('modelosPagination', filtered.length, page, (p)=>{ state.modelos.page=p; renderModelos(); });
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
    const filtered = unidades.filter(u => u.nombre.toLowerCase().includes(term) || (u.abrev||'').toLowerCase().includes(term));
    const page = state.unidades.page;
    const rows = paginate(filtered, page);
    const tbody = document.getElementById('unidadesTableBody');
    tbody.innerHTML = rows.map(r => `
      <tr>
        <td>${r.id}</td>
        <td>${r.nombre}</td>
        <td>${r.abrev || '-'}</td>
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
  byId('saveMarcaBtn')?.addEventListener('click', ()=>{
    const nombre = (byId('marcaNombre').value||'').trim(); if (!nombre){ byId('marcaNombre').focus(); return; }
    if (editing.scope==='marca' && editing.id){ const it = marcas.find(x=>x.id===editing.id); if (it) it.nombre = nombre; }
    else { marcas.push({ id: nextId(marcas), nombre }); }
    normalizePage('marcas', marcas); closeModal('marcaModal'); renderMarcas();
  });

  // Nuevo/Guardar: Modelos
  function populateModeloMarcas(){ const sel = byId('modeloMarca'); if (!sel) return; sel.innerHTML = '<option value="">Seleccionar marca</option>' + marcas.map(m=>`<option value="${m.id}">${m.nombre}</option>`).join(''); }

  // Imagen para Modelo: selección y previsualización
  function resetModeloImagePreview(){
    const preview = byId('modeloImagePreview');
    if (!preview) return;
    preview.innerHTML = '<i class="fas fa-camera"></i><span>Click para subir imagen</span>';
  }
  function setModeloImagePreview(src){
    const preview = byId('modeloImagePreview');
    if (!preview) return;
    preview.innerHTML = '';
    const img = document.createElement('img');
    img.src = src;
    preview.appendChild(img);
  }
  // Abrir selector al hacer click en preview o botón
  byId('modeloImagePreview')?.addEventListener('click', ()=> byId('modeloImage')?.click());
  byId('selectModeloImageBtn')?.addEventListener('click', ()=> byId('modeloImage')?.click());
  // Actualizar preview al seleccionar archivo
  byId('modeloImage')?.addEventListener('change', (e)=>{
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev)=> setModeloImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  });

  byId('addModeloBtn')?.addEventListener('click', ()=>{
    editing.scope='modelo'; editing.id=null; populateModeloMarcas();
    byId('modeloModalTitle').textContent='Nuevo Modelo';
    byId('modeloNombre').value=''; byId('modeloMarca').value='';
    if (byId('modeloImage')) byId('modeloImage').value='';
    resetModeloImagePreview();
    openModal('modeloModal');
  });
  byId('saveModeloBtn')?.addEventListener('click', ()=>{
    const nombre = (byId('modeloNombre').value||'').trim();
    const marcaId = Number(byId('modeloMarca').value||0);
    if (!nombre || !marcaId){ byId('modeloNombre').focus(); return; }
    const marcaObj = marcas.find(m=>m.id===marcaId);
    // Obtener imagen desde preview (si hay IMG, asumimos dataURL)
    let imagen = '';
    const preview = byId('modeloImagePreview');
    const imgEl = preview ? preview.querySelector('img') : null;
    if (imgEl && imgEl.src) imagen = imgEl.src;
    if (editing.scope==='modelo' && editing.id){
      const it = modelos.find(x=>x.id===editing.id);
      if (it){ it.nombre=nombre; it.marcaId=marcaId; it.marca=marcaObj?.nombre||''; if (imagen) it.imagen=imagen; }
    } else {
      modelos.push({ id: nextId(modelos), nombre, marcaId, marca: marcaObj?.nombre||'', imagen });
    }
    normalizePage('modelos', modelos); closeModal('modeloModal'); renderModelos();
  });

  // Nuevo/Guardar: Materiales
  byId('addMaterialBtn')?.addEventListener('click', ()=>{ editing.scope='material'; editing.id=null; byId('materialModalTitle').textContent='Nuevo Material'; byId('materialNombre').value=''; openModal('materialModal'); });
  byId('saveMaterialBtn')?.addEventListener('click', ()=>{
    const nombre = (byId('materialNombre').value||'').trim(); if (!nombre){ byId('materialNombre').focus(); return; }
    if (editing.scope==='material' && editing.id){ const it = materiales.find(x=>x.id===editing.id); if (it) it.nombre=nombre; }
    else { materiales.push({ id: nextId(materiales), nombre }); }
    normalizePage('materiales', materiales); closeModal('materialModal'); renderMateriales();
  });

  // Nuevo/Guardar: Unidades
  byId('addUnidadBtn')?.addEventListener('click', ()=>{ editing.scope='unidad'; editing.id=null; byId('unidadModalTitle').textContent='Nueva Unidad'; byId('unidadNombre').value=''; byId('unidadAbrev').value=''; openModal('unidadModal'); });
  byId('saveUnidadBtn')?.addEventListener('click', ()=>{
    const nombre = (byId('unidadNombre').value||'').trim(); const abrev = (byId('unidadAbrev').value||'').trim(); if (!nombre){ byId('unidadNombre').focus(); return; }
    if (editing.scope==='unidad' && editing.id){ const it = unidades.find(x=>x.id===editing.id); if (it){ it.nombre=nombre; it.abrev=abrev; } }
    else { unidades.push({ id: nextId(unidades), nombre, abrev }); }
    normalizePage('unidades', unidades); closeModal('unidadModal'); renderUnidades();
  });

  // Nuevo/Guardar: Tipos
  byId('addTipoBtn')?.addEventListener('click', ()=>{ editing.scope='tipo'; editing.id=null; byId('tipoModalTitle').textContent='Nuevo Tipo de Producto'; byId('tipoNombre').value=''; openModal('tipoModal'); });
  byId('saveTipoBtn')?.addEventListener('click', ()=>{
    const nombre = (byId('tipoNombre').value||'').trim(); if (!nombre){ byId('tipoNombre').focus(); return; }
    if (editing.scope==='tipo' && editing.id){ const it = tipos.find(x=>x.id===editing.id); if (it) it.nombre=nombre; }
    else { tipos.push({ id: nextId(tipos), nombre }); }
    normalizePage('tipos', tipos); closeModal('tipoModal'); renderTipos();
  });

  // Ver detalle helpers
  function viewMarca(id){ const it = marcas.find(x=>x.id===id); if (!it) return; byId('marcaDetalleBody').innerHTML = `<p><strong>ID:</strong> ${it.id}</p><p><strong>Marca:</strong> ${it.nombre}</p>`; openModal('marcaDetalleModal'); }
  function viewModelo(id){ const it = modelos.find(x=>x.id===id); if (!it) return; byId('modeloDetalleBody').innerHTML = `<p><strong>ID:</strong> ${it.id}</p><p><strong>Modelo:</strong> ${it.nombre}</p><p><strong>Marca:</strong> ${it.marca||'-'}</p>${it.imagen?`<img src="${it.imagen}" alt="${it.nombre}" style="max-width:100%;margin-top:8px;">`:''}`; openModal('modeloDetalleModal'); }
  function viewMaterial(id){ const it = materiales.find(x=>x.id===id); if (!it) return; byId('materialDetalleBody').innerHTML = `<p><strong>ID:</strong> ${it.id}</p><p><strong>Material:</strong> ${it.nombre}</p>`; openModal('materialDetalleModal'); }
  function viewUnidad(id){ const it = unidades.find(x=>x.id===id); if (!it) return; byId('unidadDetalleBody').innerHTML = `<p><strong>ID:</strong> ${it.id}</p><p><strong>Unidad:</strong> ${it.nombre}</p><p><strong>Abreviatura:</strong> ${it.abrev||'-'}</p>`; openModal('unidadDetalleModal'); }
  function viewTipo(id){ const it = tipos.find(x=>x.id===id); if (!it) return; byId('tipoDetalleBody').innerHTML = `<p><strong>ID:</strong> ${it.id}</p><p><strong>Tipo:</strong> ${it.nombre}</p>`; openModal('tipoDetalleModal'); }

  // Edit helpers
  function editMarca(id){ const it = marcas.find(x=>x.id===id); if (!it) return; editing.scope='marca'; editing.id=id; byId('marcaModalTitle').textContent='Editar Marca'; byId('marcaNombre').value=it.nombre; openModal('marcaModal'); }
  function editModelo(id){
    const it = modelos.find(x=>x.id===id); if (!it) return;
    editing.scope='modelo'; editing.id=id; populateModeloMarcas();
    byId('modeloModalTitle').textContent='Editar Modelo';
    byId('modeloNombre').value=it.nombre;
    byId('modeloMarca').value=String(it.marcaId||'');
    if (byId('modeloImage')) byId('modeloImage').value='';
    if (it.imagen){ setModeloImagePreview(it.imagen); } else { resetModeloImagePreview(); }
    openModal('modeloModal');
  }
  function editMaterial(id){ const it = materiales.find(x=>x.id===id); if (!it) return; editing.scope='material'; editing.id=id; byId('materialModalTitle').textContent='Editar Material'; byId('materialNombre').value=it.nombre; openModal('materialModal'); }
  function editUnidad(id){ const it = unidades.find(x=>x.id===id); if (!it) return; editing.scope='unidad'; editing.id=id; byId('unidadModalTitle').textContent='Editar Unidad'; byId('unidadNombre').value=it.nombre; byId('unidadAbrev').value=it.abrev||''; openModal('unidadModal'); }
  function editTipo(id){ const it = tipos.find(x=>x.id===id); if (!it) return; editing.scope='tipo'; editing.id=id; byId('tipoModalTitle').textContent='Editar Tipo de Producto'; byId('tipoNombre').value=it.nombre; openModal('tipoModal'); }

  // Acciones (ver/editar/eliminar) delegadas
  document.body.addEventListener('click', (e)=>{
    const btn = e.target.closest('.action-buttons-cell .btn-icon');
    if (!btn) return;
    const scope = btn.dataset.scope; const id = Number(btn.dataset.id);
    const sets = { marca:marcas, modelo:modelos, material:materiales, unidad:unidades, tipo:tipos };
    const list = sets[scope]; if (!list) return;
    if (btn.classList.contains('btn-view')){
      if (scope==='marca') viewMarca(id);
      if (scope==='modelo') viewModelo(id);
      if (scope==='material') viewMaterial(id);
      if (scope==='unidad') viewUnidad(id);
      if (scope==='tipo') viewTipo(id);
    } else if (btn.classList.contains('btn-edit')){
      if (scope==='marca') editMarca(id);
      if (scope==='modelo') editModelo(id);
      if (scope==='material') editMaterial(id);
      if (scope==='unidad') editUnidad(id);
      if (scope==='tipo') editTipo(id);
    } else if (btn.classList.contains('btn-delete')){
      if (confirm('¿Eliminar registro?')){
        const idx = list.findIndex(x => x.id === id);
        if (idx >= 0) list.splice(idx,1);
        if (scope==='marca'){ normalizePage('marcas', marcas); renderMarcas(); }
        if (scope==='modelo'){ normalizePage('modelos', modelos); renderModelos(); }
        if (scope==='material'){ normalizePage('materiales', materiales); renderMateriales(); }
        if (scope==='unidad'){ normalizePage('unidades', unidades); renderUnidades(); }
        if (scope==='tipo'){ normalizePage('tipos', tipos); renderTipos(); }
      }
    }
  });

  // Inicializar renders
  renderMarcas();
  renderModelos();
  renderMateriales();
  renderUnidades();
  renderTipos();
})();
