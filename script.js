const menuButton = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
menuButton.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});
navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  navLinks.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
}));
document.getElementById('year').textContent = new Date().getFullYear();



/* ==================================
   INTERACTIVE CELESTIAL STARFIELD
   ================================== */

(() => {
  const canvas = document.getElementById('constellation-canvas');
  const hero = document.querySelector('.hero');

  if (!canvas || !hero) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  );

  let width = 0;
  let height = 0;
  let stars = [];
  let frameId = null;
  let mouse = { x: -1000, y: -1000 };
  let connectionStrength = 0;

  // Curated star positions for a natural celestial feel
  const positions = [
    [.08,.20], [.18,.38], [.29,.17], [.36,.46],
    [.48,.22], [.57,.39], [.69,.16], [.78,.37],
    [.90,.19], [.12,.73], [.25,.63], [.39,.79],
    [.51,.61], [.64,.77], [.75,.61], [.88,.79],
    [.95,.51], [.04,.51], [.44,.08], [.59,.10],
    [.32,.31], [.72,.90], [.20,.90], [.84,.08],
    [.54,.85], [.94,.68], [.13,.52], [.67,.48]
  ];

  function resize() {
    const rect = hero.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    width = rect.width;
    height = rect.height;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    stars = positions.map(([x, y], index) => ({
      x: x * width,
      y: y * height,
      size: index % 5 === 0 ? 5 : 2.5,
      phase: index * 2.4
    }));

    if (reducedMotion.matches) render(0);
  }

  function drawStar(x, y, size, opacity) {
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = opacity;
    ctx.fillStyle = '#ad7185';

    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.quadraticCurveTo(
      size * 0.18, -size * 0.18, size, 0
    );
    ctx.quadraticCurveTo(
      size * 0.18, size * 0.18, 0, size
    );
    ctx.quadraticCurveTo(
      -size * 0.18, size * 0.18, -size, 0
    );
    ctx.quadraticCurveTo(
      -size * 0.18, -size * 0.18, 0, -size
    );

    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function render(time) {
    ctx.clearRect(0, 0, width, height);

    const target = mouse.x >= 0 ? 1 : 0;

    connectionStrength +=
      (target - connectionStrength) * 0.08;

    // Draw connections only around the cursor
    stars.forEach((star, index) => {
      const mouseDistance = Math.hypot(
        star.x - mouse.x,
        star.y - mouse.y
      );

      if (mouseDistance > 155) return;

      const nearest = stars
        .map((other, j) => ({
          index: j,
          distance: Math.hypot(
            star.x - other.x,
            star.y - other.y
          )
        }))
        .filter(item =>
          item.index !== index &&
          item.distance < Math.min(150, width * 0.35)
        )
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 2);

      nearest.forEach(({ index: j }) => {
        if (j < index) return;

        const other = stars[j];

        const midX = (star.x + other.x) / 2;
        const midY = (star.y + other.y) / 2;

        const cursorDistance = Math.hypot(
          midX - mouse.x,
          midY - mouse.y
        );

        const opacity =
          Math.max(0, 1 - cursorDistance / 170) *
          connectionStrength *
          0.68;

        if (opacity < 0.01) return;

        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(other.x, other.y);
        ctx.strokeStyle =
          `rgba(169, 104, 130, ${opacity})`;
        ctx.lineWidth = 1.1;
        ctx.stroke();
      });
    });

    // Draw our delicate stars
    stars.forEach(star => {
      const twinkle = reducedMotion.matches
        ? 0
        : Math.sin(time * 0.0014 + star.phase) * 0.1;

      const hover = Math.max(
        0,
        1 - Math.hypot(
          star.x - mouse.x,
          star.y - mouse.y
        ) / 110
      ) * connectionStrength;

      drawStar(
        star.x,
        star.y,
        star.size + hover,
        Math.min(1, 0.62 + twinkle + hover * 0.3)
      );
    });
  }

  function animate(time) {
    render(time);
    frameId = requestAnimationFrame(animate);
  }

  function start() {
    if (frameId !== null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }

    resize();

    if (!reducedMotion.matches) {
      frameId = requestAnimationFrame(animate);
    }
  }

  hero.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch') return;
    if (reducedMotion.matches) return;

    const rect = hero.getBoundingClientRect();

    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
  });

  hero.addEventListener('pointerleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  window.addEventListener('resize', start);

  reducedMotion.addEventListener('change', start);

  start();
})();
