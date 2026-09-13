import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { geoEqualEarth, geoMercator, geoPath } from 'd3-geo';
import { DataProvider } from '../data/dataProvider';
import { CountryRecord } from '@map-distortion/contracts';
import { ArrowLeftRight, Globe, Scale, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { CountrySearchSelect } from '../components/CountrySearchSelect';

interface CountryVsCountryProps {
  dataProvider: DataProvider;
}

export const CountryVsCountry: React.FC<CountryVsCountryProps> = ({ dataProvider }) => {
  const [countries, setCountries] = useState<CountryRecord[]>([]);
  const [geoData, setGeoData] = useState<any>(null);
  const [idA, setIdA] = useState<string>('GRL'); // Greenland
  const [idB, setIdB] = useState<string>('COD'); // DR Congo
  const [projectionType, setProjectionType] = useState<'equal_area' | 'mercator'>('equal_area');
  const [displayMode, setDisplayMode] = useState<'side_by_side' | 'overlay'>('side_by_side');

  const worldSvgRef = useRef<SVGSVGElement>(null);
  const silhouetteSvgRef = useRef<SVGSVGElement>(null);
  const zoomBehaviorRef = useRef<any>(null);

  useEffect(() => {
    dataProvider.getCountries().then(setCountries);
    dataProvider.getGeoJson().then(setGeoData);
  }, [dataProvider]);

  const countryA = countries.find((c) => c.entity_id === idA) || countries[0];
  const countryB = countries.find((c) => c.entity_id === idB) || countries[1];

  const handleSwap = () => {
    setIdA(idB);
    setIdB(idA);
  };

  const presets = [
    { label: 'Greenland vs DR Congo', a: 'GRL', b: 'COD' },
    { label: 'Canada vs Brazil', a: 'CAN', b: 'BRA' },
    { label: 'USA vs China', a: 'USA', b: 'CHN' },
    { label: 'Norway vs Nigeria', a: 'NOR', b: 'NGA' },
    { label: 'Australia vs Brazil', a: 'AUS', b: 'BRA' },
    { label: 'Russia vs India', a: 'RUS', b: 'IND' },
  ];

  // Mathematical Ratios
  const trueAreaA = countryA?.sphere_area_visible_km2 || 1;
  const trueAreaB = countryB?.sphere_area_visible_km2 || 1;
  const trueRatio = trueAreaA / trueAreaB;

  const mercatorAreaA = countryA ? countryA.sphere_area_visible_km2 * countryA.mercator_inflation : 1;
  const mercatorAreaB = countryB ? countryB.sphere_area_visible_km2 * countryB.mercator_inflation : 1;
  const mercatorRatio = mercatorAreaA / mercatorAreaB;

  const ratioBias = trueRatio > 0 ? mercatorRatio / trueRatio : 1;

  const mapWidth = 960;
  const mapHeight = 400;

  // 1. Draw World Map with Interactive Pan & Zoom
  useEffect(() => {
    if (!geoData || !worldSvgRef.current) return;

    const svg = d3.select(worldSvgRef.current);
    svg.selectAll('*').remove();

    const g = svg.append('g').attr('class', 'map-content');

    const proj = geoEqualEarth()
      .scale(155)
      .translate([mapWidth / 2, mapHeight / 2 + 10])
      .center([0, 0]);

    const path = geoPath().projection(proj);

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.8, 8])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    zoomBehaviorRef.current = zoom;
    svg.call(zoom as any);

    // Ocean
    g.append('path')
      .datum({ type: 'Sphere' })
      .attr('d', path as any)
      .attr('fill', '#000000')
      .attr('stroke', '#38bdf8')
      .attr('stroke-width', 1);

    // Graticule
    const graticule = d3.geoGraticule10();
    g.append('path')
      .datum(graticule)
      .attr('d', path as any)
      .attr('fill', 'none')
      .attr('stroke', 'rgba(255, 255, 255, 0.12)')
      .attr('stroke-width', 0.5);

    // Countries
    g.selectAll('path.world-country')
      .data(geoData.features)
      .enter()
      .append('path')
      .attr('class', 'world-country')
      .attr('d', (d: any) => path(d) || '')
      .attr('fill', (d: any) => {
        if (d.id === idA) return '#f59e0b'; // Country A: bright gold/amber
        if (d.id === idB) return '#38bdf8'; // Country B: bright cyan
        return '#1c1c1c';
      })
      .attr('stroke', (d: any) => (d.id === idA || d.id === idB ? '#ffffff' : 'rgba(255, 255, 255, 0.18)'))
      .attr('stroke-width', (d: any) => (d.id === idA || d.id === idB ? 2.2 : 0.5))
      .style('cursor', 'pointer')
      .on('click', (_event, d: any) => {
        if (d.id !== idA && d.id !== idB) {
          setIdA(d.id);
        }
      });
  }, [geoData, idA, idB]);

  const handleZoomIn = () => {
    if (worldSvgRef.current && zoomBehaviorRef.current) {
      d3.select(worldSvgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 1.4);
    }
  };

  const handleZoomOut = () => {
    if (worldSvgRef.current && zoomBehaviorRef.current) {
      d3.select(worldSvgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 0.71);
    }
  };

  const handleZoomReset = () => {
    if (worldSvgRef.current && zoomBehaviorRef.current) {
      d3.select(worldSvgRef.current).transition().duration(400).call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
    }
  };

  // 2. Draw Side-by-Side or Overlaid Silhouettes at Exact Same Scale
  const silWidth = 960;
  const silHeight = 340;

  useEffect(() => {
    if (!geoData || !countryA || !countryB || !silhouetteSvgRef.current) return;

    const svg = d3.select(silhouetteSvgRef.current);
    svg.selectAll('*').remove();

    const featA = geoData.features.find((f: any) => f.id === countryA.entity_id);
    const featB = geoData.features.find((f: any) => f.id === countryB.entity_id);

    if (!featA || !featB) return;

    // Both silhouettes share the EXACT same scale
    const commonScale = 220;

    // Card background
    svg.append('rect')
      .attr('width', silWidth)
      .attr('height', silHeight)
      .attr('fill', '#0f172a');

    if (displayMode === 'side_by_side') {
      const projA =
        projectionType === 'equal_area'
          ? geoEqualEarth().scale(commonScale).center([countryA.centroid_lon, countryA.centroid_lat]).translate([silWidth * 0.28, silHeight * 0.5])
          : geoMercator().scale(commonScale * 0.9).center([countryA.centroid_lon, countryA.centroid_lat]).translate([silWidth * 0.28, silHeight * 0.5]);

      const projB =
        projectionType === 'equal_area'
          ? geoEqualEarth().scale(commonScale).center([countryB.centroid_lon, countryB.centroid_lat]).translate([silWidth * 0.72, silHeight * 0.5])
          : geoMercator().scale(commonScale * 0.9).center([countryB.centroid_lon, countryB.centroid_lat]).translate([silWidth * 0.72, silHeight * 0.5]);

      const pathA = geoPath().projection(projA);
      const pathB = geoPath().projection(projB);

      // Draw Silhouette A
      svg.append('path')
        .datum(featA)
        .attr('d', pathA as any)
        .attr('fill', '#f97316')
        .attr('stroke', '#ea580c')
        .attr('stroke-width', 1.8)
        .style('filter', 'drop-shadow(0 4px 12px rgba(249, 115, 22, 0.4))');

      // Draw Silhouette B
      svg.append('path')
        .datum(featB)
        .attr('d', pathB as any)
        .attr('fill', '#38bdf8')
        .attr('stroke', '#0284c7')
        .attr('stroke-width', 1.8)
        .style('filter', 'drop-shadow(0 4px 12px rgba(56, 189, 248, 0.4))');

      // Titles
      svg.append('text')
        .attr('x', silWidth * 0.28)
        .attr('y', silHeight - 16)
        .attr('text-anchor', 'middle')
        .attr('font-weight', '700')
        .attr('font-size', '14px')
        .attr('fill', '#f97316')
        .text(`${countryA.display_name} (${Math.round(countryA.sphere_area_visible_km2).toLocaleString()} km²)`);

      svg.append('text')
        .attr('x', silWidth * 0.72)
        .attr('y', silHeight - 16)
        .attr('text-anchor', 'middle')
        .attr('font-weight', '700')
        .attr('font-size', '14px')
        .attr('fill', '#38bdf8')
        .text(`${countryB.display_name} (${Math.round(countryB.sphere_area_visible_km2).toLocaleString()} km²)`);
    } else {
      // OVERLAY MODE: center both at silWidth * 0.5
      const projA =
        projectionType === 'equal_area'
          ? geoEqualEarth().scale(commonScale).center([countryA.centroid_lon, countryA.centroid_lat]).translate([silWidth * 0.5, silHeight * 0.5])
          : geoMercator().scale(commonScale * 0.9).center([countryA.centroid_lon, countryA.centroid_lat]).translate([silWidth * 0.5, silHeight * 0.5]);

      const projB =
        projectionType === 'equal_area'
          ? geoEqualEarth().scale(commonScale).center([countryB.centroid_lon, countryB.centroid_lat]).translate([silWidth * 0.5, silHeight * 0.5])
          : geoMercator().scale(commonScale * 0.9).center([countryB.centroid_lon, countryB.centroid_lat]).translate([silWidth * 0.5, silHeight * 0.5]);

      const pathA = geoPath().projection(projA);
      const pathB = geoPath().projection(projB);

      // Silhouette B in background
      svg.append('path')
        .datum(featB)
        .attr('d', pathB as any)
        .attr('fill', '#38bdf8')
        .attr('opacity', 0.85)
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 2);

      // Silhouette A overlaid on top
      svg.append('path')
        .datum(featA)
        .attr('d', pathA as any)
        .attr('fill', 'rgba(249, 115, 22, 0.75)')
        .attr('stroke', '#f97316')
        .attr('stroke-width', 2.2);

      svg.append('text')
        .attr('x', silWidth * 0.5)
        .attr('y', silHeight - 16)
        .attr('text-anchor', 'middle')
        .attr('font-weight', '700')
        .attr('font-size', '14px')
        .attr('fill', '#f8fafc')
        .text(`Direct Overlay: ${countryA.display_name} (Orange) on ${countryB.display_name} (Cyan)`);
    }
  }, [geoData, countryA, countryB, projectionType, displayMode]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 className="serif" style={{ fontSize: '2.4rem', marginBottom: '0.25rem' }}>
          Country vs. Country Face-Off
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
          Compare any two nations side-by-side at the <strong>exact same physical scale</strong> and inspect their locations on the world map.
        </p>
      </div>

      {/* Selectors Bar */}
      <div className="card" style={{ position: 'relative', zIndex: 50, overflow: 'visible', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <CountrySearchSelect
            countries={countries}
            selectedId={idA}
            onSelect={(c) => setIdA(c.entity_id)}
            placeholder="Search Country A..."
            accentColor="#f97316"
            minWidth="230px"
          />

          <button
            className="btn btn-primary"
            onClick={handleSwap}
            title="Swap Countries"
            style={{ padding: '0.45rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <ArrowLeftRight size={15} /> Swap
          </button>

          <CountrySearchSelect
            countries={countries}
            selectedId={idB}
            onSelect={(c) => setIdB(c.entity_id)}
            placeholder="Search Country B..."
            accentColor="#38bdf8"
            minWidth="230px"
          />
        </div>

        {/* Presets */}
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {presets.map((p) => (
            <button
              key={p.label}
              className="btn"
              onClick={() => {
                setIdA(p.a);
                setIdB(p.b);
              }}
              style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Full World Map Context with Pan & Zoom */}
      <div className="card" style={{ position: 'relative', padding: 0, overflow: 'hidden', background: '#000000', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(10, 10, 10, 0.92)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc' }}>
            <Globe size={18} color="var(--color-primary)" />
            Global Context: Pan & Zoom Enabled
          </div>
          <div style={{ fontSize: '0.82rem', display: 'flex', gap: '1rem' }}>
            <span style={{ color: '#f59e0b', fontWeight: 700 }}>■ {countryA?.display_name}</span>
            <span style={{ color: '#38bdf8', fontWeight: 700 }}>■ {countryB?.display_name}</span>
          </div>
        </div>

        <svg
          ref={worldSvgRef}
          viewBox={`0 0 ${mapWidth} ${mapHeight}`}
          style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '420px', cursor: 'grab' }}
        />

        {/* Pan & Zoom Controls Toolbar */}
        <div
          style={{
            position: 'absolute',
            bottom: '1rem',
            right: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
            background: 'rgba(10, 10, 10, 0.92)',
            backdropFilter: 'blur(8px)',
            padding: '0.4rem',
            borderRadius: 'var(--radius-sm)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.8)',
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
      </div>

      {/* 2. Side-by-Side Scale-Preserving Silhouettes */}
      <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1rem' }}>
            <Scale size={18} color="var(--color-primary)" />
            Direct Physical Scale Comparison (1:1 Normalized)
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', padding: '2px', border: '1px solid var(--border-color)' }}>
              <button
                className={`btn ${displayMode === 'side_by_side' ? 'btn-primary' : ''}`}
                onClick={() => setDisplayMode('side_by_side')}
                style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}
              >
                Side by Side
              </button>
              <button
                className={`btn ${displayMode === 'overlay' ? 'btn-primary' : ''}`}
                onClick={() => setDisplayMode('overlay')}
                style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}
              >
                Direct Overlay
              </button>
            </div>

            <div style={{ display: 'flex', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', padding: '2px', border: '1px solid var(--border-color)' }}>
              <button
                className={`btn ${projectionType === 'equal_area' ? 'btn-primary' : ''}`}
                onClick={() => setProjectionType('equal_area')}
                style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}
              >
                Equal-Area (True)
              </button>
              <button
                className={`btn ${projectionType === 'mercator' ? 'btn-primary' : ''}`}
                onClick={() => setProjectionType('mercator')}
                style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}
              >
                Mercator (Distorted)
              </button>
            </div>
          </div>
        </div>

        <div style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
          <svg
            ref={silhouetteSvgRef}
            viewBox={`0 0 ${silWidth} ${silHeight}`}
            style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '360px' }}
          />
        </div>
      </div>

      {/* 3. Mathematical Analysis Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ borderLeft: '4px solid #d9532f' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            {countryA?.display_name || 'Country A'}
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.2rem' }}>
            {Math.round(trueAreaA).toLocaleString()} km²
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
            Latitude: <strong>{countryA?.centroid_lat.toFixed(1)}°</strong> • Mercator AF: <strong>{countryA?.mercator_inflation.toFixed(2)}×</strong>
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #1b4965' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            {countryB?.display_name || 'Country B'}
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.2rem' }}>
            {Math.round(trueAreaB).toLocaleString()} km²
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
            Latitude: <strong>{countryB?.centroid_lat.toFixed(1)}°</strong> • Mercator AF: <strong>{countryB?.mercator_inflation.toFixed(2)}×</strong>
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--color-accent)', background: 'var(--color-accent-light)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-accent)', textTransform: 'uppercase', fontWeight: 700 }}>
            Projection Visual Bias
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-accent)', marginTop: '0.2rem' }}>
            {ratioBias.toFixed(2)}× Distortion
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
            True size ratio is <strong>{trueRatio.toFixed(2)}:1</strong>, but appears <strong>{mercatorRatio.toFixed(2)}:1</strong> on Mercator.
          </div>
        </div>
      </div>
    </div>
  );
};
