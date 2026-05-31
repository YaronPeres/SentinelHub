'use client';

import { useRef, useEffect } from 'react';

// Performance-optimized LetterGlitch:
// - Throttled to ~12fps for glitch updates (was 20fps)
// - Smooth color transitions only process letters that NEED updating (was all letters every rAF)
// - Canvas uses `will-change: transform` to promote to its own GPU layer
// - Reduced character set for faster random lookups

const LetterGlitch = ({
  glitchColors = ['#1a3329', '#3a8a65', '#3a7a9a'],
  glitchSpeed = 80,
  centerVignette = false,
  outerVignette = true,
  smooth = true,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$&*'
}: {
  glitchColors?: string[];
  glitchSpeed?: number;
  centerVignette?: boolean;
  outerVignette?: boolean;
  smooth?: boolean;
  characters?: string;
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const letters = useRef<{
    char: string;
    r: number; g: number; b: number;
    tr: number; tg: number; tb: number;
    progress: number; // -1 = stable, 0..1 = transitioning
  }[]>([]);
  const activeTransitions = useRef<Set<number>>(new Set());
  const grid = useRef({ columns: 0, rows: 0 });
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const lastGlitchTime = useRef(0);
  const lastSmoothTime = useRef(0);

  const charList = Array.from(characters);

  const fontSize = 16;
  const charWidth = 10;
  const charHeight = 20;

  function hexToRgb(hex: string): [number, number, number] {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  }

  const parsedColors = glitchColors.map(hexToRgb);

  function randomChar() {
    return charList[(Math.random() * charList.length) | 0];
  }
  function randomColor(): [number, number, number] {
    return parsedColors[(Math.random() * parsedColors.length) | 0];
  }

  function initializeLetters(columns: number, rows: number) {
    grid.current = { columns, rows };
    activeTransitions.current.clear();
    letters.current = Array.from({ length: columns * rows }, () => {
      const [r, g, b] = randomColor();
      return { char: randomChar(), r, g, b, tr: r, tg: g, tb: b, progress: -1 };
    });
  }

  function drawLetters() {
    const ctx = context.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas || letters.current.length === 0) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${fontSize}px monospace`;
    ctx.textBaseline = 'top';

    const { columns } = grid.current;
    letters.current.forEach((letter, i) => {
      ctx.fillStyle = `rgb(${letter.r|0},${letter.g|0},${letter.b|0})`;
      ctx.fillText(letter.char, (i % columns) * charWidth, ((i / columns) | 0) * charHeight);
    });
  }

  function updateGlitch() {
    // Only update 3% of letters per tick (was 5%) — less visual noise, less CPU
    const count = Math.max(1, (letters.current.length * 0.03) | 0);
    for (let i = 0; i < count; i++) {
      const idx = (Math.random() * letters.current.length) | 0;
      const letter = letters.current[idx];
      if (!letter) continue;
      letter.char = randomChar();
      const [tr, tg, tb] = randomColor();
      letter.tr = tr; letter.tg = tg; letter.tb = tb;
      if (smooth) {
        letter.progress = 0;
        activeTransitions.current.add(idx);
      } else {
        letter.r = tr; letter.g = tg; letter.b = tb;
      }
    }
  }

  function tickSmoothTransitions() {
    if (activeTransitions.current.size === 0) return;
    const step = 0.08; // faster per-frame step so fewer frames needed
    const done: number[] = [];
    activeTransitions.current.forEach((idx) => {
      const l = letters.current[idx];
      if (!l || l.progress < 0) { done.push(idx); return; }
      l.progress = Math.min(1, l.progress + step);
      const t = l.progress;
      l.r = l.r + (l.tr - l.r) * t;
      l.g = l.g + (l.tg - l.g) * t;
      l.b = l.b + (l.tb - l.b) * t;
      if (l.progress >= 1) {
        l.r = l.tr; l.g = l.tg; l.b = l.tb;
        l.progress = -1;
        done.push(idx);
      }
    });
    done.forEach((idx) => activeTransitions.current.delete(idx));
  }

  function animate(timestamp: number) {
    // Throttle glitch updates to glitchSpeed ms
    if (timestamp - lastGlitchTime.current >= glitchSpeed) {
      updateGlitch();
      lastGlitchTime.current = timestamp;
    }

    // Smooth transitions throttled to ~30fps (33ms) to cut GPU load in half
    if (smooth && timestamp - lastSmoothTime.current >= 33) {
      tickSmoothTransitions();
      lastSmoothTime.current = timestamp;
    }

    drawLetters();
    animationRef.current = requestAnimationFrame(animate);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    context.current = canvas.getContext('2d');

    let resizeObserver: ResizeObserver | null = null;

    const initFrame = requestAnimationFrame(() => {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.target === canvas.parentElement) {
            const rect = entry.contentRect;
            if (rect.width === 0 || rect.height === 0) return;
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5); // cap at 1.5x — no need for full 3x retina for a background
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;
            if (context.current) context.current.setTransform(dpr, 0, 0, dpr, 0, 0);
            const columns = Math.ceil(rect.width / charWidth);
            const rows = Math.ceil(rect.height / charHeight);
            initializeLetters(columns, rows);
            drawLetters();
          }
        }
      });
      if (canvas.parentElement) resizeObserver.observe(canvas.parentElement);
      animationRef.current = requestAnimationFrame(animate);
    });

    return () => {
      cancelAnimationFrame(initFrame);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (resizeObserver) resizeObserver.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [glitchSpeed, smooth]);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
        style={{ willChange: 'transform' }}
      />
      {outerVignette && (
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle,_rgba(0,0,0,0)_60%,_rgba(0,0,0,1)_100%)]" />
      )}
      {centerVignette && (
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle,_rgba(0,0,0,0.8)_0%,_rgba(0,0,0,0)_60%)]" />
      )}
    </div>
  );
};

export default LetterGlitch;
