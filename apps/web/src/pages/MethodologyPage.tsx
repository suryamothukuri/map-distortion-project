import React from 'react';

export const MethodologyPage: React.FC = () => {
  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 className="serif">Mathematical Methodology & Scientific Model</h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
          Detailed derivations, coordinate models, domain clipping definitions, and numerical tolerances.
        </p>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <h2 className="serif">1. Earth Model and Coordinates</h2>
        <p>
          All analytical reference areas and projections utilize a consistent spherical model with radius:
        </p>
        <div style={{ background: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)' }}>
          R = 6,371,007.1809 meters (Spherical Surface Area ≈ 510,065,628 km²)
        </div>
        <p>
          Coordinates are stored canonically in degrees \([\lambda, \phi]\) (longitude, latitude) and converted to radians for projection integrals.
        </p>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <h2 className="serif">2. Projection Mathematics</h2>
        <h3>Mercator Projection (Conformal)</h3>
        <p>
          The forward equations and differential multipliers are given by:
        </p>
        <div style={{ background: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)' }}>
          x = R · λ<br />
          y = R · ln(tan(π/4 + φ/2))<br />
          Linear Scale: k(φ) = sec(φ) = 1 / cos(φ)<br />
          Area Multiplier: J(φ) = sec²(φ) = 1 / cos²(φ)
        </div>

        <h3 style={{ marginTop: '0.5rem' }}>Equal Earth Projection (Equal-Area)</h3>
        <p>
          Šavrič, Patterson, & Jenny (2018) pseudo-cylindrical equal-area formulation with parametric latitude \(\theta\):
        </p>
        <div style={{ background: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)' }}>
          sin(θ) = (√3 / 2) · sin(φ)<br />
          Area Multiplier: J(φ) = 1.000 (Exact across all latitudes)
        </div>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <h2 className="serif">3. Rigid 3D Spherical Kinematics</h2>
        <p>
          In the <em>Move a Country Laboratory</em>, translation across the globe is executed as a pure rigid 3D rotation on the unit sphere via shortest-arc unit quaternions:
        </p>
        <div style={{ background: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)' }}>
          q = shortestArc(a, b)<br />
          v' = q · v · q⁻¹
        </div>
        <p>
          This guarantees exact spherical distance and surface area invariance (\(\Delta A / A &lt; 0.001\)) without distortion drift over repeated movements.
        </p>
      </div>
    </div>
  );
};
