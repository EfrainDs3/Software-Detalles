(function(){
  const PRODUCT_API = '/api/productos/calzados';
  const PROVIDER_API = '/api/proveedores';
  const CATALOG_BASE = '/api/catalogos';
  const PLACEHOLDER_IMG = '/img/calzado-default.jpg';

  const state = {
    items: [],
    combos: {
      modelos: [],
      materiales: [],
      unidades: [],
      tipos: [],
      proveedores: []
    },
    filtros: {
      busqueda: '',
      marca: '',
      modelo: '',
      color: '',
      tipo: '',
      material: ''
    },
    editandoId: null
  };

  document.addEventListener('DOMContentLoaded', init);

  async function askConfirmation(options){
    if (window.confirmationModal?.confirm){
      return window.confirmationModal.confirm(options);
    }
    const message = options?.message || '¿Deseas continuar con esta acción?';
    return Promise.resolve(window.confirm(message));
  }

  async function init(){
    registrarEventosBasicos();
    try {
      await Promise.all([cargarCatalogos(), cargarProductos()]);
      showNotification('Catálogo de calzados actualizado');
    } catch (error) {
      console.error(error);
      showNotification(error.message || 'No se pudo cargar la información inicial', 'error');
    }
  }

  function registrarEventosBasicos(){
    const searchInput = document.getElementById('searchInput');
    const addBtn = document.getElementById('addCalzadoBtn');
  const filterBtn = document.getElementById('filterBtn');
  const selectAll = document.getElementById('selectAll');
    const form = document.getElementById('calzadoForm');
    const cancelBtn = document.getElementById('cancelBtn');
    const closeModalBtn = document.getElementById('closeModal');
    const modal = document.getElementById('calzadoModal');

    if (searchInput){
      searchInput.addEventListener('input', (e)=>{
        state.filtros.busqueda = e.target.value.toLowerCase();
        renderTabla();
      });
    }

    if (addBtn){
      addBtn.addEventListener('click', ()=> abrirModal());
    }

    if (filterBtn){
      filterBtn.addEventListener('click', openFilterModal);
    }

    if (selectAll){
      selectAll.addEventListener('change', (event)=>{
        document.querySelectorAll('.calzado-checkbox').forEach(cb => {
          cb.checked = event.target.checked;
        });
      });
    }

    if (cancelBtn){
      cancelBtn.addEventListener('click', ()=> cerrarModal());
    }

    if (closeModalBtn){
      closeModalBtn.addEventListener('click', ()=> cerrarModal());
    }

    if (modal){
      modal.addEventListener('click', (e)=>{
        if (e.target === modal){
          cerrarModal();
        }
      });
    }

    if (form){
      form.addEventListener('submit', async (e)=>{
        e.preventDefault();
        try {
          await guardarProducto();
          cerrarModal();
          await cargarProductos();
          showNotification('Producto guardado correctamente');
        } catch (error) {
          console.error(error);
          showNotification(error.message || 'No se pudo guardar el producto', 'error');
        }
      });
    }

    document.getElementById('selectImageBtn')?.addEventListener('click', ()=>{
      document.getElementById('calzadoImage')?.click();
    });

    document.getElementById('calzadoImage')?.addEventListener('change', manejarImagenSeleccionada);

    const addTallaBtn = document.getElementById('addTallaBtn');
    if (addTallaBtn){
      addTallaBtn.addEventListener('click', ()=>{
        agregarTalla();
        actualizarPreview();
      });
    }

    const modelSelect = document.getElementById('calzadoModel');
    if (modelSelect){
      modelSelect.addEventListener('change', ()=>{
        actualizarMarcaDesdeModelo();
        actualizarImagenDesdeModelo();
        actualizarPreview();
      });
    }

    ['calzadoName','calzadoModel','calzadoCategory','calzadoColor','calzadoType','calzadoMaterial','calzadoUnidad','calzadoDimensiones','calzadoPeso','calzadoBrandName'].forEach(id=>{
      const el = document.getElementById(id);
      if (el){
        el.addEventListener('input', actualizarPreview);
        el.addEventListener('change', actualizarPreview);
      }
    });

    document.getElementById('calzadoDescription')?.addEventListener('input', actualizarPreview);

    document.getElementById('calzadoCategory')?.addEventListener('change', actualizarPreview);

    document.getElementById('calzadosTableBody')?.addEventListener('click', manejarAccionesTabla);
  }

  async function cargarCatalogos(){
    try {
      const [modelos, materiales, unidades, tipos, proveedores] = await Promise.all([
        apiGet(`${CATALOG_BASE}/modelos`),
        apiGet(`${CATALOG_BASE}/materiales`),
        apiGet(`${CATALOG_BASE}/unidades`),
        apiGet(`${CATALOG_BASE}/tipos`),
        apiGet(PROVIDER_API)
      ]);
      state.combos.modelos = Array.isArray(modelos) ? modelos : [];
      state.combos.materiales = Array.isArray(materiales) ? materiales : [];
      state.combos.unidades = Array.isArray(unidades) ? unidades : [];
      state.combos.tipos = Array.isArray(tipos) ? tipos : [];
      state.combos.proveedores = Array.isArray(proveedores) ? proveedores : [];
      poblarSelects();
    } catch (error) {
      throw new Error('No se pudieron cargar los catálogos base');
    }
  }

  function poblarSelects(){
    poblarSelect('calzadoModel', state.combos.modelos, { value: 'id', label: 'nombre', extra: 'marca' }, 'Sin modelos registrados');
    poblarSelect('calzadoMaterial', state.combos.materiales, { value: 'id', label: 'nombre' });
    poblarSelect('calzadoUnidad', state.combos.unidades, { value: 'id', label: 'nombre', extra: 'abreviatura' });
    poblarSelect('calzadoCategory', state.combos.tipos, { value: 'id', label: 'nombre' });
    poblarSelect('calzadoProveedor', state.combos.proveedores, { value: 'idProveedor', label: 'razonSocial', extra: 'nombreComercial' });
    actualizarMarcaDesdeModelo();
    actualizarImagenDesdeModelo();
    actualizarPreview();
  }

  function poblarSelect(id, items, { value, label, extra } = {}){
    const select = document.getElementById(id);
    if (!select) return;
    const current = select.value;
    select.innerHTML = '<option value="">Seleccionar opción</option>';
    items.forEach(item => {
      const option = document.createElement('option');
      option.value = item[value];
      option.textContent = extra && item[extra] ? `${item[label]} (${item[extra]})` : item[label];
      select.appendChild(option);
    });
    if (current){
      select.value = current;
    }
  }

  function obtenerModeloSeleccionado(){
    const selectModelo = document.getElementById('calzadoModel');
    if (!selectModelo) return null;
    const value = parseInt(selectModelo.value, 10);
    if (Number.isNaN(value)){
      return null;
    }
    return state.combos.modelos.find(modelo => Number(modelo.id) === value) || null;
  }

  function actualizarMarcaDesdeModelo(){
    const marcaInput = document.getElementById('calzadoBrandName');
    if (!marcaInput) return;
    const modeloSeleccionado = obtenerModeloSeleccionado();
    marcaInput.value = modeloSeleccionado?.marca || '';
  }

  function actualizarImagenDesdeModelo(){
    const preview = document.getElementById('imagePreview');
    if (!preview) return;
    if (preview.dataset.userImage === 'true'){
      return;
    }
    const modeloSeleccionado = obtenerModeloSeleccionado();
    if (modeloSeleccionado?.imagen){
      preview.innerHTML = `<img src="${modeloSeleccionado.imagen}" alt="${modeloSeleccionado.nombre}">`;
      preview.style.backgroundImage = '';
      preview.dataset.source = modeloSeleccionado.imagen;
      preview.dataset.modelImage = 'true';
    } else {
      preview.style.backgroundImage = '';
      delete preview.dataset.source;
      delete preview.dataset.modelImage;
    }
  }

  async function cargarProductos(){
    const data = await apiGet(PRODUCT_API);
    state.items = Array.isArray(data) ? data.map(mapearProducto) : [];
    renderTabla();
  }

  function mapearProducto(item){
    return {
      id: item.id,
      nombre: item.nombre,
      descripcion: item.descripcion,
      categoria: item.categoria,
      marca: item.marca,
      modelo: item.modelo,
      material: item.material,
      unidad: item.unidad,
      proveedor: item.proveedor,
      precioVenta: item.precioVenta,
      costoCompra: item.costoCompra,
      color: item.color,
      tipo: item.tipo,
      dimensiones: item.dimensiones,
      pesoGramos: item.pesoGramos,
      tallas: Array.isArray(item.tallas) ? item.tallas : [],
      tiposProducto: Array.isArray(item.tiposProducto) ? item.tiposProducto : [],
      imagenModelo: item.modelo?.imagen || null,
      activo: item.activo !== false
    };
  }

  function renderTabla(){
    const tbody = document.getElementById('calzadosTableBody');
    if (!tbody) return;
    const filtro = state.filtros.busqueda;
    let registros = state.items;

    // Aplicar filtros avanzados
    if (state.filtros.marca) {
      registros = registros.filter(item => item.marca?.nombre === state.filtros.marca);
    }
    if (state.filtros.modelo) {
      registros = registros.filter(item => item.modelo?.nombre === state.filtros.modelo);
    }
    if (state.filtros.color) {
      registros = registros.filter(item => item.color === state.filtros.color);
    }
    if (state.filtros.tipo) {
      registros = registros.filter(item => item.tipo === state.filtros.tipo);
    }
    if (state.filtros.material) {
      registros = registros.filter(item => item.material?.nombre === state.filtros.material);
    }

    // Aplicar búsqueda
    if (filtro) {
      registros = registros.filter(item => {
        const texto = [item.nombre, item.marca?.nombre, item.modelo?.nombre, item.color, item.tipo]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return texto.includes(filtro);
      });
    }

    if (!registros.length){
      tbody.innerHTML = `<tr><td colspan="9"><div class="empty-state">No hay calzados registrados todavía.</div></td></tr>`;
    } else {
      tbody.innerHTML = registros.map((item, index) => renderFila(item, index)).join('');
    }
    actualizarInfoPaginacion(registros.length, state.items.length);
    const selectAll = document.getElementById('selectAll');
    if (selectAll){
      selectAll.checked = registros.length > 0 && registros.every(item => document.querySelector(`.calzado-checkbox[data-calzado-id="${item.id}"]`)?.checked);
    }
  }

  function renderFila(item, index){
    const marcaNombre = item.marca?.nombre || '-';
    const modeloNombre = item.modelo?.nombre || '-';
    const color = item.color || '-';
    const tipo = item.tipo || '-';
    const totalTallas = Array.isArray(item.tallas) ? item.tallas.length : 0;
    const imagenUrl = obtenerImagenProducto(item);
    const esPlaceholder = imagenUrl === PLACEHOLDER_IMG;
    const detallesSecundarios = [color && color !== '-' ? `Color: ${color}` : null, totalTallas ? `${totalTallas} tallas` : null]
      .filter(Boolean)
      .join(' • ');
    return `
      <tr>
        <td><input type="checkbox" class="calzado-checkbox" data-calzado-id="${item.id}"></td>
        <td>${index + 1}</td>
        <td>
          <div class="product-image">
            <img src="${imagenUrl}" alt="${item.nombre}" class="calzado-img${esPlaceholder ? ' is-placeholder' : ''}" loading="lazy">
          </div>
        </td>
        <td>
          <div class="product-info">
            <div class="product-details">
              <span class="product-name">${item.nombre}</span>
              <span class="product-category">${detallesSecundarios || 'Sin detalles'}</span>
            </div>
          </div>
        </td>
        <td><span class="brand-badge">${marcaNombre}</span></td>
        <td>${modeloNombre}</td>
        <td><span class="color-badge">${color}</span></td>
        <td><span class="type-badge">${tipo}</span></td>
        <td>
          <div class="action-buttons-cell">
            <button class="btn-icon btn-edit" data-action="edit" data-id="${item.id}" title="Editar"><i class="fas fa-edit"></i></button>
            <button class="btn-icon btn-delete" data-action="delete" data-id="${item.id}" title="Eliminar"><i class="fas fa-trash"></i></button>
            <button class="btn-icon btn-view" data-action="view" data-id="${item.id}" title="Ver detalles"><i class="fas fa-eye"></i></button>
          </div>
        </td>
      </tr>`;
  }

  function obtenerImagenProducto(item){
    if (item?.imagenModelo){
      return item.imagenModelo;
    }
    return PLACEHOLDER_IMG;
  }

  function actualizarInfoPaginacion(actual, total){
    const info = document.querySelector('.pagination-info');
    if (!info) return;
    if (total === 0){
      info.textContent = 'Sin registros';
      return;
    }
    info.textContent = `Mostrando ${actual} de ${total} calzados`;
  }

  function abrirModal(item){
    const modal = document.getElementById('calzadoModal');
    if (!modal) return;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    resetFormulario();
    if (item){
      state.editandoId = item.id;
      document.getElementById('modalTitle').textContent = 'Editar Calzado';
      cargarEnFormulario(item);
    } else {
      state.editandoId = null;
      document.getElementById('modalTitle').textContent = 'Nuevo Calzado';
      agregarTalla();
      actualizarPreview();
    }
  }

  function cerrarModal(){
    const modal = document.getElementById('calzadoModal');
    if (!modal) return;
    modal.style.display = 'none';
    document.body.style.overflow = '';
    resetFormulario();
    state.editandoId = null;
  }

  function resetFormulario(){
    document.getElementById('calzadoForm')?.reset();
    const marcaInput = document.getElementById('calzadoBrandName');
    if (marcaInput){
      marcaInput.value = '';
    }
    const tallasContainer = document.getElementById('tallasContainer');
    if (tallasContainer){
      tallasContainer.innerHTML = '';
    }
    const preview = document.getElementById('imagePreview');
    if (preview){
      preview.style.backgroundImage = '';
      delete preview.dataset.source;
      delete preview.dataset.modelImage;
      delete preview.dataset.userImage;
    }
    actualizarPreview();
  }

  function cargarEnFormulario(item){
  const nombreInput = document.getElementById('calzadoName');
  if (nombreInput) nombreInput.value = item.nombre || '';
  const modeloSelect = document.getElementById('calzadoModel');
  if (modeloSelect) modeloSelect.value = item.modelo?.id || '';
  actualizarMarcaDesdeModelo();
  const marcaInput = document.getElementById('calzadoBrandName');
  if (marcaInput) marcaInput.value = item.marca?.nombre || '';
  const colorSelect = document.getElementById('calzadoColor');
  if (colorSelect) colorSelect.value = item.color || '';
  const tipoSelect = document.getElementById('calzadoType');
  if (tipoSelect) tipoSelect.value = item.tipo || '';
  const proveedorSelect = document.getElementById('calzadoProveedor');
  if (proveedorSelect) proveedorSelect.value = item.proveedor?.id || '';
  const materialSelect = document.getElementById('calzadoMaterial');
  if (materialSelect) materialSelect.value = item.material?.id || '';
  const tipoProductoSelect = document.getElementById('calzadoCategory');
  if (tipoProductoSelect) tipoProductoSelect.value = item.tiposProducto?.[0]?.id || '';
  const unidadSelect = document.getElementById('calzadoUnidad');
  if (unidadSelect) unidadSelect.value = item.unidad?.id || '';
  const dimensionesInput = document.getElementById('calzadoDimensiones');
  if (dimensionesInput) dimensionesInput.value = item.dimensiones || '';
  const pesoInput = document.getElementById('calzadoPeso');
  if (pesoInput) pesoInput.value = item.pesoGramos ? (item.pesoGramos / 1000) : '';
  const descripcionInput = document.getElementById('calzadoDescription');
  if (descripcionInput) descripcionInput.value = item.descripcion || '';
  const codigoBarraInput = document.getElementById('calzadoCodigoBarra');
  if (codigoBarraInput) codigoBarraInput.value = item.codigoBarra || '';

    const tallasContainer = document.getElementById('tallasContainer');
    if (tallasContainer){
      tallasContainer.innerHTML = '';
      (item.tallas || []).forEach(talla => {
        agregarTalla({
          talla: talla.talla,
          precioVenta: talla.precioVenta,
          precioCompra: talla.costoCompra
        });
      });
      if (!item.tallas || item.tallas.length === 0){
        agregarTalla();
      }
    }
    actualizarImagenDesdeModelo();
    actualizarPreview();
  }

  async function manejarAccionesTabla(event){
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const { action, id } = button.dataset;
    if (!id) return;
    const numericId = Number(id);
    const producto = state.items.find(item => item.id === numericId);
    if (!producto){
      showNotification('No se encontró el producto seleccionado', 'error');
      return;
    }
    if (action === 'edit'){
      const confirmed = await askConfirmation({
        title: 'Editar calzado',
        message: `¿Deseas editar "${producto.nombre}"?`,
        confirmText: 'Sí, editar',
        cancelText: 'Cancelar'
      });
      if (!confirmed) return;
      abrirModal(producto);
    } else if (action === 'delete'){
      const confirmed = await askConfirmation({
        title: 'Desactivar calzado',
        message: `Esta acción desactivará el calzado "${producto.nombre}". ¿Deseas continuar?`,
        confirmText: 'Sí, desactivar',
        cancelText: 'Cancelar',
        variant: 'danger'
      });
      if (!confirmed) return;
      eliminarProducto(numericId);
    } else if (action === 'view'){
      mostrarDetalle(producto);
    }
  }

  async function eliminarProducto(id){
    try {
      await apiDelete(`${PRODUCT_API}/${id}`);
      await cargarProductos();
      showNotification('Calzado desactivado correctamente');
    } catch (error) {
      console.error(error);
  showNotification(error.message || 'No se pudo desactivar el calzado', 'error');
    }
  }

  async function guardarProducto(){
    const request = construirPayload();
    if (state.editandoId){
      await apiPut(`${PRODUCT_API}/${state.editandoId}`, request);
    } else {
      await apiPost(PRODUCT_API, request);
    }
  }

  function construirPayload(){
    const nombre = obtenerValor('calzadoName');
    if (!nombre){
      throw new Error('El nombre es obligatorio');
    }
    const proveedorId = convertirEntero(obtenerValor('calzadoProveedor'));
    const modeloId = convertirEntero(obtenerValor('calzadoModel'));
    const materialId = convertirEntero(obtenerValor('calzadoMaterial'));
    const unidadId = convertirEntero(obtenerValor('calzadoUnidad'));
    const tipoProductoId = convertirEntero(obtenerValor('calzadoCategory'));
    const color = obtenerValor('calzadoColor');
    const tipo = obtenerValor('calzadoType');
    const dimensiones = obtenerValor('calzadoDimensiones');
    const descripcion = obtenerValor('calzadoDescription');
    const codigoBarra = obtenerValor('calzadoCodigoBarra');

    const pesoEntrada = obtenerValor('calzadoPeso');
    const pesoGramos = convertirPesoAGramos(pesoEntrada);

    const tallas = recolectarTallas();
    if (!tallas.length){
      throw new Error('Debe registrar al menos una talla con precio de venta');
    }

    return {
      nombre,
      descripcion,
      codigoBarra,
      proveedorId,
      modeloId,
      materialId,
      unidadId,
      tipoProductoId,
      precioVenta: null,
      costoCompra: null,
      color,
      tipo,
      dimensiones,
      pesoGramos,
      tallas
    };
  }

  function convertirPesoAGramos(valor){
    if (!valor) return null;
    const numero = parseFloat(String(valor).replace(',', '.'));
    if (Number.isNaN(numero)) return null;
    if (numero < 10){
      return Math.round(numero * 1000);
    }
    return Math.round(numero);
  }

  function recolectarTallas(){
    const container = document.getElementById('tallasContainer');
    if (!container) return [];
    const items = Array.from(container.querySelectorAll('.talla-item'));
    return items.map(item => {
      const talla = item.querySelector('.talla-input')?.value?.trim();
      const precioVenta = parseFloat(item.querySelector('.talla-precio-venta')?.value || '');
      const precioCompra = parseFloat(item.querySelector('.talla-precio-compra')?.value || '');
      if (!talla){
        return null;
      }
      return {
        talla,
        precioVenta: Number.isNaN(precioVenta) ? null : precioVenta,
        costoCompra: Number.isNaN(precioCompra) ? null : precioCompra
      };
    }).filter(Boolean);
  }

  function agregarTalla(data = { talla: '', precioVenta: '', precioCompra: '' }){
    const container = document.getElementById('tallasContainer');
    if (!container) return;
    const item = document.createElement('div');
    item.className = 'talla-item';
    item.style.display = 'grid';
    item.style.gridTemplateColumns = '1fr 1fr 1fr auto';
    item.style.gap = '12px';
    item.style.alignItems = 'end';

    item.innerHTML = `
      <div class="form-group">
        <label>Talla</label>
        <input type="text" class="talla-input" placeholder="Ej: 38, 39-40, EU 41" value="${data.talla ?? ''}">
      </div>
      <div class="form-group">
        <label>Precio Venta (S/)</label>
        <input type="number" class="talla-precio-venta" step="0.01" min="0" value="${data.precioVenta ?? ''}">
      </div>
      <div class="form-group">
        <label>Precio Compra (S/)</label>
        <input type="number" class="talla-precio-compra" step="0.01" min="0" value="${data.precioCompra ?? ''}">
      </div>
      <button type="button" class="btn-icon btn-delete remove-talla-btn" title="Eliminar Talla"><i class="fas fa-minus-circle"></i></button>
    `;

    item.querySelectorAll('input, select, textarea').forEach(el => el.addEventListener('input', actualizarPreview));
    item.querySelector('.remove-talla-btn').addEventListener('click', ()=>{
      item.remove();
      actualizarPreview();
    });

    container.appendChild(item);
  }

  function actualizarPreview(){
    const nombre = obtenerValor('calzadoName') || 'Nombre del Calzado';
    const modeloSeleccionado = obtenerModeloSeleccionado();
  const marca = obtenerValor('calzadoBrandName') || (modeloSeleccionado?.marca ?? 'Marca');
  const modeloNombre = modeloSeleccionado?.nombre || 'Modelo';
    const tallas = recolectarTallas();

    const previewName = document.getElementById('previewCalzadoName');
    if (previewName) previewName.textContent = nombre;
  const previewDetails = document.getElementById('previewCalzadoDetails');
  if (previewDetails) previewDetails.textContent = `${marca} - ${modeloNombre}`;
    const colorLabel = document.querySelector('.preview-color');
    if (colorLabel) colorLabel.textContent = `Color: ${obtenerValor('calzadoColor') || '--'}`;
    const typeLabel = document.querySelector('.preview-type');
    if (typeLabel) typeLabel.textContent = `Tipo: ${obtenerValor('calzadoType') || '--'}`;
    const materialLabel = document.querySelector('.preview-material');
    if (materialLabel){
      const materialSeleccionado = state.combos.materiales.find(m => String(m.id) === obtenerValor('calzadoMaterial'));
      materialLabel.textContent = `Material: ${materialSeleccionado?.nombre || '--'}`;
    }
    const sizeLabel = document.querySelector('.preview-size');
    if (sizeLabel) sizeLabel.textContent = `Tallas: ${tallas.length} registradas`;
  }

  function mostrarDetalle(item){
    const modalId = 'calzadoDetalleModal';
    let modal = document.getElementById(modalId);
    if (!modal){
      modal = document.createElement('div');
      modal.className = 'modal';
      modal.id = modalId;
      modal.innerHTML = `
        <div class="modal-content">
          <div class="modal-header">
            <h3>Detalle de Calzado</h3>
            <button class="modal-close" data-close="${modalId}"><i class="fas fa-times"></i></button>
          </div>
          <div class="modal-body" id="calzadoDetalleBody"></div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-close="${modalId}">Cerrar</button>
          </div>
        </div>`;
      document.body.appendChild(modal);
      modal.addEventListener('click', (e)=>{
        if (e.target === modal || e.target.closest('[data-close]')){
          modal.style.display = 'none';
        }
      });
    }

    const body = modal.querySelector('#calzadoDetalleBody');
    if (body){
  const imagenUrl = obtenerImagenProducto(item);
  const formatPrecio = (valor) => (valor !== undefined && valor !== null) ? `S/ ${Number(valor).toFixed(2)}` : '--';
      const peso = item.pesoGramos ? `${(item.pesoGramos / 1000).toFixed(2)} kg` : '--';
      const tallasRows = (item.tallas || []).map(t => `
        <tr>
          <td>${t.talla}</td>
          <td>${formatPrecio(t.precioVenta)}</td>
          <td>${t.costoCompra != null ? formatPrecio(t.costoCompra) : '--'}</td>
        </tr>`).join('');
      const tallasBadges = (item.tallas || []).map(t => `<span class="detalle-tag">${t.talla}</span>`).join('');

      body.innerHTML = `
        <div class="detalle-producto">
          <div class="detalle-producto__hero">
            <div class="detalle-producto__image">
              <img src="${imagenUrl}" alt="${item.nombre}">
            </div>
            <div class="detalle-producto__summary">
              <span class="detalle-estado ${item.activo !== false ? 'estado-activo' : 'estado-inactivo'}">${item.activo !== false ? 'Activo' : 'Inactivo'}</span>
              <h4>${item.nombre}</h4>
              <div class="detalle-producto__tags">
                ${item.marca?.nombre ? `<span class="detalle-tag tag-marca">${item.marca.nombre}</span>` : ''}
                ${item.modelo?.nombre ? `<span class="detalle-tag">Modelo ${item.modelo.nombre}</span>` : ''}
                ${item.color ? `<span class="detalle-tag tag-color">${item.color}</span>` : ''}
                ${item.tipo ? `<span class="detalle-tag">${item.tipo}</span>` : ''}
              </div>
              <p class="detalle-producto__descripcion">${item.descripcion || 'Sin descripción disponible.'}</p>
              <div class="detalle-producto__info-grid">
                <div class="detalle-item"><span>Código interno</span><strong>${item.id}</strong></div>
                <div class="detalle-item"><span>Código de barras</span><strong>${item.codigoBarra || '--'}</strong></div>
                <div class="detalle-item"><span>Proveedor</span><strong>${item.proveedor?.razonSocial || '--'}</strong></div>
                <div class="detalle-item"><span>Material</span><strong>${item.material?.nombre || '--'}</strong></div>
                <div class="detalle-item"><span>Unidad</span><strong>${item.unidad?.nombre || '--'}</strong></div>
                <div class="detalle-item"><span>Dimensiones</span><strong>${item.dimensiones || '--'}</strong></div>
                <div class="detalle-item"><span>Peso</span><strong>${peso}</strong></div>
              </div>
            </div>
          </div>
          <div class="detalle-producto__tallas">
            <div class="detalle-producto__tallas-header">
              <h5>Tallas registradas</h5>
              <div class="detalle-producto__tallas-tags">${tallasBadges || '<span class="detalle-tag detalle-tag--empty">Sin tallas</span>'}</div>
            </div>
            ${(item.tallas && item.tallas.length) ? `
              <table class="detalle-producto__table">
                <thead>
                  <tr>
                    <th>Talla</th>
                    <th>Precio venta</th>
                    <th>Precio compra</th>
                  </tr>
                </thead>
                <tbody>
                  ${tallasRows}
                </tbody>
              </table>
            ` : '<div class="detalle-producto__empty">Sin tallas registradas</div>'}
          </div>
        </div>`;
    }

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }

  function manejarImagenSeleccionada(event){
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e)=>{
      const preview = document.getElementById('imagePreview');
      if (preview){
        preview.innerHTML = `<img src="${e.target?.result}" alt="Previsualización">`;
        preview.dataset.source = e.target?.result;
        preview.dataset.userImage = 'true';
        delete preview.dataset.modelImage;
      }
    };
    reader.readAsDataURL(file);
  }

  function obtenerValor(id){
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function convertirEntero(valor){
    if (!valor) return null;
    const numero = parseInt(valor, 10);
    return Number.isNaN(numero) ? null : numero;
  }

  async function apiGet(url){
    const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!response.ok){
      throw new Error(await extraerMensajeError(response));
    }
    return response.status === 204 ? null : response.json();
  }

  async function apiPost(url, body){
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!response.ok){
      throw new Error(await extraerMensajeError(response));
    }
    return response.json();
  }

  async function apiPut(url, body){
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!response.ok){
      throw new Error(await extraerMensajeError(response));
    }
    return response.json();
  }

  async function apiDelete(url){
    const response = await fetch(url, { method: 'DELETE' });
    if (!response.ok){
      throw new Error(await extraerMensajeError(response));
    }
  }

  async function extraerMensajeError(response){
    try {
      const data = await response.json();
      return data?.message || data?.error || response.statusText || 'Error desconocido';
    } catch (_){
      return response.statusText || 'Error desconocido';
    }
  }

  function openFilterModal(){
    const modalId = 'filterModal';
    let modal = document.getElementById(modalId);
    if (!modal){
      modal = document.createElement('div');
      modal.className = 'modal';
      modal.id = modalId;
      modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
          <div class="modal-header">
            <h3>Filtros Avanzados</h3>
            <button class="modal-close" data-close="${modalId}"><i class="fas fa-times"></i></button>
          </div>
          <div class="modal-body">
            <form id="filterForm">
              <div class="form-row">
                <div class="form-group">
                  <label for="filterMarca">Marca</label>
                  <select id="filterMarca">
                    <option value="">Todas las marcas</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="filterModelo">Modelo</label>
                  <select id="filterModelo">
                    <option value="">Todos los modelos</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="filterColor">Color</label>
                  <select id="filterColor">
                    <option value="">Todos los colores</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="filterTipo">Tipo</label>
                  <select id="filterTipo">
                    <option value="">Todos los tipos</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="filterMaterial">Material</label>
                  <select id="filterMaterial">
                    <option value="">Todos los materiales</option>
                  </select>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="clearFiltersBtn">Limpiar Filtros</button>
            <button type="button" class="btn btn-primary" id="applyFiltersBtn">Aplicar Filtros</button>
          </div>
        </div>`;
      document.body.appendChild(modal);
      modal.addEventListener('click', (e)=>{
        if (e.target === modal || e.target.closest('[data-close]')){
          modal.style.display = 'none';
        }
      });

      // Event listeners
      document.getElementById('clearFiltersBtn').addEventListener('click', ()=>{
        state.filtros.marca = '';
        state.filtros.modelo = '';
        state.filtros.color = '';
        state.filtros.tipo = '';
        state.filtros.material = '';
        populateFilterSelects();
        renderTabla();
        modal.style.display = 'none';
        showNotification('Filtros limpiados');
      });

      document.getElementById('applyFiltersBtn').addEventListener('click', ()=>{
        state.filtros.marca = document.getElementById('filterMarca').value;
        state.filtros.modelo = document.getElementById('filterModelo').value;
        state.filtros.color = document.getElementById('filterColor').value;
        state.filtros.tipo = document.getElementById('filterTipo').value;
        state.filtros.material = document.getElementById('filterMaterial').value;
        renderTabla();
        modal.style.display = 'none';
        showNotification('Filtros aplicados');
      });
    }

    populateFilterSelects();
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }

  function populateFilterSelects(){
    const marcas = getUniqueValues(state.items, 'marca.nombre');
    const modelos = getUniqueValues(state.items, 'modelo.nombre');
    const colores = getUniqueValues(state.items, 'color');
    const tipos = getUniqueValues(state.items, 'tipo');
    const materiales = getUniqueValues(state.items, 'material.nombre');

    poblarSelect('filterMarca', marcas.map(m => ({ id: m, nombre: m })), { value: 'id', label: 'nombre' });
    poblarSelect('filterModelo', modelos.map(m => ({ id: m, nombre: m })), { value: 'id', label: 'nombre' });
    poblarSelect('filterColor', colores.map(c => ({ id: c, nombre: c })), { value: 'id', label: 'nombre' });
    poblarSelect('filterTipo', tipos.map(t => ({ id: t, nombre: t })), { value: 'id', label: 'nombre' });
    poblarSelect('filterMaterial', materiales.map(m => ({ id: m, nombre: m })), { value: 'id', label: 'nombre' });

    // Set current values
    document.getElementById('filterMarca').value = state.filtros.marca;
    document.getElementById('filterModelo').value = state.filtros.modelo;
    document.getElementById('filterColor').value = state.filtros.color;
    document.getElementById('filterTipo').value = state.filtros.tipo;
    document.getElementById('filterMaterial').value = state.filtros.material;
  }

  function getUniqueValues(items, path){
    const values = new Set();
    items.forEach(item => {
      const value = path.split('.').reduce((obj, key) => obj?.[key], item);
      if (value) values.add(value);
    });
    return Array.from(values).sort();
  }

  function showNotification(message, type = 'success'){
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `position:fixed;top:20px;right:20px;padding:12px 18px;border-radius:8px;color:#fff;z-index:2000;display:flex;gap:8px;align-items:center;box-shadow:0 4px 12px rgba(0,0,0,.15);background:${type==='error' ? '#dc3545' : type === 'info' ? '#0d6efd' : '#28a745'};`;
    notification.innerHTML = `<i class="fas ${type==='error' ? 'fa-times-circle' : type==='info' ? 'fa-info-circle' : 'fa-check-circle'}"></i><span>${message}</span>`;
    document.body.appendChild(notification);
    setTimeout(()=>{
      notification.style.opacity = '0';
      setTimeout(()=> notification.remove(), 300);
    }, 4000);
  }
})();
