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
 * 1. CURSOR GLOW TRAIL (DISABLED - RESTORED NORMAL BROWSER CURSOR)
 */
function initCursorGlow() {
  if (!document.body) return;
  // Clean up any existing custom cursor DOM elements if present
  const elements = document.querySelectorAll('.custom-cursor-dot, .custom-cursor-ring, .custom-cursor-glow');
  elements.forEach((el) => el.remove());
  document.body.classList.remove('custom-cursor-active', 'custom-cursor-hidden');
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
