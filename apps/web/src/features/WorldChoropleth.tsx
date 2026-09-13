import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { geoMercator, geoEqualEarth, geoPath } from 'd3-geo';
import { DataProvider } from '../data/dataProvider';
import { CountryRecord } from '@map-distortion/contracts';
import { Search, Filter, Layers, Download, X, MapPin, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface WorldChoroplethProps {
  dataProvider: DataProvider;
}

export const WorldChoropleth: React.FC<WorldChoroplethProps> = ({ dataProvider }) => {
  const [countries, setCountries] = useState<CountryRecord[]>([]);
  const [geoData, setGeoData] = useState<any>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryRecord | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<CountryRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [projectionType, setProjectionType] = useState<'mercator' | 'equal_earth'>('mercator');

  const svgRef = useRef<SVGSVGElement>(null);
  const zoomBehaviorRef = useRef<any>(null);

  useEffect(() => {
    dataProvider.getCountries().then((list) => {
      setCountries(list);
      if (list.length > 0 && !selectedCountry) {
        const grl = list.find((c) => c.entity_id === 'GRL') || list[0];
        setSelectedCountry(grl);
      }
    });
    dataProvider.getGeoJson().then(setGeoData);
  }, [dataProvider]);

  const width = 1000;
  const height = 520;

  // Choropleth color interpolator (1.0 -> 7.0+ AF)
  const colorScale = d3
    .scaleSequential()
    .domain([1.0, 5.5])
    .interpolator(d3.interpolateYlOrRd);

  useEffect(() => {
    if (!geoData || !svgRef.current || countries.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg.append('g').attr('class', 'choropleth-content');

    const countryMap = new Map<string, CountryRecord>();
    countries.forEach((c) => countryMap.set(c.entity_id, c));

    const projection =
      projectionType === 'mercator'
        ? geoMercator().scale(150).translate([width / 2, height / 2 + 35]).center([0, 25])
        : geoEqualEarth().scale(175).translate([width / 2, height / 2]).center([0, 0]);

    const pathGen = geoPath().projection(projection);

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.8, 8])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    zoomBehaviorRef.current = zoom;
    svg.call(zoom as any);

    // 1. Ocean Background (Pure Deep Black)
    if (projectionType === 'equal_earth') {
      g.append('path')
        .datum({ type: 'Sphere' })
        .attr('d', pathGen as any)
        .attr('fill', '#000000')
        .attr('stroke', '#38bdf8')
        .attr('stroke-width', 1.2);
    } else {
      g.append('rect')
        .attr('width', width)
        .attr('height', height)
        .attr('fill', '#000000');
    }

    // 2. Graticules (Lat/Long grid lines)
    const graticule = d3.geoGraticule10();
    g.append('path')
      .datum(graticule)
      .attr('d', pathGen as any)
      .attr('fill', 'none')
      .attr('stroke', 'rgba(255, 255, 255, 0.12)')
      .attr('stroke-width', 0.5);

    // 3. Render all 177 authentic countries
    g.selectAll('path.country-feature')
      .data(geoData.features)
      .enter()
      .append('path')
      .attr('class', 'country-feature')
      .attr('d', (d: any) => pathGen(d) || '')
      .attr('fill', (d: any) => {
        const c = countryMap.get(d.id);
        if (!c) return '#1e293b';
        if (selectedRegion !== 'all' && c.region_id !== selectedRegion) return '#0f172a';
        if (projectionType === 'equal_earth') return '#0284c7'; // Uniform true-area cyan-blue
        return colorScale(c.mercator_inflation);
      })
      .attr('stroke', (d: any) => (selectedCountry?.entity_id === d.id ? '#38bdf8' : 'rgba(255, 255, 255, 0.25)'))
      .attr('stroke-width', (d: any) => (selectedCountry?.entity_id === d.id ? 2.5 : 0.6))
      .style('cursor', 'pointer')
      .style('transition', 'fill 0.15s, stroke 0.15s')
      .on('mouseenter', (_event, d: any) => {
        const c = countryMap.get(d.id);
        if (c) setHoveredCountry(c);
      })
      .on('mouseleave', () => setHoveredCountry(null))
      .on('click', (_event, d: any) => {
        const c = countryMap.get(d.id);
        if (c) setSelectedCountry(c);
      });
  }, [geoData, countries, selectedCountry, selectedRegion, projectionType]);

  const handleZoomIn = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 1.4);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 0.71);
    }
  };

  const handleZoomReset = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(400).call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
    }
  };

  const filteredCountries = countries.filter((c) => {
    const matchesSearch =
      c.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.iso3 && c.iso3.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRegion = selectedRegion === 'all' || c.region_id === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  const handleExportCsv = () => {
    const header = 'entity_id,display_name,iso3,region_id,sphere_area_km2,mercator_inflation,distortion_index_pct,pri,visual_power_gap_pp\n';
    const rows = filteredCountries
      .map(
        (c) =>
          `"${c.entity_id}","${c.display_name}","${c.iso3 || ''}","${c.region_id}",${c.sphere_area_visible_km2},${c.mercator_inflation},${c.distortion_index_pct},${c.pri || ''},${c.visual_power_gap_pp}`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `map_distortion_rankings_${selectedRegion}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Search & Filter Toolbar */}
      <div className="card" style={{ position: 'relative', zIndex: 50, overflow: 'visible', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', minWidth: '280px', zIndex: 9999 }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search 170+ countries (e.g. Canada, India)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 2rem 0.5rem 2.2rem',
                borderRadius: 'var(--radius-sm)',
                border: '1.5px solid var(--border-color)',
                backgroundColor: 'var(--bg-surface-solid)',
                color: '#ffffff',
                fontSize: '0.88rem',
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}

            {/* Dropdown Menu of matching countries */}
            {searchTerm.trim().length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '6px',
                  maxHeight: '280px',
                  overflowY: 'auto',
                  background: '#080d1a',
                  border: '1.5px solid rgba(56, 189, 248, 0.45)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.9)',
                  zIndex: 9999,
                }}
              >
                {filteredCountries.length === 0 ? (
                  <div style={{ padding: '0.75rem 1rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    No country matches "{searchTerm}"
                  </div>
                ) : (
                  filteredCountries.slice(0, 15).map((c) => (
                    <div
                      key={c.entity_id}
                      onClick={() => {
                        setSelectedCountry(c);
                        setSearchTerm('');
                      }}
                      style={{
                        padding: '0.55rem 0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: '1px solid var(--bg-subtle)',
                        backgroundColor: selectedCountry?.entity_id === c.entity_id ? 'var(--bg-subtle)' : 'transparent',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-subtle)')}
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          selectedCountry?.entity_id === c.entity_id ? 'var(--bg-subtle)' : 'transparent')
                      }
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{c.display_name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {c.region_name} • {c.iso3 || c.entity_id}
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          backgroundColor: c.mercator_inflation > 2.0 ? 'var(--color-accent-light)' : 'rgba(56, 189, 248, 0.15)',
                          color: c.mercator_inflation > 2.0 ? 'var(--color-accent)' : '#38bdf8',
                        }}
                      >
                        {c.mercator_inflation.toFixed(2)}× AF
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Filter size={16} color="var(--text-secondary)" />
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                fontSize: '0.88rem',
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Layers size={16} color="var(--text-secondary)" />
            <button
              className={`btn ${projectionType === 'mercator' ? 'btn-primary' : ''}`}
              onClick={() => setProjectionType('mercator')}
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.75rem' }}
            >
              Mercator
            </button>
            <button
              className={`btn ${projectionType === 'equal_earth' ? 'btn-primary' : ''}`}
              onClick={() => setProjectionType('equal_earth')}
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.75rem' }}
            >
              Equal Earth
            </button>
          </div>
        </div>

        <button className="btn" onClick={handleExportCsv} style={{ fontSize: '0.82rem' }}>
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Main Map + Detail Drawer Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedCountry ? '1fr 340px' : '1fr', gap: '1.5rem' }}>
        <div className="card" style={{ position: 'relative', padding: 0, overflow: 'hidden', backgroundColor: '#000000', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${width} ${height}`}
            style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '580px' }}
          />

          {/* Pan & Zoom Controls Toolbar */}
          <div
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
              background: 'rgba(10, 10, 10, 0.92)',
              backdropFilter: 'blur(8px)',
              padding: '0.4rem',
              borderRadius: 'var(--radius-sm)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              border: '1px solid var(--border-color)',
              zIndex: 10,
            }}
          >
            <button
              onClick={handleZoomIn}
              className="btn"
              style={{ padding: '0.35rem 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Zoom In"
            >
              <ZoomIn size={16} />
            </button>
            <button
              onClick={handleZoomOut}
              className="btn"
              style={{ padding: '0.35rem 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Zoom Out"
            >
              <ZoomOut size={16} />
            </button>
            <button
              onClick={handleZoomReset}
              className="btn"
              style={{ padding: '0.35rem 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Reset Pan & Zoom"
            >
              <RotateCcw size={15} />
            </button>
          </div>

          {/* Color Legend */}
          {projectionType === 'mercator' && (
            <div
              style={{
                position: 'absolute',
                bottom: '1rem',
                left: '1rem',
                background: 'rgba(15, 23, 42, 0.92)',
                backdropFilter: 'blur(8px)',
                padding: '0.6rem 0.9rem',
                borderRadius: 'var(--radius-sm)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                fontSize: '0.78rem',
                border: '1px solid var(--border-color)',
                color: '#f8fafc',
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: '0.35rem', color: '#f8fafc' }}>Mercator Inflation Factor (AF)</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#cbd5e1' }}>1.0× (Equator)</span>
                <div
                  style={{
                    width: '130px',
                    height: '10px',
                    background: 'linear-gradient(to right, #ffffb2, #fecc5c, #fd8d3c, #f03b20, #bd0026)',
                    borderRadius: '2px',
                  }}
                />
                <span style={{ color: '#cbd5e1' }}>6.0×+ (Arctic/High Lat)</span>
              </div>
            </div>
          )}

          {/* Tooltip */}
          {hoveredCountry && (
            <div
              style={{
                position: 'absolute',
                top: '1rem',
                left: '1rem',
                background: 'rgba(28, 36, 43, 0.95)',
                color: 'white',
                padding: '0.5rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                boxShadow: 'var(--shadow-md)',
                pointerEvents: 'none',
              }}
            >
              <div style={{ fontWeight: 700 }}>{hoveredCountry.display_name}</div>
              <div style={{ fontSize: '0.78rem', color: '#e0e6ed' }}>
                Inflation: <strong>{hoveredCountry.mercator_inflation.toFixed(2)}×</strong> (+{Math.round(hoveredCountry.distortion_index_pct)}% larger on Mercator)
              </div>
            </div>
          )}
        </div>

        {/* Selected Country Details Drawer */}
        {selectedCountry && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {selectedCountry.region_name}
                </span>
                <h3 style={{ fontSize: '1.5rem', marginTop: '0.1rem' }}>{selectedCountry.display_name}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ISO: {selectedCountry.iso3 || 'N/A'}</span>
              </div>
              <button
                onClick={() => setSelectedCountry(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                title="Close drawer"
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={{ background: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>True Spherical Area</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                  {Math.round(selectedCountry.sphere_area_visible_km2).toLocaleString()}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>km²</div>
              </div>

              <div style={{ background: 'var(--color-accent-light)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #fedcd2' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-accent)', textTransform: 'uppercase' }}>Mercator Inflation</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-accent)' }}>
                  {selectedCountry.mercator_inflation.toFixed(2)}×
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-accent)' }}>
                  +{Math.round(selectedCountry.distortion_index_pct)}% larger
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.84rem', lineHeight: '1.7', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
              <div><MapPin size={14} style={{ display: 'inline', marginRight: 4 }} /> <strong>Centroid:</strong> {selectedCountry.centroid_lat.toFixed(1)}° lat, {selectedCountry.centroid_lon.toFixed(1)}° lon</div>
              <div><strong>Mercator Map Share:</strong> {(selectedCountry.mercator_map_share * 100).toFixed(2)}% of map pixels</div>
              <div><strong>Real Earth Land Share:</strong> {(selectedCountry.land_share * 100).toFixed(2)}% of land surface</div>
              <div><strong>Visual Power Gap:</strong> {selectedCountry.visual_power_gap_pp > 0 ? `+${selectedCountry.visual_power_gap_pp.toFixed(2)}` : selectedCountry.visual_power_gap_pp.toFixed(2)} pp</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
