import React, { useState, useEffect } from 'react';
import { DataProvider } from '../data/dataProvider';
import { ReleaseMeta } from '@map-distortion/contracts';
import { Database, Download } from 'lucide-react';

interface PageProps {
  dataProvider: DataProvider;
}

export const DataPage: React.FC<PageProps> = ({ dataProvider }) => {
  const [meta, setMeta] = useState<ReleaseMeta | null>(null);

  useEffect(() => {
    dataProvider.getMeta().then(setMeta);
  }, [dataProvider]);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 className="serif">Data Provenance & Open Releases</h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
          Immutable release artifacts, entity counts, checksums, and open source licenses.
        </p>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Database size={20} color="var(--color-primary)" />
            <h3 style={{ fontSize: '1.2rem' }}>Release Manifest ({meta?.release_id || 'rel-2026-v1'})</h3>
          </div>
          <span className="badge badge-success">Verified Release</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ background: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Created At</div>
            <div style={{ fontWeight: 600 }}>{meta?.created_at || '2026-09-13T00:00:00Z'}</div>
          </div>
          <div style={{ background: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Earth Radius</div>
            <div style={{ fontWeight: 600 }}>{meta?.earth_radius_km || 6371.007} km</div>
          </div>
          <div style={{ background: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Clip Boundary</div>
            <div style={{ fontWeight: 600 }}>±{meta?.clip_latitude || 85.0}° Latitude</div>
          </div>
          <div style={{ background: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Entities</div>
            <div style={{ fontWeight: 600 }}>{meta?.total_entities || 24} countries & territories</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '0.75rem' }}>Direct Snapshot Downloads</h3>
        <p style={{ fontSize: '0.88rem' }}>
          Download pre-computed JSON releases and map vector assets for offline analysis:
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
          <a href="/data/rel-2026-v1/countries.json" download className="btn" style={{ fontSize: '0.85rem' }}>
            <Download size={14} /> countries.json
          </a>
          <a href="/data/rel-2026-v1/manifest.json" download className="btn" style={{ fontSize: '0.85rem' }}>
            <Download size={14} /> manifest.json
          </a>
          <a href="/data/rel-2026-v1/world_geo.json" download className="btn" style={{ fontSize: '0.85rem' }}>
            <Download size={14} /> world_geo.json
          </a>
        </div>
      </div>
    </div>
  );
};
