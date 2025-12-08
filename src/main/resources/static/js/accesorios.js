// Accesorios Module JavaScript

(function(){
  const PRODUCT_API = '/api/productos/accesorios';
  const PROVIDER_API = '/api/proveedores';
  const CATALOG_BASE = '/api/catalogos';
  const PLACEHOLDER_IMG = '/img/Upload/productos/producto-default.jpg';

  // Mapear tiposProducto válidos por sexo. Los nombres deben coincidir EXACTAMENTE
  // con los registrados en detalles.sql
  const TIPOS_POR_SEXO = {
    MUJER: [
      'Bolsos',
      'Billeteras',
      'Gafas de sol',
      'Cinturones'
    ],
    HOMBRE: [
      'Billeteras',
      'Cinturones',
      'Gafas de sol',
      'Gorros',
      'Relojes'
    ],
    NIÑO: [
      'Calcetines',
      'Cinturones',
      'Gorros',
      'Gafas de sol'
    ]
  };

  const state = {
    items: [],
    combos: {
      marcas: [],
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
    registrarEventos();
    try {
      await Promise.all([cargarCatalogos(), cargarProductos()]);
      showNotification('Catálogo de accesorios actualizado');
    } catch (error) {
      console.error(error);
      showNotification(error.message || 'No se pudo cargar la información inicial', 'error');
    }
  }

  function registrarEventos(){
    const searchInput = document.getElementById('searchInput');
    const addBtn = document.getElementById('addAccesorioBtn');
    const filterBtn = document.getElementById('filterBtn');
    const selectAll = document.getElementById('selectAll');
    const form = document.getElementById('accesorioForm');
    const modal = document.getElementById('accesorioModal');
    const brandSelect = document.getElementById('accesorioBrand');

    searchInput?.addEventListener('input', (event)=>{
      state.filtros.busqueda = event.target.value.toLowerCase();
      renderTabla();
    });

    addBtn?.addEventListener('click', ()=> abrirModal());

    filterBtn?.addEventListener('click', openFilterModal);

    selectAll?.addEventListener('change', (event)=>{
      document.querySelectorAll('.accesorio-checkbox').forEach(cb => {
        cb.checked = event.target.checked;
      });
    });

    modal?.addEventListener('click', (event)=>{
      if (event.target === modal){
        cerrarModal();
      }
    });

    document.getElementById('closeModal')?.addEventListener('click', cerrarModal);
    document.getElementById('cancelBtn')?.addEventListener('click', cerrarModal);

    const tallasToggle = document.getElementById('manejaTallasToggle');
    if (tallasToggle){
      tallasToggle.addEventListener('change', ()=>{
        sincronizarModoTallas();
        actualizarPreview();
      });
    }

    form?.addEventListener('submit', async (event)=>{
      event.preventDefault();
      try {
        await guardarProducto();
        cerrarModal();
        showNotification('Accesorio guardado correctamente');
        setTimeout(()=> window.location.reload(), 600);
      } catch (error) {
        console.error(error);
        showNotification(error.message || 'No se pudo guardar el accesorio', 'error');
      }
    });

    const selectImageBtn = document.getElementById('selectImageBtn');
    if (selectImageBtn){
      selectImageBtn.addEventListener('click', abrirSelectorImagen);
    }
    const imagePreview = document.getElementById('imagePreview');
    if (imagePreview){
      imagePreview.addEventListener('click', abrirSelectorImagen);
      imagePreview.style.cursor = 'pointer';
      imagePreview.setAttribute('title', 'Seleccionar imagen');
      if (imagePreview.tabIndex < 0){
        imagePreview.tabIndex = 0;
      }
      imagePreview.addEventListener('keydown', (event)=>{
        if (event.key === 'Enter' || event.key === ' '){
          event.preventDefault();
          abrirSelectorImagen();
        }
      });
    }
    document.getElementById('accesorioImage')?.addEventListener('change', manejarImagenSeleccionada);

    document.getElementById('addTallaBtn')?.addEventListener('click', ()=>{
      agregarTalla();
      actualizarPreview();
    });

    const modelSelect = document.getElementById('accesorioModel');
    if (modelSelect){
      modelSelect.addEventListener('change', ()=>{
        actualizarImagenDesdeModelo();
        actualizarPreview();
      });
    }

    // Cuando cambie el sexo/tipo (HOMBRE/MUJER/NIÑO) -> filtrar tipos de producto
    const sexoSelect = document.getElementById('accesorioType');
    if (sexoSelect){
      sexoSelect.addEventListener('change', ()=>{
        filtrarTiposPorSexo(sexoSelect.value);
        actualizarPreview();
      });
    }

    if (brandSelect){
      brandSelect.addEventListener('change', ()=>{
        manejarCambioMarca();
      });
    }

  ['accesorioName','accesorioModel','accesorioBrand','accesorioColor','accesorioType','accesorioMaterial','accesorioCategory','accesorioProveedor','accesorioUnidad','accesorioDimensions','accesorioWeight','accesorioDescription','accesorioCodigoBarra'].forEach(id=>{
      const element = document.getElementById(id);
      if (element){
        element.addEventListener('input', actualizarPreview);
        element.addEventListener('change', actualizarPreview);
      }
    });
    ['accesorioPrecioVenta','accesorioCostoCompra'].forEach(id => {
      const element = document.getElementById(id);
      if (element){
        element.addEventListener('input', actualizarPreview);
        element.addEventListener('change', actualizarPreview);
      }
    });

    document.getElementById('accesoriosTableBody')?.addEventListener('click', manejarAccionesTabla);
    actualizarEstadoSelectorImagen();
    sincronizarModoTallas();
  }

  function sincronizarModoTallas(forcedChecked){
    const toggle = document.getElementById('manejaTallasToggle');
    if (!toggle){
      return;
    }
    if (typeof forcedChecked === 'boolean'){
      toggle.checked = forcedChecked;
    }
    const usaTallas = toggle.checked !== false;
    const tallasWrapper = document.getElementById('tallasConfigWrapper');
    const preciosRow = document.getElementById('preciosGeneralesRow');
    if (tallasWrapper){
      tallasWrapper.style.display = usaTallas ? '' : 'none';
    }
    if (preciosRow){
      preciosRow.style.display = usaTallas ? 'none' : '';
    }
  }

  function usaModoTallas(){
    const toggle = document.getElementById('manejaTallasToggle');
    return !toggle || toggle.checked;
  }

  function abrirSelectorImagen(){
    document.getElementById('accesorioImage')?.click();
  }

  function limpiarPreviewImagen(){
    const preview = document.getElementById('imagePreview');
    if (!preview) return;
    preview.innerHTML = '<i class="fas fa-camera"></i>';
    preview.style.backgroundImage = '';
    delete preview.dataset.source;
    delete preview.dataset.modelImage;
    delete preview.dataset.userImage;
    delete preview.dataset.productImage;
  }

  function actualizarEstadoSelectorImagen({ texto, archivo } = {}){
    const button = document.getElementById('selectImageBtn');
    const label = button?.querySelector('.btn-text');
    if (label){
      label.textContent = texto || 'Seleccionar imagen';
    }
    const fileNameLabel = document.querySelector('#accesorioModal .image-file-name');
    if (fileNameLabel){
      fileNameLabel.textContent = archivo ? `Archivo seleccionado: ${archivo}` : '';
    }
  }

  function extraerNombreArchivo(ruta){
    if (!ruta) return '';
    const partes = ruta.split('/');
    if (!partes.length){
      return '';
    }
    return partes[partes.length - 1] || '';
  }

  function establecerImagenProducto(ruta, nombreProducto){
    const preview = document.getElementById('imagePreview');
    if (!preview || !ruta) return;
    preview.innerHTML = `<img src="${ruta}" alt="${nombreProducto || 'Imagen del accesorio'}">`;
    preview.style.backgroundImage = '';
    preview.dataset.source = ruta;
    preview.dataset.productImage = 'true';
    delete preview.dataset.userImage;
    delete preview.dataset.modelImage;
    actualizarEstadoSelectorImagen({ texto: 'Cambiar imagen', archivo: extraerNombreArchivo(ruta) });
  }

  function obtenerImagenParaEnvio(){
    const preview = document.getElementById('imagePreview');
    if (!preview) return null;
    const source = preview.dataset.source;
    const esUsuario = preview.dataset.userImage === 'true';
    const esProducto = preview.dataset.productImage === 'true';
    if (!source || (!esUsuario && !esProducto)){
      return null;
    }
    return source;
  }

  async function cargarCatalogos(){
    try {
      const [marcas, modelos, materiales, unidades, tipos, proveedores] = await Promise.all([
        apiGet(`${CATALOG_BASE}/marcas`),
        apiGet(`${CATALOG_BASE}/modelos`),
        apiGet(`${CATALOG_BASE}/materiales`),
        apiGet(`${CATALOG_BASE}/unidades`),
        apiGet(`${CATALOG_BASE}/tipos`),
        apiGet(PROVIDER_API)
      ]);
      state.combos.marcas = Array.isArray(marcas) ? marcas : [];
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
    poblarSelect('accesorioBrand', state.combos.marcas, { value: 'id', label: 'nombre' }, 'Sin marcas registradas');
    const brandSelectEl = document.getElementById('accesorioBrand');
    if (brandSelectEl){
      brandSelectEl.options[0].textContent = state.combos.marcas.length ? 'Seleccionar marca' : 'Sin marcas registradas';
    }
    const marcaSeleccionada = convertirEntero(obtenerValor('accesorioBrand'));
    poblarModelosPorMarca(marcaSeleccionada, { preserveSelection: true });
    poblarSelect('accesorioMaterial', state.combos.materiales, { value: 'id', label: 'nombre' }, 'Sin materiales');
    poblarSelect('accesorioUnidad', state.combos.unidades, { value: 'id', label: 'nombre', extra: 'abreviatura' }, 'Sin unidades');
    poblarSelect('accesorioCategory', state.combos.tipos, { value: 'id', label: 'nombre' }, 'Sin tipos');
    poblarSelect('accesorioProveedor', state.combos.proveedores, { value: 'idProveedor', label: 'razonSocial', extra: 'nombreComercial' }, 'Sin proveedores');
    // Aplicar filtro inicial según sexo si ya está seleccionado
    const sexoInicial = obtenerValor('accesorioType');
    if (sexoInicial){
      filtrarTiposPorSexo(sexoInicial);
    }
    actualizarImagenDesdeModelo();
    actualizarPreview();
  }

  function filtrarTiposPorSexo(sexo){
    const select = document.getElementById('accesorioCategory');
    if (!select) return;
    const opcionesDisponibles = Array.isArray(state.combos.tipos) ? state.combos.tipos : [];
    const allowed = sexo ? TIPOS_POR_SEXO[sexo] || [] : [];
    const current = select.value;
    select.innerHTML = '<option value="">Seleccionar opción</option>';
    if (!allowed.length){
      // Si no hay sexo seleccionado, mostrar todas las opciones
      opcionesDisponibles.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.nombre;
        select.appendChild(option);
      });
      select.value = current || '';
      return;
    }
    // Agregar sólo los tipos cuyo nombre coincide exactamente
    opcionesDisponibles.filter(t => allowed.includes(t.nombre)).forEach(item => {
      const option = document.createElement('option');
      option.value = item.id;
      option.textContent = item.nombre;
      select.appendChild(option);
    });
    // Restaurar selección si aún existe
    if (current && Array.from(select.options).some(o => o.value === current)){
      select.value = current;
    } else {
      select.value = '';
    }
  }

  function poblarSelect(id, items, { value, label, extra } = {}, emptyText = 'Sin opciones disponibles'){
    const select = document.getElementById(id);
    if (!select) return;
    const currentValue = select.value;
    select.innerHTML = `<option value="">${items.length ? 'Seleccionar opción' : emptyText}</option>`;
    items.forEach(item => {
      const option = document.createElement('option');
      option.value = item[value];
      option.textContent = extra && item[extra] ? `${item[label]} (${item[extra]})` : item[label];
      select.appendChild(option);
    });
    if (currentValue){
      select.value = currentValue;
    }
  }

  function poblarModelosPorMarca(marcaId, options = {}){
    const select = document.getElementById('accesorioModel');
    if (!select) return;
    const { forcedValue = null, preserveSelection = false } = options;
    const previous = select.value;

    const marcaParsed = marcaId == null ? null : Number(marcaId);
    if (marcaParsed == null || Number.isNaN(marcaParsed)){
      select.innerHTML = '<option value="">Selecciona una marca primero</option>';
      select.disabled = true;
      select.value = '';
      return;
    }

    const modelosDisponibles = state.combos.modelos.filter(modelo => Number(modelo.marcaId) === marcaParsed);

    if (!modelosDisponibles.length){
      select.innerHTML = '<option value="">Sin modelos disponibles para la marca</option>';
      select.disabled = true;
      select.value = '';
      return;
    }

    select.disabled = false;
    select.innerHTML = '<option value="">Seleccionar modelo</option>';
    modelosDisponibles.forEach(modelo => {
      const option = document.createElement('option');
      option.value = modelo.id;
      option.textContent = modelo.nombre;
      select.appendChild(option);
    });

    let valueToRestore = null;
    if (forcedValue != null){
      valueToRestore = String(forcedValue);
    } else if (preserveSelection && modelosDisponibles.some(modelo => String(modelo.id) === previous)){
      valueToRestore = previous;
    }

    if (valueToRestore){
      select.value = valueToRestore;
    } else {
      select.value = '';
    }
  }

  function obtenerMarcaSeleccionada(){
    const select = document.getElementById('accesorioBrand');
    if (!select) return null;
    const value = parseInt(select.value, 10);
    if (Number.isNaN(value)){
      return null;
    }
    return state.combos.marcas.find(marca => Number(marca.id) === value) || null;
  }

  function obtenerModeloSeleccionado(){
    const select = document.getElementById('accesorioModel');
    if (!select) return null;
    const value = parseInt(select.value, 10);
    if (Number.isNaN(value)){
      return null;
    }
    return state.combos.modelos.find(modelo => Number(modelo.id) === value) || null;
  }

  function manejarCambioMarca(){
    const marcaSeleccionada = convertirEntero(obtenerValor('accesorioBrand'));
    poblarModelosPorMarca(marcaSeleccionada);
    actualizarImagenDesdeModelo();
    actualizarPreview();
  }

  function actualizarImagenDesdeModelo(){
    const preview = document.getElementById('imagePreview');
    if (!preview) return;
    if (preview.dataset.userImage === 'true' || preview.dataset.productImage === 'true'){
      return;
    }
    const modeloSeleccionado = obtenerModeloSeleccionado();
    if (modeloSeleccionado?.imagen){
      preview.innerHTML = `<img src="${modeloSeleccionado.imagen}" alt="${modeloSeleccionado.nombre}">`;
      preview.style.backgroundImage = '';
      preview.dataset.source = modeloSeleccionado.imagen;
      preview.dataset.modelImage = 'true';
      actualizarEstadoSelectorImagen({ texto: 'Cambiar imagen' });
    } else {
      limpiarPreviewImagen();
      actualizarEstadoSelectorImagen();
    }
  }

  async function cargarProductos(){
    const data = await apiGet(PRODUCT_API);
    state.items = Array.isArray(data) ? data.map(mapearProducto).sort((a, b) => a.id - b.id) : [];
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
      proveedor: item.proveedor,
      unidad: item.unidad,
      precioVenta: item.precioVenta,
      costoCompra: item.costoCompra,
      color: item.color,
      tipo: item.tipo,
      dimensiones: item.dimensiones,
      pesoGramos: item.pesoGramos,
      codigoBarra: item.codigoBarra,
      tallas: Array.isArray(item.tallas) ? item.tallas : [],
      tiposProducto: Array.isArray(item.tiposProducto) ? item.tiposProducto : [],
      imagen: item.imagen || null,
      activo: item.activo !== false
    };
  }

  function renderTabla(){
    const tbody = document.getElementById('accesoriosTableBody');
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
        const texto = [item.nombre, item.marca?.nombre, item.modelo?.nombre, item.material?.nombre, item.color]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return texto.includes(filtro);
      });
    }

    if (!registros.length){
      tbody.innerHTML = `<tr><td colspan="9"><div class="empty-state">No hay accesorios registrados todavía.</div></td></tr>`;
    } else {
  tbody.innerHTML = registros.map((item, index) => renderFila(item, index)).join('');
    }

    actualizarInfoPaginacion(registros.length, state.items.length);
    const selectAll = document.getElementById('selectAll');
    if (selectAll){
      selectAll.checked = registros.length > 0 && registros.every(item => document.querySelector(`.accesorio-checkbox[data-accesorio-id="${item.id}"]`)?.checked);
    }
  }

  function renderFila(item, index){
    const marca = item.marca?.nombre || '-';
    const modelo = item.modelo?.nombre || '-';
    const material = item.material?.nombre || '-';
    const color = item.color || '-';
    const totalTallas = Array.isArray(item.tallas) ? item.tallas.length : 0;
    const detallesSecundarios = [color && color !== '-' ? `Color: ${color}` : null, totalTallas ? `${totalTallas} tallas` : null]
      .filter(Boolean)
      .join(' • ');
    const imagenUrl = obtenerImagenProducto(item);
    const esPlaceholder = imagenUrl === PLACEHOLDER_IMG;
    return `
      <tr>
        <td><input type="checkbox" class="accesorio-checkbox" data-accesorio-id="${item.id}"></td>
        <td>${index + 1}</td>
        <td>
          <div class="product-image">
            <img src="${imagenUrl}" alt="${item.nombre}" class="accesorio-img${esPlaceholder ? ' is-placeholder' : ''}" loading="lazy">
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
        <td>${modelo}</td>
        <td><span class="brand-badge">${marca}</span></td>
        <td><span class="color-badge">${color}</span></td>
        <td><span class="material-badge">${material}</span></td>
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
    if (item?.imagen){
      return item.imagen;
    }
    if (item?.modelo?.imagen){
      return item.modelo.imagen;
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
    info.textContent = `Mostrando ${actual} de ${total} accesorios`;
  }

  function abrirModal(item){
    const modal = document.getElementById('accesorioModal');
    if (!modal) return;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    resetFormulario();
    if (item){
      state.editandoId = item.id;
      document.getElementById('modalTitle').textContent = 'Editar Accesorio';
      cargarEnFormulario(item);
    } else {
      state.editandoId = null;
      document.getElementById('modalTitle').textContent = 'Nuevo Accesorio';
      if (usaModoTallas()){
        agregarTalla();
      }
      actualizarPreview();
    }
  }

  function cerrarModal(){
    const modal = document.getElementById('accesorioModal');
    if (!modal) return;
    modal.style.display = 'none';
    document.body.style.overflow = '';
    resetFormulario();
    state.editandoId = null;
  }

  function resetFormulario(){
    document.getElementById('accesorioForm')?.reset();
    const brandSelect = document.getElementById('accesorioBrand');
    if (brandSelect){
      brandSelect.value = '';
    }
    poblarModelosPorMarca(null);
    const imageInput = document.getElementById('accesorioImage');
    if (imageInput){
      imageInput.value = '';
    }
    limpiarPreviewImagen();
    actualizarEstadoSelectorImagen();
    const tallasContainer = document.getElementById('tallasContainer');
    if (tallasContainer){
      tallasContainer.innerHTML = '';
    }
    const precioVentaGeneral = document.getElementById('accesorioPrecioVenta');
    if (precioVentaGeneral){
      precioVentaGeneral.value = '';
    }
    const costoCompraGeneral = document.getElementById('accesorioCostoCompra');
    if (costoCompraGeneral){
      costoCompraGeneral.value = '';
    }
    const tallasToggle = document.getElementById('manejaTallasToggle');
    if (tallasToggle){
      tallasToggle.checked = true;
    }
    sincronizarModoTallas();
    actualizarPreview();
  }

  function cargarEnFormulario(item){
    const nombreInput = document.getElementById('accesorioName');
    if (nombreInput) nombreInput.value = item.nombre || '';
    limpiarPreviewImagen();
    if (item.imagen){
      establecerImagenProducto(item.imagen, item.nombre);
    } else {
      actualizarEstadoSelectorImagen();
    }
    const marcaId = item.marca?.id ?? item.modelo?.marca?.id ?? item.modelo?.marcaId ?? null;
    const brandSelect = document.getElementById('accesorioBrand');
    if (brandSelect){
      brandSelect.value = marcaId != null ? String(marcaId) : '';
    }
    poblarModelosPorMarca(marcaId, { forcedValue: item.modelo?.id ?? null });
    const colorSelect = document.getElementById('accesorioColor');
    if (colorSelect) colorSelect.value = item.color || '';
    const tipoSelect = document.getElementById('accesorioType');
    if (tipoSelect) tipoSelect.value = item.tipo || '';
    const materialSelect = document.getElementById('accesorioMaterial');
    if (materialSelect) materialSelect.value = item.material?.id || '';
    const categoriaSelect = document.getElementById('accesorioCategory');
    if (categoriaSelect) categoriaSelect.value = item.tiposProducto?.[0]?.id || '';
    const proveedorSelect = document.getElementById('accesorioProveedor');
    if (proveedorSelect) proveedorSelect.value = item.proveedor?.id || '';
    const unidadSelect = document.getElementById('accesorioUnidad');
    if (unidadSelect) unidadSelect.value = item.unidad?.id || '';
    const dimensionesInput = document.getElementById('accesorioDimensions');
    if (dimensionesInput) dimensionesInput.value = item.dimensiones || '';
    const pesoInput = document.getElementById('accesorioWeight');
    if (pesoInput) pesoInput.value = item.pesoGramos ? (item.pesoGramos / 1000) : '';
    const descripcionInput = document.getElementById('accesorioDescription');
    if (descripcionInput) descripcionInput.value = item.descripcion || '';
    const codigoInput = document.getElementById('accesorioCodigoBarra');
    if (codigoInput) codigoInput.value = item.codigoBarra || '';

    const tallasContainer = document.getElementById('tallasContainer');
    const manejaTallas = Array.isArray(item.tallas) && item.tallas.length > 0;
    sincronizarModoTallas(manejaTallas);
    if (tallasContainer){
      tallasContainer.innerHTML = '';
      if (manejaTallas){
        (item.tallas || []).forEach(talla => {
          agregarTalla({
            talla: talla.talla,
            precioVenta: talla.precioVenta,
            precioCompra: talla.costoCompra
          });
        });
        if (!item.tallas || !item.tallas.length){
          agregarTalla();
        }
      }
    }
    const precioVentaGeneral = document.getElementById('accesorioPrecioVenta');
    if (precioVentaGeneral){
      const precioBase = item.precioVenta != null ? Number(item.precioVenta).toFixed(2) : '';
      precioVentaGeneral.value = manejaTallas ? '' : precioBase;
    }
    const costoCompraGeneral = document.getElementById('accesorioCostoCompra');
    if (costoCompraGeneral){
      const costoBase = item.costoCompra != null ? Number(item.costoCompra).toFixed(2) : '';
      costoCompraGeneral.value = manejaTallas ? '' : costoBase;
    }
    if (!item.imagen){
      actualizarImagenDesdeModelo();
    }
    actualizarPreview();
  }

  async function manejarAccionesTabla(event){
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const { action, id } = button.dataset;
    if (!id) return;
    const numericId = Number(id);
    const accesorio = state.items.find(item => item.id === numericId);
    if (!accesorio){
      showNotification('No se encontró el accesorio seleccionado', 'error');
      return;
    }

    if (action === 'edit'){
      const confirmed = await askConfirmation({
        title: 'Editar accesorio',
        message: `¿Deseas editar "${accesorio.nombre}"?`,
        confirmText: 'Sí, editar',
        cancelText: 'Cancelar'
      });
      if (!confirmed) return;
      abrirModal(accesorio);
    } else if (action === 'delete'){
      const confirmed = await askConfirmation({
        title: 'Desactivar accesorio',
        message: `Esta acción desactivará el accesorio "${accesorio.nombre}". ¿Deseas continuar?`,
        confirmText: 'Sí, desactivar',
        cancelText: 'Cancelar',
        variant: 'danger'
      });
      if (!confirmed) return;
      eliminarProducto(numericId);
    } else if (action === 'view'){
      mostrarDetalle(accesorio);
    }
  }

  async function eliminarProducto(id){
    try {
      await apiDelete(`${PRODUCT_API}/${id}`);
      await cargarProductos();
      showNotification('Accesorio desactivado correctamente');
    } catch (error) {
      console.error(error);
      showNotification(error.message || 'No se pudo desactivar el accesorio', 'error');
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
    const nombre = obtenerValor('accesorioName');
    if (!nombre){
      throw new Error('El nombre es obligatorio');
    }
    const proveedorId = convertirEntero(obtenerValor('accesorioProveedor'));
  const modeloId = convertirEntero(obtenerValor('accesorioModel'));
    const materialId = convertirEntero(obtenerValor('accesorioMaterial'));
    const unidadId = convertirEntero(obtenerValor('accesorioUnidad'));
  const tipoProductoId = convertirEntero(obtenerValor('accesorioCategory'));
  const rawTipo = obtenerValor('accesorioType');
  const tipoSeleccionado = rawTipo ? String(rawTipo).toUpperCase() : '';
    const color = obtenerValor('accesorioColor');
    const dimensiones = obtenerValor('accesorioDimensions');
    const descripcion = obtenerValor('accesorioDescription');
    const codigoBarra = obtenerValor('accesorioCodigoBarra');
    const imagen = obtenerImagenParaEnvio();

    const pesoEntrada = obtenerValor('accesorioWeight');
    const pesoGramos = convertirPesoAGramos(pesoEntrada);

    const manejaTallas = usaModoTallas();
    const tallas = manejaTallas ? recolectarTallas() : [];
    let precioVentaGeneral = null;
    let costoCompraGeneral = null;

    if (manejaTallas){
      if (!tallas.length){
        throw new Error('Debe registrar al menos una talla con precio de venta');
      }
    } else {
      precioVentaGeneral = convertirDecimal(obtenerValor('accesorioPrecioVenta'));
      costoCompraGeneral = convertirDecimal(obtenerValor('accesorioCostoCompra'));
      if (precioVentaGeneral === null){
        throw new Error('El precio de venta es obligatorio cuando no se registran tallas');
      }
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
      precioVenta: manejaTallas ? null : precioVentaGeneral,
      costoCompra: manejaTallas ? null : costoCompraGeneral,
    color,
  tipo: tipoSeleccionado || 'Accesorio',
      dimensiones,
      pesoGramos,
      tallas,
      imagen
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
      if (Number.isNaN(precioVenta)){
        throw new Error(`El precio de venta es obligatorio para la talla ${talla}`);
      }
      return {
        talla,
        precioVenta,
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
        <input type="text" class="talla-input" placeholder="Ej: Única, 55 cm, Talla M" value="${data.talla ?? ''}">
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
    const nombre = obtenerValor('accesorioName') || 'Nombre del Accesorio';
    const modeloSeleccionado = obtenerModeloSeleccionado();
    const marcaSeleccionada = obtenerMarcaSeleccionada();
    const marca = marcaSeleccionada?.nombre || modeloSeleccionado?.marca || 'Marca del accesorio';
    const modeloNombre = modeloSeleccionado?.nombre || 'Modelo';
    const color = obtenerValor('accesorioColor') || '--';
  const tipo = obtenerValor('accesorioType') || '--';
  const material = state.combos.materiales.find(m => String(m.id) === obtenerValor('accesorioMaterial'))?.nombre || '--';
    const dimensiones = obtenerValor('accesorioDimensions') || '--';
    const peso = obtenerValor('accesorioWeight') || '--';

    const manejaTallas = usaModoTallas();
    const tallas = manejaTallas ? recolectarTallas() : [];

    const previewName = document.getElementById('previewAccesorioName');
    if (previewName) previewName.textContent = nombre;
    const previewDetails = document.getElementById('previewAccesorioDetails');
    if (previewDetails) previewDetails.textContent = `${marca} - ${modeloNombre}`;
    const colorLabel = document.querySelector('.preview-color');
    if (colorLabel) colorLabel.textContent = `Color: ${color}`;
  const typeLabel = document.querySelector('.preview-type');
  if (typeLabel) typeLabel.textContent = `Tipo: ${tipo}`;
    const materialLabel = document.querySelector('.preview-material');
    if (materialLabel) materialLabel.textContent = `Material: ${material}`;
    const dimensionsLabel = document.querySelector('.preview-dimensions');
    if (dimensionsLabel) dimensionsLabel.textContent = `Dimensiones: ${dimensiones}`;
    const weightLabel = document.querySelector('.preview-weight');
    if (weightLabel) weightLabel.textContent = `Peso: ${peso}`;
    const sizeLabel = document.querySelector('.preview-size');
    if (sizeLabel) sizeLabel.textContent = manejaTallas ? `Tallas: ${tallas.length} registradas` : 'Tallas: no aplican';
  }

  function mostrarDetalle(item){
    const modalId = 'accesorioDetalleModal';
    let modal = document.getElementById(modalId);
    if (!modal){
      modal = document.createElement('div');
      modal.className = 'modal';
      modal.id = modalId;
      modal.innerHTML = `
        <div class="modal-content">
          <div class="modal-header">
            <h3>Detalle de Accesorio</h3>
            <button class="modal-close" data-close="${modalId}"><i class="fas fa-times"></i></button>
          </div>
          <div class="modal-body" id="accesorioDetalleBody"></div>
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

    const body = modal.querySelector('#accesorioDetalleBody');
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
                ${item.tipo && item.tipo !== 'Accesorio' ? `<span class="detalle-tag">${item.tipo}</span>` : ''}
                ${item.material?.nombre ? `<span class="detalle-tag">${item.material.nombre}</span>` : ''}
              </div>
              <p class="detalle-producto__descripcion">${item.descripcion || 'Sin descripción disponible.'}</p>
              <div class="detalle-producto__info-grid">
                <div class="detalle-item"><span>Código interno</span><strong>${item.id}</strong></div>
                <div class="detalle-item"><span>Código de barras</span><strong>${item.codigoBarra || '--'}</strong></div>
                <div class="detalle-item"><span>Proveedor</span><strong>${item.proveedor?.razonSocial || '--'}</strong></div>
                <div class="detalle-item"><span>Unidad</span><strong>${item.unidad?.nombre || '--'}</strong></div>
                <div class="detalle-item"><span>Precio base</span><strong>${formatPrecio(item.precioVenta)}</strong></div>
                <div class="detalle-item"><span>Costo base</span><strong>${item.costoCompra != null ? formatPrecio(item.costoCompra) : '--'}</strong></div>
                <div class="detalle-item"><span>Dimensiones</span><strong>${item.dimensiones || '--'}</strong></div>
                <div class="detalle-item"><span>Peso</span><strong>${peso}</strong></div>
              </div>
            </div>
          </div>
          <div class="detalle-producto__tallas">
            <div class="detalle-producto__tallas-header">
              <h5>Variaciones registradas</h5>
              <div class="detalle-producto__tallas-tags">${tallasBadges || '<span class="detalle-tag detalle-tag--empty">Sin tallas</span>'}</div>
            </div>
            ${(item.tallas && item.tallas.length) ? `
              <table class="detalle-producto__table">
                <thead>
                  <tr>
                    <th>Variante</th>
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
        delete preview.dataset.productImage;
        preview.style.backgroundImage = '';
      }
      actualizarEstadoSelectorImagen({ texto: 'Cambiar imagen', archivo: file.name });
    };
    reader.readAsDataURL(file);
  }

  function obtenerValor(id){
    const element = document.getElementById(id);
    return element ? element.value.trim() : '';
  }

  function convertirDecimal(valor){
    if (valor === undefined || valor === null){
      return null;
    }
    const texto = String(valor).trim();
    if (!texto){
      return null;
    }
    const numero = parseFloat(texto.replace(',', '.'));
    if (Number.isNaN(numero)){
      return null;
    }
    return Number(numero.toFixed(2));
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
