import React, { useState } from 'react';
import { mercatorLinearScale, mercatorAreaMultiplier } from '@map-distortion/geo';
import { Compass, Sparkles, BookOpen } from 'lucide-react';

export const LatitudeExplainer: React.FC = () => {
  const [latitude, setLatitude] = useState<number>(60);

  const k = mercatorLinearScale(latitude);
  const j = mercatorAreaMultiplier(latitude);

  const presets = [0, 30, 45, 60, 80];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 className="serif" style={{ fontSize: '2.4rem', marginBottom: '0.5rem' }}>
          Why Latitude Matters: The Secant Squared Law
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '780px', margin: '0 auto' }}>
          The Mercator projection preserves constant compass bearings (rhumb lines) by progressively spreading latitude parallels farther apart toward the poles.
          This produces an exponential surface area inflation governed by <strong>sec²(φ)</strong>.
        </p>
      </div>

      {/* Interactive Slider Card */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Compass size={22} color="var(--color-primary)" />
            <h3 style={{ fontSize: '1.25rem' }}>Interactive Latitude Inspector</h3>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginRight: '0.25rem' }}>Presets:</span>
            {presets.map((p) => (
              <button
                key={p}
                className={`btn ${latitude === p ? 'btn-primary' : ''}`}
                onClick={() => setLatitude(p)}
                style={{ fontSize: '0.82rem', padding: '0.3rem 0.65rem' }}
              >
                {p}° {p === 0 ? '(Equator)' : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Latitude Slider */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 700 }}>
            <span>-80° (South Pole Region)</span>
            <span style={{ color: 'var(--color-primary)', fontSize: '1.2rem' }}>Selected: {latitude}° Latitude</span>
            <span>+80° (Arctic Region)</span>
          </div>
          <input
            type="range"
            min="-80"
            max="80"
            value={latitude}
            onChange={(e) => setLatitude(Number(e.target.value))}
            style={{ width: '100%', cursor: 'pointer', height: '10px' }}
          />
        </div>

        {/* Live Mathematical Formula Cards (Clean mathematical typography!) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
              Linear Scale Factor
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary)', margin: '0.25rem 0', fontFamily: 'var(--font-serif)' }}>
              k(φ) = sec(φ) = 1 / cos(φ)
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {k.toFixed(3)}× distance stretch
            </div>
            <p style={{ fontSize: '0.8rem', margin: '0.25rem 0 0 0', color: 'var(--text-secondary)' }}>
              Both east-west and north-south distances are multiplied by this factor.
            </p>
          </div>

          <div style={{ background: 'var(--color-accent-light)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(249, 115, 22, 0.3)' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-accent)', fontWeight: 600 }}>
              Area Inflation Multiplier
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-accent)', margin: '0.25rem 0', fontFamily: 'var(--font-serif)' }}>
              J(φ) = sec²(φ) = 1 / cos²(φ)
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-accent)' }}>
              {j.toFixed(3)}× area expansion (+{Math.round((j - 1) * 100)}%)
            </div>
            <p style={{ fontSize: '0.8rem', margin: '0.25rem 0 0 0', color: 'var(--text-secondary)' }}>
              Because width and height stretch equally, <strong>surface area inflates quadratically</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Visual expanding discs */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Sparkles size={20} color="var(--color-accent)" />
          <h3 style={{ fontSize: '1.25rem' }}>Visualizing Identical 500km Disks on the Map</h3>
        </div>
        <p style={{ fontSize: '0.9rem' }}>
          Every circle below represents an identical 500km circular land patch on the spherical Earth. Watch how their flat Mercator representation expands:
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', padding: '2.5rem 1rem', background: '#0b1528', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', minHeight: '240px' }}>
          {[
            { lat: 0, label: '0° (Equator)', mult: 1.0 },
            { lat: 30, label: '30°', mult: 1.33 },
            { lat: 45, label: '45°', mult: 2.0 },
            { lat: 60, label: '60°', mult: 4.0 },
            { lat: 80, label: '80° (Arctic)', mult: 33.16 },
          ].map((item) => {
            const baseRadius = 14;
            const r = baseRadius * Math.sqrt(item.mult);
            const isSelected = Math.abs(latitude - item.lat) <= 5;
            return (
              <div key={item.lat} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' }}>
                <svg width={r * 2 + 12} height={r * 2 + 12}>
                  <circle
                    cx={r + 6}
                    cy={r + 6}
                    r={r}
                    fill={isSelected ? 'var(--color-accent)' : 'var(--color-primary)'}
                    fillOpacity={0.88}
                    stroke={isSelected ? '#f97316' : '#38bdf8'}
                    strokeWidth={isSelected ? 2.5 : 1}
                    style={{ filter: isSelected ? 'drop-shadow(0 0 10px rgba(249, 115, 22, 0.6))' : 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.4))' }}
                  />
                </svg>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: isSelected ? 'var(--color-accent)' : 'var(--text-primary)' }}>{item.label}</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.mult.toFixed(1)}× area</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Benchmark Reference Table */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <BookOpen size={18} color="var(--color-primary)" />
          <h3 style={{ fontSize: '1.15rem' }}>Standard Benchmark Latitudes</h3>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
              <th style={{ padding: '0.6rem 0.5rem' }}>Latitude (φ)</th>
              <th style={{ padding: '0.6rem 0.5rem' }}>Linear Scale k = sec(φ)</th>
              <th style={{ padding: '0.6rem 0.5rem' }}>Area Multiplier J = sec²(φ)</th>
              <th style={{ padding: '0.6rem 0.5rem' }}>Percentage Enlargement</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '0.6rem 0.5rem', fontWeight: 600 }}>0° (Equator)</td>
              <td style={{ padding: '0.6rem 0.5rem' }}>1.000×</td>
              <td style={{ padding: '0.6rem 0.5rem' }}>1.000×</td>
              <td style={{ padding: '0.6rem 0.5rem' }}>+0% (True Physical Scale)</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '0.6rem 0.5rem', fontWeight: 600 }}>±30°</td>
              <td style={{ padding: '0.6rem 0.5rem' }}>1.155×</td>
              <td style={{ padding: '0.6rem 0.5rem' }}>1.333×</td>
              <td style={{ padding: '0.6rem 0.5rem' }}>+33.3%</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '0.6rem 0.5rem', fontWeight: 600 }}>±45°</td>
              <td style={{ padding: '0.6rem 0.5rem' }}>1.414× (√2)</td>
              <td style={{ padding: '0.6rem 0.5rem' }}>2.000×</td>
              <td style={{ padding: '0.6rem 0.5rem' }}>+100% (2× True Area)</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '0.6rem 0.5rem', fontWeight: 600 }}>±60°</td>
              <td style={{ padding: '0.6rem 0.5rem' }}>2.000×</td>
              <td style={{ padding: '0.6rem 0.5rem' }}>4.000×</td>
              <td style={{ padding: '0.6rem 0.5rem' }}>+300% (4× True Area)</td>
            </tr>
            <tr>
              <td style={{ padding: '0.6rem 0.5rem', fontWeight: 600 }}>±80°</td>
              <td style={{ padding: '0.6rem 0.5rem' }}>5.759×</td>
              <td style={{ padding: '0.6rem 0.5rem' }}>33.163×</td>
              <td style={{ padding: '0.6rem 0.5rem', color: 'var(--color-accent)', fontWeight: 700 }}>+3,216%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
