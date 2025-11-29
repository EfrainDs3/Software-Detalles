(function(){
    // Cambia enlaces de login estático a /perfil si localStorage indica sesión
    try{
        const isLogged = (function(){
            try { return !!localStorage.getItem('usuarioLogueado'); } catch(e) { return false; }
        })();

        if (!isLogged) return;

        // Buscar todos los enlaces que apuntan al login estático
        const anchors = document.querySelectorAll('a[href="/Detalles_web/login/logueo.html"], a[href="Detalles_web/login/logueo.html"]');
        anchors.forEach(a=>{
            a.setAttribute('href','/perfil');
        });

        // También buscar iconos que usen ruta relativa
        const relAnchors = document.querySelectorAll('a[href="../login/logueo.html"]');
        relAnchors.forEach(a=>{
            a.setAttribute('href','/perfil');
        });
    }catch(e){
        // no interrumpir ejecución
        console.error('user-link-fix error', e);
    }
})();
