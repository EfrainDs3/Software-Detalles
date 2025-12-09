# Plan de Integración IA + Clima + Festividades

Listado de tareas en orden sugerido. Marca cada casilla `[x]` cuando completes el paso.

## 1. Discovery y documentación
- [ ] Inventariar componentes actuales del asistente (servicios, controladores, prompts, repositorios usados)
- [ ] Documentar flujo de datos actual Groq → BD → respuesta (incluyendo consultas SQL o repos especializados)
- [x] Identificar modelos/DTOs de productos necesarios para recomendaciones (sin exponer IDs)

## 2. Fundamentos técnicos
- [x] Definir contratos de servicio para clima (OpenWeatherMap) y festividades (Nager.Date)
- [x] Decidir estrategia de caching y timeout para llamadas externas (fallos -> mensaje de error)
- [x] Registrar estructura de credenciales en `application.properties`/variables de entorno (mantener formato Groq)

## 3. Integración OpenWeatherMap (Tarapoto, Perú)
- [x] Crear cliente HTTP dedicado (Java) con API key `22c230e3a780ac659af4806e41256b29`
- [x] Implementar servicio que exponga condiciones actuales y pronóstico relevante para recomendaciones
- [x] Añadir normalización a español y formato monetario PEN (S/.)
- [x] Manejar errores de red/API con fallback explícito (mensaje al usuario)

## 4. Integración Nager.Date
- [x] Crear cliente para endpoints necesarios (`PublicHolidays`, `LongWeekend`, etc.)
- [x] Mapear respuestas a objetos internos (festividad, fecha, tipo)
- [x] Implementar lógica para detectar feriados actuales/próximos relevantes para Tarapoto (Perú -> `PE`)
- [x] Añadir manejo de errores y mensajes consistentes

## 5. Motor de recomendaciones IA
- [x] Actualizar capa de orquestación del asistente para combinar: resultado BD + clima + festividades
- [x] Ajustar prompts Groq para ser concisos, contextuales y olvidar peticiones previas irrelevantes
- [x] Asegurar que cada producto mencionado incluya disponibilidad, aclarando cuando no hay stock
- [x] Formatear respuestas en español, moneda S/., sin IDs internos de producto

## 6. Persistencia y contexto
- [x] Revisar cómo se almacena/recuerda contexto conversacional y agregar mecanismo de “olvido” inmediato cuando usuario cambie de tema
- [x] Validar que consultas a BD soporten recomendaciones por categoría/uso (ej. clima lluvioso → botas)

## 7. QA y observabilidad
- [x] Crear pruebas unitarias/integración para clientes externos y lógica de recomendación
- [x] Simular escenarios de fallo (APIs caídas, sin conexión) verificando mensaje de error
- [x] Registrar logs clave para diagnósticos (sin exponer API keys)

## 8. Rollout
- [ ] Actualizar documentación interna (README o wiki) con instrucciones de configuración y uso
- [ ] Preparar plan de despliegue y retroceso (feature flag, toggles si aplica)
- [ ] Coordinar verificación con stakeholders/cliente final
