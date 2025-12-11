# Plan de Integración Gemini AI ✅

## 📌 Objetivo General
Extender el asistente `preguntas.js` para soportar Google AI Studio (Gemini) manteniendo la compatibilidad con Groq.

---

## 1. Preparación de Entorno
- [ ] Revisar lineamientos de seguridad para almacenar la API key de Gemini.
- [ ] Crear variable de entorno o endpoint seguro en backend para exponer la clave.
- [ ] Documentar procedimiento para obtener/rotar la clave.

## 2. Diseño de Interfaz
- [x] Añadir selector de proveedor/modelo (Groq vs Gemini) en `preguntas.js`.
- [x] Mostrar estado visual indicando el motor activo.
- [x] Ajustar textos de configuración para admitir múltiples claves.

## 3. Gestión de Configuración
- [x] Ampliar `SUPPORTED_GROQ_MODELS` a estructura genérica con campo `provider`.
- [x] Persistir selección de proveedor/modelo en `localStorage`.
- [x] Ajustar flujo de almacenamiento de API keys según proveedor (frontend o backend).

## 4. Cliente HTTP para Gemini
- [x] Crear constantes: endpoint `https://generativelanguage.googleapis.com/v1beta/models`. 
- [x] Implementar función `callGeminiChat(messages, model)`.
- [x] Mapear mensajes a formato Gemini (`contents`, `systemInstruction`).
- [x] Normalizar respuesta (extraer texto de `candidates[0].content.parts`).

## 5. Integración en Flujo Principal
- [x] Ajustar `getAIResponse` para seleccionar cliente según proveedor.
- [x] Reutilizar lógica de contexto y recomendaciones para ambos motores.
- [x] Manejar errores específicos de Gemini (códigos HTTP, cuotas, safety).

## 6. UI para Gestión de Claves
- [x] Habilitar almacenamiento local para claves de Gemini (si no existe endpoint).
- [x] Mostrar/actualizar mascarado independiente por proveedor.
- [x] Añadir opción para limpiar clave de Gemini.

## 7. Pruebas
- [ ] Validar llamadas con modelo de Groq existente.
- [ ] Validar llamadas con `gemini-1.5-flash` usando API key proporcionada.
- [ ] Probar casos sin recomendaciones (manejo de vacíos).
- [ ] Probar mensajes con cambio de proveedor en vivo.

## 8. Documentación
- [ ] Actualizar README/configuración interna con pasos para activar Gemini.
- [ ] Registrar buenas prácticas de almacenamiento de claves.
- [ ] Añadir sección de troubleshooting (cuotas, respuestas vacías, etc.).

## 9. Checklist de Cierre
- [ ] Confirmar ausencia de claves expuestas en repositorio.
- [ ] Verificar que la selección de proveedor persiste tras recarga.
- [ ] Ejecutar pruebas end-to-end y registrar resultados.
- [ ] Solicitar validación del usuario antes de desplegar.

---

➡️ **Notas**
- Todas las tareas deben revisarse en pareja antes de marcar como completas.
- Las casillas sirven para llevar seguimiento durante la implementación.
