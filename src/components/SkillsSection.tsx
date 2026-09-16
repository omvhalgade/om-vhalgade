import React, { useState, useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../lib/gsap';
import { KineticText } from './KineticText';

interface SkillCategory {
  id: string;
  category: string;
  badge: string;
  color: string;
  desc: string;
  skills: string[];
}

const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: 'frontend',
    category: 'Frontend Architecture',
    badge: '01 / UI & Architecture',
    color: '#0ea5e9',
    desc: 'Component hierarchies, reactive state machines, and performant web interfaces.',
    skills: [
      'TypeScript',
      'React 19',
      'Next.js',
      'Tailwind CSS',
      'HTML5 / Semantic Web',
      'CSS Modules',
      'Vue.js',
    ],
  },
  {
    id: 'backend',
    category: 'Backend & Databases',
    badge: '02 / Server & Storage',
    color: '#10b981',
    desc: 'High-throughput APIs, relational models, real-time sync, and authentication.',
    skills: [
      'Node.js',
      'Express',
      'RESTful APIs',
      'WebSockets',
      'PostgreSQL',
      'Supabase',
      'Firebase',
    ],
  },
  {
    id: 'creative',
    category: 'Interactive & Creative',
    badge: '03 / 3D & Animation',
    color: '#f43f5e',
    desc: 'Math-driven graphics, procedural shaders, physics engines, and kinetic interactions.',
    skills: [
      'Three.js',
      'WebGL',
      'Motion / Framer',
      'Canvas 2D',
      'SVG Animation',
      'Figma to Code',
    ],
  },
  {
    id: 'tooling',
    category: 'Tooling & Quality',
    badge: '04 / DevOps & Standards',
    color: '#8b5cf6',
    desc: 'Modern bundlers, automated testing, continuous delivery, and accessibility compliance.',
    skills: [
      'Vite',
      'Git & GitHub',
      'Docker',
      'Vitest / Jest',
      'CI / CD Pipelines',
      'Core Web Vitals',
      'WCAG 2.1 AA a11y',
    ],
  },
];

const FILTER_OPTIONS = [
  { id: 'all', label: 'All Stack' },
  { id: 'frontend', label: 'Frontend' },
  { id: 'backend', label: 'Backend & DB' },
  { id: 'creative', label: 'Creative & 3D' },
  { id: 'tooling', label: 'DevOps & Quality' },
];

export const SkillsSection: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  // GSAP 3D ScrollTrigger Entrance & Card Tilt
  useEffect(() => {
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cards = cardsRef.current.filter(Boolean) as HTMLDivElement[];
    if (!cards.length) return;

    const ctx = gsap.context(() => {
      if (!isReducedMotion) {
        // On mobile layouts, cascade entrance on scroll. On desktop, section transition crossfade reveals all cards cleanly.
        if (window.innerWidth <= 900) {
          // 3D Staggered Cascade Entrance on Scroll
          gsap.from(cards, {
            scrollTrigger: {
              trigger: gridRef.current,
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

          // Staggered pop-in for all chips
          const allChips = gridRef.current?.querySelectorAll('.skill-chip');
          if (allChips && allChips.length) {
            gsap.from(allChips, {
              scrollTrigger: {
                trigger: gridRef.current,
                start: 'top 78%',
              },
              scale: 0,
              opacity: 0,
              y: 12,
              duration: 0.5,
              stagger: 0.02,
              ease: 'back.out(2.4)',
              clearProps: 'transform,opacity',
            });
          }
        }

        // Ambient gentle harmonic floating oscillation on chips
        const chipTweens: gsap.core.Tween[] = [];
        cards.forEach((card, cIdx) => {
          const chips = card.querySelectorAll<HTMLElement>('.skill-chip');
          chips.forEach((chip, sIdx) => {
            const delay = (cIdx * 0.15) + (sIdx * 0.08);
            const tween = gsap.to(chip, {
              y: '-=3',
              duration: 2.2 + (sIdx % 3) * 0.4,
              ease: 'sine.inOut',
              repeat: -1,
              yoyo: true,
              delay,
            });
            chipTweens.push(tween);
          });
        });

        // Interactive 3D Perspective Tilt on Mouse Move
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
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Filter effect with GSAP
  const handleFilterSelect = (filterId: string) => {
    setActiveFilter(filterId);

    cardsRef.current.forEach((card) => {
      if (!card) return;
      const cardCategory = card.getAttribute('data-category');
      const isMatch = filterId === 'all' || cardCategory === filterId;

      if (isMatch) {
        gsap.to(card, {
          opacity: 1,
          scale: 1,
          duration: 0.35,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      } else {
        gsap.to(card, {
          opacity: 0.3,
          scale: 0.96,
          duration: 0.35,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      }
    });
  };

  // Trigger kinetic ripple wave across all skill chips
  const triggerKineticWave = () => {
    const chips = gridRef.current?.querySelectorAll<HTMLElement>('.skill-chip');
    if (!chips || !chips.length) return;

    gsap.timeline()
      .to(chips, {
        y: -14,
        scale: 1.22,
        rotate: (i) => (i % 2 === 0 ? 5 : -5),
        duration: 0.22,
        stagger: 0.025,
        ease: 'power2.out',
      })
      .to(chips, {
        y: 0,
        scale: 1,
        rotate: 0,
        duration: 0.6,
        stagger: 0.025,
        ease: 'elastic.out(1.2, 0.4)',
      });
  };

  // Chip click handler
  const handleChipClick = (skillName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSkill(skillName);

    const target = e.currentTarget as HTMLElement;
    gsap.timeline()
      .to(target, {
        scale: 1.35,
        y: -8,
        duration: 0.16,
        ease: 'back.out(3)',
      })
      .to(target, {
        scale: 1,
        y: 0,
        duration: 0.45,
        ease: 'elastic.out(1.2, 0.4)',
      });
  };

  return (
    <section id="skills" className="site-section" ref={sectionRef}>
      <div className="sec-head">
        <KineticText as="span" className="sec-pill" shimmer>
          Technical Toolkit
        </KineticText>
        <KineticText as="h2" className="sec-title">
          Technologies, tools, and methodologies I work with daily.
        </KineticText>
        <p className="sec-desc">
          A modern and resilient stack focused on type safety, modular design systems, sub-second latency, and scalable architecture.
        </p>

        {/* Interactive Filter & Action Controls */}
        <div className="toolkit-controls mt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="filter-chips flex flex-wrap gap-2">
            {FILTER_OPTIONS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`filter-btn px-4 py-2 rounded-full text-xs uppercase tracking-wider font-medium transition-all duration-200 border ${
                  activeFilter === f.id
                    ? 'bg-ink text-[var(--bg)] border-ink shadow-md'
                    : 'bg-[var(--glass)] text-ink border-[var(--hairline)] hover:border-ink hover:scale-105'
                }`}
                onClick={() => handleFilterSelect(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={triggerKineticWave}
            className="kinetic-wave-btn inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider border border-[var(--hairline)] bg-[var(--glass)] hover:bg-ink hover:text-[var(--bg)] transition-all duration-300 shadow-sm"
            title="Trigger GSAP kinetic elastic wave across all skill chips"
          >
            <span>Trigger Wave</span>
            <span className="text-sm">⚡</span>
          </button>
        </div>

        {selectedSkill && (
          <div className="selected-skill-banner mt-4 p-3 rounded-xl border border-[var(--hairline)] bg-[var(--glass)] flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-medium">
                Active Focus: <strong className="underline">{selectedSkill}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedSkill(null)}
              className="text-xs opacity-70 hover:opacity-100 px-2 py-1"
            >
              Clear &times;
            </button>
          </div>
        )}
      </div>

      <div className="skills-grid" ref={gridRef}>
        {SKILL_CATEGORIES.map((cat, idx) => (
          <div
            key={cat.id}
            ref={(el) => {
              cardsRef.current[idx] = el;
            }}
            data-category={cat.id}
            className="skill-card relative overflow-hidden transition-shadow duration-300"
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

            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-widest opacity-60 font-mono">
                {cat.badge}
              </span>
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
            </div>

            <KineticText as="h3" className="skill-cat-title">
              {cat.category}
            </KineticText>

            <p className="text-xs opacity-75 leading-relaxed mb-4" style={{ minHeight: '36px' }}>
              {cat.desc}
            </p>

            <div className="skill-chips flex flex-wrap gap-2">
              {cat.skills.map((skill) => (
                <span
                  key={skill}
                  className={`skill-chip inline-block transition-transform duration-200 cursor-pointer select-none ${
                    selectedSkill === skill ? 'ring-2 ring-ink scale-105' : ''
                  }`}
                  onClick={(e) => handleChipClick(skill, e)}
                  title={`Click to focus on ${skill}`}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
