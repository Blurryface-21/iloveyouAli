(() => {
  "use strict";

  // Navegación entre escenas
  const screens = [...document.querySelectorAll(".screen")];
  let currentScreen = "intro";
  function showScreen(id) {
    const target = document.getElementById(id);
    if (!target || id === currentScreen) return;
    screens.forEach(screen => screen.classList.remove("active"));
    target.classList.add("active");
    currentScreen = id;
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (id === "finale") createFinalStars();
    if (id === "letter") revealLetter();
  }

  document.getElementById("beginButton").addEventListener("click", () => showScreen("journey"));
  document.getElementById("toConstellation").addEventListener("click", () => showScreen("constellation"));
  document.getElementById("toLetter").addEventListener("click", () => showScreen("letter"));
  document.getElementById("finalButton").addEventListener("click", () => {
    resetNoButton();
    showScreen("finale");
  });

  const btnYes = document.getElementById("btnYes");
  const btnNo = document.getElementById("btnNo");

  function resetNoButton() {
    if (!btnNo) return;
    btnNo.style.position = "";
    btnNo.style.left = "";
    btnNo.style.top = "";
    btnNo.style.transform = "";
    btnNo.style.zIndex = "";
  }

  function moveNoButton() {
    if (!btnNo) return;
    btnNo.style.position = "fixed";
    btnNo.style.zIndex = "100";

    const btnWidth = btnNo.offsetWidth || 100;
    const btnHeight = btnNo.offsetHeight || 50;
    const padding = 20;

    const maxLeft = Math.max(padding, window.innerWidth - btnWidth - padding);
    const maxTop = Math.max(padding, window.innerHeight - btnHeight - padding);

    const randomLeft = Math.floor(Math.random() * (maxLeft - padding)) + padding;
    const randomTop = Math.floor(Math.random() * (maxTop - padding)) + padding;

    btnNo.style.left = `${randomLeft}px`;
    btnNo.style.top = `${randomTop}px`;
    btnNo.style.transform = "none";
  }

  if (btnYes) {
    btnYes.addEventListener("click", () => {
      showScreen("teAmo");
    });
  }

  if (btnNo) {
    btnNo.addEventListener("click", (e) => {
      e.preventDefault();
      moveNoButton();
    });
    // Opcional para móviles y ratón al intentar tocarlo
    btnNo.addEventListener("touchstart", (e) => {
      e.preventDefault();
      moveNoButton();
    }, { passive: false });
  }
  const restartBtn = document.getElementById("restartButton");
  if (restartBtn) {
    restartBtn.addEventListener("click", () => {
      discovered.clear();
      updateProgress();
      resetNoButton();
      document.querySelectorAll(".star-node").forEach(node => node.classList.remove("discovered"));
      showScreen("intro");
    });
  }
  document.getElementById("homeLink").addEventListener("click", event => {
    event.preventDefault();
    resetNoButton();
    showScreen("intro");
  });

  // Constelación: cada estrella abre un mensaje único.
  const nodes = [...document.querySelectorAll(".star-node")];
  const discovered = new Set();
  const modal = document.getElementById("messageModal");
  const modalText = document.getElementById("modalText");
  const closeModal = () => { modal.hidden = true; };
  function updateProgress() {
    const count = discovered.size;
    document.getElementById("discoveryCount").textContent = `${count} / ${nodes.length}`;
    document.getElementById("progressFill").style.width = `${(count / nodes.length) * 100}%`;
    const hint = document.getElementById("unlockHint");
    const next = document.getElementById("toLetter");
    if (count === nodes.length) {
      hint.textContent = "La constelación está completa. Tu mensaje está listo.";
      next.disabled = false;
      next.classList.remove("disabled-button");
    } else {
      hint.textContent = `Todavía quedan ${nodes.length - count} estrellas por descubrir.`;
      next.disabled = true;
      next.classList.add("disabled-button");
    }
  }
  nodes.forEach(node => {
    node.addEventListener("click", () => {
      const index = nodes.indexOf(node);
      discovered.add(index);
      node.classList.add("discovered");
      modalText.textContent = node.dataset.message;
      modal.hidden = false;
      updateProgress();
      document.getElementById("closeModal").focus();
    });
  });
  document.getElementById("closeModal").addEventListener("click", closeModal);
  document.getElementById("closeModalBackdrop").addEventListener("click", closeModal);
  document.addEventListener("keydown", event => { if (event.key === "Escape" && !modal.hidden) closeModal(); });

  // Efecto de escritura: conserva el texto si el usuario prefiere movimiento reducido.
  const letterBody = document.getElementById("letterBody");
  const originalLetterHTML = letterBody.innerHTML;
  let letterRevealed = false;
  function revealLetter() {
    if (letterRevealed || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    letterRevealed = true;
    const paragraphs = [...letterBody.querySelectorAll("p")];
    paragraphs.forEach((p, i) => {
      p.style.opacity = "0";
      p.style.transform = "translateY(8px)";
      p.style.transition = "opacity .7s ease, transform .7s ease";
      setTimeout(() => { p.style.opacity = "1"; p.style.transform = "translateY(0)"; }, 280 + i * 520);
    });
  }
  const replayBtn = document.getElementById("replayLetter");
  if (replayBtn) {
    replayBtn.addEventListener("click", () => {
      letterRevealed = false;
      letterBody.innerHTML = originalLetterHTML;
      revealLetter();
    });
  }

  // Música: los navegadores móviles requieren una acción explícita.
  const audio = document.getElementById("backgroundMusic");
  const musicToggle = document.getElementById("musicToggle");
  const musicLabel = document.getElementById("musicLabel");
  musicToggle.addEventListener("click", async () => {
    if (audio.paused) {
      try {
        await audio.play();
        musicToggle.classList.add("playing");
        musicToggle.setAttribute("aria-pressed", "true");
        musicLabel.textContent = "Pausar música";
      } catch (error) {
        musicLabel.textContent = "Añade tu canción";
        console.info("No se pudo reproducir el audio. Comprueba assets/cancion.mp3.", error);
      }
    } else {
      audio.pause();
      musicToggle.classList.remove("playing");
      musicToggle.setAttribute("aria-pressed", "false");
      musicLabel.textContent = "Activar música";
    }
  });

  // Cielo estrellado en Canvas: escala de píxeles limitada para cuidar móviles.
  const canvas = document.getElementById("starfield");
  const ctx = canvas.getContext("2d", { alpha: true });
  let stars = [];
  let width = 0, height = 0, frame = 0;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const amount = Math.min(150, Math.max(65, Math.floor((width * height) / 8500)));
    stars = Array.from({ length: amount }, () => ({
      x: Math.random() * width, y: Math.random() * height,
      radius: Math.random() * 1.15 + .25, alpha: Math.random() * .62 + .18,
      phase: Math.random() * Math.PI * 2, speed: Math.random() * .012 + .003
    }));
  }
  function drawStars() {
    ctx.clearRect(0, 0, width, height);
    stars.forEach(star => {
      const twinkle = reduceMotion ? 1 : .72 + Math.sin(frame * star.speed + star.phase) * .28;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(218, 215, 255, ${star.alpha * twinkle})`;
      ctx.fill();
    });
    if (!reduceMotion) frame++;
    requestAnimationFrame(drawStars);
  }
  resizeCanvas();
  drawStars();
  window.addEventListener("resize", resizeCanvas, { passive: true });

  // Pequeñas estrellas decorativas en la escena final.
  let finaleCreated = false;
  function createFinalStars() {
    if (finaleCreated) return;
    finaleCreated = true;
    const holder = document.getElementById("confettiStars");
    for (let i = 0; i < 22; i++) {
      const star = document.createElement("i");
      star.textContent = Math.random() > .5 ? "✦" : "✧";
      star.style.left = `${Math.random() * 100}%`;
      star.style.fontSize = `${8 + Math.random() * 13}px`;
      star.style.setProperty("--duration", `${7 + Math.random() * 8}s`);
      star.style.setProperty("--delay", `${Math.random() * 8}s`);
      holder.appendChild(star);
    }
  }

  updateProgress();
})();
