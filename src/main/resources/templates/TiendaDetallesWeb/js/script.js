/* =======================
   MENU HAMBURGUESA
======================= */
document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.querySelector(".menu-btn");
  const headerDerecha = document.querySelector(".header-derecha");

  if (menuBtn) {
    menuBtn.addEventListener("click", () => {
      headerDerecha.classList.toggle("activo");
    });
  }
});

/* =======================
   SWIPER: SLIDER PRINCIPAL
======================= */
const swiperPrincipal = new Swiper(".slider-principal .swiper", {
  loop: true,
  autoplay: {
    delay: 3000,
    disableOnInteraction: false,
  },
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
});

/* =======================
   SWIPER: SLIDER MARCAS
======================= */
const swiperMarcas = new Swiper(".marcas .swiper", {
  loop: true,
  slidesPerView: 5,
  spaceBetween: 20,
  autoplay: {
    delay: 2000,
    disableOnInteraction: false,
  },
  breakpoints: {
    320: { slidesPerView: 2 },
    480: { slidesPerView: 3 },
    768: { slidesPerView: 4 },
    1024: { slidesPerView: 5 },
  },
});

/* =======================
   SWIPER: SLIDER PRODUCTOS
======================= */
const swiperProductos = new Swiper(".productos .swiper", {
  loop: true,
  slidesPerView: 4,
  spaceBetween: 15,
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  breakpoints: {
    320: { slidesPerView: 1 },
    480: { slidesPerView: 2 },
    768: { slidesPerView: 3 },
    1024: { slidesPerView: 4 },
  },
});

/* =======================
   ALPINE.JS EJEMPLO (EXTRA)
   → Para mostrar un mensaje en el form de socios
======================= */
function initAlpine() {
  return {
    enviado: false,
    enviarForm() {
      this.enviado = true;
      setTimeout(() => (this.enviado = false), 4000);
    },
  };
}