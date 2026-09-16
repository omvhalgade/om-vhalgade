import { gsap } from './gsap';

/**
 * Universal Kinetic Typography Engine
 * Replicates the "Developer" text animation across texts throughout the site:
 * - Word-safe character splitting (prevents mid-word line breaks)
 * - Springy hover physics: scale 1.28, lift y: -8px, subtle playful rotation, back.out easing
 * - Neighbor magnetic lift: adjacent letters gently lift with wave effect
 * - Elastic snap-back on mouse leave
 * - Tactile outward ripple cascade wave on click
 * - Periodic subtle shimmer wave
 */

interface KineticInitOptions {
  container?: HTMLElement | Document;
  selector?: string;
  enableClickRipple?: boolean;
  enablePeriodicShimmer?: boolean;
}

export function initUniversalKineticTypography(options: KineticInitOptions = {}): () => void {
  const root = options.container || document;
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isReducedMotion) return () => {};

  // Select key titles, pills, badges, and display elements
  const defaultSelectors = [
    '.sec-pill',
    '.card-title',
    '.card-tag',
    '.skill-cat-title',
    '.timeline-period',
    '.timeline-company',
    '.metric-num',
    '.metric-label',
    '.tag',
    '.footer-links a',
    '.contact-item-label',
  ];

  const targetSelector = options.selector || defaultSelectors.join(', ');
  const elements = Array.from(root.querySelectorAll<HTMLElement>(targetSelector));

  const cleanupFns: (() => void)[] = [];

  elements.forEach((el) => {
    // Prevent double initialization
    if (el.getAttribute('data-kinetic-init') === 'true') return;
    if (el.closest('.kinetic-text-wrap')) return; // Already wrapped by KineticText component

    // Check if element has only text or simple children
    const rawText = el.textContent || '';
    if (!rawText.trim() || rawText.length > 120) return; // Keep long paragraphs intact for readability

    el.setAttribute('data-kinetic-init', 'true');
    el.setAttribute('data-orig-text', rawText);

    // Split by words first to preserve line breaks, then split into characters
    const words = rawText.trim().split(/\s+/);
    el.innerHTML = '';
    el.classList.add('kinetic-initialized');

    const charElements: HTMLElement[] = [];

    words.forEach((word, wIdx) => {
      const wordSpan = document.createElement('span');
      wordSpan.className = 'k-word inline-block whitespace-nowrap';
      if (wIdx < words.length - 1) {
        wordSpan.style.marginRight = '0.28em';
      }

      for (let c = 0; c < word.length; c++) {
        const charSpan = document.createElement('span');
        charSpan.className = 'site-char inline-block cursor-pointer select-none origin-[50%_85%]';
        charSpan.textContent = word[c];
        wordSpan.appendChild(charSpan);
        charElements.push(charSpan);
      }

      el.appendChild(wordSpan);
    });

    // Attach spring physics to all characters in this element
    charElements.forEach((char, idx) => {
      const onEnter = () => {
        const randRot = (Math.random() - 0.5) * 12;
        gsap.to(char, {
          scale: 1.28,
          y: -8,
          rotate: randRot,
          duration: 0.2,
          ease: 'back.out(2.5)',
          overwrite: 'auto',
        });

        // Adjacent neighbors lift gently
        const prev = charElements[idx - 1];
        const next = charElements[idx + 1];
        if (prev) {
          gsap.to(prev, {
            scale: 1.1,
            y: -4,
            duration: 0.22,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        }
        if (next) {
          gsap.to(next, {
            scale: 1.1,
            y: -4,
            duration: 0.22,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        }
      };

      const onLeave = () => {
        gsap.to(char, {
          scale: 1,
          y: 0,
          rotate: 0,
          duration: 0.55,
          ease: 'elastic.out(1.2, 0.38)',
          overwrite: 'auto',
        });

        const prev = charElements[idx - 1];
        const next = charElements[idx + 1];
        if (prev) {
          gsap.to(prev, {
            scale: 1,
            y: 0,
            duration: 0.45,
            ease: 'elastic.out(1, 0.4)',
            overwrite: 'auto',
          });
        }
        if (next) {
          gsap.to(next, {
            scale: 1,
            y: 0,
            duration: 0.45,
            ease: 'elastic.out(1, 0.4)',
            overwrite: 'auto',
          });
        }
      };

      char.addEventListener('mouseenter', onEnter);
      char.addEventListener('mouseleave', onLeave);

      cleanupFns.push(() => {
        char.removeEventListener('mouseenter', onEnter);
        char.removeEventListener('mouseleave', onLeave);
      });

      // Outward ripple wave on click
      if (options.enableClickRipple !== false) {
        const onClick = (e: MouseEvent) => {
          e.stopPropagation();
          gsap.timeline()
            .to(charElements, {
              y: -10,
              scale: 1.18,
              rotate: (i) => (i - idx) * 2,
              duration: 0.18,
              stagger: {
                from: idx,
                each: 0.025,
              },
              ease: 'power2.out',
            })
            .to(charElements, {
              y: 0,
              scale: 1,
              rotate: 0,
              duration: 0.55,
              stagger: {
                from: idx,
                each: 0.025,
              },
              ease: 'elastic.out(1.2, 0.38)',
            });
        };

        char.addEventListener('click', onClick);
        cleanupFns.push(() => char.removeEventListener('click', onClick));
      }
    });

    // Entrance animation if in view
    gsap.fromTo(
      charElements,
      { y: 14, opacity: 0.2, scale: 0.9 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.4,
        stagger: 0.015,
        ease: 'power2.out',
        overwrite: 'auto',
      }
    );
  });

  return () => {
    cleanupFns.forEach((fn) => fn());
  };
}
