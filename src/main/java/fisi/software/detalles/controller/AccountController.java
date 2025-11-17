package fisi.software.detalles.controller;

import java.util.List;
import java.util.Map;

import jakarta.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class AccountController {
	@Autowired
	private JdbcTemplate jdbcTemplate;

	@GetMapping("/account")
	@ResponseBody
	public ResponseEntity<?> myAccount(HttpSession session) {
		Object uid = session.getAttribute("USER_ID");
		if (uid == null) {
			return ResponseEntity.status(401).body(Map.of("error", "No autenticado"));
		}
		Integer idUsuario = ((Number) uid).intValue();
		Map<String, Object> user = jdbcTemplate.queryForMap("SELECT id_usuario, nombres, apellidos, username, email FROM usuarios WHERE id_usuario = ?", idUsuario);
		// obtener comprobantes (ventas) simples
		List<Map<String, Object>> comprobantes = jdbcTemplate.queryForList(
			"SELECT id_comprobante, fecha_emision, total, estado FROM comprobantespago WHERE id_usuario = ? ORDER BY fecha_emision DESC LIMIT 20",
			idUsuario
		);
		return ResponseEntity.ok(Map.of("user", user, "comprobantes", comprobantes));
	}
}