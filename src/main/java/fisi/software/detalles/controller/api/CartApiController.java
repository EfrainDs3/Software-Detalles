package fisi.software.detalles.controller.api;

import java.util.*;
import java.util.stream.Collectors;

import jakarta.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartApiController {
	@Autowired
	private JdbcTemplate jdbcTemplate;

	@SuppressWarnings("unchecked")
	@PostMapping("/add")
	public Map<String, Object> addToCart(@RequestBody Map<String, Object> body, HttpSession session) {
		Integer productId = (body.get("productId") instanceof Number) ? ((Number) body.get("productId")).intValue() : null;
		Integer qty = (body.get("quantity") instanceof Number) ? ((Number) body.get("quantity")).intValue() : 1;
		if (productId == null || qty <= 0) {
			return Map.of("error", "producto o cantidad inválida");
		}
		Map<Integer, Integer> cart = (Map<Integer, Integer>) session.getAttribute("CART");
		if (cart == null) {
			cart = new HashMap<>();
		}
		cart.put(productId, cart.getOrDefault(productId, 0) + qty);
		session.setAttribute("CART", cart);
		return Map.of("ok", true, "cartSize", cart.values().stream().mapToInt(i -> i).sum());
	}

	@SuppressWarnings("unchecked")
	@GetMapping
	public Map<String, Object> viewCart(HttpSession session) {
		Map<Integer, Integer> cart = (Map<Integer, Integer>) session.getAttribute("CART");
		if (cart == null || cart.isEmpty()) {
			return Map.of("items", Collections.emptyList(), "total", 0.0);
		}
		List<Integer> ids = new ArrayList<>(cart.keySet());
		// construir consulta IN
		String inSql = ids.stream().map(i -> String.valueOf(i)).collect(Collectors.joining(","));
		String sql = "SELECT id_producto, nombre_producto, precio_venta FROM productos WHERE id_producto IN (" + inSql + ")";
		List<Map<String, Object>> products = jdbcTemplate.queryForList(sql);
		double total = 0.0;
		List<Map<String, Object>> items = new ArrayList<>();
		for (Map<String, Object> p : products) {
			int id = ((Number) p.get("id_producto")).intValue();
			int quantity = cart.getOrDefault(id, 0);
			double price = ((Number) p.get("precio_venta")).doubleValue();
			double subtotal = price * quantity;
			total += subtotal;
			Map<String, Object> item = new HashMap<>();
			item.put("id_producto", id);
			item.put("nombre_producto", p.get("nombre_producto"));
			item.put("precio_venta", price);
			item.put("quantity", quantity);
			item.put("subtotal", subtotal);
			items.add(item);
		}
		return Map.of("items", items, "total", total);
	}

	@PostMapping("/clear")
	public Map<String, Object> clearCart(HttpSession session) {
		session.removeAttribute("CART");
		return Map.of("ok", true);
	}
}