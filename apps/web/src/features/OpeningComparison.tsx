import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { geoEqualEarth, geoMercator, geoPath } from 'd3-geo';
import { DataProvider } from '../data/dataProvider';
import { CountryRecord, ReleaseMeta } from '@map-distortion/contracts';
import { ArrowRight, Sliders, Info, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface OpeningComparisonProps {
  dataProvider: DataProvider;
}

export const OpeningComparison: React.FC<OpeningComparisonProps> = ({ dataProvider }) => {
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [geoData, setGeoData] = useState<any>(null);
  const [meta, setMeta] = useState<ReleaseMeta | null>(null);
  const [greenland, setGreenland] = useState<CountryRecord | null>(null);
  const [drc, setDrc] = useState<CountryRecord | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgMercatorRef = useRef<SVGSVGElement>(null);
  const svgEqualEarthRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    dataProvider.getGeoJson().then(setGeoData);
    dataProvider.getMeta().then(setMeta);
    dataProvider.getCountryDetail('GRL').then(setGreenland);
    dataProvider.getCountryDetail('COD').then(setDrc);
  }, [dataProvider]);

  const width = 1000;
  const height = 520;

  useEffect(() => {
    if (!geoData) return;

    // 1. Mercator Layer
    if (svgMercatorRef.current) {
      const svg = d3.select(svgMercatorRef.current);
      svg.selectAll('*').remove();

      const projMerc = geoMercator()
        .scale(150)
        .translate([width / 2, height / 2 + 35])
        .center([0, 25]);

      const pathMerc = geoPath().projection(projMerc);

      // Ocean
      svg.append('rect')
        .attr('width', width)
        .attr('height', height)
        .attr('fill', '#000000');

      // Graticules
      const graticule = d3.geoGraticule10();
      svg.append('path')
        .datum(graticule)
        .attr('d', pathMerc as any)
        .attr('fill', 'none')
        .attr('stroke', 'rgba(255, 255, 255, 0.12)')
        .attr('stroke-width', 0.5);

      // Land countries
      svg.selectAll('path.country-merc')
        .data(geoData.features)
        .enter()
        .append('path')
        .attr('class', 'country-merc')
        .attr('d', (d: any) => pathMerc(d) || '')
        .attr('fill', (d: any) => {
          if (d.id === 'GRL') return '#f59e0b'; // Greenland highlighted in gold
          if (d.id === 'COD') return '#38bdf8'; // DR Congo highlighted in cyan
          return '#1c1c1c';
        })
        .attr('stroke', 'rgba(255, 255, 255, 0.18)')
        .attr('stroke-width', 0.6);
    }

    // 2. Equal Earth Layer
    if (svgEqualEarthRef.current) {
      const svg = d3.select(svgEqualEarthRef.current);
      svg.selectAll('*').remove();

      const projEE = geoEqualEarth()
        .scale(175)
        .translate([width / 2, height / 2])
        .center([0, 0]);

      const pathEE = geoPath().projection(projEE);

      // Sphere Background
      svg.append('path')
        .datum({ type: 'Sphere' })
        .attr('d', pathEE as any)
        .attr('fill', '#000000')
        .attr('stroke', '#38bdf8')
        .attr('stroke-width', 1.2);

      // Graticules
      const graticule = d3.geoGraticule10();
      svg.append('path')
        .datum(graticule)
        .attr('d', pathEE as any)
        .attr('fill', 'none')
        .attr('stroke', 'rgba(255, 255, 255, 0.12)')
        .attr('stroke-width', 0.5);

      // Land countries
      svg.selectAll('path.country-ee')
        .data(geoData.features)
        .enter()
        .append('path')
        .attr('class', 'country-ee')
        .attr('d', (d: any) => pathEE(d) || '')
        .attr('fill', (d: any) => {
          if (d.id === 'GRL') return '#f59e0b';
          if (d.id === 'COD') return '#38bdf8';
          return '#1c1c1c';
        })
        .attr('stroke', 'rgba(255, 255, 255, 0.2)')
        .attr('stroke-width', 0.6);
    }
  }, [geoData]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '850px', margin: '0 auto' }}>
        <h1 className="serif" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          How Much Does the Map Distort the World?
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
          On standard Mercator classroom maps, high-latitude landmasses like Greenland and Canada appear massive.
          Drag the interactive split-reveal handle below to see how the world transforms under the true-to-scale <strong>Equal Earth</strong> projection.
        </p>
      </div>

      {/* Split-Reveal Map Container */}
      <div
        ref={containerRef}
        className="card"
        style={{
          position: 'relative',
          padding: 0,
          overflow: 'hidden',
          backgroundColor: '#0b1528',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          userSelect: 'none',
          border: '1px solid var(--border-color)',
        }}
      >
        {/* Equal Earth base layer */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <svg
            ref={svgEqualEarthRef}
            viewBox={`0 0 ${width} ${height}`}
            style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '580px' }}
          />
          <div
            style={{
              position: 'absolute',
              top: '1.25rem',
              right: '1.5rem',
              background: 'rgba(15, 23, 42, 0.92)',
              backdropFilter: 'blur(8px)',
              padding: '0.45rem 0.9rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.88rem',
              fontWeight: 700,
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Sparkles size={16} color="#38bdf8" /> Equal Earth (True Physical Area)
          </div>
        </div>

        {/* Mercator clipped overlay layer */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: `${sliderPos}%`,
            overflow: 'hidden',
            backgroundColor: '#0b1528',
            borderRight: '3px solid var(--color-accent)',
          }}
        >
          <div style={{ width: containerRef.current ? containerRef.current.clientWidth : '100%', display: 'flex', justifyContent: 'center' }}>
            <svg
              ref={svgMercatorRef}
              viewBox={`0 0 ${width} ${height}`}
              style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '580px' }}
            />
          </div>
          <div
            style={{
              position: 'absolute',
              top: '1.25rem',
              left: '1.5rem',
              background: 'rgba(15, 23, 42, 0.92)',
              backdropFilter: 'blur(8px)',
              padding: '0.45rem 0.9rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.88rem',
              fontWeight: 700,
              color: 'var(--color-accent)',
              border: '1px solid rgba(249, 115, 22, 0.4)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
            }}
          >
            Mercator (Apparent Area Inflation)
          </div>
        </div>

        {/* Floating reveal slider handle */}
        <div
          style={{
            position: 'absolute',
            bottom: '1.25rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(12px)',
            padding: '0.6rem 1.4rem',
            borderRadius: '9999px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            zIndex: 20,
            border: '1px solid rgba(56, 189, 248, 0.3)',
            color: '#f8fafc',
          }}
        >
          <Sliders size={18} color="var(--color-primary)" />
          <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>Drag Reveal</span>
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPos}
            onChange={(e) => setSliderPos(Number(e.target.value))}
            style={{ width: '220px', cursor: 'ew-resize', accentColor: 'var(--color-accent)' }}
            aria-label="Mercator vs Equal Earth Reveal Slider"
          />
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', minWidth: '90px' }}>
            {sliderPos}% Mercator
          </span>
        </div>
      </div>

      {/* Ratios & Insights Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--color-accent)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              Headline Geometry Finding
            </span>
            <span className="badge badge-warning">Calculated</span>
          </div>
          <h3 style={{ fontSize: '1.75rem', color: 'var(--text-primary)', margin: '0.5rem 0' }}>
            Africa is ~{meta?.headline_ratios.africa_greenland_true_ratio || 14.02}× Larger
          </h3>
          <p style={{ fontSize: '0.88rem', margin: 0 }}>
            In reality, the entire continent of Africa (~30.37M km²) is <strong>fourteen times</strong> larger than Greenland (~2.17M km²).
            On a Mercator map, Greenland is stretched by ~9.45×, making them look almost identical in size.
          </p>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              Individual Country Matchup
            </span>
            <span className="badge badge-info">DR Congo vs. Greenland</span>
          </div>
          <h3 style={{ fontSize: '1.75rem', color: 'var(--text-primary)', margin: '0.5rem 0' }}>
            DR Congo &gt; Greenland
          </h3>
          <p style={{ fontSize: '0.88rem', margin: 0 }}>
            The Democratic Republic of the Congo ({drc ? Math.round(drc.sphere_area_visible_km2).toLocaleString() : '2,344,858'} km²)
            is physically larger than all of Greenland ({greenland ? Math.round(greenland.sphere_area_visible_km2).toLocaleString() : '2,166,086'} km²).
          </p>
        </div>

        <div className="card" style={{ background: 'rgba(11, 18, 34, 0.9)', borderColor: 'rgba(56, 189, 248, 0.35)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Info size={18} color="var(--color-primary)" />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>Explore Features</h4>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.75rem' }}>
            Check out every country's distortion score, drag countries around the 3D globe, or see the world sized by population.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Link to="/explore" className="btn btn-primary" style={{ fontSize: '0.82rem', padding: '0.35rem 0.75rem' }}>
              Explore Map <ArrowRight size={14} />
            </Link>
            <Link to="/lab" className="btn" style={{ fontSize: '0.82rem', padding: '0.35rem 0.75rem' }}>
              Move Lab
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
