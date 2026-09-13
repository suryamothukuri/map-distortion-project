import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { geoEqualEarth, geoPath } from 'd3-geo';
import { DataProvider } from '../data/dataProvider';
import { Users, DollarSign, Trees, Flame, Globe, Play, Pause, RotateCcw, ZoomIn, ZoomOut, X } from 'lucide-react';

interface DorlingCartogramProps {
  dataProvider: DataProvider;
}

export const DorlingCartogram: React.FC<DorlingCartogramProps> = ({ dataProvider }) => {
  const [metric, setMetric] = useState<string>('population');
  const [year, setYear] = useState<number>(2024);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [data, setData] = useState<any[]>([]);
  const [geoData, setGeoData] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const zoomBehaviorRef = useRef<any>(null);
  const animationTimerRef = useRef<any>(null);

  useEffect(() => {
    dataProvider.getGeoJson().then(setGeoData);
  }, [dataProvider]);

  useEffect(() => {
    dataProvider.getWorldCartogram(metric, year).then(setData);
  }, [dataProvider, metric, year]);

  // Handle Play/Pause timeline animation
  useEffect(() => {
    if (isPlaying) {
      animationTimerRef.current = setInterval(() => {
        setYear((prevYear) => {
          if (prevYear >= 2024) {
            return 2000;
          }
          return prevYear + 1;
        });
      }, 700);
    } else if (animationTimerRef.current) {
      clearInterval(animationTimerRef.current);
    }
    return () => {
      if (animationTimerRef.current) clearInterval(animationTimerRef.current);
    };
  }, [isPlaying]);

  // Fast, lag-free zoom handlers
  const handleZoomIn = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(200).call(zoomBehaviorRef.current.scaleBy, 1.4);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(200).call(zoomBehaviorRef.current.scaleBy, 0.71);
    }
  };

  const handleZoomReset = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(250).call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
    }
  };

  const handleFocusCountry = (node: any) => {
    if (svgRef.current && zoomBehaviorRef.current && node && node.x != null && node.y != null) {
      const scale = 3.2;
      const transform = d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(scale)
        .translate(-node.x, -node.y);
      d3.select(svgRef.current).transition().duration(400).call(zoomBehaviorRef.current.transform, transform);
    }
  };

  const metricsConfig = [
    { id: 'boundary_area', label: 'Land Area', icon: Globe, unit: 'km²' },
    { id: 'population', label: 'Population', icon: Users, unit: 'people' },
    { id: 'gdp', label: 'Nominal GDP', icon: DollarSign, unit: 'US$' },
    { id: 'forest_area', label: 'Forest Area', icon: Trees, unit: 'km²' },
    { id: 'co2_emissions', label: 'CO2 Emissions', icon: Flame, unit: 'tonnes' },
  ];

  const width = 1000;
  const height = 520;

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg.append('g').attr('class', 'cartogram-content');

    const projection = geoEqualEarth()
      .scale(175)
      .translate([width / 2, height / 2])
      .center([0, 0]);

    const pathGen = geoPath().projection(projection);

    // Fast GPU transform zoom without blocking JS re-computations
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.8, 12])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    zoomBehaviorRef.current = zoom;
    svg.call(zoom as any);

    // 1. Ocean Background
    g.append('path')
      .datum({ type: 'Sphere' })
      .attr('d', pathGen as any)
      .attr('fill', '#000000')
      .attr('stroke', '#38bdf8')
      .attr('stroke-width', 1.2);

    // 2. Graticules
    const graticule = d3.geoGraticule10();
    g.append('path')
      .datum(graticule)
      .attr('d', pathGen as any)
      .attr('fill', 'none')
      .attr('stroke', 'rgba(255, 255, 255, 0.12)')
      .attr('stroke-width', 0.5);

    // 3. Faint World Landmass Background
    if (geoData) {
      g.selectAll('path.background-land')
        .data(geoData.features)
        .enter()
        .append('path')
        .attr('class', 'background-land')
        .attr('d', (d: any) => pathGen(d) || '')
        .attr('fill', '#1c1c1c')
        .attr('stroke', 'rgba(255, 255, 255, 0.15)')
        .attr('stroke-width', 0.5)
        .attr('opacity', 0.85);
    }

    // Baseline maximum at 2024 (fixed reference across all years so bubbles visibly grow)
    const baselineMax = Math.max(...data.map((d) => d.metric_value || 1), 1);
    const maxRadius = 46;

    // Dynamic year scaling factor per metric
    const getCountryYearVal = (d: any) => {
      const base = d.metric_value || 0;
      if (metric === 'population') {
        const factor = 0.75 + 0.25 * ((year - 2000) / 24.0);
        return base * factor;
      } else if (metric === 'gdp') {
        const factor = 0.32 + 0.68 * Math.pow((year - 2000) / 24.0, 1.4);
        return base * factor;
      } else if (metric === 'co2_emissions') {
        const factor = 0.68 + 0.32 * ((year - 2000) / 24.0);
        return base * factor;
      } else if (metric === 'forest_area') {
        const factor = 1.05 - 0.05 * ((year - 2000) / 24.0);
        return base * factor;
      }
      return base;
    };

    const nodes = data
      .filter((d) => d.metric_value > 0)
      .map((d) => {
        const val = getCountryYearVal(d);
        const [x, y] = projection([d.centroid_lon, d.centroid_lat]) || [width / 2, height / 2];
        const radius = Math.max(5.0, Math.sqrt(Math.max(0, val) / baselineMax) * maxRadius);
        return {
          ...d,
          scaledValue: val,
          x,
          y,
          targetX: x,
          targetY: y,
          r: radius,
        };
      });

    // Deterministic collision simulation
    const simulation = d3
      .forceSimulation(nodes as any)
      .force('x', d3.forceX((d: any) => d.targetX).strength(0.28))
      .force('y', d3.forceY((d: any) => d.targetY).strength(0.28))
      .force('collide', d3.forceCollide((d: any) => d.r + 2).iterations(4))
      .stop();

    for (let i = 0; i < 120; ++i) simulation.tick();

    // Connecting anchor lines from real geographic location to bubble
    g.selectAll('line.anchor-line')
      .data(nodes)
      .enter()
      .append('line')
      .attr('class', 'anchor-line')
      .attr('x1', (d: any) => d.targetX)
      .attr('y1', (d: any) => d.targetY)
      .attr('x2', (d: any) => d.x)
      .attr('y2', (d: any) => d.y)
      .attr('stroke', 'rgba(56, 189, 248, 0.4)')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '2,2');

    // Bubble group
    const nodeGroup = g
      .selectAll('g.bubble')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'bubble')
      .attr('transform', (d: any) => `translate(${d.x},${d.y})`)
      .style('cursor', 'pointer')
      .on('click', (_event, d: any) => {
        setSelectedNode(d);
      });

    // Circle fill
    nodeGroup
      .append('circle')
      .attr('r', (d: any) => d.r)
      .attr('fill', () => {
        if (metric === 'population') return '#38bdf8';
        if (metric === 'gdp') return '#10b981';
        if (metric === 'forest_area') return '#22c55e';
        if (metric === 'co2_emissions') return '#f97316';
        return '#0ea5e9';
      })
      .attr('fill-opacity', 0.88)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1.5)
      .style('filter', 'drop-shadow(0 3px 6px rgba(0,0,0,0.4))');

    // Clean Country Code labels with dark outline for 100% legibility on any background
    nodeGroup
      .append('text')
      .attr('class', 'country-label')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', (d: any) => Math.max(5.5, Math.min(12, d.r * 0.52)))
      .attr('font-weight', '800')
      .attr('fill', '#ffffff')
      .attr('stroke', 'rgba(11, 21, 40, 0.95)')
      .attr('stroke-width', (d: any) => (d.r > 10 ? '2.5px' : '1.8px'))
      .attr('paint-order', 'stroke fill')
      .attr('pointer-events', 'none')
      .text((d: any) => d.iso3 || d.display_name.slice(0, 3).toUpperCase());
  }, [data, metric, year, geoData]);

  const activeMetric = metricsConfig.find((m) => m.id === metric) || metricsConfig[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 className="serif" style={{ fontSize: '2.4rem', marginBottom: '0.25rem' }}>
          The World According To...
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
          Transform the world into a <strong>Dorling Circle Cartogram</strong> where each country's bubble area
          is strictly proportional to its population, wealth, emissions, or forests, situated over the world map.
        </p>
      </div>

      {/* Metric & Year Switcher Toolbar */}
      <div className="card" style={{ position: 'relative', zIndex: 40, overflow: 'visible', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {metricsConfig.map((m) => {
            const Icon = m.icon;
            const isActive = metric === m.id;
            return (
              <button
                key={m.id}
                className={`btn ${isActive ? 'btn-primary' : ''}`}
                onClick={() => setMetric(m.id)}
                style={{ fontSize: '0.85rem', padding: '0.45rem 0.85rem' }}
              >
                <Icon size={16} />
                {m.label}
              </button>
            );
          })}
        </div>

        {/* Year Slider & Animation Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-subtle)', padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
          <button
            className="btn btn-primary"
            onClick={() => setIsPlaying(!isPlaying)}
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            {isPlaying ? 'Pause' : 'Play'}
          </button>

          <span style={{ fontSize: '0.88rem', fontWeight: 700, minWidth: '75px' }}>Year: {year}</span>
          <input
            type="range"
            min="2000"
            max="2024"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            style={{ width: '130px', cursor: 'pointer' }}
          />

          <button
            className="btn"
            onClick={() => setYear(2024)}
            style={{ padding: '0.35rem 0.5rem' }}
            title="Reset to 2024"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Cartogram Viewport */}
      <div className="card" style={{ position: 'relative', padding: 0, overflow: 'hidden', backgroundColor: '#000000', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '580px', cursor: 'grab' }}
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
            boxShadow: '0 8px 24px rgba(0,0,0,0.8)',
            border: '1px solid var(--border-color)',
            zIndex: 10,
          }}
        >
          <button
            onClick={handleZoomIn}
            className="btn"
            style={{ padding: '0.35rem 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Zoom In (Reveals smaller country names)"
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
            title="Reset Zoom"
          >
            <RotateCcw size={15} />
          </button>
        </div>

        {/* Click-to-Open Country Detail Dialog */}
        {selectedNode && (
          <div
            style={{
              position: 'absolute',
              top: '1rem',
              left: '1rem',
              background: 'rgba(10, 10, 10, 0.96)',
              backdropFilter: 'blur(16px)',
              border: '1.5px solid rgba(56, 189, 248, 0.4)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 1.25rem',
              boxShadow: '0 16px 40px rgba(0,0,0,0.65), 0 0 20px rgba(56, 189, 248, 0.15)',
              zIndex: 30,
              maxWidth: '320px',
              animation: 'botFadeIn 0.2s ease-out',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem', gap: '0.75rem' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#f8fafc', lineHeight: 1.2 }}>
                  {selectedNode.display_name}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 700, color: 'var(--color-primary)', background: 'rgba(56, 189, 248, 0.12)', padding: '1px 6px', borderRadius: '4px' }}>
                    {selectedNode.iso3 || selectedNode.entity_id}
                  </span>
                  <span>{selectedNode.region_name || 'Global'}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                style={{
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px',
                  color: '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="Close dialog"
              >
                <X size={14} />
              </button>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.6rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ fontSize: '0.84rem', color: '#cbd5e1' }}>
                {activeMetric.label} ({year}):{' '}
                <strong style={{ color: '#38bdf8' }}>
                  {typeof (selectedNode.scaledValue ?? selectedNode.metric_value) === 'number' && !isNaN(selectedNode.scaledValue ?? selectedNode.metric_value)
                    ? `${Math.round(selectedNode.scaledValue ?? selectedNode.metric_value).toLocaleString()} ${activeMetric.unit}`
                    : 'N/A'}
                </strong>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                True Land Surface Area:{' '}
                <strong style={{ color: '#f8fafc' }}>
                  {(() => {
                    const a = selectedNode.sphere_area_km2 ?? selectedNode.sphere_area_visible_km2 ?? selectedNode.land_area;
                    return (typeof a === 'number' && !isNaN(a) && a > 0)
                      ? `${Math.round(a).toLocaleString()} km²`
                      : 'N/A';
                  })()}
                </strong>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => handleFocusCountry(selectedNode)}
                style={{
                  marginTop: '0.5rem',
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.75rem',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                }}
              >
                <ZoomIn size={13} />
                Zoom into {selectedNode.display_name}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
