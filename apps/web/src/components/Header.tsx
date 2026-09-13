import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Globe,
  Layers,
  Compass,
  ArrowLeftRight,
  PieChart,
  Activity,
  Database,
  BookOpen,
  Sparkles,
  Volume2,
  VolumeX,
  PlayCircle,
} from 'lucide-react';
import { soundFx } from '../utils/soundFx';

interface HeaderProps {
  providerMode: 'api' | 'snapshot';
  onReplayIntro?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ providerMode, onReplayIntro }) => {
  const [soundEnabled, setSoundEnabled] = useState(soundFx.enabled);

  const toggleSound = () => {
    soundFx.enabled = !soundFx.enabled;
    setSoundEnabled(soundFx.enabled);
    if (soundFx.enabled) {
      soundFx.playUiClick();
    }
  };

  const handleTabClick = () => {
    soundFx.playUiClick();
  };

  return (
    <header className="site-header">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Top Branding & Status Row */}
      <div className="header-top-row">
        <div className="header-inner">
          <div className="logo-group">
            <div className="logo-icon-wrapper">
              <Globe size={20} color="#38bdf8" />
            </div>
            <div className="logo-text">
              <NavLink to="/" style={{ textDecoration: 'none', color: 'inherit' }} onClick={handleTabClick}>
                <span className="logo-title">The Map Distortion Project</span>
              </NavLink>
              <span className="logo-subtitle">Real-Scale Multi-Dimensional Atlas</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {onReplayIntro && (
              <button
                onClick={() => {
                  soundFx.playUiClick();
                  onReplayIntro();
                }}
                className="btn-portal"
                title="Replay Cinematic Intro"
              >
                <PlayCircle size={14} />
                <span>Portal</span>
              </button>
            )}

            <button
              onClick={toggleSound}
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '16px',
                color: soundEnabled ? '#38bdf8' : '#64748b',
                padding: '0.3rem 0.65rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.15s',
              }}
              title="Toggle Web Audio SFX"
            >
              {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
              <span>{soundEnabled ? 'SFX' : 'MUTED'}</span>
            </button>

            <div className="header-status">
              {providerMode === 'api' ? (
                <span className="badge badge-success" title="Connected to Python FastAPI analytical server">
                  ● Live API
                </span>
              ) : (
                <span className="badge badge-info" title="Using local reproducible snapshot dataset (updated 2026)">
                  ● Snapshot Mode
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Creative Segmented Navigation Bar */}
      <div className="header-nav-row">
        <div className="header-inner nav-inner">
          <nav className="nav-segmented" aria-label="Main Navigation">
            {/* Group 1: Interactive Labs */}
            <div className="nav-group">
              <span className="nav-group-label">Labs</span>
              <NavLink to="/" end className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`} onClick={handleTabClick}>
                <Sparkles size={15} className="tab-icon" />
                <span>Reveal</span>
              </NavLink>
              <NavLink to="/explore" className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`} onClick={handleTabClick}>
                <Layers size={15} className="tab-icon" />
                <span>Explorer</span>
              </NavLink>
              <NavLink to="/lab" className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`} onClick={handleTabClick}>
                <Globe size={15} className="tab-icon" />
                <span>Move Lab</span>
              </NavLink>
              <NavLink to="/compare" className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`} onClick={handleTabClick}>
                <ArrowLeftRight size={15} className="tab-icon" />
                <span>Compare</span>
              </NavLink>
              <NavLink to="/world" className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`} onClick={handleTabClick}>
                <Activity size={15} className="tab-icon" />
                <span>World Bubble</span>
              </NavLink>
            </div>

            <div className="nav-divider" />

            {/* Group 2: Science & Research */}
            <div className="nav-group">
              <span className="nav-group-label">Analysis</span>
              <NavLink to="/learn" className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`} onClick={handleTabClick}>
                <Compass size={15} className="tab-icon" />
                <span>Latitude Math</span>
              </NavLink>
              <NavLink to="/representation" className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`} onClick={handleTabClick}>
                <PieChart size={15} className="tab-icon" />
                <span>Power Gap</span>
              </NavLink>
              <NavLink to="/methodology" className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`} onClick={handleTabClick}>
                <BookOpen size={15} className="tab-icon" />
                <span>Methods</span>
              </NavLink>
              <NavLink to="/data" className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`} onClick={handleTabClick}>
                <Database size={15} className="tab-icon" />
                <span>Data</span>
              </NavLink>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};
