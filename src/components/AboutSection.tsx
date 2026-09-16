import React, { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { KineticText } from './KineticText';

export const AboutSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReducedMotion) return;

    const ctx = gsap.context(() => {
      const cards = cardsRef.current?.querySelectorAll('.card');
      if (cards && cards.length) {
        gsap.from(cards, {
          scrollTrigger: {
            trigger: cardsRef.current,
            start: 'top 82%',
            toggleActions: 'play none none none',
          },
          y: 45,
          opacity: 0,
          scale: 0.96,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power2.out',
          clearProps: 'transform,opacity',
        });
      }

      const metrics = metricsRef.current?.querySelectorAll('.metric-item');
      if (metrics && metrics.length) {
        gsap.from(metrics, {
          scrollTrigger: {
            trigger: metricsRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
          y: 30,
          opacity: 0,
          scale: 0.9,
          duration: 0.7,
          stagger: 0.1,
          ease: 'back.out(1.8)',
          clearProps: 'transform,opacity',
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="about" className="site-section" ref={sectionRef}>
      <div className="sec-head">
        <KineticText as="span" className="sec-pill" shimmer>
          About Me
        </KineticText>
        <KineticText as="h2" className="sec-title">
          Aspiring creative developer &amp; Computer Science student.
        </KineticText>
        <p className="sec-desc">
          I’m Om Vhalgade, a Computer Science student and aspiring creative developer focused on building modern, interactive web experiences. I’m currently developing my skills in programming, frontend development and interactive web design. I enjoy combining technology, design and motion to create digital experiences that feel thoughtful and engaging. I’m at the beginning of my journey and continuously learning, experimenting and improving my skills.
        </p>
      </div>

      <div className="grid-3" ref={cardsRef}>
        <div className="card">
          <span className="card-num">01 / Focus</span>
          <KineticText as="h3" className="card-title">
            Creative Development
          </KineticText>
          <p className="card-text">
            Developing skills in programming, frontend development, and interactive web design to build engaging digital experiences.
          </p>
          <span className="card-tag">Continuous Learning</span>
        </div>

        <div className="card">
          <span className="card-num">02 / Philosophy</span>
          <KineticText as="h3" className="card-title">
            Technology &amp; Motion
          </KineticText>
          <p className="card-text">
            Combining technology, design, and motion to create web experiences that feel thoughtful, tactile, and engaging.
          </p>
          <span className="card-tag">Interactive Craft</span>
        </div>

        <div className="card">
          <span className="card-num">03 / Education</span>
          <KineticText as="h3" className="card-title">
            B.Sc. Computer Science
          </KineticText>
          <p className="card-text">
            MET Bhujbal Knowledge City, Nashik &bull; Affiliated with Savitribai Phule Pune University (SPPU).
          </p>
          <span className="card-tag">2026 – Present</span>
        </div>
      </div>

      <div className="metrics-bar" ref={metricsRef}>
        <div className="metric-item">
          <KineticText as="div" className="metric-num">
            2026
          </KineticText>
          <div className="metric-label">B.Sc. Computer Science (MET BKC)</div>
        </div>
        <div className="metric-item">
          <KineticText as="div" className="metric-num">
            SPPU
          </KineticText>
          <div className="metric-label">Savitribai Phule Pune University</div>
        </div>
        <div className="metric-item">
          <KineticText as="div" className="metric-num">
            100%
          </KineticText>
          <div className="metric-label">Dedication to creative development</div>
        </div>
        <div className="metric-item">
          <KineticText as="div" className="metric-num">
            Daily
          </KineticText>
          <div className="metric-label">Learning, experimenting &amp; improving</div>
        </div>
      </div>
    </section>
  );
};
