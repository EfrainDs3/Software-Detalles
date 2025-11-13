package fisi.software.detalles.security;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Maneja respuestas personalizadas cuando un usuario autenticado intenta acceder a un recurso sin permisos.
 */
@Component
public class CustomAccessDeniedHandler implements AccessDeniedHandler {

    public static final String ACCESS_DENIED_MESSAGE_KEY = "ACCESS_DENIED_MESSAGE";

    private final ObjectMapper objectMapper;

    public CustomAccessDeniedHandler(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException)
        throws IOException {

        if (isApiRequest(request)) {
            writeJsonResponse(request, response);
            return;
        }

        request.getSession(true)
            .setAttribute(ACCESS_DENIED_MESSAGE_KEY, "No cuentas con los permisos suficientes para acceder a este módulo.");
        response.sendRedirect(request.getContextPath() + "/acceso-denegado");
    }

    private boolean isApiRequest(HttpServletRequest request) {
        String uri = request.getRequestURI();
        String contextPath = request.getContextPath();
        String accept = request.getHeader("Accept");
        String requestedWith = request.getHeader("X-Requested-With");

        boolean contextAwareApi = StringUtils.hasText(contextPath)
            ? uri.startsWith(contextPath + "/api")
            : uri.startsWith("/api");

        return contextAwareApi
            || (accept != null && accept.contains(MediaType.APPLICATION_JSON_VALUE))
            || (requestedWith != null && "XMLHttpRequest".equalsIgnoreCase(requestedWith));
    }

    private void writeJsonResponse(HttpServletRequest request, HttpServletResponse response) throws IOException {
        Map<String, Object> body = new HashMap<>();
        body.put("error", "No cuentas con permisos para realizar esta acción");
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", HttpStatus.FORBIDDEN.value());
        body.put("path", request.getRequestURI());

        response.setStatus(HttpStatus.FORBIDDEN.value());
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getOutputStream(), body);
    }
}
