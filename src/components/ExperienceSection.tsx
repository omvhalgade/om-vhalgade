import React, { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../lib/gsap';
import { KineticText } from './KineticText';

interface MilestoneData {
  id: string;
  title: string;
  desc: string;
}

const MILESTONES: MilestoneData[] = [
  {
    id: 'academic',
    title: 'Department of Computer Science',
    desc: 'B.Sc. Computer Science, affiliated with Savitribai Phule Pune University (SPPU), 2024 pattern curriculum, expected graduation 2026.',
  },
  {
    id: 'creative',
    title: 'Self-Driven Engineering',
    desc: 'Ongoing self-directed practice in frontend development, animation, and interactive web design.',
  },
  {
    id: 'foundation',
    title: 'Hands-on Prototyping',
    desc: 'Hands-on learning through building, experimenting, and iterating on real projects.',
  },
];

export const ExperienceSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const items = itemRefs.current.filter(Boolean) as HTMLDivElement[];
    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!items.length) return;

    const cleanupFns: (() => void)[] = [];

    const ctx = gsap.context(() => {
      // 1. 3D Staggered Cascade Entrance on Scroll (identical to Technical Toolkit)
      if (!isReducedMotion) {
        gsap.from(items, {
          scrollTrigger: {
            trigger: listRef.current || sectionRef.current,
            start: 'top 82%',
            toggleActions: 'play none none none',
          },
          y: 75,
          rotateX: -22,
          opacity: 0,
          scale: 0.94,
          duration: 0.9,
          stagger: 0.12,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
        });
      }

      // 2. Interactive 3D Perspective Tilt & Glare on Mouse Move (identical to Technical Toolkit)
      if (!isReducedMotion && cards.length) {
        cards.forEach((card) => {
          const glare = card.querySelector<HTMLElement>('.card-glare');

          const onMouseMove = (e: MouseEvent) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((centerY - y) / centerY) * 12; // Max 12 deg
            const rotateY = ((x - centerX) / centerX) * 12;

            gsap.to(card, {
              rotateX,
              rotateY,
              transformPerspective: 900,
              duration: 0.25,
              ease: 'power2.out',
              overwrite: 'auto',
            });

            if (glare) {
              const glareX = (x / rect.width) * 100;
              const glareY = (y / rect.height) * 100;
              glare.style.opacity = '0.35';
              glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.4) 0%, transparent 60%)`;
            }
          };

          const onMouseLeave = () => {
            gsap.to(card, {
              rotateX: 0,
              rotateY: 0,
              duration: 0.6,
              ease: 'elastic.out(1, 0.45)',
              overwrite: 'auto',
            });
            if (glare) {
              glare.style.opacity = '0';
            }
          };

          card.addEventListener('mousemove', onMouseMove);
          card.addEventListener('mouseleave', onMouseLeave);

          cleanupFns.push(() => {
            card.removeEventListener('mousemove', onMouseMove);
            card.removeEventListener('mouseleave', onMouseLeave);
          });
        });
      }
    }, sectionRef);

    // Refresh ScrollTrigger calculations after initial mount and frame settling
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    return () => {
      clearTimeout(timer);
      cleanupFns.forEach((fn) => fn());
      ctx.revert();
    };
  }, []);

  return (
    <section id="experience" className="site-section relative" ref={sectionRef}>
      <div className="sec-head">
        <KineticText as="span" className="sec-pill" shimmer>
          Education &amp; Journey
        </KineticText>
        <KineticText as="h2" className="sec-title">
          Academic foundations and continuous learning journey.
        </KineticText>
        <p className="sec-desc">
          Dedicated to Computer Science fundamentals, programming, frontend development, and interactive web design. Each milestone animates into view through individual GSAP ScrollTrigger choreography.
        </p>
      </div>

      {/* Interactive Timeline Layout */}
      <div className="timeline-container relative mt-8 w-full" style={{ perspective: 1000 }}>
        <div className="timeline-list flex flex-col gap-6 w-full" ref={listRef}>
          {MILESTONES.map((m, idx) => (
            <div
              key={m.id}
              ref={(el) => {
                itemRefs.current[idx] = el;
              }}
              className="timeline-item-wrapper relative w-full"
            >
              {/* Milestone Card Container with 3D tilt and single cohesive left border */}
              <div
                ref={(el) => {
                  cardRefs.current[idx] = el;
                }}
                className="milestone-card relative overflow-hidden transition-shadow duration-300"
                style={{
                  transformStyle: 'preserve-3d',
                  willChange: 'transform',
                }}
              >
                {/* Dynamic Glare Overlay */}
                <div
                  className="card-glare pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300"
                  style={{ mixBlendMode: 'overlay' }}
                />

                {/* Title */}
                <KineticText as="h3" className="milestone-title">
                  {m.title}
                </KineticText>

                {/* Description */}
                <p className="milestone-desc">
                  {m.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
