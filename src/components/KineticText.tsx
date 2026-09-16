import React, { useRef, useEffect } from 'react';
import { gsap } from '../lib/gsap';

interface KineticTextProps {
  children: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
  hoverEffect?: boolean;
  shimmer?: boolean;
  clickRipple?: boolean;
}

export const KineticText: React.FC<KineticTextProps> = ({
  children,
  className = '',
  as: Component = 'span',
  hoverEffect = true,
  shimmer = false,
  clickRipple = true,
}) => {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const chars: HTMLElement[] = Array.from(el.querySelectorAll<HTMLElement>('.k-char'));
    if (!chars.length) return;

    const cleanupFns: (() => void)[] = [];

    // Hover effect with magnetic neighbor lift
    if (hoverEffect) {
      chars.forEach((char: HTMLElement, idx: number) => {
        const onEnter = () => {
          const randRot = (Math.random() - 0.5) * 14;
          gsap.to(char, {
            scale: 1.28,
            y: -8,
            rotate: randRot,
            duration: 0.22,
            ease: 'back.out(2.4)',
            overwrite: 'auto',
          });

          // Adjacent letters lift gently
          const prev = chars[idx - 1];
          const next = chars[idx + 1];
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
            duration: 0.6,
            ease: 'elastic.out(1.2, 0.36)',
            overwrite: 'auto',
          });

          const prev = chars[idx - 1];
          const next = chars[idx + 1];
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

        // Click ripple
        if (clickRipple) {
          const onClick = (e: MouseEvent) => {
            e.stopPropagation();
            gsap.timeline()
              .to(chars, {
                y: -12,
                scale: 1.16,
                rotate: (i: number) => (i - idx) * 2,
                duration: 0.2,
                stagger: {
                  from: idx,
                  each: 0.028,
                },
                ease: 'power2.out',
              })
              .to(chars, {
                y: 0,
                scale: 1,
                rotate: 0,
                duration: 0.6,
                stagger: {
                  from: idx,
                  each: 0.028,
                },
                ease: 'elastic.out(1.2, 0.38)',
              });
          };

          char.addEventListener('click', onClick);
          cleanupFns.push(() => char.removeEventListener('click', onClick));
        }
      });
    }

    // Periodic subtle shimmer
    if (shimmer) {
      const interval = setInterval(() => {
        gsap.to(chars, {
          scale: 1.1,
          y: -3,
          duration: 0.16,
          stagger: 0.03,
          yoyo: true,
          repeat: 1,
          ease: 'power2.out',
        });
      }, 5500);

      cleanupFns.push(() => clearInterval(interval));
    }

    return () => {
      cleanupFns.forEach((fn) => fn());
    };
  }, [children, hoverEffect, shimmer, clickRipple]);

  // Split string into words, and words into characters
  const words = typeof children === 'string' ? children.split(' ') : [];
  const isBlock = ['h1', 'h2', 'h3', 'h4', 'p', 'div'].includes(Component);

  return React.createElement(
    Component,
    {
      ref: containerRef,
      className: `kinetic-text-wrap ${isBlock ? 'block w-full text-left' : 'inline-block'} ${className}`,
    },
    words.map((word, wIdx) => (
      <span key={wIdx} className="k-word inline-block whitespace-nowrap mr-[0.28em]">
        {Array.from(word).map((char, cIdx) => (
          <span
            key={cIdx}
            className="k-char inline-block cursor-pointer select-none transition-colors duration-150 origin-[50%_85%]"
          >
            {char}
          </span>
        ))}
      </span>
    ))
  );
};
