import React, { useState } from 'react';
import { CountryRecord } from '@map-distortion/contracts';
import { ArrowUpDown } from 'lucide-react';

interface RankingTableProps {
  countries: CountryRecord[];
}

export const RankingTable: React.FC<RankingTableProps> = ({ countries }) => {
  const [sortKey, setSortKey] = useState<keyof CountryRecord>('mercator_inflation');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [regionFilter, setRegionFilter] = useState<string>('all');

  const handleSort = (key: keyof CountryRecord) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  const filtered = countries
    .filter((c) => regionFilter === 'all' || c.region_id === regionFilter)
    .sort((a, b) => {
      const va = (a[sortKey] as number) ?? 0;
      const vb = (b[sortKey] as number) ?? 0;
      return sortOrder === 'asc' ? va - vb : vb - va;
    });

  const maxInflation = Math.max(...countries.map((c) => c.mercator_inflation), 10);

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h3 className="serif" style={{ fontSize: '1.3rem' }}>Country Distortion Leaderboard</h3>
        
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              fontSize: '0.82rem',
            }}
          >
            <option value="all">All Regions</option>
            <option value="north_america">North America</option>
            <option value="latin_america">Latin America & Caribbean</option>
            <option value="europe">Europe</option>
            <option value="africa">Africa</option>
            <option value="asia">Asia</option>
            <option value="oceania">Oceania</option>
          </select>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
              <th style={{ padding: '0.6rem 0.5rem' }}>#</th>
              <th style={{ padding: '0.6rem 0.5rem', cursor: 'pointer' }} onClick={() => handleSort('display_name')}>
                Country <ArrowUpDown size={12} style={{ display: 'inline' }} />
              </th>
              <th style={{ padding: '0.6rem 0.5rem' }}>Region</th>
              <th style={{ padding: '0.6rem 0.5rem', cursor: 'pointer', textAlign: 'right' }} onClick={() => handleSort('sphere_area_visible_km2')}>
                True Area (km²) <ArrowUpDown size={12} style={{ display: 'inline' }} />
              </th>
              <th style={{ padding: '0.6rem 0.5rem', cursor: 'pointer', minWidth: '180px' }} onClick={() => handleSort('mercator_inflation')}>
                Mercator Inflation (AF) <ArrowUpDown size={12} style={{ display: 'inline' }} />
              </th>
              <th style={{ padding: '0.6rem 0.5rem', cursor: 'pointer', textAlign: 'right' }} onClick={() => handleSort('distortion_index_pct')}>
                Enlargement (DI) <ArrowUpDown size={12} style={{ display: 'inline' }} />
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, idx) => {
              const barWidthPct = Math.min(100, (c.mercator_inflation / maxInflation) * 100);
              return (
                <tr key={c.entity_id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>{idx + 1}</td>
                  <td style={{ padding: '0.5rem', fontWeight: 600 }}>{c.display_name}</td>
                  <td style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>{c.region_name}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {Math.round(c.sphere_area_visible_km2).toLocaleString()}
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div
                        style={{
                          width: `${barWidthPct}%`,
                          height: '8px',
                          background: c.mercator_inflation > 3 ? 'var(--color-accent)' : 'var(--color-primary)',
                          borderRadius: '2px',
                        }}
                      />
                      <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{c.mercator_inflation.toFixed(2)}×</span>
                    </div>
                  </td>
                  <td
                    style={{
                      padding: '0.5rem',
                      textAlign: 'right',
                      fontVariantNumeric: 'tabular-nums',
                      color: c.distortion_index_pct > 100 ? 'var(--color-accent)' : 'inherit',
                      fontWeight: c.distortion_index_pct > 100 ? 600 : 400,
                    }}
                  >
                    +{Math.round(c.distortion_index_pct)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
