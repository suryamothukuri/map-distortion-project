import React, { useState, useEffect } from 'react';
import { DataProvider } from '../data/dataProvider';
import { CountryRecord } from '@map-distortion/contracts';
import { Info, TrendingUp, TrendingDown, ChevronDown, ChevronUp, Search, X } from 'lucide-react';

interface VisualPowerGapProps {
  dataProvider: DataProvider;
}

export const VisualPowerGap: React.FC<VisualPowerGapProps> = ({ dataProvider }) => {
  const [countries, setCountries] = useState<CountryRecord[]>([]);
  const [viewMode, setViewMode] = useState<'countries' | 'regions'>('countries');
  const [showAllCountries, setShowAllCountries] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    dataProvider.getCountries().then(setCountries);
  }, [dataProvider]);

  const sovereignCountries = countries.filter((c) => c.region_id !== 'antarctica' && c.entity_id !== 'ATA');

  const regionsMap = new Map<string, { name: string; trueArea: number; mercatorArea: number }>();
  sovereignCountries.forEach((c) => {
    const existing = regionsMap.get(c.region_id) || { name: c.region_name, trueArea: 0, mercatorArea: 0 };
    existing.trueArea += c.sphere_area_visible_km2;
    existing.mercatorArea += c.mercator_area_km2;
    regionsMap.set(c.region_id, existing);
  });

  const totalTrueArea = Array.from(regionsMap.values()).reduce((sum, r) => sum + r.trueArea, 0);
  const totalMercatorArea = Array.from(regionsMap.values()).reduce((sum, r) => sum + r.mercatorArea, 0);

  const regionList = Array.from(regionsMap.entries()).map(([id, r]) => {
    const landShare = totalTrueArea > 0 ? (r.trueArea / totalTrueArea) * 100 : 0;
    const mapShare = totalMercatorArea > 0 ? (r.mercatorArea / totalMercatorArea) * 100 : 0;
    const gap = mapShare - landShare;
    return {
      id,
      name: r.name,
      landShare,
      mapShare,
      gap,
    };
  }).sort((a, b) => b.gap - a.gap);

  const sortedCountries = [...sovereignCountries].sort((a, b) => b.visual_power_gap_pp - a.visual_power_gap_pp);

  // Top 15 over-represented (positive gap)
  const topOver = sortedCountries.filter((c) => c.visual_power_gap_pp > 0).slice(0, 15);
  // Top 15 under-represented (most negative gap)
  const topUnder = sortedCountries.filter((c) => c.visual_power_gap_pp < 0).slice(-15).reverse();

  // Remaining countries with near-zero gap
  const topIds = new Set([...topOver.map((c) => c.entity_id), ...topUnder.map((c) => c.entity_id)]);
  const remainingCountries = sortedCountries.filter((c) => !topIds.has(c.entity_id));

  const filteredRemaining = remainingCountries.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      c.display_name.toLowerCase().includes(q) ||
      (c.iso3 && c.iso3.toLowerCase().includes(q)) ||
      c.region_name.toLowerCase().includes(q)
    );
  });

  const renderDivergenceRow = (name: string, gap: number, regionName?: string, iso3?: string | null) => {
    const isPositive = gap >= 0;
    const barWidth = Math.min(100, Math.abs(gap) * 11.5);

    return (
      <div
        key={name}
        style={{
          display: 'grid',
          gridTemplateColumns: '220px 1fr 1fr 90px',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.84rem',
          padding: '0.2rem 0',
        }}
      >
        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <span style={{ fontWeight: 600 }}>{name}</span>
          {regionName && (
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
              ({iso3 || regionName})
            </span>
          )}
        </div>

        {/* Negative Bar (Left of Zero Axis) */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', borderRight: '2px solid var(--text-primary)', height: '20px' }}>
          {!isPositive && (
            <div
              style={{
                width: `${barWidth}%`,
                background: 'var(--color-primary)',
                height: '100%',
                borderRadius: '3px 0 0 3px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                paddingLeft: '4px',
                color: 'white',
                fontSize: '0.72rem',
                minWidth: '4px',
              }}
            />
          )}
        </div>

        {/* Positive Bar (Right of Zero Axis) */}
        <div style={{ display: 'flex', justifyContent: 'flex-start', height: '20px' }}>
          {isPositive && (
            <div
              style={{
                width: `${barWidth}%`,
                background: 'var(--color-accent)',
                height: '100%',
                borderRadius: '0 3px 3px 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingRight: '4px',
                color: 'white',
                fontSize: '0.72rem',
                minWidth: '4px',
              }}
            />
          )}
        </div>

        {/* Value Label */}
        <div
          style={{
            textAlign: 'right',
            fontVariantNumeric: 'tabular-nums',
            fontWeight: 700,
            color: isPositive ? 'var(--color-accent)' : 'var(--color-primary)',
          }}
        >
          {isPositive ? `+${gap.toFixed(2)}` : gap.toFixed(2)} pp
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 className="serif" style={{ fontSize: '2.4rem', marginBottom: '0.25rem' }}>
          Visual Power Gap & Representation Index
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
          Measuring the cartographic difference between a nation’s actual land surface area versus its visual share of map pixels on Mercator.
        </p>
      </div>

      {/* Mode Switcher */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
        <button
          className={`btn ${viewMode === 'countries' ? 'btn-primary' : ''}`}
          onClick={() => setViewMode('countries')}
          style={{ padding: '0.45rem 1rem', fontSize: '0.88rem' }}
        >
          Top & Bottom Distortions
        </button>
        <button
          className={`btn ${viewMode === 'regions' ? 'btn-primary' : ''}`}
          onClick={() => setViewMode('regions')}
          style={{ padding: '0.45rem 1rem', fontSize: '0.88rem' }}
        >
          Continental / Regional Gap
        </button>
      </div>

      {viewMode === 'countries' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Key Summary Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <div className="card" style={{ borderLeft: '4px solid var(--color-accent)', background: 'var(--color-accent-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-accent)', textTransform: 'uppercase' }}>
                <TrendingUp size={16} /> Most Over-Represented
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.2rem' }}>
                {topOver[0]?.display_name || 'Russia'} (+{topOver[0]?.visual_power_gap_pp.toFixed(2)} pp)
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Occupies {(topOver[0]?.mercator_map_share * 100).toFixed(1)}% of Mercator pixels vs only {(topOver[0]?.land_share * 100).toFixed(1)}% of Earth landmass.
              </div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid var(--color-primary)', background: 'rgba(56, 189, 248, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                <TrendingDown size={16} /> Most Under-Represented
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.2rem' }}>
                {topUnder[0]?.display_name || 'Brazil'} ({topUnder[0]?.visual_power_gap_pp.toFixed(2)} pp)
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Makes up {(topUnder[0]?.land_share * 100).toFixed(1)}% of Earth's land, but gets only {(topUnder[0]?.mercator_map_share * 100).toFixed(1)}% of map pixels.
              </div>
            </div>
          </div>

          {/* Section 1: Top 15 Over-Represented Nations */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.6rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={18} color="var(--color-accent)" />
                <h3 style={{ fontSize: '1.15rem' }}>Top 15 Over-Represented Nations (High Northern Latitudes)</h3>
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-accent)', fontWeight: 700 }}>
                Visual Map Share &gt; Physical Land Share
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {topOver.map((c) => renderDivergenceRow(c.display_name, c.visual_power_gap_pp, c.region_name, c.iso3))}
            </div>
          </div>

          {/* Section 2: Top 15 Under-Represented Nations */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.6rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingDown size={18} color="var(--color-primary)" />
                <h3 style={{ fontSize: '1.15rem' }}>Top 15 Under-Represented Nations (Equatorial & Southern)</h3>
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-primary)', fontWeight: 700 }}>
                Physical Land Share &gt; Visual Map Share
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {topUnder.map((c) => renderDivergenceRow(c.display_name, c.visual_power_gap_pp, c.region_name, c.iso3))}
            </div>
          </div>

          {/* Section 3: Collapsible Remaining Countries Accordion with Search */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button
              type="button"
              onClick={() => setShowAllCountries(!showAllCountries)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                textAlign: 'left',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                  Remaining Nations ({remainingCountries.length} countries with near-zero delta)
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                  Countries with minimal visual distortion ($\pm 0.05$ percentage points)
                </p>
              </div>
              <div className="btn" style={{ padding: '0.35rem 0.75rem', fontSize: '0.82rem' }}>
                {showAllCountries ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                {showAllCountries ? 'Collapse' : 'Expand Remaining'}
              </div>
            </button>

            {showAllCountries && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ position: 'relative', maxWidth: '300px' }}>
                  <Search size={14} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search in remaining nations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.4rem 1.8rem 0.4rem 1.8rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontSize: '0.84rem',
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '380px', overflowY: 'auto' }}>
                  {filteredRemaining.length === 0 ? (
                    <div style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
                      No countries match "{searchQuery}"
                    </div>
                  ) : (
                    filteredRemaining.map((c) =>
                      renderDivergenceRow(c.display_name, c.visual_power_gap_pp, c.region_name, c.iso3)
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Continental Net Representation Gap */
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.15rem' }}>Continental Net Representation Gap</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Gap = Continental Map Share (%) − Continental Real Land Share (%)
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {regionList.map((r) => renderDivergenceRow(r.name, r.gap))}
          </div>
        </div>
      )}

      {/* Scientific Interpretation Footer */}
      <div className="card" style={{ background: 'var(--bg-subtle)', fontSize: '0.85rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        <Info size={20} color="var(--text-secondary)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>Scientific Interpretation:</strong> The term <em>"Visual Power Gap"</em> is a descriptive cartographic metric
          measuring the arithmetic difference between a polygon's share of world map pixels versus its physical surface area.
          It does not denote economic power, geopolitical intent, or societal causation.
        </div>
      </div>
    </div>
  );
};
