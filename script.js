/* ============================================================
   Invitación digital — Promoción 2026 · Unidad Educativa San Luis
   JS moderno sin frameworks. Sin eval() ni HTML dinámico inseguro.
   ============================================================ */

"use strict";

/* ---------- Indicar que JS está activo (los estados ocultos de
   animación solo aplican con html.js → nunca se oculta contenido
   si JavaScript falla) ---------- */
document.documentElement.classList.add("js");

/* ============================================================
   CONFIGURACIÓN DEL EVENTO
   ============================================================ */
const CONFIG = {
  zona: "America/La_Paz",
  evento: { anio: 2026, mes: 12, dia: 15, hora: 10, minuto: 0 },
  youtubeID: "Yd8MQo-QE0",
};

/* ============================================================
   CUENTA REGRESIVA (6.3) — zona horaria America/La_Paz
   ============================================================ */

/** Desplazamiento (ms) de `zona` respecto a UTC en un instante dado. */
function desplazamientoZona(instante, zona) {
  const formato = new Intl.DateTimeFormat("en-US", {
    timeZone: zona,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const partes = {};
  for (const parte of formato.formatToParts(instante)) {
    partes[parte.type] = parte.value;
  }

  const hora = Number(partes.hour) === 24 ? 0 : Number(partes.hour);
  const comoUTC = Date.UTC(
    Number(partes.year),
    Number(partes.month) - 1,
    Number(partes.day),
    hora,
    Number(partes.minute),
    Number(partes.second),
  );

  return comoUTC - instante.getTime();
}

/** Epoch (ms) del momento del evento en hora local de `CONFIG.zona`. */
function instanteEvento() {
  const { anio, mes, dia, hora, minuto } = CONFIG.evento;
  const muroUTC = Date.UTC(anio, mes - 1, dia, hora, minuto);

  // Aproximación con el desplazamiento actual y refinado una vez
  const apr = desplazamientoZona(new Date(), CONFIG.zona);
  let est = muroUTC - apr;
  est = muroUTC - desplazamientoZona(new Date(est), CONFIG.zona);
  return est;
}

function iniciarCuentaRegresiva() {
  const dias = document.getElementById("c-dias");
  const horas = document.getElementById("c-horas");
  const minutos = document.getElementById("c-minutos");
  const segundos = document.getElementById("c-segundos");
  const contador = document.getElementById("contador");
  const mensajeEvento = document.getElementById("contador-listo");

  if (!dias || !horas || !minutos || !segundos || !contador || !mensajeEvento) {
    return;
  }

  const objetivo = instanteEvento();

  if (Number.isNaN(objetivo)) {
    // Fecha inválida: no mostrar valores absurdos
    contador.hidden = true;
    mensajeEvento.hidden = false;
    return;
  }

  const dosDigitos = (valor) => String(valor).padStart(2, "0");

  let temporizador = null;

  function actualizar() {
    const resta = objetivo - Date.now();

    if (resta <= 0) {
      clearInterval(temporizador);
      contador.hidden = true;
      mensajeEvento.hidden = false;
      return;
    }

    dias.textContent = dosDigitos(Math.floor(resta / 86400000));
    horas.textContent = dosDigitos(Math.floor((resta % 86400000) / 3600000));
    minutos.textContent = dosDigitos(Math.floor((resta % 3600000) / 60000));
    segundos.textContent = dosDigitos(Math.floor((resta % 60000) / 1000));
  }

  actualizar();
  temporizador = setInterval(actualizar, 1000);
}

/* ============================================================
   GALERÍA: LIGHTBOX ACCESIBLE (6.7)
   ============================================================ */
function iniciarLightbox() {
  const lightbox = document.getElementById("lightbox");
  const imagen = document.getElementById("lightbox-imagen");
  const leyenda = document.getElementById("lightbox-leyenda");
  const botonCerrar = document.getElementById("lightbox-cerrar");
  const botonesGaleria = document.querySelectorAll("[data-ampliar]");

  if (!lightbox || !imagen || !leyenda || !botonCerrar || botonesGaleria.length === 0) {
    return;
  }

  let focoPrevio = null;

  function abrir(desde) {
    const miniatura = desde.querySelector("img");
    if (miniatura) {
      imagen.src = miniatura.src;
      imagen.alt = miniatura.alt;
      leyenda.textContent = miniatura.alt;
    }

    focoPrevio = document.activeElement;
    lightbox.hidden = false;
    document.documentElement.style.overflow = "hidden";
    botonCerrar.focus();
  }

  function cerrar() {
    if (lightbox.hidden) return;

    lightbox.hidden = true;
    imagen.src = "";
    imagen.alt = "";
    document.documentElement.style.overflow = "";

    if (focoPrevio instanceof HTMLElement) {
      focoPrevio.focus();
    }
  }

  botonesGaleria.forEach((boton) => {
    boton.addEventListener("click", () => abrir(boton));
  });

  botonCerrar.addEventListener("click", cerrar);

  lightbox.addEventListener("click", (evento) => {
    if (evento.target === lightbox) cerrar();
  });

  document.addEventListener("keydown", (evento) => {
    if (lightbox.hidden) return;

    if (evento.key === "Escape") {
      cerrar();
      return;
    }

    // El único control enfocable es "Cerrar": mantener el foco dentro
    if (evento.key === "Tab" && document.activeElement !== botonCerrar) {
      evento.preventDefault();
      botonCerrar.focus();
    }
  });
}

/* ============================================================
   MÚSICA DE FONDO (6.8) — archivo local
   ============================================================ */
function iniciarMusica() {
  const boton = document.getElementById("boton-musica");
  const audio = document.getElementById("musica-audio");

  if (!boton || !audio) return;

  let reproduciendo = false;

  function actualizarEstado() {
    boton.setAttribute("aria-pressed", String(reproduciendo));
    boton.setAttribute(
      "aria-label",
      reproduciendo ? "Pausar música" : "Reproducir música",
    );
  }

  boton.addEventListener("click", () => {
    reproduciendo = !reproduciendo;

    if (reproduciendo) {
      const reproduccion = audio.play();

      // Si el navegador o la red impiden reproducir, la navegación sigue
      if (reproduccion instanceof Promise) {
        reproduccion.catch(() => {
          reproduciendo = false;
          actualizarEstado();
        });
      }
    } else {
      audio.pause();
    }

    actualizarEstado();
  });

  // Mantener el estado sincronizado si el audio se detiene por sí solo
  audio.addEventListener("pause", () => {
    if (reproduciendo) {
      reproduciendo = false;
      actualizarEstado();
    }
  });
}

/* ============================================================
   ANIMACIONES DE APARICIÓN (7) — IntersectionObserver
   ============================================================ */
function iniciarApariciones() {
  const objetivos = document.querySelectorAll(".seccion__interior, .cierre");
  if (objetivos.length === 0) return;

  const movimientoReducido = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (movimientoReducido || !("IntersectionObserver" in window)) {
    return; // sin animación: el contenido queda visible
  }

  objetivos.forEach((elemento) => elemento.classList.add("reveal"));

  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          entrada.target.classList.add("reveal--visible");
          observador.unobserve(entrada.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
  );

  objetivos.forEach((elemento) => observador.observe(elemento));
}

/* ============================================================
   ESCUDO INSTITUCIONAL — marcador provisional si no carga
   ============================================================ */
function verificarEscudo() {
  const escudo = document.getElementById("escudo-imagen");
  const marcador = document.querySelector(".escudo__marcador");
  if (!escudo) return;

  function usarMarcador() {
    escudo.remove();
    if (marcador) marcador.hidden = false;
  }

  if (escudo.complete && escudo.naturalWidth === 0) {
    usarMarcador();
    return;
  }

  escudo.addEventListener("error", usarMarcador);
}

/* ============================================================
   Inicialización
   ============================================================ */
iniciarCuentaRegresiva();
iniciarLightbox();
iniciarMusica();
iniciarApariciones();
verificarEscudo();
