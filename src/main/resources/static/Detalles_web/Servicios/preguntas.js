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
  const SYSTEM_PROMPT = [
    'Eres el asistente virtual de Detalles, tienda de calzado ubicada en Tarapoto, Perú. Debes recomendar productos reales del catálogo de Detalles.',
    'Redacta siempre en español neutro y muestra importes con el formato "S/ 0.00". Evita IDs, códigos internos o campos técnicos.',
    'Incorpora la información de clima y festividades disponible cuando ayude a justificar recomendaciones, alertar sobre condiciones especiales o proponer accesorios y planificación.',
    'Si un producto no tiene stock, dilo explícitamente y ofrece alternativas como reservar, avisar o elegir otra opción similar.',
    'Haz preguntas breves, evita repeticiones y respeta los cambios de tema: si el cliente indica que ya no le interesa lo anterior, olvida las solicitudes previas y continúa con el nuevo objetivo.',
    'Estructura cada respuesta con: introducción breve, lista numerada (1., 2., 3. o emojis numéricos permitidos) y un cierre corto. No utilices formato Markdown (negritas, tablas, listas con guiones) ni emojis adicionales.',
    'En cada elemento de la lista menciona nombre comercial del producto, precio en S/., tallas disponibles o agotadas, estado de stock y un motivo claro para la recomendación. Sugiere accesorios complementarios cuando sea oportuno y cierra invitando a la acción (añadir al carrito, reservar, explorar más).'
  ].join(' ');

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
    elements.suggestions = Array.from(document.querySelectorAll('#suggestions .tag'));
    elements.eventType = document.getElementById('eventType');
    elements.stylePreference = document.getElementById('stylePreference');
    elements.colorPreference = document.getElementById('colorPreference');
    elements.shoeSize = document.getElementById('shoeSize');
    elements.comfortPriority = document.getElementById('comfortPriority');
    elements.preferencesPanel = document.getElementById('preferencesPanel');
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
      elements.clearApiKey.addEventListener('click', () => clearApiKey(true));
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
      elements.resetChat.addEventListener('click', () => resetConversation(true, true));
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

  function clearApiKey(showConfirmation = true) {
    if (hasServerKey) {
      alert('La API Key está administrada por el servidor. Ajusta la configuración backend para modificarla.');
      return;
    }

    if (showConfirmation && !confirm('¿Estás seguro de que deseas eliminar la API Key guardada?')) {
      return;
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

  function resetConversation(askConfirmation = true, autoRestart = false) {
    if (askConfirmation && !confirm('¿Deseas iniciar una nueva conversación? El chat actual se guardará en el historial y comenzaremos uno nuevo.')) {
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
    return {
      ...snapshot,
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
        descripcion: item.descripcion || ''
      };
    });

    const dataBlock = JSON.stringify(descriptor, null, 2);

    return [
      'Opciones reales disponibles en Detalles (usa solo estos productos; si nada encaja dilo explícitamente).',
      'Datos JSON de referencia:',
      dataBlock,
        'Instrucciones de estilo: redacta la respuesta con una introducción breve, luego una lista numerada (1., 2., 3. o 1️⃣, 2️⃣, 3️⃣) donde cada elemento describe un producto en frases corridas y agrega valor sin repetir datos visibles en las tarjetas (precio, stock, talla, color). Enfócate en cómo se ajusta al evento solicitado, el confort, las ventajas comparativas y siguientes pasos recomendados. Prefiere artículos con stock disponible; si todos están agotados, indícalo, ofrece reservas o alternativas cercanas (incluyendo cambio de estilo o accesorios). Descarta productos que no encajen con el tipo de evento o preferencias informadas. Finaliza con una conclusión corta orientada a la acción. Nunca menciones IDs internos ni códigos. No utilices formato Markdown (negritas, tablas, listas con guiones) ni bloques extensos de texto.'
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

  function saveHistory() {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(conversationHistorySessions));
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
      item.dataset.id = session.id;
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');

      const primary = document.createElement('div');
      primary.className = 'history-item-title';
      primary.textContent = session.title;

      const meta = document.createElement('div');
      meta.className = 'muted';
      meta.style.fontSize = '0.8rem';
      const userTurns = Array.isArray(session.messages)
        ? session.messages.filter(message => message.role === 'user').length
        : 0;
      meta.textContent = `${formatTimestamp(session.timestamp)} · ${userTurns} mensaje${userTurns === 1 ? '' : 's'} del cliente`;

      item.append(primary, meta);
      elements.historyList.appendChild(item);
    });
  }

  function handleHistoryListClick(event) {
    const target = event.target.closest('.history-item');
    if (!target) {
      return;
    }

    const { id } = target.dataset;
    if (!id) {
      return;
    }

    restoreConversationFromHistory(id);
  }

  function handleHistoryListKeydown(event) {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }
    const target = event.target.closest('.history-item');
    if (!target) {
      return;
    }
    event.preventDefault();
    const { id } = target.dataset;
    if (!id) {
      return;
    }
    restoreConversationFromHistory(id);
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