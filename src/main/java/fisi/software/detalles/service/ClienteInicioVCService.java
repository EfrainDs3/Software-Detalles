package fisi.software.detalles.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import fisi.software.detalles.entity.Producto;
import fisi.software.detalles.repository.ProductoRepository;

@Service
public class ClienteInicioVCService {

    @Autowired
    private ProductoRepository productoRepository;

    public List<Producto> obtenerProductosDestacados() {
        // Ejemplo: obtener los 6 primeros productos
        return productoRepository.findAll().stream().limit(6).toList();
    }
}
