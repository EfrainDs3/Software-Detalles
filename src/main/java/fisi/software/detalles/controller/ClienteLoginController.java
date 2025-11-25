package fisi.software.detalles.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ClienteLoginController {

    @GetMapping("/login-cliente")
    public String loginCliente() {
        return "redirect:/Detalles_web/login/logueo.html";
    }

}
