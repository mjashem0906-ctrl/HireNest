/**
 * Global Micro-Interactions & Effects
 * Handles cursor effects, card tilts, scroll animations, and more
 */

export const initializeGlobalEffects = () => {
  // Try-catch wrappers to ensure dynamic resilience and prevent one failure from halting all effects
  try {
    // 1. Cursor Glow Trail Effect
    initCursorGlow();
  } catch (error) {
    console.warn("Failed to initialize Cursor Glow Effect:", error);
  }

  try {
    // 2. Card Tilt Effect
    initCardTilt();
  } catch (error) {
    console.warn("Failed to initialize Card Tilt Effect:", error);
  }

  try {
    // 3. Scroll-Triggered Fade In
    initScrollTriggerAnimations();
  } catch (error) {
    console.warn("Failed to initialize Scroll Animations:", error);
  }

  try {
    // 4. Input Label Float Effect
    initInputLabelFloat();
  } catch (error) {
    console.warn("Failed to initialize Input Label Float Effect:", error);
  }

  try {
    // 5. Magnetic Button Effect
    initMagneticButtons();
  } catch (error) {
    console.warn("Failed to initialize Magnetic Buttons:", error);
  }

  try {
    // 6. Notification Bell Shake
    initNotificationBell();
  } catch (error) {
    console.warn("Failed to initialize Notification Bell Shake:", error);
  }
};

/**
 * 1. CURSOR GLOW TRAIL
 */
function initCursorGlow() {
  if (!document.body) {
    window.addEventListener('DOMContentLoaded', initCursorGlow);
    return;
  }

  if (document.querySelector('.custom-cursor-dot')) return;

  const dot = document.createElement('div');
  dot.className = 'custom-cursor-dot';

  const ring = document.createElement('div');
  ring.className = 'custom-cursor-ring';

  const glow = document.createElement('div');
  glow.className = 'custom-cursor-glow';

  // Append glow first so it sits beneath dot and ring
  document.body.appendChild(glow);
  document.body.appendChild(dot);
  document.body.appendChild(ring);

  document.body.classList.add('custom-cursor-active');

  let mouseX = 0, mouseY = 0;
  let dotX = 0, dotY = 0;
  let ringX = 0, ringY = 0;
  let glowX = 0, glowY = 0;
  let isHidden = false;

  // Track real mouse position
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (isHidden) {
      isHidden = false;
      document.body.classList.remove('custom-cursor-hidden');
    }
  });

  // Linear Interpolation (lerp) loop for high performance GPU-accelerated positions
  function updateCursor() {
    dotX += (mouseX - dotX) * 0.35;
    dotY += (mouseY - dotY) * 0.35;

    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;

    // Organic slow-follow drag for the big glowing radial light aura (spotlight effect)
    glowX += (mouseX - glowX) * 0.08;
    glowY += (mouseY - glowY) * 0.08;

    dot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
    glow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0) translate(-50%, -50%)`;

    requestAnimationFrame(updateCursor);
  }
  requestAnimationFrame(updateCursor);

  // Dynamic Event Delegation for hover states across the SPA
  document.addEventListener('mouseover', (e) => {
    const target = e.target;
    if (!target) return;

    const clickable = target.closest('a, button, input, select, textarea, [role="button"], .clickable, .job-card, [onclick], .viewAllBtn, .lp-signin-btn, .lp-google-btn');

    if (clickable) {
      ring.classList.add('cursor-hover');
      dot.classList.add('cursor-hover');
      glow.classList.add('cursor-hover');
    }
  });

  document.addEventListener('mouseout', (e) => {
    const target = e.target;
    if (!target) return;

    const clickable = target.closest('a, button, input, select, textarea, [role="button"], .clickable, .job-card, [onclick], .viewAllBtn, .lp-signin-btn, .lp-google-btn');

    if (clickable) {
      const relatedTarget = e.relatedTarget;
      if (!relatedTarget || !relatedTarget.closest('a, button, input, select, textarea, [role="button"], .clickable, .job-card, [onclick], .viewAllBtn, .lp-signin-btn, .lp-google-btn')) {
        ring.classList.remove('cursor-hover');
        dot.classList.remove('cursor-hover');
        glow.classList.remove('cursor-hover');
      }
    }
  });

  // Click Interactions
  document.addEventListener('mousedown', () => {
    ring.classList.add('cursor-clicked');
  });

  document.addEventListener('mouseup', () => {
    ring.classList.remove('cursor-clicked');
  });

  // Viewport Leave/Enter smooth handling
  document.addEventListener('mouseleave', () => {
    isHidden = true;
    document.body.classList.add('custom-cursor-hidden');
  });

  document.addEventListener('mouseenter', () => {
    isHidden = false;
    document.body.classList.remove('custom-cursor-hidden');
  });
}

/**
 * 2. TILT EFFECT ON JOB CARDS
 */
function initCardTilt() {
  const cards = document.querySelectorAll('.job-card');

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      card.style.transform =
        `translateY(-8px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) scale(1.01)`;
      card.style.transformStyle = 'preserve-3d';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0) rotateY(0) rotateX(0) scale(1)';
      card.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';

      setTimeout(() => {
        card.style.transition = '';
      }, 500);
    });
  });
}

/**
 * 3. SCROLL-TRIGGERED FADE IN
 */
function initScrollTriggerAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll('.animate-on-scroll').forEach((el) => {
    observer.observe(el);
  });

  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    .animate-on-scroll {
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.5s ease, transform 0.5s ease;
    }
    .animate-on-scroll.visible {
      opacity: 1;
      transform: translateY(0);
    }
  `;
  document.head.appendChild(style);
}

/**
 * 4. INPUT LABEL FLOAT ON FOCUS
 */
function initInputLabelFloat() {
  const inputs = document.querySelectorAll('.form-group input');

  inputs.forEach((input) => {
    const label = input.parentElement.querySelector('label');
    if (!label) return;

    input.addEventListener('focus', () => {
      label.style.top = '-10px';
      label.style.fontSize = '11px';
      label.style.color = '#3B82F6';
    });

    input.addEventListener('blur', () => {
      if (input.value === '') {
        label.style.top = '50%';
        label.style.fontSize = 'inherit';
        label.style.color = 'var(--text-muted)';
      }
    });

    // Initial check
    if (input.value !== '') {
      label.style.top = '-10px';
      label.style.fontSize = '11px';
      label.style.color = '#3B82F6';
    }
  });
}

/**
 * 5. MAGNETIC BUTTON EFFECT
 */
function initMagneticButtons() {
  const magneticButtons = document.querySelectorAll('.btn-magnetic');

  magneticButtons.forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
      btn.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';

      setTimeout(() => {
        btn.style.transition = '';
      }, 500);
    });
  });
}

/**
 * 6. NOTIFICATION BELL SHAKE
 */
function initNotificationBell() {
  const bell = document.querySelector('.notif-bell');

  if (bell) {
    bell.addEventListener('mouseenter', () => {
      const svg = bell.querySelector('svg');
      if (svg) {
        svg.style.animation = 'bellShake 0.5s ease';

        setTimeout(() => {
          svg.style.animation = '';
        }, 500);
      }
    });
  }
}

/**
 * Utility: Add CSS animations class to elements on demand
 */
export const addScrollAnimation = (element) => {
  if (element) {
    element.classList.add('animate-on-scroll');
  }
};

/**
 * Utility: Trigger card entrance animation
 */
export const triggerCardEntrance = (container) => {
  const cards = container?.querySelectorAll('.job-card');
  if (!cards) return;

  cards.forEach((card, index) => {
    card.style.animation = `fadeSlideUp 0.4s ease ${index * 50}ms both`;
  });

  // Add keyframes if not present
  if (!document.querySelector('style[data-card-entrance]')) {
    const style = document.createElement('style');
    style.setAttribute('data-card-entrance', 'true');
    style.textContent = `
      @keyframes fadeSlideUp {
        from { opacity: 0; transform: translateY(24px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }
};

export default initializeGlobalEffects;
