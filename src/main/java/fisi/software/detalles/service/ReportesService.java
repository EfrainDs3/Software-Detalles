package fisi.software.detalles.service;

import fisi.software.detalles.controller.dto.*;
import fisi.software.detalles.entity.*;
import fisi.software.detalles.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportesService {

        private final VentaRepository ventaRepository;
        private final InventarioRepository inventarioRepository;
        private final InventarioTallaRepository inventarioTallaRepository;
        private final ClienteRepository clienteRepository;
        private final PedidoCompraRepository pedidoCompraRepository;

        public ReporteVentasDTO generarReporteVentas(FiltrosReporteDTO filtros) {
                try {
                        List<ComprobantePago> ventas = ventaRepository.findAll();
                        ventas = aplicarFiltrosFechas(ventas, filtros);

                        BigDecimal totalVentas = ventas.stream()
                                        .filter(v -> !"Anulado".equals(v.getEstado()))
                                        .map(ComprobantePago::getTotal)
                                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                        int cantidadVentas = (int) ventas.stream()
                                        .filter(v -> !"Anulado".equals(v.getEstado()))
                                        .count();

                        BigDecimal ticketPromedio = cantidadVentas > 0
                                        ? totalVentas.divide(BigDecimal.valueOf(cantidadVentas), 2,
                                                        RoundingMode.HALF_UP)
                                        : BigDecimal.ZERO;

                        List<ReporteVentasDTO.VentaPorProducto> ventasPorProducto = calcularVentasPorProducto(ventas);
                        List<ReporteVentasDTO.VentaPorVendedor> ventasPorVendedor = calcularVentasPorVendedor(ventas);
                        Map<String, BigDecimal> distribucionPorCategoria = calcularDistribucionCategoria(totalVentas);

                        return ReporteVentasDTO.builder()
                                        .totalVentas(totalVentas)
                                        .cantidadVentas(cantidadVentas)
                                        .ticketPromedio(ticketPromedio)
                                        .ventasPorProducto(ventasPorProducto)
                                        .ventasPorVendedor(ventasPorVendedor)
                                        .ventasPorCategoria(new ArrayList<>())
                                        .distribucionPorCategoria(distribucionPorCategoria)
                                        .build();
                } catch (Exception e) {
                        return crearReporteVentasVacio();
                }
        }

        public ReporteInventarioDTO generarReporteInventario(FiltrosReporteDTO filtros) {
                try {
                        List<Inventario> inventarios = inventarioRepository.findAll();

                        if (filtros != null && filtros.getAlmacenId() != null) {
                                inventarios = inventarios.stream()
                                                .filter(inv -> inv.getAlmacen() != null &&
                                                                inv.getAlmacen().getId().equals(filtros.getAlmacenId()))
                                                .collect(Collectors.toList());
                        }

                        int totalProductos = inventarios.size();
                        int totalUnidades = inventarios.stream()
                                        .mapToInt(inv -> {
                                                // Obtener todas las tallas para este inventario
                                                List<InventarioTalla> tallas = inventarioTallaRepository
                                                                .findByInventario(inv);

                                                // Calcular stock total sumando todas las tallas
                                                int stockActualTotal = tallas.stream()
                                                                .mapToInt(InventarioTalla::getCantidadStock)
                                                                .sum();

                                                // Si no hay tallas, usar el valor del inventario principal
                                                return tallas.isEmpty() ? inv.getCantidadStock() : stockActualTotal;
                                        })
                                        .sum();

                        BigDecimal valorTotalInventario = calcularValorInventario(inventarios);
                        List<ReporteInventarioDTO.StockProducto> stockPorProducto = obtenerStockProductos(inventarios);
                        List<ReporteInventarioDTO.ProductoStockBajo> productosStockBajo = obtenerProductosStockBajo(
                                        inventarios);

                        Map<String, Integer> distribucionPorCategoria = calcularDistribucionInventarioPorCategoria(
                                        inventarios);

                        return ReporteInventarioDTO.builder()
                                        .totalProductos(totalProductos)
                                        .totalUnidades(totalUnidades)
                                        .valorTotalInventario(valorTotalInventario)
                                        .stockPorProducto(stockPorProducto)
                                        .productosStockBajo(productosStockBajo)
                                        .productosMasVendidos(new ArrayList<>())
                                        .distribucionPorCategoria(distribucionPorCategoria)
                                        .build();
                } catch (Exception e) {
                        return crearReporteInventarioVacio();
                }
        }

        public ReporteFinancieroDTO generarReporteFinanciero(FiltrosReporteDTO filtros) {
                try {
                        List<ComprobantePago> ventas = ventaRepository.findAll();
                        ventas = aplicarFiltrosFechas(ventas, filtros);

                        BigDecimal totalIngresos = ventas.stream()
                                        .filter(v -> !"Anulado".equals(v.getEstado()))
                                        .map(ComprobantePago::getTotal)
                                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                        // Calcular egresos reales desde compras
                        List<PedidoCompra> compras = pedidoCompraRepository.findAllByOrderByFechaPedidoDesc();
                        compras = aplicarFiltrosFechasCompras(compras, filtros);

                        BigDecimal totalEgresos = compras.stream()
                                        .filter(c -> "Completado".equals(c.getEstadoPedido()))
                                        .map(PedidoCompra::getTotalPedido)
                                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                        BigDecimal utilidadBruta = totalIngresos.subtract(totalEgresos);
                        BigDecimal margenUtilidad = totalIngresos.compareTo(BigDecimal.ZERO) > 0
                                        ? utilidadBruta.divide(totalIngresos, 4, RoundingMode.HALF_UP)
                                                        .multiply(BigDecimal.valueOf(100))
                                        : BigDecimal.ZERO;

                        Map<String, BigDecimal> distribucion = new LinkedHashMap<>();
                        distribucion.put("Ingresos", totalIngresos);
                        distribucion.put("Egresos", totalEgresos);

                        return ReporteFinancieroDTO.builder()
                                        .totalIngresos(totalIngresos)
                                        .ingresosVentas(totalIngresos)
                                        .otrosIngresos(BigDecimal.ZERO)
                                        .totalEgresos(totalEgresos)
                                        .egresosCompras(totalEgresos)
                                        .otrosEgresos(BigDecimal.ZERO)
                                        .utilidadBruta(utilidadBruta)
                                        .margenUtilidad(margenUtilidad)
                                        .saldoInicial(BigDecimal.ZERO)
                                        .saldoFinal(utilidadBruta)
                                        .flujoCaja(utilidadBruta)
                                        .distribucionIngresosEgresos(distribucion)
                                        .build();
                } catch (Exception e) {
                        return crearReporteFinancieroVacio();
                }
        }

        public ReporteClientesDTO generarReporteClientes(FiltrosReporteDTO filtros) {
                try {
                        List<Cliente> clientes = clienteRepository.findAll();
                        List<ComprobantePago> ventas = ventaRepository.findAll();
                        ventas = aplicarFiltrosFechas(ventas, filtros);

                        int totalClientes = clientes.size();
                        int clientesActivos = (int) ventas.stream()
                                        .filter(v -> !"Anulado".equals(v.getEstado()) && v.getCliente() != null)
                                        .map(v -> v.getCliente().getIdCliente())
                                        .distinct()
                                        .count();

                        BigDecimal totalVentas = ventas.stream()
                                        .filter(v -> !"Anulado".equals(v.getEstado()))
                                        .map(ComprobantePago::getTotal)
                                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                        BigDecimal ticketPromedio = clientesActivos > 0
                                        ? totalVentas.divide(BigDecimal.valueOf(clientesActivos), 2,
                                                        RoundingMode.HALF_UP)
                                        : BigDecimal.ZERO;

                        List<ReporteClientesDTO.ClienteTop> clientesTop = calcularClientesTop(ventas);
                        Map<String, BigDecimal> distribucion = clientesTop.stream()
                                        .limit(5)
                                        .collect(Collectors.toMap(
                                                        ReporteClientesDTO.ClienteTop::getNombreCliente,
                                                        ReporteClientesDTO.ClienteTop::getTotalCompras,
                                                        (a, b) -> a,
                                                        LinkedHashMap::new));

                        return ReporteClientesDTO.builder()
                                        .totalClientes(totalClientes)
                                        .clientesActivos(clientesActivos)
                                        .ticketPromedio(ticketPromedio)
                                        .clientesTop(clientesTop)
                                        .clientesFrecuentes(new ArrayList<>())
                                        .distribucionPorCliente(distribucion)
                                        .build();
                } catch (Exception e) {
                        return crearReporteClientesVacio();
                }
        }

        public ReporteComprasDTO generarReporteCompras(FiltrosReporteDTO filtros) {
                try {
                        List<PedidoCompra> compras = pedidoCompraRepository.findAllByOrderByFechaPedidoDesc();

                        // Aplicar filtros de fecha
                        compras = aplicarFiltrosFechasCompras(compras, filtros);

                        // Filtrar por proveedor si se especifica
                        if (filtros != null && filtros.getProveedorId() != null) {
                                compras = compras.stream()
                                                .filter(c -> c.getProveedor() != null &&
                                                                c.getProveedor().getIdProveedor()
                                                                                .equals(filtros.getProveedorId()))
                                                .collect(Collectors.toList());
                        }

                        // Filtrar solo compras completadas
                        compras = compras.stream()
                                        .filter(c -> "Completado".equals(c.getEstadoPedido()))
                                        .collect(Collectors.toList());

                        // Calcular totales
                        BigDecimal totalCompras = compras.stream()
                                        .map(PedidoCompra::getTotalPedido)
                                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                        int cantidadCompras = compras.size();

                        BigDecimal costoPromedio = cantidadCompras > 0
                                        ? totalCompras.divide(BigDecimal.valueOf(cantidadCompras), 2,
                                                        RoundingMode.HALF_UP)
                                        : BigDecimal.ZERO;

                        // Calcular compras por proveedor
                        List<ReporteComprasDTO.CompraPorProveedor> comprasPorProveedor = calcularComprasPorProveedor(
                                        compras);

                        // Calcular productos más comprados
                        List<ReporteComprasDTO.ProductoMasComprado> productosMasComprados = calcularProductosMasComprados(
                                        compras);

                        // Crear distribución por proveedor para gráfico
                        Map<String, BigDecimal> distribucionPorProveedor = comprasPorProveedor.stream()
                                        .limit(5)
                                        .collect(Collectors.toMap(
                                                        ReporteComprasDTO.CompraPorProveedor::getNombreProveedor,
                                                        ReporteComprasDTO.CompraPorProveedor::getTotalCompras,
                                                        (a, b) -> a,
                                                        LinkedHashMap::new));

                        return ReporteComprasDTO.builder()
                                        .totalCompras(totalCompras)
                                        .cantidadCompras(cantidadCompras)
                                        .costoPromedio(costoPromedio)
                                        .comprasPorProveedor(comprasPorProveedor)
                                        .productosMasComprados(productosMasComprados)
                                        .distribucionPorProveedor(distribucionPorProveedor)
                                        .build();
                } catch (Exception e) {
                        return crearReporteComprasVacio();
                }
        }

        private List<PedidoCompra> aplicarFiltrosFechasCompras(List<PedidoCompra> compras, FiltrosReporteDTO filtros) {
                if (filtros == null || (filtros.getFechaInicio() == null && filtros.getFechaFin() == null)) {
                        return compras;
                }

                LocalDateTime inicio = filtros.getFechaInicio() != null
                                ? filtros.getFechaInicio().atStartOfDay()
                                : LocalDateTime.of(2000, 1, 1, 0, 0);
                LocalDateTime fin = filtros.getFechaFin() != null
                                ? filtros.getFechaFin().atTime(23, 59, 59)
                                : LocalDateTime.now();

                return compras.stream()
                                .filter(c -> c.getFechaPedido() != null &&
                                                !c.getFechaPedido().isBefore(inicio) &&
                                                !c.getFechaPedido().isAfter(fin))
                                .collect(Collectors.toList());
        }

        private List<ReporteComprasDTO.CompraPorProveedor> calcularComprasPorProveedor(List<PedidoCompra> compras) {
                Map<Integer, CompraPorProveedorTemp> proveedoresMap = new HashMap<>();

                for (PedidoCompra compra : compras) {
                        if (compra.getProveedor() != null) {
                                Integer proveedorId = compra.getProveedor().getIdProveedor();
                                CompraPorProveedorTemp temp = proveedoresMap.getOrDefault(proveedorId,
                                                new CompraPorProveedorTemp(
                                                                compra.getProveedor().getRazonSocial(),
                                                                compra.getProveedor().getRuc(),
                                                                0,
                                                                BigDecimal.ZERO));
                                temp.cantidadCompras += 1;
                                temp.totalCompras = temp.totalCompras.add(compra.getTotalPedido());
                                proveedoresMap.put(proveedorId, temp);
                        }
                }

                return proveedoresMap.values().stream()
                                .sorted((a, b) -> b.totalCompras.compareTo(a.totalCompras))
                                .map(temp -> ReporteComprasDTO.CompraPorProveedor.builder()
                                                .nombreProveedor(temp.nombreProveedor)
                                                .ruc(temp.ruc)
                                                .cantidadCompras(temp.cantidadCompras)
                                                .totalCompras(temp.totalCompras)
                                                .build())
                                .collect(Collectors.toList());
        }

        private List<ReporteComprasDTO.ProductoMasComprado> calcularProductosMasComprados(List<PedidoCompra> compras) {
                Map<Long, ProductoMasCompradoTemp> productosMap = new HashMap<>();

                for (PedidoCompra compra : compras) {
                        if (compra.getDetalles() != null) {
                                for (DetallePedidoCompra detalle : compra.getDetalles()) {
                                        if (detalle.getProducto() != null) {
                                                Long productoId = detalle.getProducto().getId();
                                                ProductoMasCompradoTemp temp = productosMap.getOrDefault(productoId,
                                                                new ProductoMasCompradoTemp(
                                                                                detalle.getProducto().getNombre(),
                                                                                0,
                                                                                BigDecimal.ZERO));
                                                temp.cantidadComprada += detalle.getCantidadPedida();
                                                temp.totalCompras = temp.totalCompras.add(detalle.getSubtotalLinea());
                                                productosMap.put(productoId, temp);
                                        }
                                }
                        }
                }

                return productosMap.values().stream()
                                .sorted((a, b) -> Integer.compare(b.cantidadComprada, a.cantidadComprada))
                                .limit(10)
                                .map(temp -> {
                                        BigDecimal costoPromedio = temp.cantidadComprada > 0
                                                        ? temp.totalCompras.divide(
                                                                        BigDecimal.valueOf(temp.cantidadComprada), 2,
                                                                        RoundingMode.HALF_UP)
                                                        : BigDecimal.ZERO;
                                        return ReporteComprasDTO.ProductoMasComprado.builder()
                                                        .nombreProducto(temp.nombreProducto)
                                                        .cantidadComprada(temp.cantidadComprada)
                                                        .totalCompras(temp.totalCompras)
                                                        .costoPromedio(costoPromedio)
                                                        .build();
                                })
                                .collect(Collectors.toList());
        }

        private ReporteComprasDTO crearReporteComprasVacio() {
                return ReporteComprasDTO.builder()
                                .totalCompras(BigDecimal.ZERO)
                                .cantidadCompras(0)
                                .costoPromedio(BigDecimal.ZERO)
                                .comprasPorProveedor(new ArrayList<>())
                                .productosMasComprados(new ArrayList<>())
                                .distribucionPorProveedor(new LinkedHashMap<>())
                                .build();
        }

        private List<ComprobantePago> aplicarFiltrosFechas(List<ComprobantePago> ventas, FiltrosReporteDTO filtros) {
                if (filtros == null || (filtros.getFechaInicio() == null && filtros.getFechaFin() == null)) {
                        return ventas;
                }

                LocalDateTime inicio = filtros.getFechaInicio() != null
                                ? filtros.getFechaInicio().atStartOfDay()
                                : LocalDateTime.of(2000, 1, 1, 0, 0);
                LocalDateTime fin = filtros.getFechaFin() != null
                                ? filtros.getFechaFin().atTime(23, 59, 59)
                                : LocalDateTime.now();

                return ventas.stream()
                                .filter(v -> v.getFechaEmision() != null &&
                                                !v.getFechaEmision().isBefore(inicio) &&
                                                !v.getFechaEmision().isAfter(fin))
                                .collect(Collectors.toList());
        }

        private List<ReporteVentasDTO.VentaPorProducto> calcularVentasPorProducto(List<ComprobantePago> ventas) {
                Map<String, VentaPorProductoTemp> ventasPorProductoMap = new HashMap<>();

                for (ComprobantePago venta : ventas) {
                        if (!"Anulado".equals(venta.getEstado()) && venta.getDetalles() != null) {
                                for (DetalleComprobantePago detalle : venta.getDetalles()) {
                                        String nombreProducto = detalle.getProducto() != null
                                                        ? detalle.getProducto().getNombre()
                                                        : "Producto desconocido";

                                        VentaPorProductoTemp temp = ventasPorProductoMap.getOrDefault(
                                                        nombreProducto,
                                                        new VentaPorProductoTemp(nombreProducto, 0, BigDecimal.ZERO));
                                        temp.cantidad += detalle.getCantidad();
                                        temp.total = temp.total.add(detalle.getSubtotalLinea());
                                        ventasPorProductoMap.put(nombreProducto, temp);
                                }
                        }
                }

                return ventasPorProductoMap.values().stream()
                                .sorted((a, b) -> b.total.compareTo(a.total))
                                .limit(10)
                                .map(temp -> ReporteVentasDTO.VentaPorProducto.builder()
                                                .nombreProducto(temp.nombre)
                                                .cantidadVendida(temp.cantidad)
                                                .totalVentas(temp.total)
                                                .build())
                                .collect(Collectors.toList());
        }

        private List<ReporteVentasDTO.VentaPorVendedor> calcularVentasPorVendedor(List<ComprobantePago> ventas) {
                Map<String, VentaPorVendedorTemp> ventasPorVendedorMap = new HashMap<>();

                for (ComprobantePago venta : ventas) {
                        if (!"Anulado".equals(venta.getEstado())) {
                                String nombreVendedor = venta.getUsuario() != null
                                                ? venta.getUsuario().getNombres()
                                                : "Vendedor desconocido";

                                VentaPorVendedorTemp temp = ventasPorVendedorMap.getOrDefault(
                                                nombreVendedor,
                                                new VentaPorVendedorTemp(nombreVendedor, 0, BigDecimal.ZERO));
                                temp.cantidad += 1;
                                temp.total = temp.total.add(venta.getTotal());
                                ventasPorVendedorMap.put(nombreVendedor, temp);
                        }
                }

                return ventasPorVendedorMap.values().stream()
                                .sorted((a, b) -> b.total.compareTo(a.total))
                                .map(temp -> ReporteVentasDTO.VentaPorVendedor.builder()
                                                .nombreVendedor(temp.nombre)
                                                .cantidadVentas(temp.cantidad)
                                                .totalVentas(temp.total)
                                                .build())
                                .collect(Collectors.toList());
        }

        private Map<String, BigDecimal> calcularDistribucionCategoria(BigDecimal totalVentas) {
                Map<String, BigDecimal> distribucion = new LinkedHashMap<>();
                BigDecimal calzados = totalVentas.multiply(BigDecimal.valueOf(0.7));
                BigDecimal accesorios = totalVentas.multiply(BigDecimal.valueOf(0.3));
                distribucion.put("Calzados", calzados);
                distribucion.put("Accesorios", accesorios);
                return distribucion;
        }

        private Map<String, Integer> calcularDistribucionInventarioPorCategoria(List<Inventario> inventarios) {
                Map<String, Integer> distribucion = new LinkedHashMap<>();

                for (Inventario inv : inventarios) {
                        if (inv.getProducto() != null && inv.getProducto().getCategoria() != null) {
                                String categoriaNombre = inv.getProducto().getCategoria().getNombre();
                                int cantidadActual = distribucion.getOrDefault(categoriaNombre, 0);

                                // Obtener todas las tallas para este inventario
                                List<InventarioTalla> tallas = inventarioTallaRepository.findByInventario(inv);

                                // Calcular stock total sumando todas las tallas
                                int stockActualTotal = tallas.stream()
                                                .mapToInt(InventarioTalla::getCantidadStock)
                                                .sum();

                                // Si no hay tallas, usar el valor del inventario principal
                                if (tallas.isEmpty()) {
                                        stockActualTotal = inv.getCantidadStock();
                                }

                                distribucion.put(categoriaNombre, cantidadActual + stockActualTotal);
                        }
                }

                // Si no hay categorías, retornar mapa vacío
                if (distribucion.isEmpty()) {
                        distribucion.put("Sin categoría", 0);
                }

                return distribucion;
        }

        private BigDecimal calcularValorInventario(List<Inventario> inventarios) {
                return inventarios.stream()
                                .map(inv -> {
                                        // Obtener todas las tallas para este inventario
                                        List<InventarioTalla> tallas = inventarioTallaRepository.findByInventario(inv);

                                        // Calcular stock total sumando todas las tallas
                                        int stockActualTotal = tallas.stream()
                                                        .mapToInt(InventarioTalla::getCantidadStock)
                                                        .sum();

                                        // Si no hay tallas, usar el valor del inventario principal
                                        if (tallas.isEmpty()) {
                                                stockActualTotal = inv.getCantidadStock();
                                        }

                                        BigDecimal precio = inv.getProducto() != null
                                                        && inv.getProducto().getPrecioVenta() != null
                                                                        ? inv.getProducto().getPrecioVenta()
                                                                        : BigDecimal.ZERO;
                                        return precio.multiply(BigDecimal.valueOf(stockActualTotal));
                                })
                                .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        private List<ReporteInventarioDTO.StockProducto> obtenerStockProductos(List<Inventario> inventarios) {
                return inventarios.stream()
                                .limit(50)
                                .map(inv -> {
                                        // Obtener todas las tallas para este inventario
                                        List<InventarioTalla> tallas = inventarioTallaRepository.findByInventario(inv);

                                        // Calcular stock total sumando todas las tallas
                                        int stockActualTotal = tallas.stream()
                                                        .mapToInt(InventarioTalla::getCantidadStock)
                                                        .sum();

                                        int stockMinimoTotal = tallas.stream()
                                                        .mapToInt(InventarioTalla::getStockMinimo)
                                                        .sum();

                                        // Si no hay tallas, usar los valores del inventario principal
                                        if (tallas.isEmpty()) {
                                                stockActualTotal = inv.getCantidadStock();
                                                stockMinimoTotal = inv.getStockMinimo();
                                        }

                                        return ReporteInventarioDTO.StockProducto.builder()
                                                        .nombreProducto(inv.getProducto() != null
                                                                        ? inv.getProducto().getNombre()
                                                                        : "Desconocido")
                                                        .categoria(inv.getProducto() != null
                                                                        && inv.getProducto().getCategoria() != null
                                                                                        ? inv.getProducto()
                                                                                                        .getCategoria()
                                                                                                        .getNombre()
                                                                                        : "General")
                                                        .stockActual(stockActualTotal)
                                                        .stockMinimo(stockMinimoTotal)
                                                        .valorStock(inv.getProducto() != null
                                                                        && inv.getProducto().getPrecioVenta() != null
                                                                                        ? inv.getProducto()
                                                                                                        .getPrecioVenta()
                                                                                                        .multiply(BigDecimal
                                                                                                                        .valueOf(stockActualTotal))
                                                                                        : BigDecimal.ZERO)
                                                        .build();
                                })
                                .collect(Collectors.toList());
        }

        private List<ReporteInventarioDTO.ProductoStockBajo> obtenerProductosStockBajo(List<Inventario> inventarios) {
                return inventarios.stream()
                                .map(inv -> {
                                        // Obtener todas las tallas para este inventario
                                        List<InventarioTalla> tallas = inventarioTallaRepository.findByInventario(inv);

                                        // Calcular stock total sumando todas las tallas
                                        int stockActualTotal = tallas.stream()
                                                        .mapToInt(InventarioTalla::getCantidadStock)
                                                        .sum();

                                        int stockMinimoTotal = tallas.stream()
                                                        .mapToInt(InventarioTalla::getStockMinimo)
                                                        .sum();

                                        // Si no hay tallas, usar los valores del inventario principal
                                        if (tallas.isEmpty()) {
                                                stockActualTotal = inv.getCantidadStock();
                                                stockMinimoTotal = inv.getStockMinimo();
                                        }

                                        return new Object[] {
                                                        inv,
                                                        stockActualTotal,
                                                        stockMinimoTotal
                                        };
                                })
                                .filter(data -> (int) data[1] <= (int) data[2]) // Filtrar productos con stock bajo
                                .map(data -> {
                                        Inventario inv = (Inventario) data[0];
                                        int stockActual = (int) data[1];
                                        int stockMinimo = (int) data[2];

                                        return ReporteInventarioDTO.ProductoStockBajo.builder()
                                                        .nombreProducto(inv.getProducto() != null
                                                                        ? inv.getProducto().getNombre()
                                                                        : "Desconocido")
                                                        .stockActual(stockActual)
                                                        .stockMinimo(stockMinimo)
                                                        .estado(stockActual == 0 ? "Crítico" : "Bajo")
                                                        .build();
                                })
                                .collect(Collectors.toList());
        }

        private List<ReporteClientesDTO.ClienteTop> calcularClientesTop(List<ComprobantePago> ventas) {
                Map<Integer, ClienteTopTemp> clientesMap = new HashMap<>();

                for (ComprobantePago venta : ventas) {
                        if (!"Anulado".equals(venta.getEstado()) && venta.getCliente() != null) {
                                Integer clienteId = venta.getCliente().getIdCliente();
                                ClienteTopTemp temp = clientesMap.getOrDefault(clienteId,
                                                new ClienteTopTemp(
                                                                venta.getCliente().getNombre(),
                                                                venta.getCliente().getNumeroDocumento(),
                                                                0,
                                                                BigDecimal.ZERO));
                                temp.cantidadCompras += 1;
                                temp.totalCompras = temp.totalCompras.add(venta.getTotal());
                                clientesMap.put(clienteId, temp);
                        }
                }

                return clientesMap.values().stream()
                                .sorted((a, b) -> b.totalCompras.compareTo(a.totalCompras))
                                .limit(10)
                                .map(temp -> ReporteClientesDTO.ClienteTop.builder()
                                                .nombreCliente(temp.nombre)
                                                .documento(temp.documento)
                                                .cantidadCompras(temp.cantidadCompras)
                                                .totalCompras(temp.totalCompras)
                                                .build())
                                .collect(Collectors.toList());
        }

        private ReporteVentasDTO crearReporteVentasVacio() {
                return ReporteVentasDTO.builder()
                                .totalVentas(BigDecimal.ZERO)
                                .cantidadVentas(0)
                                .ticketPromedio(BigDecimal.ZERO)
                                .ventasPorProducto(new ArrayList<>())
                                .ventasPorVendedor(new ArrayList<>())
                                .ventasPorCategoria(new ArrayList<>())
                                .distribucionPorCategoria(new LinkedHashMap<>())
                                .build();
        }

        private ReporteInventarioDTO crearReporteInventarioVacio() {
                return ReporteInventarioDTO.builder()
                                .totalProductos(0)
                                .totalUnidades(0)
                                .valorTotalInventario(BigDecimal.ZERO)
                                .stockPorProducto(new ArrayList<>())
                                .productosStockBajo(new ArrayList<>())
                                .productosMasVendidos(new ArrayList<>())
                                .distribucionPorCategoria(new LinkedHashMap<>())
                                .build();
        }

        private ReporteFinancieroDTO crearReporteFinancieroVacio() {
                return ReporteFinancieroDTO.builder()
                                .totalIngresos(BigDecimal.ZERO)
                                .ingresosVentas(BigDecimal.ZERO)
                                .otrosIngresos(BigDecimal.ZERO)
                                .totalEgresos(BigDecimal.ZERO)
                                .egresosCompras(BigDecimal.ZERO)
                                .otrosEgresos(BigDecimal.ZERO)
                                .utilidadBruta(BigDecimal.ZERO)
                                .margenUtilidad(BigDecimal.ZERO)
                                .saldoInicial(BigDecimal.ZERO)
                                .saldoFinal(BigDecimal.ZERO)
                                .flujoCaja(BigDecimal.ZERO)
                                .distribucionIngresosEgresos(new LinkedHashMap<>())
                                .build();
        }

        private ReporteClientesDTO crearReporteClientesVacio() {
                return ReporteClientesDTO.builder()
                                .totalClientes(0)
                                .clientesActivos(0)
                                .ticketPromedio(BigDecimal.ZERO)
                                .clientesTop(new ArrayList<>())
                                .clientesFrecuentes(new ArrayList<>())
                                .distribucionPorCliente(new LinkedHashMap<>())
                                .build();
        }

        private static class VentaPorProductoTemp {
                String nombre;
                int cantidad;
                BigDecimal total;

                VentaPorProductoTemp(String nombre, int cantidad, BigDecimal total) {
                        this.nombre = nombre;
                        this.cantidad = cantidad;
                        this.total = total;
                }
        }

        private static class VentaPorVendedorTemp {
                String nombre;
                int cantidad;
                BigDecimal total;

                VentaPorVendedorTemp(String nombre, int cantidad, BigDecimal total) {
                        this.nombre = nombre;
                        this.cantidad = cantidad;
                        this.total = total;
                }
        }

        private static class ClienteTopTemp {
                String nombre;
                String documento;
                int cantidadCompras;
                BigDecimal totalCompras;

                ClienteTopTemp(String nombre, String documento, int cantidadCompras, BigDecimal totalCompras) {
                        this.nombre = nombre;
                        this.documento = documento;
                        this.cantidadCompras = cantidadCompras;
                        this.totalCompras = totalCompras;
                }
        }

        private static class CompraPorProveedorTemp {
                String nombreProveedor;
                String ruc;
                int cantidadCompras;
                BigDecimal totalCompras;

                CompraPorProveedorTemp(String nombreProveedor, String ruc, int cantidadCompras,
                                BigDecimal totalCompras) {
                        this.nombreProveedor = nombreProveedor;
                        this.ruc = ruc;
                        this.cantidadCompras = cantidadCompras;
                        this.totalCompras = totalCompras;
                }
        }

        private static class ProductoMasCompradoTemp {
                String nombreProducto;
                int cantidadComprada;
                BigDecimal totalCompras;

                ProductoMasCompradoTemp(String nombreProducto, int cantidadComprada, BigDecimal totalCompras) {
                        this.nombreProducto = nombreProducto;
                        this.cantidadComprada = cantidadComprada;
                        this.totalCompras = totalCompras;
                }
        }
}
