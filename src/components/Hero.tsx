import React, { useEffect, useRef } from 'react';
import { RollingWord } from './RollingWord';

interface HeroProps {
  isDark: boolean;
  onToggleTheme: () => void;
  isDim: boolean;
  onToggleBrightness: () => void;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onNavigate: (sectionId: string) => void;
}

export const Hero: React.FC<HeroProps> = ({
  onToggleTheme,
  isDim,
  onToggleBrightness,
  isMenuOpen,
  onToggleMenu,
  onNavigate,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Video mouse scrubbing and continuous scroll rotation effect
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let prevX: number | null = null;
    let mouseOffset = 0;
    let targetTime = 0;
    let seeking = false;
    let requested = -1;
    const SENSITIVITY = 0.8;
    const EPSILON = 0.04;

    const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);
    const getDuration = () => (Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0);

    const pump = () => {
      if (seeking || Math.abs(targetTime - video.currentTime) < EPSILON) return;
      seeking = true;
      requested = targetTime;
      try {
        video.currentTime = targetTime;
      } catch {
        seeking = false;
      }
    };

    const handleSeeked = () => {
      seeking = false;
      if (Math.abs(targetTime - requested) >= EPSILON) {
        pump();
      }
    };

    video.addEventListener('seeked', handleSeeked);
    video.pause();

    const updateRotation = () => {
      const d = getDuration();
      if (!d) return;

      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const scrollProgress = window.scrollY / maxScroll;
      // Scrolling down -> character smoothly rotates in one direction
      // Scrolling back up -> character smoothly rotates back in opposite direction
      // Rotation is smooth and subtle, working continuously throughout the page
      const scrollContribution = scrollProgress * d * 0.85;

      let total = scrollContribution + mouseOffset;
      // Smoothly wrap within video duration
      total = ((total % d) + d) % d;
      targetTime = clamp(total, 0.001, d - 0.001);
      pump();
    };

    const anchor = () => {
      targetTime = video.currentTime || 0.001;
      if (!video.currentTime) {
        video.currentTime = 0.001;
      }
      updateRotation();
    };

    video.addEventListener('loadeddata', anchor, { once: true });
    if (video.readyState >= 2) anchor();

    const handleScroll = () => {
      updateRotation();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const d = getDuration();
      if (prevX === null || !d) {
        prevX = e.clientX;
        return;
      }
      const delta = prevX - e.clientX;
      prevX = e.clientX;
      if (!delta) return;
      mouseOffset += (delta / window.innerWidth) * SENSITIVITY * d;
      updateRotation();
    };

    const resetPointer = () => {
      prevX = null;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', resetPointer);
    window.addEventListener('blur', resetPointer);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', resetPointer);
      window.removeEventListener('blur', resetPointer);
      video.removeEventListener('seeked', handleSeeked);
    };
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    onNavigate(id);
  };

  return (
    <main className="stage" id="hero">
      <div
        className="bust"
        role="img"
        aria-label="Translucent iridescent figure with light tracing through it, turning to its left"
      >
        <video
          ref={videoRef}
          className="bust-v"
          style={{
            filter: isDim
              ? 'brightness(0.85) saturate(1.1)'
              : 'brightness(1.18) saturate(1.22)',
          }}
          muted
          playsInline
          loop
          preload="auto"
          disablePictureInPicture
          tabIndex={-1}
          aria-hidden="true"
          src="https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/24f3c998-86fb-4f1d-9906-07c7fa740f8a.mp4"
        />
      </div>

      {/* Mobile Burger Button */}
      <button
        className="burger pin pin-tl"
        type="button"
        aria-label="Menu"
        aria-expanded={isMenuOpen}
        aria-controls="primary-nav"
        onClick={onToggleMenu}
      >
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect x="3" y="8.4" width="18" height="1.7" rx=".85" />
          <rect x="3" y="13.9" width="18" height="1.7" rx=".85" />
        </svg>
      </button>

      {/* Primary Navigation */}
      <nav className="nav pin pin-tl" id="primary-nav" aria-label="Primary">
        <ul className="col-a">
          <li>
            <a href="#about" className="lead" onClick={(e) => handleNavClick(e, 'about')}>
              About
            </a>
          </li>
          <li>
            <a href="#work" onClick={(e) => handleNavClick(e, 'work')}>
              Work
            </a>
          </li>
          <li>
            <a href="#skills" onClick={(e) => handleNavClick(e, 'skills')}>
              Skills
            </a>
          </li>
        </ul>
        <ul className="col-b">
          <li>
            <a href="#experience" className="lead" onClick={(e) => handleNavClick(e, 'experience')}>
              Experience
            </a>
          </li>
          <li>
            <a href="#contact" onClick={(e) => handleNavClick(e, 'contact')}>
              Contact
            </a>
          </li>
        </ul>
      </nav>

      {/* Logo */}
      <a
        href="#hero"
        className="logo pin pin-tc"
        aria-label="Om Vhalgade Portfolio — Back to top"
        onClick={(e) => handleNavClick(e, 'hero')}
      >
        <svg
          viewBox="0 0 60 38"
          width="100%"
          height="100%"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Portfolio"
        >
          <path
            d="M27.40 34.52 C27.59 34.43 27.80 34.24 27.87 34.10 C28.07 33.71 28.05 21.22 27.86 20.75 C27.57 20.06 27.67 20.07 23.23 20.18 C20.54 20.24 19.15 20.31 18.95 20.39 C18.00 20.77 17.83 21.72 18.57 22.46 C19.24 23.13 19.43 23.20 20.66 23.20 C21.27 23.20 22.02 23.15 22.31 23.08 C22.61 23.02 23.05 22.96 23.29 22.96 C23.65 22.96 23.77 23.01 24.01 23.27 C24.40 23.71 24.48 24.21 24.24 24.78 C24.13 25.03 23.92 25.32 23.77 25.44 C23.51 25.63 23.37 25.65 22.32 25.62 C18.00 25.51 16.98 25.24 15.55 23.83 C14.47 22.77 14.01 22.03 13.69 20.80 C13.36 19.56 13.38 18.26 13.73 16.95 C13.88 16.41 14.08 15.84 14.18 15.69 C15.55 13.60 16.89 12.64 18.81 12.41 C19.27 12.35 20.52 12.30 21.58 12.29 C23.22 12.28 23.54 12.30 23.76 12.44 C24.13 12.69 24.40 13.19 24.40 13.64 C24.40 13.95 24.33 14.09 24.00 14.42 L23.61 14.82 L22.38 14.73 C21.70 14.69 20.74 14.65 20.23 14.65 C19.37 14.65 19.30 14.67 18.88 14.96 C18.30 15.39 18.06 15.82 18.06 16.46 C18.06 17.02 18.24 17.39 18.66 17.67 C18.89 17.82 19.37 17.84 23.08 17.86 C27.68 17.89 27.59 17.90 27.85 17.27 C28.03 16.82 28.00 9.86 27.81 9.52 C27.55 9.03 27.29 9.00 23.23 9.00 C18.23 9.00 17.31 9.11 15.63 9.90 C14.14 10.60 12.78 11.84 11.88 13.32 C11.65 13.68 11.39 14.12 11.28 14.28 C11.18 14.45 10.90 15.16 10.67 15.87 L10.26 17.15 L10.25 19.05 L10.25 20.95 L10.71 22.15 C11.30 23.72 12.01 24.80 13.19 25.92 C14.16 26.85 15.03 27.42 16.22 27.92 C17.75 28.57 18.07 28.62 21.30 28.67 C24.43 28.71 24.55 28.73 24.81 29.21 C24.98 29.54 24.94 30.37 24.73 30.73 C24.38 31.33 24.05 31.42 22.35 31.35 C17.25 31.14 15.82 30.94 14.18 30.20 C12.97 29.64 11.70 28.82 10.92 28.06 C10.17 27.35 9.14 26.05 8.79 25.40 C8.63 25.10 8.40 24.70 8.28 24.51 C8.08 24.19 7.97 23.93 7.32 22.15 C7.08 21.51 7.06 21.29 7.02 19.48 C7.00 18.32 7.03 17.16 7.09 16.66 C7.24 15.53 8.00 13.33 8.52 12.50 C8.75 12.14 9.04 11.68 9.16 11.48 C9.48 10.98 10.98 9.50 11.73 8.95 C12.90 8.11 14.58 7.33 16.17 6.90 C18.15 6.36 19.12 6.28 23.42 6.31 C26.76 6.33 27.11 6.32 27.35 6.16 C27.71 5.92 27.90 5.43 27.90 4.73 C27.90 4.00 27.66 3.51 27.20 3.27 C26.87 3.10 26.51 3.09 22.00 3.13 C16.65 3.18 16.94 3.15 14.65 3.89 C13.26 4.35 11.68 5.08 10.82 5.68 C9.15 6.85 7.54 8.28 6.97 9.10 C6.80 9.35 6.53 9.70 6.37 9.89 C6.21 10.08 6.01 10.38 5.94 10.56 C5.86 10.74 5.62 11.17 5.41 11.50 C5.19 11.84 4.98 12.25 4.94 12.43 C4.91 12.61 4.70 13.18 4.49 13.70 C3.89 15.20 3.75 16.11 3.76 18.50 C3.77 20.71 3.97 22.65 4.29 23.55 C4.39 23.82 4.62 24.46 4.79 24.95 C4.96 25.45 5.23 26.03 5.39 26.25 C5.54 26.47 5.78 26.85 5.90 27.10 C6.54 28.35 8.93 30.70 11.06 32.16 C11.98 32.79 13.97 33.64 15.12 33.89 C15.63 34.00 16.43 34.19 16.90 34.31 C17.69 34.51 18.07 34.53 22.15 34.59 C24.57 34.63 26.66 34.67 26.80 34.68 C26.94 34.69 27.21 34.62 27.40 34.52 Z M39.85 34.57 C41.79 34.53 42.01 34.51 42.75 34.27 C43.19 34.13 43.91 33.92 44.35 33.81 C45.85 33.44 48.12 32.22 49.58 31.01 C50.26 30.44 51.75 28.79 52.38 27.91 C52.61 27.58 52.94 27.03 53.10 26.68 C53.26 26.33 53.48 25.91 53.60 25.75 C53.71 25.59 53.90 25.13 54.01 24.75 C54.12 24.37 54.37 23.60 54.56 23.04 C55.00 21.73 55.14 20.47 55.06 18.57 C54.98 16.69 54.86 15.91 54.44 14.64 C54.25 14.08 54.10 13.53 54.10 13.42 C54.10 13.31 53.94 12.91 53.74 12.54 C53.54 12.16 53.25 11.60 53.10 11.28 C52.94 10.97 52.68 10.57 52.52 10.38 C52.36 10.20 52.10 9.85 51.93 9.60 C51.57 9.07 49.89 7.40 49.10 6.78 C48.22 6.09 47.07 5.35 46.46 5.07 C46.15 4.92 45.77 4.72 45.61 4.61 C45.23 4.33 42.40 3.41 41.61 3.30 C41.25 3.25 38.77 3.20 36.11 3.19 L31.27 3.16 L31.04 3.44 C30.91 3.59 30.80 3.81 30.79 3.93 C30.78 4.05 30.79 7.12 30.80 10.74 C30.81 16.61 30.83 17.37 30.97 17.61 C31.24 18.06 31.47 18.11 32.91 18.00 C34.76 17.86 37.88 17.86 38.28 18.01 C38.91 18.23 39.12 19.22 38.65 19.79 C38.21 20.30 37.96 20.33 34.96 20.24 C31.19 20.12 31.35 20.11 31.02 20.43 L30.75 20.70 L30.75 24.50 C30.75 28.22 30.75 28.30 30.96 28.50 C31.08 28.62 31.32 28.74 31.51 28.78 C31.70 28.82 33.83 28.82 36.25 28.79 C41.10 28.72 41.24 28.71 42.96 28.04 C43.47 27.85 44.20 27.46 44.60 27.19 C45.53 26.54 46.71 25.32 47.16 24.55 C47.35 24.22 47.60 23.81 47.71 23.63 C47.97 23.22 48.56 20.60 48.64 19.45 C48.73 18.33 48.59 17.19 48.19 15.73 C47.93 14.78 47.78 14.46 47.20 13.58 C46.51 12.52 45.30 11.25 44.38 10.62 C44.12 10.44 43.51 10.11 43.03 9.89 C41.82 9.33 40.86 9.20 37.55 9.14 C36.02 9.11 34.73 9.04 34.57 8.98 C34.18 8.83 33.98 8.38 33.98 7.65 C33.98 6.97 34.17 6.48 34.53 6.28 C34.79 6.13 41.30 6.15 42.20 6.31 C43.06 6.45 44.86 7.21 45.81 7.83 C47.22 8.74 49.27 10.89 50.06 12.30 C50.23 12.60 50.48 13.05 50.63 13.30 C51.03 14.01 51.78 16.36 51.91 17.35 C51.98 17.88 52.01 18.91 51.98 19.90 C51.94 21.37 51.90 21.63 51.66 22.30 C51.51 22.71 51.28 23.39 51.15 23.80 C51.01 24.21 50.74 24.78 50.55 25.07 C50.36 25.36 50.04 25.85 49.84 26.16 C49.37 26.86 48.07 28.18 47.04 29.00 C46.05 29.78 44.20 30.70 42.85 31.07 L41.85 31.34 L36.60 31.37 C31.66 31.39 31.34 31.41 31.10 31.58 C30.35 32.14 30.47 34.15 31.27 34.55 C31.46 34.65 34.38 34.65 39.85 34.57 Z M34.63 25.50 C34.04 25.15 33.97 24.03 34.51 23.54 C34.70 23.37 34.94 23.35 37.14 23.30 C39.37 23.25 39.58 23.23 39.95 23.03 C40.49 22.74 40.86 22.33 41.04 21.83 C41.31 21.07 41.43 19.82 41.37 18.56 C41.26 16.44 40.94 15.71 39.85 15.15 L39.26 14.85 L37.02 14.83 C34.55 14.80 34.45 14.78 34.14 14.18 C33.91 13.73 33.99 12.88 34.30 12.55 C34.43 12.42 34.67 12.26 34.84 12.20 C35.23 12.07 40.57 12.25 41.13 12.40 C42.07 12.67 43.39 13.73 44.30 14.95 C44.93 15.78 45.07 16.09 45.26 17.07 C45.53 18.52 45.38 21.05 44.94 22.08 C44.72 22.62 43.83 23.74 43.20 24.30 C42.05 25.29 41.45 25.44 37.88 25.60 C34.95 25.73 35.00 25.73 34.63 25.50 Z"
            fill="currentColor"
            fillRule="evenodd"
          />
        </svg>
      </a>

      {/* Moon decorative icon */}
      <svg
        className="moon pin pin-tr"
        viewBox="0 0 21 22"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M9.71 20.24 C12.47 19.82 14.94 18.02 16.40 15.36 C17.01 14.25 17.16 13.82 17.37 12.50 C17.53 11.50 17.53 10.75 17.37 9.75 C17.17 8.49 16.93 7.71 16.57 7.16 C16.40 6.89 16.16 6.48 16.05 6.27 C15.94 6.05 15.58 5.54 15.25 5.12 C13.81 3.35 11.91 2.23 11.63 3.02 C11.56 3.22 11.64 3.42 12.19 4.54 C12.91 6.00 13.00 6.40 13.00 8.12 C13.00 9.45 12.89 10.00 12.39 11.35 C12.04 12.27 11.81 12.74 11.37 13.38 C10.35 14.90 8.83 16.25 7.23 17.05 C6.28 17.53 5.73 17.67 4.75 17.67 C3.52 17.67 3.17 17.82 3.17 18.36 C3.17 18.88 3.88 19.31 5.71 19.87 C7.44 20.41 8.11 20.48 9.71 20.24 Z"
          fill="currentColor"
          fillRule="evenodd"
        />
      </svg>

      {/* Theme toggle mode icon */}
      <svg
        className="mode pin pin-tr"
        viewBox="0 0 38 38"
        xmlns="http://www.w3.org/2000/svg"
        role="button"
        aria-label="Switch appearance"
        tabIndex={0}
        onClick={onToggleTheme}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggleTheme();
          }
        }}
      >
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M19 .25A18.75 18.75 0 1 1 19 37.75 18.75 18.75 0 1 1 19 .25ZM19 13A6 6 0 1 0 19 25 6 6 0 1 0 19 13Z"
        />
      </svg>

      {/* Main Headline */}
      <h1 className="headline pin pin-ml">
        <span className="l1">
          <span className="ln">
            <span className="w1">
              <RollingWord word="Om" warpable />
            </span>{' '}
            <span className="w2">
              <RollingWord word="Vhalgade" warpable />
            </span>
          </span>
        </span>
        <span className="l2">
          <span className="ln">
            <span className="w4">
              <RollingWord word="Creative" warpable />
            </span>{' '}
            <b>
              <RollingWord word="Developer" warpable />
            </b>
          </span>
        </span>
      </h1>

      {/* Intro Blurb */}
      <p className="blurb pin pin-mr">
        {['Computer', 'Science', 'student', 'and', 'aspiring', 'creative', 'developer', 'focused', 'on', 'building', 'modern,', 'interactive', 'web', 'experiences.'].map((w, idx) => (
          <React.Fragment key={idx}>
            <RollingWord word={w} />
            {idx < 13 ? ' ' : ''}
          </React.Fragment>
        ))}
      </p>

      {/* Bottom Instruments (Brightness & Fast Tags) */}
      <div className="instruments">
        <button
          className="brightness pin pin-bl"
          type="button"
          aria-label="Toggle brightness"
          onClick={onToggleBrightness}
        >
          <svg viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="13" cy="13" r="7.5" fill="none" stroke="currentColor" strokeWidth="2" />
            <g fill="currentColor">
              <circle cx="13.000" cy="1.200" r="1.3" />
              <circle cx="18.900" cy="2.781" r="1.3" />
              <circle cx="23.219" cy="7.100" r="1.3" />
              <circle cx="24.800" cy="13.000" r="1.3" />
              <circle cx="23.219" cy="18.900" r="1.3" />
              <circle cx="18.900" cy="23.219" r="1.3" />
              <circle cx="13.000" cy="24.800" r="1.3" />
              <circle cx="7.100" cy="23.219" r="1.3" />
              <circle cx="2.781" cy="18.900" r="1.3" />
              <circle cx="1.200" cy="13.000" r="1.3" />
              <circle cx="2.781" cy="7.100" r="1.3" />
              <circle cx="7.100" cy="2.781" r="1.3" />
            </g>
          </svg>
        </button>

        <div className="tags pin pin-br">
          <a
            href="#about"
            className="tag"
            role="button"
            onClick={(e) => handleNavClick(e, 'about')}
          >
            About
          </a>
          <a
            href="#work"
            className="tag"
            role="button"
            onClick={(e) => handleNavClick(e, 'work')}
          >
            Work
          </a>
          <a
            href="#contact"
            className="tag"
            role="button"
            onClick={(e) => handleNavClick(e, 'contact')}
          >
            Contact
          </a>
        </div>
      </div>
    </main>
  );
};
