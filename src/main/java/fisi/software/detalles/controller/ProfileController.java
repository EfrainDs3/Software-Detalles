package fisi.software.detalles.controller;

import java.util.List;
import java.util.Map;

import jakarta.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * Controlador para la gestión del perfil de usuario
 * 
 * @author Equipo Detalles
 * @version 1.0
 */
@Controller
public class ProfileController {
	@Autowired
	private JdbcTemplate jdbcTemplate;

	/**
	 * Muestra la página de perfil del usuario logueado
	 * 
	 * @param session sesión del usuario
	 * @return Vista del perfil
	 */
	@GetMapping("/perfil")
	public String showProfile(HttpSession session) {
		Object uid = session.getAttribute("USER_ID");
		if (uid == null) {
			return "redirect:/login";
		}
		return "software/perfil";
	}

	/**
	 * Obtiene los datos del usuario logueado incluyendo compras y favoritos
	 * 
	 * @param session sesión del usuario
	 * @return JSON con datos del usuario, compras y favoritos
	 */
	@GetMapping("/api/perfil/datos")
	@ResponseBody
	public ResponseEntity<?> getProfileData(HttpSession session) {
		Object uid = session.getAttribute("USER_ID");
		if (uid == null) {
			return ResponseEntity.status(401).body(Map.of("error", "No autenticado"));
		}
		Integer idUsuario = ((Number) uid).intValue();
		
		try {
			// Obtener datos del usuario
			Map<String, Object> user = jdbcTemplate.queryForMap(
				"SELECT id_usuario, nombres, apellidos, username, email, numero_documento, celular, direccion, id_tipodocumento FROM usuarios WHERE id_usuario = ?",
				idUsuario
			);
			
			// Obtener compras (comprobantes de pago)
			List<Map<String, Object>> compras = jdbcTemplate.queryForList(
				"SELECT id_comprobante, fecha_emision, total, estado FROM comprobantespago WHERE id_usuario = ? ORDER BY fecha_emision DESC LIMIT 10",
				idUsuario
			);
			
			// Obtener carritos (favoritos) - usando tabla carrito como referencia de productos guardados
			List<Map<String, Object>> favoritos = jdbcTemplate.queryForList(
				"SELECT DISTINCT p.id_producto, p.nombre_producto, p.precio_venta, p.color, p.tipo, p.imagen " +
				"FROM carrito c " +
				"INNER JOIN carrito_detalle cd ON c.id_carrito = cd.id_carrito " +
				"INNER JOIN productos p ON cd.id_producto = p.id_producto " +
				"WHERE c.id_usuario = ? " +
				"ORDER BY c.fecha_creacion DESC LIMIT 5",
				idUsuario
			);
			
			return ResponseEntity.ok(Map.of(
				"user", user,
				"compras", compras,
				"favoritos", favoritos
			));
		} catch (Exception e) {
			return ResponseEntity.status(500).body(Map.of("error", "Error al obtener datos: " + e.getMessage()));
		}
	}

	/**
	 * Actualiza los datos del perfil del usuario logueado
	 * 
	 * @param session sesión del usuario
	 * @param datosActualizados mapa con los datos a actualizar
	 * @return Respuesta con resultado de la actualización
	 */
	@PostMapping("/api/perfil/actualizar")
	@ResponseBody
	public ResponseEntity<?> updateProfile(HttpSession session, @RequestBody Map<String, Object> datosActualizados) {
		Object uid = session.getAttribute("USER_ID");
		if (uid == null) {
			return ResponseEntity.status(401).body(Map.of("error", "No autenticado"));
		}
		Integer idUsuario = ((Number) uid).intValue();
		
		try {
			// Construir query dinámico solo con los campos que vienen en la solicitud
			StringBuilder queryBuilder = new StringBuilder("UPDATE usuarios SET ");
			java.util.List<Object> params = new java.util.ArrayList<>();
			
			boolean first = true;
			if (datosActualizados.containsKey("nombres")) {
				if (!first) queryBuilder.append(", ");
				queryBuilder.append("nombres = ?");
				params.add(datosActualizados.get("nombres"));
				first = false;
			}
			
			if (datosActualizados.containsKey("apellidos")) {
				if (!first) queryBuilder.append(", ");
				queryBuilder.append("apellidos = ?");
				params.add(datosActualizados.get("apellidos"));
				first = false;
			}
			
			if (datosActualizados.containsKey("email")) {
				if (!first) queryBuilder.append(", ");
				queryBuilder.append("email = ?");
				params.add(datosActualizados.get("email"));
				first = false;
			}
			
			if (datosActualizados.containsKey("celular")) {
				if (!first) queryBuilder.append(", ");
				queryBuilder.append("celular = ?");
				params.add(datosActualizados.get("celular"));
				first = false;
			}
			
			if (datosActualizados.containsKey("numero_documento")) {
				if (!first) queryBuilder.append(", ");
				queryBuilder.append("numero_documento = ?");
				params.add(datosActualizados.get("numero_documento"));
				first = false;
			}
			
			if (datosActualizados.containsKey("direccion")) {
				if (!first) queryBuilder.append(", ");
				queryBuilder.append("direccion = ?");
				params.add(datosActualizados.get("direccion"));
				first = false;
			}
			
			if (first) {
				return ResponseEntity.badRequest().body(Map.of("error", "No hay campos para actualizar"));
			}
			
			queryBuilder.append(" WHERE id_usuario = ?");
			params.add(idUsuario);
			
			// Ejecutar actualización
			int rowsAffected = jdbcTemplate.update(queryBuilder.toString(), params.toArray());
			
			if (rowsAffected > 0) {
				return ResponseEntity.ok(Map.of("mensaje", "Perfil actualizado exitosamente", "success", true));
			} else {
				return ResponseEntity.status(500).body(Map.of("error", "No se pudo actualizar el perfil"));
			}
		} catch (Exception e) {
			return ResponseEntity.status(500).body(Map.of("error", "Error al actualizar: " + e.getMessage()));
		}
	}
}
