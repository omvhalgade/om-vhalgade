/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { gsap } from './lib/gsap';
import { initUniversalKineticTypography } from './lib/kineticTextInit';
import { useScrollReveal } from './lib/useScrollReveal';
import { syncNavRenderedHeight } from './lib/navMeasurement';
import { Hero } from './components/Hero';
import { FloatingNav } from './components/FloatingNav';
import { AboutSection } from './components/AboutSection';
import { WorkSection } from './components/WorkSection';
import { SkillsSection } from './components/SkillsSection';
import { ExperienceSection } from './components/ExperienceSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { MousePointerInteraction } from './components/MousePointerInteraction';

export default function App() {
  const [isDark, setIsDark] = useState<boolean>(false);
  const [isDim, setIsDim] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('hero');

  // Activate reliable scroll-reveal animations across sections
  useScrollReveal();

  // Handle Theme Toggle
  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      const root = document.documentElement;
      if (next) {
        root.setAttribute('data-mode', 'dark');
        root.style.setProperty('--bg', '#151016');
        root.style.setProperty('--ink', '#ffffff');
        root.style.setProperty('--hairline', 'rgba(255,255,255,.55)');
        root.style.setProperty('--glass', 'rgba(255,255,255,.08)');
      } else {
        root.removeAttribute('data-mode');
        root.style.removeProperty('--bg');
        root.style.removeProperty('--ink');
        root.style.removeProperty('--hairline');
        root.style.removeProperty('--glass');
      }
      return next;
    });
  }, []);

  // Handle Brightness Toggle
  const toggleBrightness = useCallback(() => {
    setIsDim((prev) => !prev);
  }, []);

  // Handle Mobile Menu Toggle
  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.setAttribute('data-menu', 'open');
      } else {
        document.documentElement.removeAttribute('data-menu');
      }
      return next;
    });
  }, []);

  // Synchronize real rendered nav height on mount
  useEffect(() => {
    syncNavRenderedHeight();
  }, []);

  // Smooth scroll to section
  const scrollToSection = useCallback((sectionId: string) => {
    // Close mobile menu
    setIsMenuOpen(false);
    document.documentElement.removeAttribute('data-menu');

    if (sectionId === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setActiveSection('hero');
      if (window.history && window.history.pushState) {
        window.history.pushState(null, '', '#hero');
      }
      return;
    }

    const el = document.getElementById(sectionId);
    if (!el) return;

    const navOffset = syncNavRenderedHeight() + 16;
    const rect = el.getBoundingClientRect();
    const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    const targetPos = Math.max(0, rect.top + scrollY - navOffset);

    window.scrollTo({
      top: targetPos,
      behavior: 'smooth',
    });

    setActiveSection(sectionId);
    if (window.history && window.history.pushState) {
      window.history.pushState(null, '', `#${sectionId}`);
    }
  }, []);

  // Scroll listener for floating nav visibility and scroll spy
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
      const windowHeight = window.innerHeight;

      if (scrollY > 60) {
        document.body.classList.add('is-scrolled');
      } else {
        document.body.classList.remove('is-scrolled');
      }

      if (scrollY < 180) {
        setActiveSection('hero');
        return;
      }

      const sectionIds = ['about', 'work', 'skills', 'experience', 'contact'];
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const id = sectionIds[i];
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= windowHeight * 0.42) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Card hover animations and subtle kinetic interactions with GSAP
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const cards = document.querySelectorAll('.project-card');
    cards.forEach((card) => {
      gsap.set(card, { transformOrigin: '50% 50%', force3D: true });

      const onEnter = () => {
        gsap.to(card, {
          y: -7,
          scale: 1.022,
          boxShadow: '0 18px 36px -8px rgba(0, 0, 0, 0.11)',
          duration: 0.35,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      };

      const onLeave = () => {
        gsap.to(card, {
          y: 0,
          scale: 1,
          boxShadow: '0 0px 0px rgba(0, 0, 0, 0)',
          duration: 0.42,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      };

      card.addEventListener('mouseenter', onEnter);
      card.addEventListener('mouseleave', onLeave);
    });

    // Initialize kinetic typography across all sections
    const cleanupKinetic = initUniversalKineticTypography();

    return () => {
      cleanupKinetic();
    };
  }, []);

  return (
    <div>
      {/* Premium fluid mouse-pointer trail & typography interaction */}
      <MousePointerInteraction isDark={isDark} />

      {/* Floating Header / Dock */}
      <FloatingNav
        activeSection={activeSection}
        onNavigate={scrollToSection}
        onToggleTheme={toggleTheme}
      />

      {/* Standard Natural Document Flow Sections */}
      <main className="site-sections-container site-content" id="site-sections-container">
        {/* Section 0: Hero */}
        <div className="section-wrapper" id="section-hero-wrapper">
          <Hero
            isDark={isDark}
            onToggleTheme={toggleTheme}
            isDim={isDim}
            onToggleBrightness={toggleBrightness}
            isMenuOpen={isMenuOpen}
            onToggleMenu={toggleMenu}
            onNavigate={scrollToSection}
          />
        </div>

        <hr className="site-divider" />

        {/* Section 1: About */}
        <div className="section-wrapper reveal-section" id="section-about-wrapper">
          <AboutSection />
        </div>

        <hr className="site-divider" />

        {/* Section 2: Work */}
        <div className="section-wrapper reveal-section" id="section-work-wrapper">
          <WorkSection />
        </div>

        <hr className="site-divider" />

        {/* Section 3: Skills */}
        <div className="section-wrapper reveal-section" id="section-skills-wrapper">
          <SkillsSection />
        </div>

        <hr className="site-divider" />

        {/* Section 4: Experience */}
        <div className="section-wrapper reveal-section" id="section-experience-wrapper">
          <ExperienceSection />
        </div>

        <hr className="site-divider" />

        {/* Section 5: Contact & Footer */}
        <div className="section-wrapper reveal-section" id="section-contact-wrapper">
          <ContactSection />
          <Footer onNavigate={scrollToSection} />
        </div>
      </main>
    </div>
  );
}
