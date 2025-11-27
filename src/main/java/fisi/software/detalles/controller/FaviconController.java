package fisi.software.detalles.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class FaviconController {

    @GetMapping("favicon.ico")
    @ResponseBody
    public void favicon() {
        // Devuelve vacío para evitar error 404/500 en favicon
        // Solo sirve para que no salga el error al cargar la página de la Vista Cliente
        // Es independiente y no toca los demás archivos
    }
}
