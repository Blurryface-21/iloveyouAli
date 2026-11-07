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
    if (id === "teAmo") triggerTeAmoSpectacularFx();
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

  const audio = document.getElementById("backgroundMusic");
  const celebrationAudio = document.getElementById("celebrationMusic");
  const musicToggle = document.getElementById("musicToggle");
  const musicLabel = document.getElementById("musicLabel");

  function getActiveAudio() {
    if (celebrationAudio && (!celebrationAudio.paused || celebrationAudio.currentTime > 0)) {
      return celebrationAudio;
    }
    return audio;
  }

  function updateMusicButtonState() {
    const currentAudio = getActiveAudio();
    if (currentAudio && !currentAudio.paused) {
      musicToggle.classList.add("playing");
      musicToggle.setAttribute("aria-pressed", "true");
      musicLabel.textContent = "Pausar música";
    } else {
      musicToggle.classList.remove("playing");
      musicToggle.setAttribute("aria-pressed", "false");
      musicLabel.textContent = "Activar música";
    }
  }

  if (btnYes) {
    btnYes.addEventListener("click", () => {
      // Detener Lovebomb
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      // Reproducir Robot Voices inmediatamente y mantener en TE AMO
      if (celebrationAudio) {
        celebrationAudio.currentTime = 0;
        celebrationAudio.play().then(() => {
          updateMusicButtonState();
        }).catch(err => {
          console.info("Error al reproducir audio de celebración:", err);
        });
      }
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
      stopTeAmoFx();
      if (celebrationAudio) {
        celebrationAudio.pause();
        celebrationAudio.currentTime = 0;
      }
      updateMusicButtonState();
      showScreen("intro");
    });
  }
  document.getElementById("homeLink").addEventListener("click", event => {
    event.preventDefault();
    resetNoButton();
    stopTeAmoFx();
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

  musicToggle.addEventListener("click", async () => {
    const currentAudio = getActiveAudio();
    if (currentAudio.paused) {
      try {
        await currentAudio.play();
        updateMusicButtonState();
      } catch (error) {
        musicLabel.textContent = "Error al reproducir";
        console.info("No se pudo reproducir el audio.", error);
      }
    } else {
      currentAudio.pause();
      updateMusicButtonState();
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

  // Efectos impactantes para la sección "TE AMO"
  let shootingStarInterval = null;
  const sparkSymbols = ["✦", "✧", "★", "✨", "❤"];

  function triggerTeAmoSpectacularFx() {
    stopTeAmoFx();
    const fxLayer = document.getElementById("teAmoFxLayer");
    const flashEl = document.getElementById("teAmoFlash");
    if (!fxLayer) return;

    // Destello de luz cósmica
    if (flashEl) {
      flashEl.classList.remove("flash-active");
      void flashEl.offsetWidth; // forzar reflujo
      flashEl.classList.add("flash-active");
    }

    // Explosión de destellos radiales y chispas doradas/violetas
    const burstCount = reduceMotion ? 16 : 45;
    for (let i = 0; i < burstCount; i++) {
      createSparkle(fxLayer, i, burstCount);
    }

    // Lluvia de estrellas fugaces continua mientras esté en la pantalla
    const launchShootingStar = () => {
      if (currentScreen !== "teAmo") return;
      const star = document.createElement("div");
      star.className = "shooting-star";

      // Posiciones aleatorias en el tercio superior o laterales
      const startX = Math.random() * (window.innerWidth * 0.9);
      const startY = Math.random() * (window.innerHeight * 0.45);
      const length = 120 + Math.random() * 180;
      const duration = 1.1 + Math.random() * 0.9;
      const angle = 28 + Math.random() * 16; // trayectoria en diagonal atractiva

      star.style.left = `${startX}px`;
      star.style.top = `${startY}px`;
      star.style.width = `${length}px`;
      star.style.animationDuration = `${duration}s`;
      star.style.transform = `rotate(${angle}deg)`;

      fxLayer.appendChild(star);
      setTimeout(() => star.remove(), duration * 1000 + 100);
    };

    // Lanzar varias ráfagas de estrellas fugaces al inicio
    const initialBurst = reduceMotion ? 2 : 6;
    for (let j = 0; j < initialBurst; j++) {
      setTimeout(launchShootingStar, j * 260);
    }

    // Y mantener estrellas fugaces periódicas
    shootingStarInterval = setInterval(() => {
      if (currentScreen !== "teAmo") {
        stopTeAmoFx();
        return;
      }
      launchShootingStar();
      if (Math.random() > 0.4) {
        setTimeout(launchShootingStar, 200 + Math.random() * 300);
      }
    }, 1100);
  }

  function createSparkle(container, index, total) {
    const el = document.createElement("div");
    el.className = "cosmic-sparkle";
    el.textContent = sparkSymbols[Math.floor(Math.random() * sparkSymbols.length)];

    // Ángulo y distancia de dispersión radial
    const angle = (index / total) * Math.PI * 2 + (Math.random() * 0.4 - 0.2);
    const distance = 80 + Math.random() * (Math.min(window.innerWidth, window.innerHeight) * 0.42);
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;
    const duration = 1.2 + Math.random() * 1.5;
    const size = 12 + Math.random() * 18;

    el.style.setProperty("--tx", `${tx}px`);
    el.style.setProperty("--ty", `${ty}px`);
    el.style.setProperty("--scale-end", `${0.4 + Math.random() * 0.8}`);
    el.style.fontSize = `${size}px`;
    el.style.animationDuration = `${duration}s`;
    el.style.animationDelay = `${Math.random() * 0.3}s`;

    container.appendChild(el);
    setTimeout(() => el.remove(), (duration + 0.5) * 1000);
  }

  function stopTeAmoFx() {
    if (shootingStarInterval) {
      clearInterval(shootingStarInterval);
      shootingStarInterval = null;
    }
    const fxLayer = document.getElementById("teAmoFxLayer");
    if (fxLayer) {
      fxLayer.innerHTML = "";
    }
  }

  updateProgress();
})();
