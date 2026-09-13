import React, { useState, useEffect, useRef } from 'react';
import { geoOrthographic, geoPath, geoGraticule10 } from 'd3-geo';
import { soundFx } from '../utils/soundFx';
import { getRandomFact } from '../data/shockingMapFacts';
import { Sparkles, ArrowRight, Volume2, VolumeX } from 'lucide-react';

interface CinematicIntroProps {
  onEnter: () => void;
}

export const CinematicIntro: React.FC<CinematicIntroProps> = ({ onEnter }) => {
  const [teaserFact, setTeaserFact] = useState(() => getRandomFact('/'));
  const [isWarping, setIsWarping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(soundFx.enabled);
  const [geoData, setGeoData] = useState<any>(null);

  const globeCanvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // Load real world GeoJSON for 3D Earth Globe
  useEffect(() => {
    fetch('/data/rel-2026-v1/world_geo.json')
      .then((res) => res.json())
      .then(setGeoData)
      .catch((err) => console.error('Failed to load globe GeoJSON', err));
  }, []);

  // Continuous 3D Earth Globe Rotation Animation
  useEffect(() => {
    const canvas = globeCanvasRef.current;
    if (!canvas || !geoData) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const globeSize = 220;
    const center = globeSize / 2;
    const radius = 72;

    const projection = geoOrthographic()
      .scale(radius)
      .translate([center, center])
      .clipAngle(90);

    const pathGen = geoPath(projection, ctx);
    const graticule = geoGraticule10();

    let yaw = 0;

    const renderGlobe = () => {
      yaw = (yaw + 0.65) % 360;
      projection.rotate([yaw, -16, 0]);

      ctx.clearRect(0, 0, globeSize, globeSize);

      // 1. Deep Ocean Sphere with 3D Radial Depth & Specular Highlight
      const oceanGrad = ctx.createRadialGradient(
        center - 22,
        center - 22,
        10,
        center,
        center,
        radius
      );
      oceanGrad.addColorStop(0, '#1e3a8a');
      oceanGrad.addColorStop(0.5, '#0b1528');
      oceanGrad.addColorStop(0.92, '#030712');
      oceanGrad.addColorStop(1, '#000000');

      ctx.beginPath();
      ctx.arc(center, center, radius, 0, Math.PI * 2);
      ctx.fillStyle = oceanGrad;
      ctx.fill();

      // 2. 3D Rotating Graticules
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.lineWidth = 0.6;
      pathGen(graticule as any);
      ctx.stroke();

      // 3. Real 3D Rotating Continents (Front-Facing Hemisphere)
      ctx.beginPath();
      ctx.fillStyle = '#10b981';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 0.8;
      pathGen(geoData);
      ctx.fill();
      ctx.stroke();

      // 4. Atmospheric Specular Highlight Overlay
      const shineGrad = ctx.createRadialGradient(
        center - 28,
        center - 28,
        4,
        center - 20,
        center - 20,
        radius * 0.95
      );
      shineGrad.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
      shineGrad.addColorStop(0.3, 'rgba(56, 189, 248, 0.1)');
      shineGrad.addColorStop(1, 'rgba(0, 0, 0, 0.45)');

      ctx.beginPath();
      ctx.arc(center, center, radius, 0, Math.PI * 2);
      ctx.fillStyle = shineGrad;
      ctx.fill();

      // 5. Outer Atmospheric Glow Ring
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 6. Concentric 3D Orbiting Rings with Astrolabe Markers
      const orbitAngle = yaw * 0.02;
      ctx.save();
      ctx.translate(center, center);

      // Ring 1 (Equatorial Astrolabe)
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 1.35, radius * 0.45, orbitAngle, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.55)';
      ctx.lineWidth = 1.4;
      ctx.setLineDash([6, 8]);
      ctx.stroke();

      // Ring 1 Satellite Marker
      const sat1X = Math.cos(orbitAngle * 2) * radius * 1.35;
      const sat1Y = Math.sin(orbitAngle * 2) * radius * 0.45;
      ctx.beginPath();
      ctx.arc(sat1X, sat1Y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();

      // Ring 2 (Polar Orbit)
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 1.25, radius * 0.35, -orbitAngle * 0.8, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 6]);
      ctx.stroke();

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(renderGlobe);
    };

    renderGlobe();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [geoData]);

  // Cycle teaser facts every 5 seconds
  useEffect(() => {
    const factTimer = setInterval(() => {
      setTeaserFact(getRandomFact('/'));
    }, 5000);
    return () => clearInterval(factTimer);
  }, []);

  const handleLaunch = () => {
    setIsWarping(true);
    soundFx.playBombBlast();

    setTimeout(() => {
      onEnter();
    }, 650);
  };

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.enabled = !soundFx.enabled;
    setSoundEnabled(soundFx.enabled);
    if (soundFx.enabled) {
      soundFx.playUiClick();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.42), rgba(0, 0, 0, 0.82)), url(/assets/intro_background.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        overflow: 'hidden',
        color: '#ffffff',
        transition: 'opacity 0.6s ease-out, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        opacity: isWarping ? 0 : 1,
        transform: isWarping ? 'scale(1.35) rotate(-3deg)' : 'scale(1)',
        pointerEvents: isWarping ? 'none' : 'auto',
      }}
    >
      {/* Warp Speed Lightburst Rays when Launching */}
      {isWarping && (
        <div
          style={{
            position: 'absolute',
            inset: -100,
            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.8) 0%, rgba(245, 158, 11, 0.6) 40%, transparent 80%)',
            animation: 'warpFlash 0.6s ease-out forwards',
            zIndex: 100,
          }}
        />
      )}

      {/* Top Controls: Sound Toggle & Skip */}
      <div
        style={{
          position: 'absolute',
          top: '1.5rem',
          right: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          zIndex: 10,
        }}
      >
        <button
          onClick={toggleSound}
          style={{
            background: 'rgba(10, 10, 10, 0.85)',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            borderRadius: '20px',
            color: soundEnabled ? '#38bdf8' : '#94a3b8',
            padding: '0.4rem 0.85rem',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.2s',
          }}
        >
          {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          <span>{soundEnabled ? 'SFX ON' : 'SFX MUTED'}</span>
        </button>

        <button
          onClick={handleLaunch}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#cbd5e1',
            fontSize: '0.84rem',
            cursor: 'pointer',
            padding: '0.4rem 0.6rem',
            textDecoration: 'underline',
          }}
        >
          Skip Intro →
        </button>
      </div>

      {/* Center Cinematic Container */}
      <div
        style={{
          maxWidth: '840px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '1.4rem',
          position: 'relative',
          zIndex: 5,
        }}
      >
        {/* Real 3D Rotating Earth Globe with Continents */}
        <div style={{ position: 'relative', width: '220px', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <canvas
            ref={globeCanvasRef}
            width={220}
            height={220}
            style={{
              width: '220px',
              height: '220px',
              filter: 'drop-shadow(0 0 35px rgba(56, 189, 248, 0.45)) drop-shadow(0 15px 30px rgba(0,0,0,0.8))',
            }}
          />
        </div>

        {/* Epic Catchphrase & Headline */}
        <div>
          <div className="editorial-tag">
            THE CARTOGRAPHIC REALITY REVEALED
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5vw, 3.6rem)',
              fontFamily: 'var(--font-serif)',
              fontWeight: 800,
              lineHeight: 1.15,
              color: '#ffffff',
              marginBottom: '0.75rem',
              letterSpacing: '-0.02em',
            }}
          >
            Unmask the True Earth.
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.15rem)',
              color: '#cbd5e1',
              maxWidth: '640px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Step into the <strong>Real-Scale Multi-Dimensional Atlas</strong>. Discover how 450 years of Mercator map distortion shrunk continents, enlarged empires, and warped human perception.
          </p>
        </div>

        {/* Editorial Quote & Teaser Fact Duo */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', width: '100%', maxWidth: '780px' }}>
          {/* Quote Block (Inspired by Ralph Waldo Emerson block in reference) */}
          <div className="quote-card" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', fontStyle: 'italic', lineHeight: 1.45 }}>
              "Though We Travel The World Over To Find The Beautiful, We Must Carry It With Us Or We Find It Not."
            </div>
            <div style={{ fontSize: '0.78rem', color: '#fb923c', marginTop: '0.5rem', fontWeight: 700 }}>
              — Ralph Waldo Emerson
            </div>
          </div>

          {/* Dynamic Teaser Fact Card */}
          <div
            style={{
              background: 'rgba(11, 18, 34, 0.9)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
              <Sparkles size={13} /> Shocking Map Fact
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.4 }}>
              {teaserFact.headline}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.25rem', lineHeight: 1.45 }}>
              {teaserFact.detail}
            </div>
          </div>
        </div>

        {/* Main "LAUNCH EXPLORATION" Epic Button */}
        <button
          onClick={handleLaunch}
          onMouseEnter={() => soundFx.playUiClick()}
          style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 50%, #dc2626 100%)',
            color: '#ffffff',
            border: '2px solid rgba(255, 255, 255, 0.45)',
            padding: '1rem 2.75rem',
            borderRadius: '40px',
            fontSize: '1.15rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 0 35px rgba(245, 158, 11, 0.45), 0 10px 25px rgba(0, 0, 0, 0.6)',
            letterSpacing: '0.04em',
            transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transform: 'scale(1)',
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)')}
          onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <span>COME, LET'S EXPLORE TOGETHER</span>
          <ArrowRight size={20} style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.8))' }} />
        </button>
      </div>
    </div>
  );
};
