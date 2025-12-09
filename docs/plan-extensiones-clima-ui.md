# Plan de Implementación: Pronóstico Climático y UI en Tarjetas

Listado de tareas con casillas para seguir el avance. Marca cada `[ ]` cuando completes el paso.

## Objetivos y alcance
- [ ] Confirmar alcance final con negocio: horizonte de pronóstico (24h, 5 días, 7 días), número de productos en tarjetas y si se implementa filtrado de stock.
- [x] Revisar límites de la API (plan gratuito vs. de pago) para evitar bloqueos por número de llamadas.
- [ ] Definir métricas de éxito (ej. reducción de respuestas sin stock, uso del asistente en campañas festivas).

## Entregables clave
- [x] Documento técnico actualizado con contratos (`AiContextResponse` ampliado, payload UI) y dependencias externas.
- [x] Pruebas automatizadas (unitarias + integración) cubriendo clima actual, pronóstico, render tarjetas.
- [ ] Guía para soporte/operaciones describiendo configuración de API keys, caché y pasos de despliegue.

## 1. Extender clima para pronóstico
- [x] Revisar capacidades disponibles en OpenWeatherMap (One Call 3.0 u otras) y confirmar restricciones de API key actual.
- [x] Definir nuevo contrato del servicio (`WeatherForecastContext`, campos diarios/hora) y actualizar DTOs compartidos con el front.
- [x] Implementar cliente/servicio Java para pronóstico (manejo de cache y fallbacks similares al clima actual).
- [x] Ajustar `AiContextService` para combinar clima actual + pronóstico y exponerlo en `/api/ai/context` sin romper compatibilidad.
- [x] Adaptar `preguntas.js` para incorporar el pronóstico en el prompt y mostrar narrativa adicional cuando esté disponible.
- [x] Crear pruebas unitarias/integración que cubran: éxito, errores externos, y expiración de cache.
- [x] Documentar configuración requerida (nuevos endpoints, parámetros de aplicación) en README/plan anterior.

### Dependencias y riesgos del módulo de pronóstico
- [x] Evaluar coste adicional del endpoint (One Call requiere suscripción) y alternativas de gratuita (Forecast 5 day/3 hour).
- [x] Verificar que el tamaño de la respuesta no sature el prompt del modelo Groq; planificar resumen automático.
- [ ] Asegurar que la caché no supere el límite de memoria en el servidor; decidir ubicación (in-memory vs. Redis).

## 2. Filtro/alternativas cuando no hay stock (opcional)
- [ ] Evaluar necesidad con stakeholders; si se aprueba, definir reglas (omitir sin stock, proponer pedidos, etc.).
- [ ] Implementar cambios en `AiRecommendationService` y ajustar pruebas.
- [ ] Actualizar prompts y UI según el comportamiento deseado.

## 3. UI tipo tarjetas en el asistente
- [x] Diseñar estructura HTML para tarjeta de producto (imagen, nombre, precio, stock, CTA) y clases CSS reutilizables.
- [x] Modificar `appendMessage`/render del chat para detectar respuestas con productos y construir tarjetas dinámicamente.
- [x] Actualizar `buildRecommendationContext` y/o formato de respuesta para facilitar el renderizado (ej. bloque JSON adicional).
- [x] Añadir estilos específicos en `static/css` (responsivo, hover, accesibilidad) y validar contraste/espaciado.
- [x] Implementar fallback cuando no haya imagen o stock.
- [ ] Probar en navegadores objetivo (desktop/móvil) y ajustar interacción (scroll, foco, teclado).
- [ ] Documentar uso y mantenimiento de los componentes de tarjeta.

### Experiencia de usuario y accesibilidad
- [ ] Validar que las tarjetas sean navegables con teclado y lector de pantalla (etiquetas ARIA, orden de tabulación).
- [ ] Definir comportamiento cuando la IA devuelva más de 5 productos (paginación, carrusel, scroll interno).
- [ ] Asegurar degradación progresiva: si falla el CSS/JS, se debe mostrar la información mínima en texto.

## Roadmap sugerido
- [ ] Semana 1: investigaciones (API, alcance UX), diseño contratos, prototipos UI en baja fidelidad.
- [ ] Semana 2: implementación backend (servicio pronóstico + AiContextService), pruebas unitarias.
- [ ] Semana 3: ajustes frontend (`preguntas.js`, tarjetas, estilos) y pruebas cruzadas.
- [ ] Semana 4: validación end-to-end, documentación final, reunión con stakeholders para aprobación.

## Criterios de aceptación
- [ ] Endpoint `/api/ai/context` responde en <500 ms con clima actual y pronóstico resumido.
- [ ] La IA menciona pronóstico cuando el usuario pregunta por fechas futuras y no rompe el flujo actual.
- [ ] El chat muestra tarjetas correctamente en desktop ≥1280px y mobile ≥360px, con imagen y CTA funcional.
- [ ] Todas las pruebas automatizadas nuevas pasan y el pipeline CI se mantiene verde.

## Notas de configuración (actualizado)
- La API de pronóstico usa `https://api.openweathermap.org/data/2.5/forecast` (plan gratuito con bloques de 3 h). Se requieren las coordenadas de Tarapoto (`detalles.ai.weather.lat`, `detalles.ai.weather.lon`) y la misma API key configurada para el clima actual.
- El caché en memoria se controla con `detalles.ai.weather.forecast-cache-minutes` (por defecto 60 min). Ajustar si se detectan límites de memoria.
- El nuevo contrato `WeatherForecastContext` expone `nextHours` (primeros bloques de 3 h) y `nextDays` (resumen diario), además de una narrativa que ya se incorpora automáticamente al prompt en `preguntas.js`.
