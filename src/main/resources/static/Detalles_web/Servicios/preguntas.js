(() => {
  const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
  const STORAGE_KEY_API = 'detalles_groq_api_key';
  const STORAGE_KEY_CONVERSATION = 'detalles_groq_conversation';
  const STORAGE_KEY_MODEL = 'detalles_groq_model';
  const STORAGE_KEY_HISTORY = 'detalles_groq_conversation_history';
  const ADMIN_MODE_KEY = 'detalles_groq_admin_mode';
  const DEFAULT_GROQ_MODEL = 'openai/gpt-oss-120b';
  const SUPPORTED_GROQ_MODELS = [
    { value: 'openai/gpt-oss-120b', label: 'GPT OSS 120B (OpenAI)' },
    { value: 'llama-3.3-70b-instruct', label: 'Llama 3.3 70B Instruct' },
    { value: 'llama-4-scout', label: 'Llama 4 Scout' },
    { value: 'gpt-oss-20b', label: 'GPT OSS 20B' },
    { value: 'gpt-oss-120b', label: 'GPT OSS 120B' },
    { value: 'kimi-k2', label: 'Kimi K2' }
  ];
  const AI_RECOMMENDATIONS_URL = '/api/ai/recommendations';
  const AI_CONTEXT_URL = '/api/ai/context';
  const MAX_RECOMMENDATIONS_FOR_PROMPT = 5;
  const MAX_PRODUCT_CARDS = 4;
  const MAX_HISTORY_SESSIONS = 25;
  const CONTEXT_CACHE_MS = 15 * 60 * 1000; // 15 minutos
  const SERVER_KEY_ENDPOINT = '/api/config/groq-key';
  const MASKED_VALUE = '••••••••••••••••';
  const TOPIC_RESET_KEYWORDS = [
    'olvida',
    'olvídate',
    'cambio de plan',
    'cambié de opinión',
    'nuevo tema',
    'otra cosa',
    'ya no quiero',
    'ahora quiero',
    'reiniciemos'
  ];
  const SYSTEM_PROMPT = `Eres el Asistente Virtual Experto de Detalles, la tienda de calzado premium en Tarapoto, Perú. Tu misión es ayudar a los clientes a encontrar el calzado perfecto mediante recomendaciones inteligentes, contextuales y precisas, siempre basadas en la información real disponible en el catálogo recibido.

## IDENTIDAD Y TONO
- Eres un experto en calzado con conocimiento profundo sobre tipos de zapatos, materiales, usos apropiados y tendencias
- Comunícate en español neutro, amigable pero profesional
- Sé conversacional, empático y orientado a soluciones
- Muestra entusiasmo genuino por ayudar al cliente a encontrar el producto ideal

## ANÁLISIS OBLIGATORIO ANTES DE RESPONDER
- Revisa detenidamente el catálogo proporcionado (nombre, descripción, materiales, tallas, colores, stock, coincidencias) antes de responder.
- Usa únicamente los atributos disponibles; si un dato no aparece, indícalo como no especificado y no lo inventes.
- Prioriza productos con stock disponible. Si ninguno coincide perfectamente, explica la situación y propone alternativas cercanas dentro del catálogo o invita a revisar más adelante.
- No prometas acciones fuera de tu alcance (avisos, reservas, seguimiento personalizado) ni menciones buscar productos fuera del inventario de Detalles.

## REGLAS FUNDAMENTALES DE FILTRADO (CRÍTICO)

### Proceso de Análisis Obligatorio:
1. **IDENTIFICA** la actividad específica mencionada (correr, caminar, trabajar, evento formal, etc.)
2. **IDENTIFICA** el contexto ambiental (clima lluvioso, calor, frío, interior, exterior, terreno)
3. **EVALÚA** cada producto del catálogo contra estos criterios
4. **DESCARTA INMEDIATAMENTE** productos incompatibles
5. **RECOMIENDA** solo productos lógicamente apropiados

### Matriz de Compatibilidad Actividad-Calzado:

**ACTIVIDADES DEPORTIVAS:**
- Correr/Trotar → ✅ Zapatillas deportivas con amortiguación | ❌ Sandalias, tacones, zapatos formales, casuales
- Gimnasio/Fitness → ✅ Zapatillas deportivas | ❌ Sandalias, tacones, zapatos formales
- Caminar/Senderismo → ✅ Zapatillas deportivas, botas de trekking | ❌ Tacones, sandalias delicadas, zapatos formales

**EVENTOS SOCIALES:**
- Boda/Gala/Formal → ✅ Zapatos formales, tacones elegantes, botas formales | ❌ Zapatillas deportivas, sandalias casuales
- Fiesta/Celebración → ✅ Tacones, zapatos casuales elegantes, botas fashion | ❌ Zapatillas deportivas muy casuales
- Reunión semiformal → ✅ Zapatos casuales elegantes, mocasines, botas | ❌ Zapatillas muy deportivas, sandalias playeras

**USO DIARIO:**
- Trabajo oficina → ✅ Zapatos formales, casuales elegantes, mocasines | ❌ Zapatillas muy deportivas, sandalias playeras
- Uso casual/diario → ✅ Zapatillas urbanas, zapatos casuales, sandalias (según clima) | ❌ Tacones muy altos, zapatos muy formales
- Playa/Piscina → ✅ Sandalias, chanclas | ❌ Zapatos cerrados, zapatillas deportivas

**CONDICIONES CLIMÁTICAS:**
- Lluvia/Humedad → ✅ Calzado con suela antideslizante, materiales resistentes al agua | ❌ Sandalias abiertas, materiales delicados (gamuza)
- Calor intenso → ✅ Sandalias, zapatos transpirables | ❌ Botas cerradas pesadas
- Frío → ✅ Botas, zapatos cerrados | ❌ Sandalias abiertas

## PROCESO DE RECOMENDACIÓN

### Paso 1: Análisis del Cliente
- Extrae: actividad específica, contexto, preferencias de estilo, talla, prioridad (comodidad vs estilo)
- Considera: clima actual, eventos próximos, festividades

### Paso 2: Filtrado Inteligente
- Aplica la matriz de compatibilidad
- Elimina productos incompatibles
- Prioriza productos con stock disponible
- Si la talla solicitada no está disponible, menciona tallas cercanas

### Paso 3: Construcción de Recomendación
Para cada producto recomendado, explica:
- **Por qué es apropiado** para la actividad específica
- **Características clave** que lo hacen ideal (ej: "suela antideslizante perfecta para correr bajo lluvia")
- **Beneficios prácticos** para el cliente
- **Disponibilidad** (stock, tallas)

### Paso 4: Valor Agregado
- Sugiere accesorios complementarios cuando sea relevante
- Ofrece consejos de uso o cuidado si es pertinente
- Menciona promociones o alternativas si aplica

## ESTRUCTURA DE RESPUESTA

**Introducción (1-2 líneas):**
- Reconoce la necesidad del cliente
- Muestra comprensión del contexto

**Recomendaciones (lista numerada 1., 2., 3.):**
- Máximo 3-4 productos
- Cada uno con: nombre, precio (S/ X.XX), tallas disponibles, razón específica de recomendación
- Enfócate en el VALOR para la actividad específica, no solo en características generales

**Cierre (1-2 líneas):**
- Invita a la acción (añadir al carrito, preguntar más, visitar tienda)
- Ofrece ayuda adicional

## MANEJO DE CASOS ESPECIALES

**Si NO hay productos apropiados:**
"Lamentablemente, no contamos en este momento con productos que cumplan exactamente lo que necesitas dentro del catálogo disponible. Podemos revisar opciones cercanas o consultar más adelante por nuevas llegadas."

**Si hay productos pero sin stock:**
"Este modelo encaja muy bien con tu necesidad, pero actualmente aparece sin stock. Podemos revisar alternativas similares disponibles o volver a consultar cuando se reponga."

**Si el cliente cambia de tema:**
Reconoce el cambio y enfócate completamente en la nueva solicitud, olvidando las preferencias anteriores.

## FORMATO Y ESTILO

✅ USAR:
- Listas numeradas simples (1., 2., 3.)
- Precios en formato S/ XX.XX
- Lenguaje conversacional y claro
- Emojis numéricos ocasionales (1️⃣, 2️⃣, 3️⃣)

❌ NO USAR:
- Markdown (**, ##, -, *)
- IDs o códigos internos de productos
- Tablas
- Listas con guiones
- Jerga técnica innecesaria
- Respuestas genéricas sin personalización
- Promesas de avisos, reservas o búsqueda fuera del inventario de Detalles

## EJEMPLOS DE RAZONAMIENTO

**Pregunta:** "Necesito zapatillas para correr en clima lluvioso"
**Razonamiento interno:**
- Actividad: Correr (requiere zapatillas deportivas)
- Contexto: Lluvia (requiere suela antideslizante, materiales resistentes al agua)
- DESCARTO: Sandalias (inapropiadas para correr), tacones, zapatos casuales
- BUSCO: Zapatillas deportivas con características específicas para lluvia

**Pregunta:** "Busco zapatos para una boda"
**Razonamiento interno:**
- Evento: Boda (formal, requiere elegancia)
- DESCARTO: Zapatillas deportivas, sandalias casuales
- BUSCO: Zapatos formales, tacones elegantes, botas formales

Recuerda: La calidad de tu recomendación se mide por qué tan bien el producto se ajusta a la necesidad ESPECÍFICA del cliente, no solo por recomendar productos del catálogo.`;


  const PRODUCT_IMG_PLACEHOLDER = '/img/Upload/productos/producto-default.jpg';

  const elements = {};
  let apiKey = '';
  let conversationHistory = [];
  let conversationHistorySessions = [];
  let isProcessing = false;
  let currentModel = '';
  let adminModeEnabled = false;
  let hasServerKey = false;
  let situationalContext = null;
  let contextLastFetch = 0;
  let contextErrorMessage = '';
  let contextErrorShown = false;
  let confirmResolver = null;
  let confirmFocusableElements = [];
  let confirmPreviousFocus = null;
  const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

  document.addEventListener('DOMContentLoaded', () => {
    void init();
  });

  async function init() {
    cacheElements();
    loadAdminModePreference();
    applyAdminMode(true);
    await loadApiKey();
    loadModel();
    loadHistory();
    loadConversation();
    renderConversation();
    renderHistoryList();
    setupEventListeners();
    try {
      await refreshSituationalContext(true);
    } catch (error) {
      console.error('No se pudo inicializar el contexto situacional:', error);
    }
    updateUIState();

    if (apiKey && conversationHistory.length === 0) {
      startConversation();
    }
  }

  function cacheElements() {
    elements.body = document.body;
    elements.apiConfig = document.getElementById('apiConfig');
    elements.apiHeader = document.getElementById('apiHeader');
    elements.apiChevron = document.getElementById('apiChevron');
    elements.apiBody = document.getElementById('apiBody');
    elements.apiKeyForm = document.getElementById('apiKeyForm');
    elements.apiKeyInput = document.getElementById('apiKeyInput');
    elements.saveApiKey = document.getElementById('saveApiKey');
    elements.clearApiKey = document.getElementById('clearApiKey');
    elements.apiStatusText = document.getElementById('apiStatusText');
    elements.apiModelSelect = document.getElementById('apiModelSelect');
    elements.modelStatus = document.getElementById('modelStatus');
    elements.assistantStatus = document.getElementById('assistantStatus');
    elements.chat = document.getElementById('chat');
    elements.sendBtn = document.getElementById('sendBtn');
    elements.userInput = document.getElementById('userInput');
    elements.resetChat = document.getElementById('resetChat');
    elements.historyBtn = document.getElementById('historyBtn');
    elements.historyDrawer = document.getElementById('historyDrawer');
    elements.historyList = document.getElementById('historyList');
    elements.historyEmpty = document.getElementById('historyEmpty');
    elements.closeHistory = document.getElementById('closeHistory');
    elements.clearHistory = document.getElementById('clearHistory');
    elements.suggestions = Array.from(document.querySelectorAll('#suggestions .tag'));
    elements.eventType = document.getElementById('eventType');
    elements.stylePreference = document.getElementById('stylePreference');
    elements.colorPreference = document.getElementById('colorPreference');
    elements.shoeSize = document.getElementById('shoeSize');
    elements.comfortPriority = document.getElementById('comfortPriority');
    elements.preferencesPanel = document.getElementById('preferencesPanel');
    elements.confirmBackdrop = document.getElementById('confirmBackdrop');
    elements.confirmModal = document.getElementById('confirmModal');
    elements.confirmTitle = document.getElementById('confirmTitle');
    elements.confirmMessage = document.getElementById('confirmMessage');
    elements.confirmAccept = document.getElementById('confirmAccept');
    elements.confirmCancel = document.getElementById('confirmCancel');
  }

  function setupEventListeners() {
    if (elements.apiKeyForm) {
      elements.apiKeyForm.addEventListener('submit', event => {
        event.preventDefault();
        saveApiKeyHandler();
      });
    }

    if (elements.apiHeader) {
      elements.apiHeader.addEventListener('click', toggleApiConfig);
    }
    if (!hasServerKey && elements.saveApiKey && elements.clearApiKey) {
      elements.saveApiKey.addEventListener('click', saveApiKeyHandler);
      elements.clearApiKey.addEventListener('click', () => {
        void clearApiKey(true);
      });
    }
    if (elements.apiModelSelect) {
      elements.apiModelSelect.addEventListener('change', handleModelChange);
    }
    if (elements.sendBtn) {
      elements.sendBtn.addEventListener('click', () => {
        void sendMessage();
      });
    }

    if (elements.userInput) {
      elements.userInput.addEventListener('input', updateUIState);
      elements.userInput.addEventListener('keypress', handleKeyPress);
    }

    elements.suggestions.forEach(tag => {
      tag.addEventListener('click', () => {
        const query = tag.getAttribute('data-q') || '';
        if (elements.userInput) {
          elements.userInput.value = query;
        }
        updateUIState();
        void sendMessage();
      });
    });

    if (elements.resetChat) {
      elements.resetChat.addEventListener('click', () => {
        void promptNewConversation(true);
      });
    }

    if (elements.historyBtn) {
      elements.historyBtn.addEventListener('click', () => toggleHistoryDrawer(true));
    }

    if (elements.closeHistory) {
      elements.closeHistory.addEventListener('click', () => toggleHistoryDrawer(false));
    }

    if (elements.historyList) {
      elements.historyList.addEventListener('click', handleHistoryListClick);
      elements.historyList.addEventListener('keydown', handleHistoryListKeydown);
    }

    if (elements.clearHistory) {
      elements.clearHistory.addEventListener('click', () => {
        void promptClearHistory();
      });
    }

    if (elements.confirmAccept) {
      elements.confirmAccept.addEventListener('click', () => finalizeConfirmation(true));
    }

    if (elements.confirmCancel) {
      elements.confirmCancel.addEventListener('click', () => finalizeConfirmation(false));
    }

    if (elements.confirmBackdrop) {
      elements.confirmBackdrop.addEventListener('click', () => finalizeConfirmation(false));
    }

    document.addEventListener('keydown', handleGlobalKeydown);
  }

  async function refreshSituationalContext(force = false) {
    const now = Date.now();
    if (!force && situationalContext && now - contextLastFetch < CONTEXT_CACHE_MS) {
      return situationalContext;
    }

    try {
      const response = await fetch(AI_CONTEXT_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        let message = `HTTP ${response.status}`;
        try {
          const payload = await response.json();
          message = payload?.message || payload?.detail || message;
        } catch (parseError) {
          // Ignorar errores de parsing, usamos el mensaje por defecto.
        }
        throw new Error(message);
      }

      const data = await response.json();
      situationalContext = data;
      contextLastFetch = now;
      contextErrorMessage = '';
      contextErrorShown = false;
      return situationalContext;
    } catch (error) {
      situationalContext = null;
      contextLastFetch = now;
      contextErrorMessage = error?.message || 'No se pudo recuperar el contexto local.';
      throw new Error(contextErrorMessage);
    }
  }

  function buildSituationalContextPrompt(context) {
    if (!context || typeof context !== 'object') {
      return '';
    }

    const segments = [];
    const weather = context.weather || {};
    const holidays = context.holidays || {};
    const forecast = context.forecast || {};

    const weatherParts = [];
    if (weather.description) {
      weatherParts.push(`Condiciones: ${weather.description}`);
    }
    if (typeof weather.temperatureC === 'number') {
      weatherParts.push(`Temperatura ${weather.temperatureC.toFixed(1)} °C`);
    }
    if (typeof weather.feelsLikeC === 'number') {
      weatherParts.push(`Sensación ${weather.feelsLikeC.toFixed(1)} °C`);
    }
    if (typeof weather.humidity === 'number') {
      weatherParts.push(`Humedad ${weather.humidity}%`);
    }
    if (weatherParts.length) {
      segments.push(`Clima actual en Tarapoto: ${weatherParts.join(', ')}.`);
    }

    const todayHoliday = holidays.today || null;
    const upcomingHoliday = holidays.upcoming || null;
    const longWeekend = holidays.longWeekend || null;

    if (todayHoliday) {
      segments.push(`Hoy se celebra ${todayHoliday.localName || todayHoliday.englishName}.`);
    }
    if (upcomingHoliday) {
      const upcomingParts = [];
      upcomingParts.push(upcomingHoliday.localName || upcomingHoliday.englishName);
      upcomingParts.push(`fecha ${upcomingHoliday.date}`);
      if (typeof upcomingHoliday.daysUntil === 'number') {
        upcomingParts.push(`faltan ${upcomingHoliday.daysUntil} día${upcomingHoliday.daysUntil === 1 ? '' : 's'}`);
      }
      segments.push(`Próximo feriado en Perú: ${upcomingParts.join(', ')}.`);
    }
    if (longWeekend && (!upcomingHoliday || longWeekend.date !== upcomingHoliday.date)) {
      segments.push(`Fin de semana largo: ${longWeekend.localName || longWeekend.englishName} el ${longWeekend.date}.`);
    }

    if (Array.isArray(forecast.nextDays) && forecast.nextDays.length) {
      const daysSummary = forecast.nextDays.slice(0, 3).map(day => {
        const dateLabel = day.date || '';
        const description = day.description ? day.description.toLowerCase() : '';
        const tempRange = typeof day.minTemperatureC === 'number' && typeof day.maxTemperatureC === 'number'
          ? `min ${Math.round(day.minTemperatureC)} °C, max ${Math.round(day.maxTemperatureC)} °C`
          : '';
        const rainText = typeof day.precipitationProbability === 'number'
          ? `lluvia ${Math.round(day.precipitationProbability)}%`
          : '';
        return [dateLabel, description, tempRange, rainText].filter(Boolean).join(' · ');
      }).filter(Boolean);
      if (daysSummary.length) {
        segments.push(`Pronóstico próximos días: ${daysSummary.join(' | ')}.`);
      }
    }

    if (Array.isArray(forecast.nextHours) && forecast.nextHours.length) {
      const nextHour = forecast.nextHours[0];
      if (nextHour && nextHour.timestamp && typeof nextHour.temperatureC === 'number') {
        const hourLabel = new Date(nextHour.timestamp).toLocaleTimeString('es-PE', {
          hour: '2-digit',
          minute: '2-digit'
        });
        const desc = nextHour.description ? nextHour.description.toLowerCase() : '';
        const rainProbability = typeof nextHour.precipitationProbability === 'number'
          ? `lluvia ${Math.round(nextHour.precipitationProbability)}%`
          : '';
        segments.push(`Próximas horas (${hourLabel}): ${desc} ${Math.round(nextHour.temperatureC)} °C ${rainProbability}`.trim());
      }
    }

    if (typeof context.narrative === 'string' && context.narrative.trim()) {
      segments.push(context.narrative.trim());
    }

    return segments.join(' ').trim();
  }

  function notifyContextError(message) {
    if (!message || contextErrorShown) {
      return;
    }
    appendMessage(`Error al recuperar clima/festividades: ${message}.`, 'system');
    contextErrorShown = true;
  }

  function toggleApiConfig() {
    if (!elements.apiBody || !elements.apiChevron) {
      return;
    }
    elements.apiBody.classList.toggle('open');
    const isOpen = elements.apiBody.classList.contains('open');
    elements.apiChevron.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
  }

  async function loadApiKey() {
    apiKey = await fetchServerApiKey();
    hasServerKey = Boolean(apiKey);

    if (hasServerKey) {
      configureServerKeyUIState();
      return;
    }

    apiKey = localStorage.getItem(STORAGE_KEY_API) || '';

    if (!elements.apiConfig) {
      return;
    }

    if (apiKey) {
      if (elements.apiKeyInput) {
        elements.apiKeyInput.value = MASKED_VALUE;
        elements.apiKeyInput.disabled = true;
      }
      if (elements.saveApiKey) {
        elements.saveApiKey.textContent = 'Actualizar';
        elements.saveApiKey.dataset.mode = 'view';
        elements.saveApiKey.disabled = false;
      }
      if (elements.clearApiKey) {
        elements.clearApiKey.style.display = 'inline-flex';
      }
      elements.apiConfig.classList.add('configured');
      if (elements.apiStatusText) {
        elements.apiStatusText.textContent = 'API Key configurada (Groq)';
      }
    } else {
      if (elements.apiKeyInput) {
        elements.apiKeyInput.value = '';
        elements.apiKeyInput.disabled = false;
      }
      if (elements.saveApiKey) {
        elements.saveApiKey.textContent = 'Guardar';
        elements.saveApiKey.dataset.mode = 'save';
        elements.saveApiKey.disabled = false;
      }
      if (elements.clearApiKey) {
        elements.clearApiKey.style.display = 'none';
      }
      elements.apiConfig.classList.remove('configured');
      if (elements.apiStatusText) {
        elements.apiStatusText.textContent = 'Configuración de API Key (Groq)';
      }
    }
  }

  function configureServerKeyUIState() {
    if (!elements.apiConfig) {
      return;
    }

    if (elements.apiKeyInput) {
      elements.apiKeyInput.value = MASKED_VALUE;
      elements.apiKeyInput.disabled = true;
    }
    if (elements.saveApiKey) {
      elements.saveApiKey.textContent = 'Definida en servidor';
      elements.saveApiKey.disabled = true;
    }
    if (elements.clearApiKey) {
      elements.clearApiKey.style.display = 'none';
    }
    elements.apiConfig.classList.add('configured');
    if (elements.apiStatusText) {
      elements.apiStatusText.textContent = 'API Key configurada desde el servidor (Groq)';
    }
  }

  async function fetchServerApiKey() {
    try {
      const response = await fetch(SERVER_KEY_ENDPOINT, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok || response.status === 204) {
        return '';
      }

      const payload = await response.json();
      const key = typeof payload?.apiKey === 'string' ? payload.apiKey.trim() : '';
      if (key.startsWith('gsk_')) {
        return key;
      }
      return '';
    } catch (error) {
      console.error('No se pudo obtener la API Key desde el servidor:', error);
      return '';
    }
  }

  function loadModel() {
    populateModelSelect();

    if (typeof window.DETALLES_GROQ_MODEL === 'string' && window.DETALLES_GROQ_MODEL.trim()) {
      currentModel = window.DETALLES_GROQ_MODEL.trim();
    } else {
      try {
        const storedModel = localStorage.getItem(STORAGE_KEY_MODEL);
        currentModel = storedModel ? storedModel : '';
      } catch (error) {
        console.error('No se pudo leer el modelo almacenado:', error);
        currentModel = '';
      }
    }

    if (!currentModel) {
      currentModel = DEFAULT_GROQ_MODEL;
    }

    try {
      localStorage.setItem(STORAGE_KEY_MODEL, currentModel);
    } catch (error) {
      console.error('No se pudo persistir el modelo activo en localStorage:', error);
    }

    syncModelSelect(currentModel);
    updateModelStatus(`Modelo activo: ${currentModel}`);
  }

  function populateModelSelect() {
    if (!elements.apiModelSelect) {
      return;
    }

    const existingValues = new Set(
      Array.from(elements.apiModelSelect.options || []).map(option => option.value)
    );

    SUPPORTED_GROQ_MODELS.forEach(model => {
      if (!existingValues.has(model.value)) {
        const option = document.createElement('option');
        option.value = model.value;
        option.textContent = model.label;
        elements.apiModelSelect.appendChild(option);
      }
    });
  }

  function syncModelSelect(modelValue) {
    if (!elements.apiModelSelect) {
      return;
    }

    const options = Array.from(elements.apiModelSelect.options || []);
    if (!options.some(option => option.value === modelValue)) {
      const option = document.createElement('option');
      option.value = modelValue;
      option.textContent = modelValue;
      elements.apiModelSelect.appendChild(option);
    }

    elements.apiModelSelect.value = modelValue;
  }

  function updateModelStatus(message, isError = false) {
    if (!elements.modelStatus) {
      return;
    }

    elements.modelStatus.textContent = message;
    elements.modelStatus.style.color = isError ? '#b91c1c' : '#6b6f76';
  }

  function handleModelChange(event) {
    const selected = (event.target.value || '').trim();
    if (!selected) {
      return;
    }

    currentModel = selected;

    try {
      localStorage.setItem(STORAGE_KEY_MODEL, selected);
    } catch (error) {
      console.error('No se pudo guardar el modelo seleccionado:', error);
    }

    syncModelSelect(selected);
    updateModelStatus(`Modelo activo: ${selected}`);

    if (apiKey) {
      resetConversation(false, true);
    }
  }

  function handleModelDeprecation() {
    const message = `El modelo ${currentModel || DEFAULT_GROQ_MODEL} ya no está disponible. Selecciona otro en la configuración.`;
    updateModelStatus(message, true);

    if (elements.apiBody && !elements.apiBody.classList.contains('open')) {
      elements.apiBody.classList.add('open');
      if (elements.apiChevron) {
        elements.apiChevron.style.transform = 'rotate(180deg)';
      }
    }
  }

  function saveApiKeyHandler() {
    if (hasServerKey) {
      alert('La API Key está administrada por el servidor. Ajusta la configuración backend para modificarla.');
      return;
    }

    if (!elements.saveApiKey || !elements.apiKeyInput) {
      return;
    }

    const mode = elements.saveApiKey.dataset.mode;

    if (mode === 'view') {
      elements.apiKeyInput.disabled = false;
      elements.apiKeyInput.value = '';
      elements.apiKeyInput.focus();
      elements.saveApiKey.textContent = 'Guardar';
      elements.saveApiKey.dataset.mode = 'save';
      return;
    }

    const key = elements.apiKeyInput.value.trim();

    if (!key || key === MASKED_VALUE) {
      alert('Por favor ingresa una API Key válida.');
      return;
    }

    if (!key.startsWith('gsk_')) {
      alert('La API Key de Groq debe comenzar con "gsk_".');
      return;
    }

    apiKey = key;
    try {
      localStorage.setItem(STORAGE_KEY_API, key);
    } catch (error) {
      console.error('No se pudo guardar la API Key en localStorage:', error);
    }
    void loadApiKey();
    updateUIState();
    resetConversation(false, false);
    startConversation();
  }

  async function clearApiKey(showConfirmation = true) {
    if (hasServerKey) {
      alert('La API Key está administrada por el servidor. Ajusta la configuración backend para modificarla.');
      return;
    }

    if (showConfirmation) {
      const confirmed = await showConfirmation({
        title: 'Eliminar API Key',
        message: '¿Estás seguro de que deseas eliminar la API Key guardada?',
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      });

      if (!confirmed) {
        return;
      }
    }

    apiKey = '';
    try {
      localStorage.removeItem(STORAGE_KEY_API);
    } catch (error) {
      console.error('No se pudo eliminar la API Key de localStorage:', error);
    }
    void loadApiKey();
    updateUIState();
    resetConversation(false, false);
  }

  function updateUIState() {
    if (!elements.sendBtn || !elements.assistantStatus || !elements.userInput) {
      return;
    }

    const canSend = Boolean(apiKey && elements.userInput.value.trim() && !isProcessing);
    elements.sendBtn.disabled = !canSend;

    if (apiKey) {
      const status = hasServerKey
        ? '<span style="color:#10b981"><i class="fas fa-check-circle"></i> Asistente activo con API Key definida en servidor</span>'
        : '<span style="color:#10b981"><i class="fas fa-check-circle"></i> Asistente activo y listo</span>';
      elements.assistantStatus.innerHTML = status;
    } else {
      elements.assistantStatus.innerHTML = '<span class="muted"><i class="fas fa-exclamation-circle"></i> Configura tu API Key para comenzar</span>';
    }
  }

  function loadConversation() {
    let stored = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY_CONVERSATION);
    } catch (error) {
      console.error('No se pudo acceder a localStorage para leer la conversación:', error);
    }

    if (!stored) {
      conversationHistory = [];
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      conversationHistory = Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('No se pudo leer el historial guardado:', error);
      conversationHistory = [];
      localStorage.removeItem(STORAGE_KEY_CONVERSATION);
    }

    if (apiKey && conversationHistory.length > 0 && !conversationHistory.some(entry => entry.role === 'system')) {
      conversationHistory.unshift({
        role: 'system',
        content: SYSTEM_PROMPT
      });
      saveConversation();
    }
  }

  function saveConversation() {
    try {
      localStorage.setItem(STORAGE_KEY_CONVERSATION, JSON.stringify(conversationHistory));
    } catch (error) {
      console.error('No se pudo guardar el historial:', error);
    }
  }

  function renderConversation() {
    if (!elements.chat) {
      return;
    }

    elements.chat.innerHTML = '';
    conversationHistory.forEach(entry => {
      if (entry.role === 'system') {
        return;
      }
      const type = entry.role === 'user' ? 'user' : entry.role === 'assistant' ? 'ai' : 'system';
      appendMessage(entry.content, type);
      if (type === 'ai' && Array.isArray(entry.cards) && entry.cards.length) {
        appendProductCards(entry.cards);
      }
    });
  }

  function startConversation() {
    if (!apiKey) {
      return;
    }

    conversationHistory = [
      {
        role: 'system',
        content: SYSTEM_PROMPT
      }
    ];
    saveConversation();
    renderConversation();
    getAIResponse({ isInitial: true });
  }

  async function promptNewConversation(autoRestart = false) {
    const hasInteraction = conversationHistory.some(entry => entry.role === 'user' || entry.role === 'assistant');
    const message = hasInteraction
      ? '¿Deseas iniciar una nueva conversación? El chat actual se guardará en el historial y comenzaremos uno nuevo.'
      : '¿Deseas iniciar una nueva conversación?';

    const confirmed = await showConfirmation({
      title: 'Nueva conversación',
      message,
      confirmText: 'Iniciar',
      cancelText: 'Cancelar'
    });

    if (!confirmed) {
      return;
    }

    resetConversation(false, autoRestart);
  }

  function resetConversation(askConfirmation = true, autoRestart = false) {
    if (askConfirmation) {
      void promptNewConversation(autoRestart);
      return;
    }

    const archived = archiveCurrentConversation();

    conversationHistory = [];
    try {
      localStorage.removeItem(STORAGE_KEY_CONVERSATION);
    } catch (error) {
      console.error('No se pudo limpiar el historial de la conversación en localStorage:', error);
    }
    renderConversation();
    if (archived) {
      renderHistoryList();
      saveHistory();
    }
    toggleHistoryDrawer(false);

    if (autoRestart && apiKey) {
      startConversation();
    }
  }

  function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  }

  function appendMessage(text, type) {
    if (!elements.chat) {
      return;
    }
    const msgDiv = document.createElement('div');
    msgDiv.className = `msg ${type}`;
    msgDiv.textContent = text;
    elements.chat.appendChild(msgDiv);
    elements.chat.scrollTop = elements.chat.scrollHeight;
  }

  function appendProductCards(cards) {
    if (!elements.chat) {
      return;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'assistant-cards';

    cards.forEach(card => {
      const cardEl = document.createElement('article');
      cardEl.className = 'assistant-card';

      const title = document.createElement('h4');
      title.className = 'assistant-card__title';
      title.textContent = card?.title || 'Producto sugerido';
      cardEl.appendChild(title);

      if (card?.subtitle) {
        const subtitle = document.createElement('p');
        subtitle.className = 'assistant-card__subtitle';
        subtitle.textContent = card.subtitle;
        cardEl.appendChild(subtitle);
      }

      const image = document.createElement('img');
      image.className = 'assistant-card__image';
      image.src = card?.imageUrl || PRODUCT_IMG_PLACEHOLDER;
      image.alt = card?.title || 'Imagen del producto sugerido';
      cardEl.appendChild(image);

      if (card?.badge) {
        const badge = document.createElement('span');
        badge.className = 'assistant-card__badge';
        badge.textContent = card.badge;
        cardEl.appendChild(badge);
      }

      if (Array.isArray(card?.features) && card.features.length) {
        const list = document.createElement('ul');
        list.className = 'assistant-card__features';
        card.features.forEach(feature => {
          const item = document.createElement('li');
          item.textContent = feature;
          list.appendChild(item);
        });
        cardEl.appendChild(list);
      }

      if (card?.price) {
        const price = document.createElement('p');
        price.className = 'assistant-card__price';
        price.textContent = card.price;
        cardEl.appendChild(price);
      }

      if (card?.cta && card?.ctaUrl) {
        const link = document.createElement('a');
        link.className = 'assistant-card__cta';
        link.href = card.ctaUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = card.cta;
        cardEl.appendChild(link);
      }

      if (card?.additionalInfo) {
        const info = document.createElement('p');
        info.className = 'assistant-card__info';
        info.textContent = card.additionalInfo;
        cardEl.appendChild(info);
      }

      wrapper.appendChild(cardEl);
    });

    elements.chat.appendChild(wrapper);
    elements.chat.scrollTop = elements.chat.scrollHeight;
  }

  function showTypingIndicator() {
    if (!elements.chat) {
      return;
    }
    if (document.getElementById('typingIndicator')) {
      return;
    }

    const indicator = document.createElement('div');
    indicator.id = 'typingIndicator';
    indicator.className = 'typing-indicator';
    indicator.innerHTML = '<span></span><span></span><span></span>';
    elements.chat.appendChild(indicator);
    elements.chat.scrollTop = elements.chat.scrollHeight;
  }

  function hideTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
      indicator.remove();
    }
  }

  async function sendMessage() {
    if (!elements.userInput) {
      return;
    }

    const message = elements.userInput.value.trim();

    if (!message || !apiKey || isProcessing) {
      return;
    }

    applyConversationPivotIfNeeded(message);

    conversationHistory.push({
      role: 'user',
      content: message
    });

    appendMessage(message, 'user');
    elements.userInput.value = '';
    updateUIState();
    saveConversation();

    const preferences = collectPreferences();
    let recommendations = [];
    try {
      recommendations = await fetchRecommendations(preferences);
    } catch (error) {
      console.error('No se pudieron obtener recomendaciones desde la API:', error);
    }

    await getAIResponse({ recommendations, preferences });
  }

  async function getAIResponse(options = {}) {
    const { isInitial = false, recommendations = null, preferences = null } = options;

    isProcessing = true;
    updateUIState();
    showTypingIndicator();

    try {
      let situationalPrompt = '';
      try {
        const context = await refreshSituationalContext(false);
        situationalPrompt = buildSituationalContextPrompt(context);
      } catch (contextError) {
        console.error('Contexto situacional no disponible:', contextError);
        notifyContextError(contextError.message || contextError);
      }

      const profile = getProfileContext();
      const messages = conversationHistory.map(entry => ({
        role: entry.role,
        content: entry.content
      }));
      let contextualRecommendations = Array.isArray(recommendations) ? recommendations : [];

      if (!isInitial && contextualRecommendations.length === 0) {
        try {
          contextualRecommendations = await fetchRecommendations(preferences);
        } catch (error) {
          console.error('Fallo al obtener recomendaciones previas al mensaje IA:', error);
        }
      }

      if (profile && !isInitial) {
        messages.push({
          role: 'system',
          content: `Información del perfil del cliente: ${profile}.`
        });
      }

      if (situationalPrompt) {
        messages.push({
          role: 'system',
          content: situationalPrompt
        });
      }

      if (contextualRecommendations.length > 0) {
        messages.push({
          role: 'system',
          content: buildRecommendationContext(contextualRecommendations)
        });
      }

      if (isInitial) {
        messages.push({
          role: 'user',
          content: 'Inicia la conversación con este saludo exacto y continúa con preguntas guiadas: "¡Bienvenido! Soy tu asistente de compras personalizado de Detalles y estaré encantado de ayudarte a encontrar el par de zapatos perfecto para tu evento. Para comenzar, ¿puedes indicarme a qué tipo de evento o reunión asistirás? Por ejemplo, ¿una boda, una reunión formal, una fiesta o una ocasión casual?". Después sigue el flujo establecido sin usar respuestas de relleno.'
        });
      }

      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: currentModel || DEFAULT_GROQ_MODEL,
          messages,
          temperature: 1,
          top_p: 1,
          max_completion_tokens: 8192,
          reasoning_effort: 'medium',
          stream: false,
          stop: null
        })
      });

      if (!response.ok) {
        let errorMessage = 'Error en la API de Groq.';
        try {
          const errorPayload = await response.json();
          errorMessage = errorPayload.error?.message || errorMessage;
        } catch (error) {
          console.error('No se pudo interpretar el error de la API:', error);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const aiMessage = data?.choices?.[0]?.message?.content?.trim();

      if (!aiMessage) {
        throw new Error('La respuesta del asistente llegó vacía.');
      }

      const productCards = buildProductCardsFromRecommendations(contextualRecommendations);

      conversationHistory.push({
        role: 'assistant',
        content: aiMessage,
        cards: productCards
      });

      hideTypingIndicator();
      appendMessage(aiMessage, 'ai');
      if (productCards.length) {
        appendProductCards(productCards);
      }
      saveConversation();
    } catch (error) {
      hideTypingIndicator();
      console.error('Error al consultar Groq:', error);
      if (typeof error.message === 'string' && error.message.toLowerCase().includes('decommissioned')) {
        handleModelDeprecation();
      }
      const prefix = 'Error: ' + (error.message || 'Se produjo un error inesperado.');
      const suffix = ' Por favor verifica tu API Key, la conexión a internet y que el modelo seleccionado siga vigente.';
      appendMessage(prefix + suffix, 'system');
    } finally {
      isProcessing = false;
      updateUIState();
    }
  }

  function getProfileContext() {
    const parts = [];

    if (elements.eventType && elements.eventType.value) {
      const label = elements.eventType.options[elements.eventType.selectedIndex].text;
      parts.push(`Tipo de evento: ${label}`);
    }

    if (elements.stylePreference && elements.stylePreference.value) {
      const label = elements.stylePreference.options[elements.stylePreference.selectedIndex].text;
      parts.push(`Estilo preferido: ${label}`);
    }

    if (elements.colorPreference && elements.colorPreference.value.trim()) {
      parts.push(`Color preferido: ${elements.colorPreference.value.trim()}`);
    }

    if (elements.shoeSize && elements.shoeSize.value) {
      parts.push(`Talla: ${elements.shoeSize.value}`);
    }

    if (elements.comfortPriority && elements.comfortPriority.value) {
      const label = elements.comfortPriority.options[elements.comfortPriority.selectedIndex].text;
      parts.push(`Prioridad de comodidad: ${label}`);
    }

    return parts.length > 0 ? parts.join(', ') : '';
  }

  function collectPreferences() {
    const snapshot = collectPreferencesSnapshot();
    
    // Detectar automáticamente tipo de evento y estilo desde la conversación
    const autoEventType = inferEventTypeFromConversation();
    const autoStyle = inferStyleFromConversation();
    
    return {
      ...snapshot,
      eventType: snapshot.eventType || autoEventType, // Usar detección automática si no está configurado
      stylePreference: snapshot.stylePreference || autoStyle, // Usar detección automática si no está configurado
      comfortPriority: snapshot.comfortPriority || 'high',
      gender: inferGenderFromConversation()
    };
  }

  function applyConversationPivotIfNeeded(message) {
    if (!message) {
      return;
    }
    const normalized = message.toLowerCase();
    const shouldReset = TOPIC_RESET_KEYWORDS.some(keyword => normalized.includes(keyword));
    if (!shouldReset) {
      return;
    }

    conversationHistory = conversationHistory.filter(entry => entry.role === 'system');
    conversationHistory.push({
      role: 'system',
      content: 'El cliente indicó que cambia de tema; ignora las solicitudes anteriores y enfócate únicamente en el nuevo pedido.'
    });
    saveConversation();
  }

  function collectSelectValue(selectEl) {
    if (!selectEl) {
      return '';
    }
    const value = (selectEl.value || '').trim();
    if (!value || value.toLowerCase() === 'seleccionar...') {
      return '';
    }
    return value;
  }
  
  /**
   * Detecta automáticamente el tipo de evento desde la conversación
   */
  function inferEventTypeFromConversation() {
    const lastUserMessage = [...conversationHistory].reverse().find(entry => entry.role === 'user');
    if (!lastUserMessage || !lastUserMessage.content) {
      return '';
    }
    const content = lastUserMessage.content.toLowerCase();
    
    // Palabras clave para cada tipo de evento
    const eventPatterns = {
      'deportivo': ['correr', 'running', 'gym', 'gimnasio', 'deporte', 'entrenar', 'training', 'fitness', 'ejercicio', 'trotar', 'zapatilla deportiva'],
      'formal': ['boda', 'gala', 'formal', 'elegante', 'evento', 'ceremonia', 'fiesta elegante'],
      'semiformal': ['reunión', 'semiformal', 'cocktail', 'semi formal'],
      'casual': ['casual', 'diario', 'día a día', 'salir', 'paseo'],
      'trabajo': ['oficina', 'trabajo', 'laboral']
    };
    
    // Buscar coincidencias
    for (const [eventType, keywords] of Object.entries(eventPatterns)) {
      if (keywords.some(keyword => content.includes(keyword))) {
        return eventType;
      }
    }
    
    return '';
  }
  
  /**
   * Detecta automáticamente el estilo desde la conversación
   */
  function inferStyleFromConversation() {
    const lastUserMessage = [...conversationHistory].reverse().find(entry => entry.role === 'user');
    if (!lastUserMessage || !lastUserMessage.content) {
      return '';
    }
    const content = lastUserMessage.content.toLowerCase();
    
    // Palabras clave para cada estilo
    const stylePatterns = {
      'deportivo': ['deportivo', 'running', 'sport', 'training', 'correr', 'zapatilla'],
      'elegante': ['elegante', 'formal', 'fino', 'sofisticado'],
      'moderno': ['moderno', 'actual', 'tendencia', 'moda'],
      'clasico': ['clásico', 'tradicional', 'atemporal'],
      'casual': ['casual', 'cómodo', 'relajado']
    };
    
    // Buscar coincidencias
    for (const [style, keywords] of Object.entries(stylePatterns)) {
      if (keywords.some(keyword => content.includes(keyword))) {
        return style;
      }
    }
    
    return '';
  }

  function inferGenderFromConversation() {
    const lastUserMessage = [...conversationHistory].reverse().find(entry => entry.role === 'user');
    if (!lastUserMessage || !lastUserMessage.content) {
      return '';
    }
    const content = lastUserMessage.content.toLowerCase();
    if (content.includes('mujer') || content.includes('femenin')) {
      return 'mujer';
    }
    if (content.includes('hombre') || content.includes('masculin')) {
      return 'hombre';
    }
    if (content.includes('niño') || content.includes('niña')) {
      return 'niños';
    }
    return '';
  }

  async function fetchRecommendations(preferencesInput) {
    const payload = { ...(preferencesInput || collectPreferences()) };

    // Normalizar nulos y eliminar undefined para evitar errores en el backend
    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined || payload[key] === null) {
        payload[key] = '';
      }
    });

    const response = await fetch(AI_RECOMMENDATIONS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} - No se pudo obtener recomendaciones`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  }

  function buildRecommendationContext(recommendations) {
    if (!Array.isArray(recommendations) || recommendations.length === 0) {
      return '';
    }

    const subset = recommendations.slice(0, MAX_RECOMMENDATIONS_FOR_PROMPT);
    const descriptor = subset.map(item => {
      const tallas = Array.isArray(item.tallas)
        ? item.tallas.map(tallaItem => {
          const tallaPrecio = formatPrice(tallaItem?.precio);
          return {
            talla: tallaItem?.talla || '',
            precio: safeNumber(tallaItem?.precio),
            precioTexto: tallaPrecio,
            stock: safeNumber(tallaItem?.stockDisponible)
          };
        })
        : [];

      return {
        id: item.productId,
        nombre: item.nombre,
        precio: safeNumber(item.precioReferencia),
        precioTexto: formatPrice(item.precioReferencia),
        stockTotal: safeNumber(item.stockTotal),
        tallas,
        coincidencias: Array.isArray(item.coincidencias) ? item.coincidencias : [],
        tallaSolicitadaDisponible: Boolean(item.tallaSolicitadaDisponible),
        categoria: item.categoria || '',
        color: item.color || '',
        estilo: item.estiloSugerido || '',
        publicoObjetivo: item.publicoObjetivo || '',
        descripcion: item.descripcion || ''
      };
    });

    const dataBlock = JSON.stringify(descriptor, null, 2);

    return [
      '## CATÁLOGO DE PRODUCTOS DISPONIBLES',
      'Estos son los productos reales disponibles en Detalles. IMPORTANTE: No todos los productos son apropiados para todas las solicitudes.',
      '',
      '### Datos de Productos (JSON):',
      dataBlock,
      '',
      '## INSTRUCCIONES DE FILTRADO Y RECOMENDACIÓN',
      '',
      '### PASO 0: Comprensión del Catálogo',
      '- Analiza primero el JSON recibido: nombre, descripción, coincidencias, materiales, tallas, colores, stock y público objetivo.',
      '- Usa únicamente la información presente. Si un atributo no aparece, decláralo como no especificado y evita inferencias.',
      '',
      '### PASO 1: Análisis de Compatibilidad',
      '- Revisa la solicitud del cliente e identifica: actividad específica, contexto ambiental y preferencias.',
      '- Para CADA producto del catálogo, pregúntate: "¿Es este producto lógicamente apropiado para [actividad] en [contexto]?"',
      '- Aplica la Matriz de Compatibilidad Actividad-Calzado de tu prompt del sistema.',
      '',
      '### PASO 2: Descarte Inmediato',
      'Descarta productos que:',
      '- Sean incompatibles con la actividad (ej: sandalias para correr, tacones para gimnasio).',
      '- No se ajusten al contexto climático (ej: sandalias abiertas para lluvia).',
      '- No cumplan con el nivel de formalidad requerido (ej: zapatillas deportivas para bodas).',
      '',
      '### PASO 3: Selección y Priorización',
      '- De los productos compatibles, prioriza aquellos con stock disponible.',
      '- Si la talla solicitada no está disponible, menciona tallas cercanas si existen e indica que la talla exacta está agotada.',
      '- Selecciona máximo 3-4 productos que mejor se ajusten.',
      '',
      '### PASO 4: Construcción de Respuesta',
      'Para cada producto recomendado:',
      '- Nombre comercial del producto.',
      '- Precio en formato S/ XX.XX.',
      '- Tallas disponibles (destaca si la talla solicitada está disponible o agotada).',
      '- Stock actual.',
      '- **RAZÓN ESPECÍFICA**: Explica POR QUÉ este producto es apropiado para la actividad/contexto mencionado apoyándote en la descripción y coincidencias del JSON.',
      '  Ejemplo BUENO: "Ideal para correr bajo lluvia gracias a su suela antideslizante y materiales resistentes al agua."',
      '  Ejemplo MALO: "Buen producto, cómodo y bonito."',
      '',
      '### FORMATO DE RESPUESTA',
      '**Estructura:**',
      '1. Introducción breve (1-2 líneas) que reconozca la necesidad del cliente.',
      '2. Lista numerada (1., 2., 3.) con las recomendaciones.',
      '3. Cierre corto (1-2 líneas) invitando a la acción dentro del catálogo disponible.',
      '',
      '**Estilo:**',
      '- Conversacional y amigable.',
      '- Sin formato Markdown (nada de **, ##, -, *).',
      '- Sin IDs o códigos internos.',
      '- Enfocado en el VALOR para el cliente.',
      '- Nunca prometas avisos, reservas ni búsquedas fuera del inventario de Detalles.',
      '',
      '### CASOS ESPECIALES',
      '**Si NO hay productos apropiados:**',
      'Sé honesto: "Lamentablemente no tenemos productos que cumplan exactamente lo que necesitas dentro del catálogo disponible. Podemos revisar opciones cercanas o volver a consultar más adelante."',
      '',
      '**Si hay productos pero sin stock:**',
      'Menciona: "Este modelo sería perfecto, pero actualmente aparece sin stock. Podemos ver alternativas similares disponibles o revisar más adelante cuando se reponga."',
      '',
      '### EJEMPLOS DE RAZONAMIENTO',
      '',
      '**Solicitud: "Zapatillas para correr en clima lluvioso"**',
      '✅ CORRECTO: Recomendar zapatillas deportivas con suela antideslizante.',
      '❌ INCORRECTO: Recomendar sandalias, tacones, zapatos casuales.',
      '',
      '**Solicitud: "Zapatos para una boda"**',
      '✅ CORRECTO: Recomendar zapatos formales, tacones elegantes.',
      '❌ INCORRECTO: Recomendar zapatillas deportivas, sandalias casuales.',
      '',
      'Recuerda: La calidad de tu recomendación depende de qué tan bien el producto se ajusta a la necesidad ESPECÍFICA del cliente y de mantenerte dentro del inventario disponible.'
    ].join('\n');
  }

  function formatPrice(value) {
    const numeric = safeNumber(value);
    if (numeric === null) {
      return 'S/ --';
    }
    return `S/ ${numeric.toFixed(2)}`;
  }

  function formatTallaSummary(talla) {
    if (!talla || !talla.talla) {
      return 'Talla no especificada';
    }
    const precio = formatPrice(talla.precio);
    const stock = safeNumber(talla.stockDisponible);
    let stockTexto = 'stock no informado';
    if (stock !== null) {
      stockTexto = stock <= 0 ? 'sin stock' : `${stock} uds`;
    }
    return `${talla.talla}: ${precio} (${stockTexto})`;
  }

  function safeNumber(value) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number.parseFloat(value);
      if (!Number.isNaN(parsed) && Number.isFinite(parsed)) {
        return parsed;
      }
    }
    return null;
  }

  function loadHistory() {
    let raw = null;
    try {
      raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    } catch (error) {
      console.error('No se pudo leer el historial de conversaciones archivadas:', error);
    }

    if (!raw) {
      conversationHistorySessions = [];
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      conversationHistorySessions = Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('No se pudo interpretar el historial de conversaciones archivadas:', error);
      conversationHistorySessions = [];
    }
  }

  function showConfirmation(options = {}) {
    if (!elements.confirmModal || !elements.confirmAccept || !elements.confirmCancel) {
      const fallbackMessage = options.message || '¿Deseas continuar?';
      return Promise.resolve(window.confirm(fallbackMessage));
    }

    if (confirmResolver) {
      finalizeConfirmation(false);
    }

    return new Promise(resolve => {
      confirmResolver = resolve;
      const mergedOptions = {
        title: options.title || 'Confirmación',
        message: options.message || '¿Deseas continuar? Esta acción no se puede deshacer.',
        confirmText: options.confirmText || 'Aceptar',
        cancelText: options.cancelText || 'Cancelar'
      };

      if (elements.confirmTitle) {
        elements.confirmTitle.textContent = mergedOptions.title;
      }
      if (elements.confirmMessage) {
        elements.confirmMessage.textContent = mergedOptions.message;
      }
      if (elements.confirmAccept) {
        elements.confirmAccept.textContent = mergedOptions.confirmText;
      }
      if (elements.confirmCancel) {
        elements.confirmCancel.textContent = mergedOptions.cancelText;
      }

      confirmPreviousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;

      if (elements.confirmBackdrop) {
        elements.confirmBackdrop.classList.add('visible');
        elements.confirmBackdrop.setAttribute('aria-hidden', 'false');
      }
      if (elements.confirmModal) {
        elements.confirmModal.classList.add('visible');
        elements.confirmModal.setAttribute('aria-hidden', 'false');
      }

      confirmFocusableElements = Array.from(elements.confirmModal.querySelectorAll(FOCUSABLE_SELECTOR)).filter(el => !el.hasAttribute('disabled'));
      const firstFocusable = confirmFocusableElements.find(el => typeof el.focus === 'function');
      if (firstFocusable) {
        setTimeout(() => {
          firstFocusable.focus();
        }, 0);
      }

      document.addEventListener('keydown', handleConfirmationKeydown, true);
    });
  }

  function finalizeConfirmation(result) {
    if (!confirmResolver) {
      return;
    }

    if (elements.confirmBackdrop) {
      elements.confirmBackdrop.classList.remove('visible');
      elements.confirmBackdrop.setAttribute('aria-hidden', 'true');
    }
    if (elements.confirmModal) {
      elements.confirmModal.classList.remove('visible');
      elements.confirmModal.setAttribute('aria-hidden', 'true');
    }

    document.removeEventListener('keydown', handleConfirmationKeydown, true);

    const resolve = confirmResolver;
    confirmResolver = null;
    confirmFocusableElements = [];

    if (confirmPreviousFocus && typeof confirmPreviousFocus.focus === 'function') {
      setTimeout(() => {
        confirmPreviousFocus.focus();
      }, 0);
    }
    confirmPreviousFocus = null;

    resolve(Boolean(result));
  }

  function handleConfirmationKeydown(event) {
    if (!confirmResolver || !elements.confirmModal?.classList.contains('visible')) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      finalizeConfirmation(false);
      return;
    }

    if (event.key !== 'Tab') {
      return;
    }

    if (confirmFocusableElements.length === 0) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    const currentIndex = confirmFocusableElements.indexOf(document.activeElement);
    let nextIndex = currentIndex;

    if (event.shiftKey) {
      nextIndex = currentIndex <= 0 ? confirmFocusableElements.length - 1 : currentIndex - 1;
    } else {
      nextIndex = currentIndex === confirmFocusableElements.length - 1 ? 0 : currentIndex + 1;
    }

    const target = confirmFocusableElements[nextIndex];
    if (target && typeof target.focus === 'function') {
      event.preventDefault();
      event.stopPropagation();
      target.focus();
    }
  }

  function buildProductCardsFromRecommendations(recommendations) {
    if (!Array.isArray(recommendations) || recommendations.length === 0) {
      return [];
    }

    return recommendations.slice(0, MAX_PRODUCT_CARDS).map(item => {
      const subtitleParts = [];
      if (item?.categoria) {
        subtitleParts.push(item.categoria);
      }
      if (item?.publicoObjetivo) {
        subtitleParts.push(capitalizeFirst(item.publicoObjetivo));
      }
      if (item?.estiloSugerido) {
        subtitleParts.push(item.estiloSugerido);
      }

      const features = [];
      const tallas = Array.isArray(item?.tallas) ? item.tallas.filter(Boolean).slice(0, 3).map(formatTallaSummary) : [];
      if (tallas.length) {
        features.push(`Tallas destacadas: ${tallas.join(' · ')}`);
      }

      const stockTotal = safeNumber(item?.stockTotal);
      if (stockTotal !== null) {
        features.push(stockTotal <= 0 ? 'Sin stock general disponible' : `Stock total: ${stockTotal} pares`);
      }

      if (item?.color) {
        features.push(`Color: ${capitalizeFirst(item.color)}`);
      }

      const coincidencias = Array.isArray(item?.coincidencias) ? item.coincidencias.filter(Boolean) : [];
      if (coincidencias.length) {
        features.push(`Motivos: ${coincidencias.slice(0, 2).join(' · ')}`);
      }

      const additionalInfo = buildCardAdditionalInfo(item, coincidencias);

      return {
        title: item?.nombre || 'Producto sugerido',
        subtitle: subtitleParts.filter(Boolean).join(' · '),
        imageUrl: item?.imagen || PRODUCT_IMG_PLACEHOLDER,
        price: formatPrice(item?.precioReferencia),
        features,
        additionalInfo,
        badge: item?.tallaSolicitadaDisponible ? 'Talla solicitada disponible' : ''
      };
    });
  }

  function buildCardAdditionalInfo(item, coincidencias) {
    const description = typeof item?.descripcion === 'string' ? item.descripcion.trim() : '';
    if (description) {
      return description.length > 200 ? `${description.slice(0, 197)}…` : description;
    }
    if (Array.isArray(coincidencias) && coincidencias.length) {
      return coincidencias.slice(0, 3).join(' · ');
    }
    return '';
  }

  function capitalizeFirst(text) {
    if (!text || typeof text !== 'string') {
      return '';
    }
    const trimmed = text.trim();
    if (!trimmed) {
      return '';
    }
    const lower = trimmed.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }

  function performHistoryClear({ clearArchived, clearConversation }) {
    if (clearArchived) {
      conversationHistorySessions = [];
      try {
        localStorage.removeItem(STORAGE_KEY_HISTORY);
      } catch (error) {
        console.error('No se pudo limpiar el historial archivado:', error);
      }
      saveHistory();
      renderHistoryList();
    }

    if (clearConversation) {
      conversationHistory = conversationHistory.filter(entry => entry.role === 'system');
      if (!conversationHistory.some(entry => entry.role === 'system')) {
        conversationHistory.push({
          role: 'system',
          content: SYSTEM_PROMPT
        });
      }
      try {
        localStorage.removeItem(STORAGE_KEY_CONVERSATION);
      } catch (error) {
        console.error('No se pudo limpiar la conversación actual:', error);
      }
      saveConversation();
      renderConversation();
      appendMessage('Historial eliminado. Puedes iniciar una nueva conversación cuando lo desees.', 'system');
    }

    updateUIState();
    toggleHistoryDrawer(false);
  }

  async function promptClearHistory() {
    const hasArchived = conversationHistorySessions.length > 0;
    const hasConversation = conversationHistory.some(entry => entry.role !== 'system');

    if (!hasArchived && !hasConversation) {
      alert('No hay historial para eliminar.');
      return;
    }

    let message = '¿Deseas eliminar el historial? Esta acción no se puede deshacer.';
    if (hasArchived && hasConversation) {
      message = '¿Deseas eliminar todas las conversaciones archivadas y la conversación actual? Esta acción no se puede deshacer.';
    } else if (hasArchived) {
      message = '¿Deseas eliminar todas las conversaciones archivadas? Esta acción no se puede deshacer.';
    } else if (hasConversation) {
      message = '¿Deseas limpiar la conversación actual? Esta acción no se puede deshacer.';
    }

    const confirmed = await showConfirmation({
      title: 'Eliminar historial',
      message,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    });

    if (!confirmed) {
      return;
    }

    performHistoryClear({
      clearArchived: hasArchived,
      clearConversation: hasConversation
    });
  }

  function deleteHistorySession(sessionId) {
    if (!sessionId) {
      return;
    }
    const session = conversationHistorySessions.find(item => item.id === sessionId);
    if (!session) {
      return;
    }

    const preview = session.title || 'esta conversación';
    void showConfirmation({
      title: 'Eliminar conversación',
      message: `¿Eliminar la conversación "${preview}"? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    }).then(confirmed => {
      if (!confirmed) {
        return;
      }

      conversationHistorySessions = conversationHistorySessions.filter(item => item.id !== sessionId);
      saveHistory();
      renderHistoryList();
    });
  }

  function saveHistory() {
    try {
      if (conversationHistorySessions.length === 0) {
        localStorage.removeItem(STORAGE_KEY_HISTORY);
      } else {
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(conversationHistorySessions));
      }
    } catch (error) {
      console.error('No se pudo guardar el historial de conversaciones archivadas:', error);
    }
  }

  function archiveCurrentConversation() {
    if (!Array.isArray(conversationHistory) || conversationHistory.length <= 1) {
      return false;
    }

    const hasUserInteraction = conversationHistory.some(message => message.role === 'user');
    if (!hasUserInteraction) {
      return false;
    }

    const cloned = deepClone(conversationHistory);
    if (!Array.isArray(cloned) || cloned.length === 0) {
      return false;
    }

    const session = {
      id: cryptoRandomId(),
      title: buildSessionTitle(cloned),
      timestamp: Date.now(),
      messages: cloned,
      preferences: collectPreferencesSnapshot(),
      model: currentModel
    };

    conversationHistorySessions = [session, ...conversationHistorySessions].slice(0, MAX_HISTORY_SESSIONS);
    return true;
  }

  function renderHistoryList() {
    if (!elements.historyList || !elements.historyEmpty) {
      return;
    }

    elements.historyList.innerHTML = '';

    if (!conversationHistorySessions.length) {
      elements.historyEmpty.classList.remove('hidden');
      return;
    }

    elements.historyEmpty.classList.add('hidden');

    conversationHistorySessions.forEach(session => {
      const item = document.createElement('div');
      item.className = 'history-item';

      const loadButton = document.createElement('button');
      loadButton.type = 'button';
      loadButton.className = 'history-item-load';
      loadButton.dataset.sessionId = session.id;
      loadButton.setAttribute('aria-label', `Abrir conversación ${session.title}`);

      const info = document.createElement('div');
      info.className = 'history-item-info';

      const title = document.createElement('div');
      title.className = 'history-item-title';
      title.textContent = session.title;

      const meta = document.createElement('div');
      meta.className = 'history-item-meta';
      const userTurns = Array.isArray(session.messages)
        ? session.messages.filter(message => message.role === 'user').length
        : 0;
      meta.textContent = `${formatTimestamp(session.timestamp)} · ${userTurns} mensaje${userTurns === 1 ? '' : 's'} del cliente`;

      info.append(title, meta);

      if (session.preferences?.eventType) {
        const eventMeta = document.createElement('div');
        eventMeta.className = 'history-item-meta';
        eventMeta.textContent = `Evento: ${capitalizeFirst(session.preferences.eventType)}`;
        info.append(eventMeta);
      }

      loadButton.appendChild(info);

      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.className = 'history-item-delete';
      deleteButton.dataset.sessionId = session.id;
      deleteButton.setAttribute('aria-label', `Eliminar la conversación ${session.title}`);
      deleteButton.textContent = 'Eliminar';

      item.append(loadButton, deleteButton);
      elements.historyList.appendChild(item);
    });
  }

  function handleHistoryListClick(event) {
    const deleteButton = event.target.closest('.history-item-delete');
    if (deleteButton) {
      event.preventDefault();
      event.stopPropagation();
      const { sessionId } = deleteButton.dataset;
      if (sessionId) {
        deleteHistorySession(sessionId);
      }
      return;
    }

    const loadButton = event.target.closest('.history-item-load');
    if (!loadButton) {
      return;
    }

    const { sessionId } = loadButton.dataset;
    if (!sessionId) {
      return;
    }

    restoreConversationFromHistory(sessionId);
  }

  function handleHistoryListKeydown(event) {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }
    const loadButton = event.target.closest('.history-item-load');
    if (!loadButton) {
      return;
    }
    event.preventDefault();
    const { sessionId } = loadButton.dataset;
    if (!sessionId) {
      return;
    }
    restoreConversationFromHistory(sessionId);
  }

  function restoreConversationFromHistory(sessionId) {
    const session = conversationHistorySessions.find(item => item.id === sessionId);
    if (!session) {
      return;
    }

    conversationHistorySessions = [session, ...conversationHistorySessions.filter(item => item.id !== sessionId)];
    renderHistoryList();
    saveHistory();

    conversationHistory = deepClone(session.messages) || [];
    if (!Array.isArray(conversationHistory) || !conversationHistory.length) {
      conversationHistory = [];
      return;
    }

    applyPreferencesSnapshot(session.preferences || {});
    saveConversation();
    renderConversation();
    updateUIState();
    toggleHistoryDrawer(false);
  }

  function toggleHistoryDrawer(open) {
    if (!elements.historyDrawer) {
      return;
    }
    if (open) {
      elements.historyDrawer.classList.add('open');
      elements.historyDrawer.setAttribute('aria-hidden', 'false');
    } else {
      elements.historyDrawer.classList.remove('open');
      elements.historyDrawer.setAttribute('aria-hidden', 'true');
    }
  }

  function handleGlobalKeydown(event) {
    if (event.key === 'Escape') {
      toggleHistoryDrawer(false);
    }

    if (event.ctrlKey && event.shiftKey && event.code === 'KeyA') {
      event.preventDefault();
      setAdminMode(!adminModeEnabled);
    }

    if (event.ctrlKey && event.shiftKey && event.code === 'KeyH') {
      event.preventDefault();
      toggleHistoryDrawer(!(elements.historyDrawer && elements.historyDrawer.classList.contains('open')));
    }
  }

  function buildSessionTitle(messages) {
    const firstUserMessage = Array.isArray(messages)
      ? messages.find(message => message.role === 'user')
      : null;

    if (firstUserMessage && typeof firstUserMessage.content === 'string') {
      const trimmed = firstUserMessage.content.trim();
      if (trimmed) {
        return trimmed.length > 60 ? `${trimmed.slice(0, 57)}…` : trimmed;
      }
    }

    const date = formatTimestamp(Date.now());
    return `Chat ${date}`;
  }

  function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('es-PE', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  }

  function collectPreferencesSnapshot() {
    return {
      eventType: collectSelectValue(elements.eventType),
      stylePreference: collectSelectValue(elements.stylePreference),
      colorPreference: elements.colorPreference ? elements.colorPreference.value.trim() : '',
      shoeSize: elements.shoeSize ? elements.shoeSize.value.trim() : '',
      comfortPriority: collectSelectValue(elements.comfortPriority) || 'high'
    };
  }

  function applyPreferencesSnapshot(snapshot) {
    if (!snapshot || typeof snapshot !== 'object') {
      return;
    }

    if (elements.eventType && snapshot.eventType !== undefined) {
      elements.eventType.value = snapshot.eventType || '';
    }
    if (elements.stylePreference && snapshot.stylePreference !== undefined) {
      elements.stylePreference.value = snapshot.stylePreference || '';
    }
    if (elements.colorPreference && snapshot.colorPreference !== undefined) {
      elements.colorPreference.value = snapshot.colorPreference || '';
    }
    if (elements.shoeSize && snapshot.shoeSize !== undefined) {
      elements.shoeSize.value = snapshot.shoeSize || '';
    }
    if (elements.comfortPriority && snapshot.comfortPriority !== undefined) {
      elements.comfortPriority.value = snapshot.comfortPriority || 'high';
    }
  }

  function loadAdminModePreference() {
    try {
      const stored = localStorage.getItem(ADMIN_MODE_KEY);
      adminModeEnabled = stored === 'true';
    } catch (error) {
      adminModeEnabled = false;
    }
  }

  function applyAdminMode(initial = false) {
    if (!elements.body) {
      return;
    }
    if (adminModeEnabled) {
      elements.body.classList.add('admin-mode');
      if (!initial) {
        console.info('Modo administrador activado');
      }
    } else {
      elements.body.classList.remove('admin-mode');
      if (!initial) {
        console.info('Modo administrador desactivado');
      }
    }
  }

  function setAdminMode(enabled) {
    adminModeEnabled = Boolean(enabled);
    try {
      localStorage.setItem(ADMIN_MODE_KEY, adminModeEnabled ? 'true' : 'false');
    } catch (error) {
      console.error('No se pudo persistir el estado del modo administrador:', error);
    }
    applyAdminMode();
  }

  function cryptoRandomId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }
    return `session-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function deepClone(data) {
    try {
      if (typeof structuredClone === 'function') {
        return structuredClone(data);
      }
    } catch (error) {
      // Ignorar y continuar con el plan B
    }
    try {
      return JSON.parse(JSON.stringify(data));
    } catch (error) {
      console.error('No se pudo clonar la conversación para el historial:', error);
      return null;
    }
  }
})();