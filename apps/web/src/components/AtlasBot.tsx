import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { getRandomFact, ShockingFact } from '../data/shockingMapFacts';
import { Sparkles, RefreshCw, X, ChevronRight, Lightbulb, Globe } from 'lucide-react';

export const AtlasBot: React.FC = () => {
  const location = useLocation();
  const [currentFact, setCurrentFact] = useState<ShockingFact>(() => getRandomFact(location.pathname));
  const [isExpanded, setIsExpanded] = useState<boolean>(false); // Starts collapsed so landing page is 100% clean
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [mouseOffset, setMouseOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const botRef = useRef<HTMLDivElement>(null);

  // Update fact when navigating between pages
  useEffect(() => {
    setCurrentFact(getRandomFact(location.pathname));
  }, [location.pathname]);

  // Track mouse relative to bot to animate eyes
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!botRef.current) return;
      const rect = botRef.current.getBoundingClientRect();
      const botCenterX = rect.left + rect.width / 2;
      const botCenterY = rect.top + rect.height / 2;
      const deltaX = Math.max(-12, Math.min(12, (e.clientX - botCenterX) / 20));
      const deltaY = Math.max(-8, Math.min(8, (e.clientY - botCenterY) / 20));
      setMouseOffset({ x: deltaX, y: deltaY });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleNextFact = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsSpinning(true);
    setCurrentFact(getRandomFact(location.pathname));
    setTimeout(() => setIsSpinning(false), 700);
  };

  const handleToggle = () => {
    if (!isExpanded) {
      setIsExpanded(true);
      handleNextFact();
    } else {
      setIsExpanded(false);
    }
  };

  return (
    <div
      ref={botRef}
      style={{
        position: 'fixed',
        bottom: '1.75rem',
        right: '1.75rem',
        zIndex: 999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '0.75rem',
        maxWidth: isExpanded ? '400px' : 'auto',
      }}
    >
      {/* Speech Bubble / Fact Card (Shown ONLY when clicked) */}
      {isExpanded && (
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1.5px solid rgba(56, 189, 248, 0.4)',
            borderRadius: '18px',
            padding: '1.25rem',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(56, 189, 248, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            animation: 'botFadeIn 0.25s ease-out',
            transformOrigin: 'bottom right',
            position: 'relative',
            color: '#f8fafc',
          }}
        >
          {/* Top Bar with Badge & Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                  color: 'white',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  boxShadow: '0 2px 6px rgba(14, 165, 233, 0.3)',
                }}
              >
                <Globe size={13} /> GeoBot Atlas Guide
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <button
                onClick={handleNextFact}
                title="Roll another shocking fact"
                style={{
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  cursor: 'pointer',
                  padding: '5px',
                  borderRadius: '6px',
                  color: '#38bdf8',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <RefreshCw size={14} className={isSpinning ? 'spin-anim' : ''} />
              </button>
              <button
                onClick={() => setIsExpanded(false)}
                title="Close"
                style={{
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  cursor: 'pointer',
                  padding: '5px',
                  borderRadius: '6px',
                  color: '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Headline */}
          <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.35 }}>
            {currentFact.headline}
          </div>

          {/* Detail Body */}
          <div style={{ fontSize: '0.84rem', color: '#cbd5e1', lineHeight: 1.55 }}>
            {currentFact.detail}
          </div>

          {/* Did You Know Box */}
          {currentFact.didYouKnow && (
            <div
              style={{
                background: 'rgba(217, 83, 47, 0.15)',
                border: '1px solid rgba(217, 83, 47, 0.4)',
                borderRadius: '10px',
                padding: '0.6rem 0.85rem',
                fontSize: '0.8rem',
                color: '#fedcd2',
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'flex-start',
              }}
            >
              <Lightbulb size={15} style={{ flexShrink: 0, marginTop: '2px', color: '#f97316' }} />
              <div>
                <strong style={{ color: '#f97316' }}>Fun Geographic Truth:</strong> {currentFact.didYouKnow}
              </div>
            </div>
          )}

          {/* Action Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '0.65rem' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Click GeoBot for another mind-bending fact 🌍
            </span>
            <button
              onClick={handleNextFact}
              className="btn btn-primary"
              style={{ padding: '0.35rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              Next Fact <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Floating Interactive GeoBot Mascot Trigger */}
      <div
        onClick={handleToggle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          cursor: 'pointer',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform: isHovered ? 'scale(1.08) translateY(-4px)' : 'scale(1)',
        }}
      >
        {/* Floating Call-to-Action Pill when Minimized */}
        {!isExpanded && (
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.92)',
              backdropFilter: 'blur(12px)',
              border: '1.5px solid rgba(56, 189, 248, 0.45)',
              color: '#f8fafc',
              fontSize: '0.82rem',
              fontWeight: 700,
              padding: '0.45rem 0.9rem',
              borderRadius: '20px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6), 0 0 16px rgba(56, 189, 248, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              animation: 'pulse 2.2s infinite',
            }}
          >
            <Sparkles size={14} color="var(--color-accent)" />
            <span>Map Facts (Click Me!)</span>
          </div>
        )}

        {/* Larger, Map-Themed Globe Robot Graphic */}
        <svg
          width="88"
          height="88"
          viewBox="0 0 88 88"
          style={{
            filter: 'drop-shadow(0 10px 24px rgba(27, 73, 101, 0.35))',
            animation: 'botBob 2.6s ease-in-out infinite',
          }}
          className={isSpinning ? 'spin-anim' : ''}
        >
          <defs>
            <radialGradient id="globeSphereGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#4ba3e3" />
              <stop offset="45%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#1e3a8a" />
            </radialGradient>
            <linearGradient id="chassisGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
            <linearGradient id="goldBrassGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <radialGradient id="jetGlowGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="1" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Jet Thruster Flame */}
          <ellipse cx="44" cy="78" rx="14" ry="5" fill="url(#jetGlowGrad)" />
          <ellipse cx="44" cy="77" rx="7" ry="2.5" fill="#e0f2fe" />

          {/* Brass Astrolabe / Compass Antenna */}
          <line x1="44" y1="18" x2="44" y2="7" stroke="#d97706" strokeWidth="3" strokeLinecap="round" />
          <circle cx="44" cy="6" r="5" fill="url(#goldBrassGrad)" stroke="#78350f" strokeWidth="1" />
          {/* Compass Star Pointer */}
          <polygon points="44,2 45.5,6 44,7 42.5,6" fill="#d9532f" />
          <polygon points="44,10 45.5,6 44,5 42.5,6" fill="#ffffff" />

          {/* Outer Orbital Brass Ring (Meridian Gimbal) */}
          <ellipse
            cx="44"
            cy="36"
            rx="28"
            ry="28"
            fill="none"
            stroke="url(#goldBrassGrad)"
            strokeWidth="2.5"
            strokeDasharray="9 3"
          />

          {/* Spherical Earth Head */}
          <circle cx="44" cy="36" r="22" fill="url(#globeSphereGrad)" stroke="#ffffff" strokeWidth="1.8" />

          {/* Graticule Latitude & Longitude Curved Lines */}
          <ellipse cx="44" cy="36" rx="22" ry="7" fill="none" stroke="#93c5fd" strokeWidth="1" opacity="0.6" />
          <ellipse cx="44" cy="36" rx="9" ry="22" fill="none" stroke="#93c5fd" strokeWidth="1" opacity="0.6" />

          {/* Glowing Green Continents on Globe Face */}
          <path
            d="M32 25 Q38 22 42 27 Q40 32 35 34 Q30 30 32 25 Z"
            fill="#34d399"
            opacity="0.9"
          />
          <path
            d="M48 26 Q54 28 56 34 Q51 38 46 32 Z"
            fill="#34d399"
            opacity="0.9"
          />
          <path
            d="M36 40 Q44 38 48 45 Q40 50 36 44 Z"
            fill="#34d399"
            opacity="0.9"
          />

          {/* Cybernetic Eye Visor with Mouse-Tracking Pupils */}
          <rect x="27" y="30" width="34" height="13" rx="6.5" fill="rgba(15, 23, 42, 0.88)" stroke="#67e8f9" strokeWidth="1.2" />

          {/* Eyes tracking cursor */}
          <g transform={`translate(${mouseOffset.x * 0.35}, ${mouseOffset.y * 0.35})`}>
            {/* Left Eye */}
            <circle cx="36" cy="36.5" r="4" fill="#38bdf8" />
            <circle cx="34.5" cy="35" r="1.4" fill="#ffffff" />

            {/* Right Eye */}
            <circle cx="52" cy="36.5" r="4" fill="#38bdf8" />
            <circle cx="50.5" cy="35" r="1.4" fill="#ffffff" />
          </g>

          {/* Robot Mechanical Base / Compass Collar */}
          <path
            d="M26 56 L62 56 L56 70 L32 70 Z"
            fill="url(#chassisGrad)"
            stroke="#94a3b8"
            strokeWidth="1.2"
          />
          {/* Compass Rose Dial on Chest */}
          <circle cx="44" cy="63" r="5" fill="#1b4965" stroke="#fbbf24" strokeWidth="1" />
          <polygon points="44,59 45.5,63 44,64 42.5,63" fill="#d9532f" />
          <polygon points="44,67 45.5,63 44,62 42.5,63" fill="#ffffff" />

          {/* Left Hand: Holding Cartographic Caliper / Lens */}
          <g transform="translate(12, 48)">
            <circle cx="6" cy="6" r="6" fill="none" stroke="#fbbf24" strokeWidth="2" />
            <line x1="10" y1="10" x2="16" y2="16" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="6" cy="6" r="4.5" fill="#67e8f9" fillOpacity="0.4" />
          </g>

          {/* Right Hand: Waving Cartographer Pointer */}
          <g transform="translate(68, 48)">
            <circle cx="6" cy="6" r="3.5" fill="url(#goldBrassGrad)" />
            <line x1="6" y1="6" x2="12" y2="2" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
          </g>
        </svg>
      </div>
    </div>
  );
};
