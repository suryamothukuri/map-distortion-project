import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Database, ShieldCheck, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="site-footer">
      {/* Geodetic Telemetry Strip */}
      <div
        style={{
          borderBottom: '1px solid rgba(245, 158, 11, 0.18)',
          background: 'rgba(12, 18, 30, 0.95)',
          padding: '0.65rem 1.5rem',
          fontSize: '0.74rem',
          letterSpacing: '0.04em',
          color: '#cbd5e1',
          fontFamily: 'var(--font-mono)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#f59e0b', fontWeight: 800 }}>● GEODESY TELEMETRY:</span>
          <span>WGS84 SPHEROID (EPSG:4326) • AUTHALIC RADIUS: 6,371.007 km</span>
        </div>
        <div style={{ display: 'flex', gap: '1.25rem', color: '#94a3b8' }}>
          <span>PROJECTIONS: EPSG:3857 & EQUAL EARTH</span>
          <span>ANALYTICAL DOMAIN: -85° to +85° LAT</span>
        </div>
      </div>

      <div className="footer-inner" style={{ paddingTop: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Compass size={18} color="#f59e0b" />
            <h4 className="serif" style={{ fontSize: '1.15rem', color: '#f8fafc', margin: 0 }}>
              The Map Distortion Project
            </h4>
          </div>
          <p style={{ maxWidth: '480px', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.6 }}>
            An open scientific and educational platform investigating how map projections alter perceived landmass,
            and juxtaposing cartographic representations with demographic, economic, and ecological realities.
          </p>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
            <Database size={15} color="#38bdf8" />
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>Data Sources & Attributions</h4>
          </div>
          <ul style={{ listStyle: 'none', fontSize: '0.8rem', lineHeight: '1.8', color: '#94a3b8' }}>
            <li>• Boundaries: Natural Earth Admin 0 (Public Domain)</li>
            <li>• Statistics: World Bank World Development Indicators (CC BY 4.0)</li>
            <li>• Emissions: Our World in Data / Global Carbon Budget (CC BY 4.0)</li>
          </ul>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
            <ShieldCheck size={15} color="#10b981" />
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>Reproducibility & Standards</h4>
          </div>
          <ul style={{ listStyle: 'none', fontSize: '0.8rem', lineHeight: '1.8' }}>
            <li><Link to="/methodology" style={{ color: '#38bdf8' }}>Mathematical Methods & Clipping Domain</Link></li>
            <li><Link to="/data" style={{ color: '#38bdf8' }}>Release Manifest & SHA256 Checksums</Link></li>
            <li>
              <a href="https://proj.org/en/stable/operations/projections/eqearth.html" target="_blank" rel="noreferrer" style={{ color: '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                PROJ Equal Earth Specification <ExternalLink size={11} />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};
