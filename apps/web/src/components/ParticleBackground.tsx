import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  r: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

export const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initStars();
    };
    window.addEventListener('resize', handleResize);

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = width / 2;
    let targetMouseY = height / 2;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Generate Stars in the upper night sky
    let stars: Star[] = [];
    const initStars = () => {
      stars = [];
      const numStars = Math.floor((width * height) / 9000);
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * (height * 0.45), // Upper night sky
          r: Math.random() * 1.3 + 0.5,
          baseAlpha: Math.random() * 0.6 + 0.3,
          twinkleSpeed: Math.random() * 0.03 + 0.015,
          twinklePhase: Math.random() * Math.PI * 2,
        });
      }
    };
    initStars();

    let time = 0;

    const render = () => {
      time += 0.012;
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;

      const parallaxX = (mouseX - width / 2) * -0.015;
      const parallaxY = (mouseY - height / 2) * -0.015;

      if (containerRef.current) {
        containerRef.current.style.transform = `scale(1.04) translate(${parallaxX}px, ${parallaxY}px)`;
      }

      ctx.clearRect(0, 0, width, height);

      // Twinkling stars overlay
      for (const s of stars) {
        const currentAlpha = s.baseAlpha + Math.sin(time * s.twinkleSpeed * 60 + s.twinklePhase) * 0.3;
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, Math.min(1, currentAlpha))})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();

        if (s.r > 1.2) {
          ctx.fillStyle = `rgba(254, 215, 170, ${currentAlpha * 0.4})`;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Subtle water shimmer lines across the lower mirror lake
      const lakeTop = height * 0.58;
      const numRipples = 6;
      ctx.lineWidth = 1;
      for (let i = 0; i < numRipples; i++) {
        const ry = lakeTop + (i * (height - lakeTop)) / numRipples + Math.sin(time + i) * 2;
        const alpha = 0.04 + Math.sin(time * 0.8 + i * 1.2) * 0.03;
        ctx.strokeStyle = `rgba(251, 146, 60, ${Math.max(0.01, alpha)})`;
        ctx.beginPath();
        ctx.moveTo(width * 0.1, ry);
        ctx.lineTo(width * 0.9, ry);
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: -1,
        overflow: 'hidden',
        backgroundColor: '#000000',
      }}
    >
      {/* Photorealistic Mountain, Lake & Starry Night Backdrop */}
      <div
        ref={containerRef}
        style={{
          position: 'absolute',
          top: '-4%',
          left: '-4%',
          width: '108%',
          height: '108%',
          backgroundImage: 'url(/assets/dusk_mountain_lake_bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
          filter: 'brightness(0.78) contrast(1.12)',
          transition: 'transform 0.1s ease-out',
        }}
      />

      {/* Atmospheric Pure Deep Black Vignette Overlay for Readability */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 40%, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, 0.7) 65%, #000000 100%)',
        }}
      />

      {/* Interactive Twinkling Stars & Shimmer Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
};
