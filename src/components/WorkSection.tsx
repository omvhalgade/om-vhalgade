import React, { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { KineticText } from './KineticText';

export const WorkSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReducedMotion) return;

    const ctx = gsap.context(() => {
      const cards = gridRef.current?.querySelectorAll('.project-card');
      if (cards && cards.length) {
        gsap.from(cards, {
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 82%',
            toggleActions: 'play none none none',
          },
          y: 50,
          opacity: 0,
          scale: 0.94,
          duration: 0.85,
          stagger: 0.15,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="work" className="site-section" ref={sectionRef}>
      <div className="sec-head">
        <KineticText as="span" className="sec-pill" shimmer>
          Projects
        </KineticText>
        <KineticText as="h2" className="sec-title">
          Works in progress &amp; upcoming experiments.
        </KineticText>
        <p className="sec-desc">
          I do not have completed projects yet. I am at the beginning of my journey, currently developing and experimenting with interactive web experiences. Projects will be showcased here as they are completed.
        </p>
      </div>

      <div className="grid-3" ref={gridRef}>
        <div className="card project-card cursor-pointer" id="project-card-1">
          <span className="card-num">01 / In Progress</span>
          <KineticText as="h3" className="card-title">
            Interactive Web Project
          </KineticText>
          <p className="card-text">
            Currently exploring modern frontend architecture, interactive web design, and fluid motion in active development.
          </p>
          <div className="card-actions">
            <span className="card-tag">In Development</span>
          </div>
        </div>

        <div className="card project-card cursor-pointer" id="project-card-2">
          <span className="card-num">02 / Exploration</span>
          <KineticText as="h3" className="card-title">
            Creative Coding
          </KineticText>
          <p className="card-text">
            Building interactive experiments that combine technology, design, and motion to create thoughtful digital interactions.
          </p>
          <div className="card-actions">
            <span className="card-tag">Experiment</span>
          </div>
        </div>

        <div className="card project-card cursor-pointer" id="project-card-3">
          <span className="card-num">03 / Learning</span>
          <KineticText as="h3" className="card-title">
            Future Showcase
          </KineticText>
          <p className="card-text">
            I do not have completed projects yet. Completed works, experiments, and source repositories will be featured here.
          </p>
          <div className="card-actions">
            <span className="card-tag">Upcoming</span>
          </div>
        </div>
      </div>
    </section>
  );
};
