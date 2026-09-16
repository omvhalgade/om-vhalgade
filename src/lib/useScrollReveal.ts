import { useEffect } from 'react';
import { gsap, ScrollTrigger } from './gsap';

export function useScrollReveal() {
  useEffect(() => {
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReducedMotion) return;

    const ctx = gsap.context(() => {
      // Find all site sections (excluding hero which is in initial viewport)
      const sections = document.querySelectorAll<HTMLElement>('.reveal-section');

      sections.forEach((section) => {
        // Reveal animation for section header & text
        const secHead = section.querySelector('.sec-head');
        if (secHead) {
          gsap.from(secHead, {
            scrollTrigger: {
              trigger: section,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
            opacity: 0,
            y: 40,
            duration: 0.7,
            ease: 'power2.out',
            clearProps: 'transform,opacity',
          });
        } else {
          // If no .sec-head, reveal the section root directly
          gsap.from(section, {
            scrollTrigger: {
              trigger: section,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
            opacity: 0,
            y: 40,
            duration: 0.7,
            ease: 'power2.out',
            clearProps: 'transform,opacity',
          });
        }

        // Stagger reveal for card grids (about, work, skills, experience, contact)
        const cards = section.querySelectorAll('.card, .skill-group-card, .metric-item, .contact-card');
        if (cards && cards.length > 0) {
          gsap.from(cards, {
            scrollTrigger: {
              trigger: cards[0],
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
            opacity: 0,
            y: 35,
            scale: 0.97,
            duration: 0.7,
            stagger: 0.1,
            ease: 'power2.out',
            clearProps: 'transform,opacity',
          });
        }
      });
    });

    // Refresh ScrollTrigger once DOM layout and images settle
    ScrollTrigger.refresh();

    const handleLoad = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener('load', handleLoad);

    return () => {
      window.removeEventListener('load', handleLoad);
      ctx.revert();
    };
  }, []);
}
