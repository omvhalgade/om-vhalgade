import React, { useEffect, useRef } from 'react';

interface TrailPoint {
  x: number;
  y: number;
  time: number;
  speed: number;
  width: number;
  maxAge: number;
}

interface MicroWisp {
  x: number;
  y: number;
  vx: number;
  vy: number;
  time: number;
  maxAge: number;
  size: number;
  alpha: number;
}

interface CharPhysicsState {
  currX: number;
  currY: number;
  currRot: number;
  currScale: number;
  targetX: number;
  targetY: number;
  targetRot: number;
  targetScale: number;
  elements: HTMLElement[];
  centerX: number;
  centerY: number;
}

interface MousePointerInteractionProps {
  isDark?: boolean;
}

export const MousePointerInteraction: React.FC<MousePointerInteractionProps> = ({ isDark = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // 1. Check for touch/coarse devices or reduced motion preference
    const isTouch =
      window.matchMedia('(pointer: coarse)').matches ||
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isTouch || prefersReducedMotion) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animFrameId: number | null = null;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Trail State
    const points: TrailPoint[] = [];
    const wisps: MicroWisp[] = [];
    let lastMouseX = -100;
    let lastMouseY = -100;
    let lastMoveTime = performance.now();
    let smoothedSpeed = 0;
    let isMoving = false;
    let mouseInWindow = false;
    let hue = 0;

    // Helper: Convert HSL to RGB string "r, g, b"
    function hslToRgbString(h: number, sPercent: number, lPercent: number): string {
      const hNorm = ((h % 360) + 360) % 360;
      const s = sPercent / 100;
      const l = lPercent / 100;
      const c = (1 - Math.abs(2 * l - 1)) * s;
      const x = c * (1 - Math.abs(((hNorm / 60) % 2) - 1));
      const m = l - c / 2;
      let r = 0;
      let g = 0;
      let b = 0;

      if (hNorm < 60) {
        r = c; g = x; b = 0;
      } else if (hNorm < 120) {
        r = x; g = c; b = 0;
      } else if (hNorm < 180) {
        r = 0; g = c; b = x;
      } else if (hNorm < 240) {
        r = 0; g = x; b = c;
      } else if (hNorm < 300) {
        r = x; g = 0; b = c;
      } else {
        r = c; g = 0; b = x;
      }

      const r255 = Math.round((r + m) * 255);
      const g255 = Math.round((g + m) * 255);
      const b255 = Math.round((b + m) * 255);

      return `${r255}, ${g255}, ${b255}`;
    }

    // Large Hero Typography Characters Tracking
    let charStates: CharPhysicsState[] = [];

    function updateHeadlineBounds() {
      const heroSection = document.getElementById('hero');
      if (!heroSection) return;

      const words = Array.from(
        heroSection.querySelectorAll<HTMLElement>('.headline .roll-word[data-warpable="true"]')
      );

      const nextStates: CharPhysicsState[] = [];

      words.forEach((wordEl) => {
        const primaryChars = Array.from(
          wordEl.querySelectorAll<HTMLElement>('.roll-word-primary .hero-warp-char')
        );
        const secondaryChars = Array.from(
          wordEl.querySelectorAll<HTMLElement>('.roll-word-secondary .hero-warp-char')
        );

        const count = Math.max(primaryChars.length, secondaryChars.length);

        for (let i = 0; i < count; i++) {
          const pEl = primaryChars[i];
          const sEl = secondaryChars[i];
          const targets: HTMLElement[] = [];
          if (pEl) targets.push(pEl);
          if (sEl) targets.push(sEl);

          // Calculate center of this letter column
          let cx = 0;
          let cy = 0;
          if (pEl) {
            const rect = pEl.getBoundingClientRect();
            cx = rect.left + rect.width / 2;
            cy = rect.top + rect.height / 2;
          } else if (sEl) {
            const rect = sEl.getBoundingClientRect();
            cx = rect.left + rect.width / 2;
            cy = rect.top + rect.height / 2;
          }

          nextStates.push({
            currX: 0,
            currY: 0,
            currRot: 0,
            currScale: 1,
            targetX: 0,
            targetY: 0,
            targetRot: 0,
            targetScale: 1,
            elements: targets,
            centerX: cx,
            centerY: cy,
          });
        }
      });

      charStates = nextStates;
    }

    function resizeCanvas() {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      updateHeadlineBounds();
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });
    window.addEventListener('scroll', updateHeadlineBounds, { passive: true });
    const boundsTimer = setTimeout(updateHeadlineBounds, 120);

    // Mouse Movement Handler
    function onMouseMove(e: MouseEvent) {
      mouseInWindow = true;
      const curX = e.clientX;
      const curY = e.clientY;
      const now = performance.now();
      const dt = Math.max(1, now - lastMoveTime);

      const dx = curX - lastMouseX;
      const dy = curY - lastMouseY;
      const dist = Math.hypot(dx, dy);

      if (lastMouseX < 0) {
        lastMouseX = curX;
        lastMouseY = curY;
        lastMoveTime = now;
        return;
      }

      const instantSpeed = dist / dt; // px/ms
      smoothedSpeed = smoothedSpeed * 0.65 + instantSpeed * 0.35;

      // Natural velocity-responsive trail attributes
      const clampedSpeed = Math.min(smoothedSpeed, 3.2);
      // Faster movement produces a slightly longer flowing trail; slow movement creates a small subtle trail
      const maxAge = Math.min(340, 140 + clampedSpeed * 65);
      const widthFactor = Math.min(6.5, 2.2 + clampedSpeed * 1.4);

      // Offset head slightly behind the arrow tip so normal arrow pointer remains crisp
      const angle = Math.atan2(dy, dx);
      const offsetDist = Math.min(5, Math.max(2, dist * 0.3));
      const headX = curX - Math.cos(angle) * offsetDist;
      const headY = curY - Math.sin(angle) * offsetDist;

      // Interpolate points during faster movement for smooth fluid curves
      if (dist > 5) {
        const steps = Math.min(5, Math.floor(dist / 4));
        for (let s = 1; s <= steps; s++) {
          const t = s / steps;
          const interpX = lastMouseX + (headX - lastMouseX) * t;
          const interpY = lastMouseY + (headY - lastMouseY) * t;
          points.push({
            x: interpX,
            y: interpY,
            time: now - (1 - t) * dt * 0.5,
            speed: smoothedSpeed,
            width: widthFactor,
            maxAge,
          });
        }
      } else {
        points.push({
          x: headX,
          y: headY,
          time: now,
          speed: smoothedSpeed,
          width: widthFactor,
          maxAge,
        });
      }

      // High-velocity micro aerodynamic wisps on curved motions
      if (clampedSpeed > 1.2 && Math.random() < 0.32) {
        const perpAngle = angle + (Math.random() > 0.5 ? Math.PI / 2 : -Math.PI / 2);
        wisps.push({
          x: headX,
          y: headY,
          vx: Math.cos(perpAngle) * (0.4 + Math.random() * 0.8),
          vy: Math.sin(perpAngle) * (0.4 + Math.random() * 0.8),
          time: now,
          maxAge: 160 + Math.random() * 80,
          size: 1.2 + Math.random() * 1.8,
          alpha: 0.28,
        });
      }

      lastMouseX = curX;
      lastMouseY = curY;
      lastMoveTime = now;
      isMoving = true;

      // 3. Hero Typography Proximity Check
      // Only compute when near hero viewport
      if (window.scrollY < window.innerHeight * 1.1) {
        const PUSH_RADIUS = 100; // Radius of magnetic push
        const MAX_PUSH = 8.5; // Max displacement in pixels (subtle & restrained)

        for (let i = 0; i < charStates.length; i++) {
          const ch = charStates[i];
          const cdx = ch.centerX - curX;
          const cdy = ch.centerY - curY;
          const cdist = Math.hypot(cdx, cdy);

          if (cdist < PUSH_RADIUS && cdist > 0.1) {
            // Normalized push factor with cosine falloff
            const factor = 1 - cdist / PUSH_RADIUS;
            const smoothPush = Math.sin((factor * Math.PI) / 2) ** 2;
            const pushAmt = smoothPush * MAX_PUSH;

            const pushAngle = Math.atan2(cdy, cdx);
            ch.targetX = Math.cos(pushAngle) * pushAmt;
            ch.targetY = Math.sin(pushAngle) * pushAmt;
            // Subtle organic tilt
            ch.targetRot = -Math.sin(pushAngle) * (smoothPush * 2.2);
            ch.targetScale = 1 + smoothPush * 0.032;
          } else {
            ch.targetX = 0;
            ch.targetY = 0;
            ch.targetRot = 0;
            ch.targetScale = 1;
          }
        }
      }

      // Ensure animation loop is running
      if (!animFrameId) {
        animFrameId = requestAnimationFrame(renderLoop);
      }
    }

    function onMouseLeave() {
      mouseInWindow = false;
      lastMouseX = -100;
      lastMouseY = -100;
      // Reset targets for letters
      for (let i = 0; i < charStates.length; i++) {
        charStates[i].targetX = 0;
        charStates[i].targetY = 0;
        charStates[i].targetRot = 0;
        charStates[i].targetScale = 1;
      }
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave, { passive: true });
    window.addEventListener('blur', onMouseLeave, { passive: true });

    // Main Render Loop
    function renderLoop(timestamp: number) {
      ctx.clearRect(0, 0, width, height);

      // Increment hue smoothly on each animation frame
      hue = (hue + 0.6) % 360;

      // Prune expired trail points
      const activePoints: TrailPoint[] = [];
      for (let i = 0; i < points.length; i++) {
        if (timestamp - points[i].time < points[i].maxAge) {
          activePoints.push(points[i]);
        }
      }
      points.length = 0;
      points.push(...activePoints);

      // Prune expired wisps
      const activeWisps: MicroWisp[] = [];
      for (let i = 0; i < wisps.length; i++) {
        const w = wisps[i];
        if (timestamp - w.time < w.maxAge) {
          w.x += w.vx;
          w.y += w.vy;
          activeWisps.push(w);
        }
      }
      wisps.length = 0;
      wisps.push(...activeWisps);

      // Detect current theme for fluid colors
      const isCurrentDark =
        document.documentElement.getAttribute('data-mode') === 'dark' || isDark;

      // Dynamically shifting rainbow hue palette
      // Light Mode: Smooth holographic pastel rainbow (70% saturation, 74% lightness)
      // Dark Mode: Radiant luminous neon-pastel rainbow (85% saturation, 82% lightness)
      const primarySat = isCurrentDark ? 85 : 70;
      const primaryLight = isCurrentDark ? 82 : 74;
      const ambientSat = isCurrentDark ? 75 : 60;
      const ambientLight = isCurrentDark ? 86 : 80;

      const rgbPrimary = hslToRgbString(hue, primarySat, primaryLight);
      const rgbAmbient = hslToRgbString(hue + 42, ambientSat, ambientLight);

      // Draw Fluid Trail Ribbon
      if (points.length >= 2) {
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Draw Pass 1: Outer Soft Wispy Smoke Diffusion (scaled 2.2x size)
        for (let i = 0; i < points.length - 1; i++) {
          const p1 = points[i];
          const p2 = points[i + 1];
          const life = 1 - (timestamp - p1.time) / p1.maxAge;
          if (life <= 0) continue;

          const alpha = Math.max(0, life ** 1.8) * 0.16;
          const strokeWidth = p1.width * (life ** 0.8) * 3.6 * 2.2;

          ctx.beginPath();
          ctx.strokeStyle = `rgba(${rgbAmbient}, ${alpha.toFixed(3)})`;
          ctx.lineWidth = Math.max(1, strokeWidth);
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }

        // Draw Pass 2: Middle Translucent Smoke Body (scaled 2.2x size)
        for (let i = 0; i < points.length - 1; i++) {
          const p1 = points[i];
          const p2 = points[i + 1];
          const life = 1 - (timestamp - p1.time) / p1.maxAge;
          if (life <= 0) continue;

          const alpha = Math.max(0, life ** 1.5) * 0.25;
          const strokeWidth = p1.width * (life ** 0.82) * 2.2 * 2.2;

          ctx.beginPath();
          ctx.strokeStyle = `rgba(${rgbPrimary}, ${alpha.toFixed(3)})`;
          ctx.lineWidth = Math.max(0.8, strokeWidth);

          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2;
          ctx.moveTo(p1.x, p1.y);
          ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
          ctx.stroke();
        }

        // Draw Pass 3: Soft Core Fluid Vapor with Scaled Radial Dissipation Gradients (2.2x)
        for (let i = 0; i < points.length - 1; i++) {
          const p1 = points[i];
          const p2 = points[i + 1];
          const life = 1 - (timestamp - p1.time) / p1.maxAge;
          if (life <= 0) continue;

          const alpha = Math.max(0, life ** 1.3) * 0.25;
          const strokeWidth = p1.width * (life ** 0.9) * 1.2 * 2.2;

          ctx.beginPath();
          ctx.strokeStyle = `rgba(${rgbPrimary}, ${alpha.toFixed(3)})`;
          ctx.lineWidth = Math.max(0.6, strokeWidth);

          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2;
          ctx.moveTo(p1.x, p1.y);
          ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
          ctx.stroke();

          // Soft radial glow stamp at intermittent points (2.2x radius)
          if (i % 2 === 0) {
            const rad = Math.max(4, p1.width * life * 2.8 * 2.2);
            const grad = ctx.createRadialGradient(p1.x, p1.y, 0, p1.x, p1.y, rad);
            grad.addColorStop(0, `rgba(${rgbPrimary}, ${(alpha * 0.9).toFixed(3)})`);
            grad.addColorStop(0.5, `rgba(${rgbAmbient}, ${(alpha * 0.4).toFixed(3)})`);
            grad.addColorStop(1, `rgba(${rgbAmbient}, 0)`);

            ctx.beginPath();
            ctx.fillStyle = grad;
            ctx.arc(p1.x, p1.y, rad, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Draw Micro Wisps with Soft Radial Falloff (2.2x radius)
        for (let i = 0; i < wisps.length; i++) {
          const w = wisps[i];
          const life = 1 - (timestamp - w.time) / w.maxAge;
          if (life <= 0) continue;

          const wispAlpha = life * w.alpha * 0.25;
          const wispRad = Math.max(4, w.size * life * 3.0 * 2.2);

          const wispGrad = ctx.createRadialGradient(w.x, w.y, 0, w.x, w.y, wispRad);
          wispGrad.addColorStop(0, `rgba(${rgbPrimary}, ${wispAlpha.toFixed(3)})`);
          wispGrad.addColorStop(0.6, `rgba(${rgbAmbient}, ${(wispAlpha * 0.4).toFixed(3)})`);
          wispGrad.addColorStop(1, `rgba(${rgbAmbient}, 0)`);

          ctx.beginPath();
          ctx.fillStyle = wispGrad;
          ctx.arc(w.x, w.y, wispRad, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      // Update Hero Typography Physics Spring/Lerp
      let hasMovingChars = false;
      const LERP_FACTOR = 0.18; // Smooth, elastic settling

      for (let i = 0; i < charStates.length; i++) {
        const ch = charStates[i];

        const prevX = ch.currX;
        const prevY = ch.currY;

        ch.currX += (ch.targetX - ch.currX) * LERP_FACTOR;
        ch.currY += (ch.targetY - ch.currY) * LERP_FACTOR;
        ch.currRot += (ch.targetRot - ch.currRot) * LERP_FACTOR;
        ch.currScale += (ch.targetScale - ch.currScale) * LERP_FACTOR;

        const isDisplaced =
          Math.abs(ch.currX) > 0.04 ||
          Math.abs(ch.currY) > 0.04 ||
          Math.abs(ch.currRot) > 0.04 ||
          Math.abs(ch.currScale - 1) > 0.002;

        if (isDisplaced) {
          hasMovingChars = true;
          const transformStr = `translate3d(${ch.currX.toFixed(2)}px, ${ch.currY.toFixed(2)}px, 0) rotate(${ch.currRot.toFixed(2)}deg) scale(${ch.currScale.toFixed(3)})`;
          for (let e = 0; e < ch.elements.length; e++) {
            ch.elements[e].style.transform = transformStr;
          }
        } else if (Math.abs(prevX) > 0.04 || Math.abs(prevY) > 0.04) {
          // Snap clean when settled
          ch.currX = 0;
          ch.currY = 0;
          ch.currRot = 0;
          ch.currScale = 1;
          for (let e = 0; e < ch.elements.length; e++) {
            ch.elements[e].style.transform = '';
          }
        }
      }

      // Keep animation running if trail points remain or typography is still settling
      if (points.length > 0 || wisps.length > 0 || hasMovingChars || mouseInWindow) {
        animFrameId = requestAnimationFrame(renderLoop);
      } else {
        animFrameId = null;
      }
    }

    // Initial check to start loop if needed
    animFrameId = requestAnimationFrame(renderLoop);

    return () => {
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
      }
      clearTimeout(boundsTimer);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('scroll', updateHeadlineBounds);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('blur', onMouseLeave);

      // Clean up any applied letter transforms
      for (let i = 0; i < charStates.length; i++) {
        for (let e = 0; e < charStates[i].elements.length; e++) {
          charStates[i].elements[e].style.transform = '';
        }
      }
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      id="pointer-fluid-trail-canvas"
      className="pointer-fluid-canvas"
      aria-hidden="true"
    />
  );
};
