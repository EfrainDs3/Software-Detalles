/*(() => {
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
  const MAX_RECOMMENDATIONS_FOR_PROMPT = 5;
  const MAX_HISTORY_SESSIONS = 25;
  const EMBEDDED_API_KEY = '';
  const MASKED_VALUE = '••••••••••••••••';
  const SYSTEM_PROMPT = [
    'Eres el asistente virtual de selección de calzado de la marca Detalles y debes seguir este flujo sin utilizar respuestas de relleno ni "fallbacks":',
    '1) Inicia con un saludo cálido, profesional y directo. Pregunta de inmediato el tipo de evento o reunión.',
    '2) Profundiza para clasificar el evento (formal, semi-formal, casual, deportivo, trabajo).',
    '3) Indaga por el estilo y tipo de calzado que prefiere la persona (elegante, moderno, clásico, deportivo, casual).',
    '4) Pide colores y materiales preferidos.',
    '5) Evalúa la prioridad de comodidad y el tiempo de uso previsto.',
    '6) Confirma la talla habitual para filtrar opciones disponibles.',
    '7) Recomienda modelos concretos del catálogo Detalles con descripciones breves, ocasión ideal, beneficios y disponibilidad.',
    '8) Sugiere accesorios o complementos que combinen con el calzado recomendado.',
    '9) Facilita la acción final: añadir al carrito, ver más opciones o continuar explorando.',
    'Redacta siempre en párrafos cortos separados por una línea en blanco. Cuando debas listar preguntas o pasos, utiliza una línea por elemento con numeración natural o emojis numéricos (1️⃣, 2️⃣, 3️⃣, ...). No uses formato Markdown (negritas, encabezados, tablas, guiones decorativos) ni emojis ajenos a la numeración solicitada.',
    'Divide la respuesta en partes claras: Introducción breve, lista numerada de ideas/pasos, conclusión corta. Cada punto debe ocupar su propia línea y frase, separados por punto final. A partir de ahora, responde siempre con frases separadas por puntos y párrafos independientes; no combines todo en un solo bloque.',
    'Mantén todo en español neutro, con tono experto y cordial, pide detalles cuando falte información, conserva contexto en toda la conversación y nunca recurras a respuestas genéricas o ambiguas.',
    'Formatea cada recomendación dentro de la lista numerada como texto corrido: inicia con "Nombre (ID X)" y continúa con precio, tallas, stock y motivo en frases naturales. Evita el uso de formato Markdown (negritas, encabezados, tablas o separadores) y limita los emojis a los numéricos (1️⃣, 2️⃣, 3️⃣...). Cierra con un punto final y pasa al siguiente elemento.'
  ].join(' ');

  const elements = {};
  let apiKey = '';
  let conversationHistory = [];
  let conversationHistorySessions = [];
  let isProcessing = false;
  let currentModel = '';
  let adminModeEnabled = false;
  const hasEmbeddedKey = EMBEDDED_API_KEY && EMBEDDED_API_KEY.startsWith('gsk_');

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    cacheElements();
    loadAdminModePreference();
    applyAdminMode(true);
    loadApiKey();
    loadModel();
    loadHistory();
    loadConversation();
    renderConversation();
    renderHistoryList();
    setupEventListeners();
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
    if (!hasEmbeddedKey && elements.saveApiKey && elements.clearApiKey) {
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

  function toggleApiConfig() {
    if (!elements.apiBody || !elements.apiChevron) {
      return;
    }
    elements.apiBody.classList.toggle('open');
    const isOpen = elements.apiBody.classList.contains('open');
    elements.apiChevron.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
  }

  function loadApiKey() {
    if (hasEmbeddedKey) {
      apiKey = EMBEDDED_API_KEY;
      configureEmbeddedKeyUIState();
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

  function configureEmbeddedKeyUIState() {
    if (!elements.apiConfig) {
      return;
    }

    if (elements.apiKeyInput) {
      elements.apiKeyInput.value = MASKED_VALUE;
      elements.apiKeyInput.disabled = true;
    }
    if (elements.saveApiKey) {
      elements.saveApiKey.textContent = 'Definida en código';
      elements.saveApiKey.disabled = true;
    }
    if (elements.clearApiKey) {
      elements.clearApiKey.style.display = 'none';
    }
    elements.apiConfig.classList.add('configured');
    if (elements.apiStatusText) {
      elements.apiStatusText.textContent = 'API Key configurada desde el código (Groq)';
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
    if (hasEmbeddedKey) {
      alert('La API Key está definida en el código. Edítala directamente en el archivo preguntas.js.');
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
    loadApiKey();
    updateUIState();
    resetConversation(false, false);
    startConversation();
  }

  function clearApiKey(showConfirmation = true) {
    if (hasEmbeddedKey) {
      alert('La API Key está definida en el código. Edítala directamente en el archivo preguntas.js.');
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
    loadApiKey();
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
      const status = hasEmbeddedKey
        ? '<span style="color:#10b981"><i class="fas fa-check-circle"></i> Asistente activo con API Key definida en código</span>'
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
      appendMessage(entry.content, entry.role === 'user' ? 'user' : 'ai');
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
      const profile = getProfileContext();
      const messages = [...conversationHistory];
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

      conversationHistory.push({
        role: 'assistant',
        content: aiMessage
      });

      hideTypingIndicator();
      appendMessage(aiMessage, 'ai');
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
      'Instrucciones de estilo: redacta la respuesta con una introducción breve, luego una lista numerada (1., 2., 3. o 1️⃣, 2️⃣, 3️⃣) donde cada elemento describe un producto en frases corridas (Nombre (ID X), precio, tallas, stock, motivo) y finaliza con una conclusión corta. No utilices formato Markdown (negritas, tablas, listas con guiones) ni bloques extensos de texto.'
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
      console.error('No se pudo interpretar el historial almacenado:', error);
      conversationHistorySessions = [];
    }
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