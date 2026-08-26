(() => {
  const OPENING_DURATION = 3350;
  const DIVE_DURATION = 760;
  const REDUCED_DURATION = 650;

  document.addEventListener('DOMContentLoaded', initEhimeOpening);

  function initEhimeOpening() {
    const opening = document.querySelector('#ehimeOpening');
    const hero = document.querySelector('.ehime-hero');
    const skipButton = document.querySelector('#skipEhimeOpening');
    const replayButton = document.querySelector('#replayEhimeOpening');
    const canvas = document.querySelector('#ehimeFogCanvas');
    if (!opening || !hero) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let finishTimer = null;
    let diveTimer = null;
    let hideTimer = null;
    let fogController = null;
    let finished = false;
    let previousBodyOverflow = document.body.style.overflow;

    const clearTimers = () => {
      window.clearTimeout(finishTimer);
      window.clearTimeout(diveTimer);
      window.clearTimeout(hideTimer);
      finishTimer = null;
      diveTimer = null;
      hideTimer = null;
    };

    const stopFog = () => {
      fogController?.stop?.();
      fogController = null;
    };

    const lockPage = () => {
      previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.classList.add('ehime-opening-active');
    };

    const unlockPage = () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.classList.remove('ehime-opening-active');
    };

    const scheduleFinish = () => {
      clearTimers();
      finishTimer = window.setTimeout(() => beginDive(false), reduceMotion ? REDUCED_DURATION : OPENING_DURATION);
    };

    const resetOpening = () => {
      clearTimers();
      stopFog();
      finished = false;
      opening.hidden = false;
      opening.classList.remove('is-finished', 'is-diving');
      opening.setAttribute('aria-hidden', 'false');
      lockPage();
      hero.classList.remove('is-opening-arrival');
      restartCssAnimations(opening);
      fogController = reduceMotion ? null : createFog(canvas);
      skipButton?.focus({ preventScroll: true });
      scheduleFinish();
    };

    const complete = () => {
      if (finished) return;
      finished = true;
      clearTimers();
      stopFog();
      opening.classList.add('is-finished');
      opening.setAttribute('aria-hidden', 'true');
      unlockPage();
      hero.classList.remove('is-opening-arrival');
      void hero.offsetWidth;
      hero.classList.add('is-opening-arrival');
      if (opening.contains(document.activeElement)) {
        replayButton?.focus({ preventScroll: true });
      }
      hideTimer = window.setTimeout(() => {
        opening.hidden = true;
        hideTimer = null;
      }, 720);
    };

    const beginDive = (immediate) => {
      if (finished) return;
      clearTimers();
      if (immediate || reduceMotion) {
        complete();
        return;
      }
      opening.classList.add('is-diving');
      diveTimer = window.setTimeout(complete, DIVE_DURATION);
    };

    skipButton?.addEventListener('click', () => beginDive(true));
    replayButton?.addEventListener('click', resetOpening);

    opening.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') beginDive(true);
    });

    lockPage();
    fogController = reduceMotion ? null : createFog(canvas);
    scheduleFinish();
  }

  function restartCssAnimations(root) {
    root.querySelectorAll('*').forEach((node) => {
      const value = node.style.animation;
      node.style.animation = 'none';
      void node.offsetWidth;
      node.style.animation = value;
    });
  }

  function createFog(canvas) {
    if (!(canvas instanceof HTMLCanvasElement)) return null;
    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return null;

    let frame = 0;
    let running = true;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles = [];

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = Math.max(1, window.innerWidth);
      height = Math.max(1, window.innerHeight);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      const targetCount = width < 720 ? 24 : 42;
      particles = Array.from({ length: targetCount }, (_, index) => makeParticle(index, width, height));
    };

    const draw = (time) => {
      if (!running) return;
      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = 'screen';

      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy + Math.sin(time * .00035 + particle.phase) * .05;
        if (particle.x > width + particle.radius) particle.x = -particle.radius;
        if (particle.y < -particle.radius) particle.y = height + particle.radius;

        const gradient = context.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.radius
        );
        gradient.addColorStop(0, `rgba(192, 225, 217, ${particle.alpha})`);
        gradient.addColorStop(.45, `rgba(108, 163, 156, ${particle.alpha * .48})`);
        gradient.addColorStop(1, 'rgba(40, 83, 88, 0)');
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fill();
      });

      context.globalCompositeOperation = 'source-over';
      frame = window.requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });
    frame = window.requestAnimationFrame(draw);

    return {
      stop() {
        running = false;
        window.cancelAnimationFrame(frame);
        window.removeEventListener('resize', resize);
        context.clearRect(0, 0, width, height);
      }
    };
  }

  function makeParticle(index, width, height) {
    const seed = (index * 47 + 19) % 101;
    return {
      x: ((seed * 37) % 100) / 100 * width,
      y: ((seed * 71 + 11) % 100) / 100 * height,
      radius: 34 + (seed % 8) * 13,
      vx: .08 + (seed % 5) * .025,
      vy: -.015 - (seed % 3) * .012,
      alpha: .025 + (seed % 6) * .008,
      phase: seed * .19
    };
  }
})();
