package fisi.software.detalles.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import fisi.software.detalles.entity.Producto;
import fisi.software.detalles.service.ClienteInicioVCService;

@Controller
public class ClienteInicioVCController {

    @Autowired
    private ClienteInicioVCService clienteInicioVCService;

    @GetMapping({"/", "/index"})
    public String mostrarInicio(Model model) {

        List<Producto> productos = clienteInicioVCService.obtenerProductosDestacados();
        model.addAttribute("productos", productos);

        return "index"; // esto carga templates/index.html
    }
}
