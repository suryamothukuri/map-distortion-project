import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { geoMercator, geoPath } from 'd3-geo';
import { DataProvider } from '../data/dataProvider';
import { CountryRecord } from '@map-distortion/contracts';
import { rotateMultiPolygonOnSphere, PointLonLat } from '@map-distortion/geo';
import { RotateCcw, AlertTriangle, CheckCircle2, MapPin, Sparkles, ZoomIn, ZoomOut } from 'lucide-react';
import { CountrySearchSelect } from '../components/CountrySearchSelect';

interface MoveCountryLabProps {
  dataProvider: DataProvider;
}

type MoveMode = 'country' | 'continent';

interface ContinentMeta {
  id: string;
  name: string;
  regionId: string;
  origCentroid: [number, number]; // [lon, lat]
  approxAreaKm2: number;
  funFact: string;
}

const CONTINENTS: ContinentMeta[] = [
  {
    id: 'africa',
    name: 'Africa',
    regionId: 'africa',
    origCentroid: [18.0, 3.5],
    approxAreaKm2: 30370000,
    funFact: 'Africa (30.37M km²) is larger than China, the US, India, and all of Europe combined!',
  },
  {
    id: 'south_america',
    name: 'South America',
    regionId: 'latin_america',
    origCentroid: [-58.0, -15.0],
    approxAreaKm2: 17840000,
    funFact: 'South America (17.84M km²) is nearly double the size of Europe (10.18M km²).',
  },
  {
    id: 'north_america',
    name: 'North America',
    regionId: 'north_america',
    origCentroid: [-100.0, 48.0],
    approxAreaKm2: 24710000,
    funFact: 'Mercator projection severely stretches North America, making Greenland look as big as Africa.',
  },
  {
    id: 'europe',
    name: 'Europe',
    regionId: 'europe',
    origCentroid: [20.0, 52.0],
    approxAreaKm2: 10180000,
    funFact: 'Europe appears massive on Mercator maps due to high northern latitudes (45°N - 71°N).',
  },
  {
    id: 'asia',
    name: 'Asia',
    regionId: 'asia',
    origCentroid: [95.0, 42.0],
    approxAreaKm2: 44580000,
    funFact: 'Asia is Earth’s largest continent, covering 30% of the world’s total land area.',
  },
  {
    id: 'oceania',
    name: 'Oceania / Australia',
    regionId: 'oceania',
    origCentroid: [135.0, -25.0],
    approxAreaKm2: 8560000,
    funFact: 'Australia alone covers 7.69M km², spanning the entire width of mainland Europe.',
  },
  {
    id: 'antarctica',
    name: 'Antarctica',
    regionId: 'antarctica',
    origCentroid: [0.0, -82.0],
    approxAreaKm2: 14200000,
    funFact: 'On a standard Mercator map, Antarctica is distorted infinitely and fills the entire bottom margin.',
  },
];

export const MoveCountryLab: React.FC<MoveCountryLabProps> = ({ dataProvider }) => {
  const [countries, setCountries] = useState<CountryRecord[]>([]);
  const [geoData, setGeoData] = useState<any>(null);
  
  const [mode, setMode] = useState<MoveMode>('country');
  const [selectedCountryId, setSelectedCountryId] = useState<string>('GRL');
  const [selectedContinentId, setSelectedContinentId] = useState<string>('africa');
  
  const [destLon, setDestLon] = useState<number>(20.0);
  const [destLat, setDestLat] = useState<number>(0.0);

  const svgRef = useRef<SVGSVGElement>(null);
  const zoomBehaviorRef = useRef<any>(null);

  useEffect(() => {
    dataProvider.getCountries().then((list) => {
      setCountries(list);
    });
    dataProvider.getGeoJson().then(setGeoData);
  }, [dataProvider]);

  const selectedCountry = countries.find((c) => c.entity_id === selectedCountryId) || countries[0];
  const selectedContinent = CONTINENTS.find((c) => c.id === selectedContinentId) || CONTINENTS[0];

  const handleModeChange = (newMode: MoveMode) => {
    setMode(newMode);
    if (newMode === 'continent') {
      setSelectedContinentId('africa');
      setDestLat(40.0);
      setDestLon(-95.0);
    } else {
      setSelectedCountryId('GRL');
      setDestLat(0.0);
      setDestLon(20.0);
    }
  };

  const handleCountrySelect = (cId: string) => {
    setSelectedCountryId(cId);
    const c = countries.find((item) => item.entity_id === cId);
    if (c) {
      setDestLon(0.0);
      setDestLat(0.0);
    }
  };

  const handleContinentSelect = (contId: string) => {
    setSelectedContinentId(contId);
    const cont = CONTINENTS.find((c) => c.id === contId);
    if (cont) {
      if (cont.id === 'africa') {
        setDestLat(40.0);
        setDestLon(-95.0);
      } else {
        setDestLat(0.0);
        setDestLon(20.0);
      }
    }
  };

  const handleReset = () => {
    if (mode === 'country' && selectedCountry) {
      setDestLon(selectedCountry.centroid_lon);
      setDestLat(selectedCountry.centroid_lat);
    } else if (mode === 'continent' && selectedContinent) {
      setDestLon(selectedContinent.origCentroid[0]);
      setDestLat(selectedContinent.origCentroid[1]);
    }
  };

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

  const width = 1000;
  const height = 520;

  let rotatedFeature: any = null;
  let originalFeatures: any[] = [];
  let isClipped = false;
  let sourceCentroid: PointLonLat = [0, 0];
  let trueAreaKm2 = 0;
  let origInflation = 1.0;
  let movedAf = 1.0;

  if (geoData) {
    if (mode === 'country' && selectedCountry) {
      const rawFeature = geoData.features.find((f: any) => f.id === selectedCountry.entity_id);
      if (rawFeature) {
        originalFeatures = [rawFeature];
        const geomType = rawFeature.geometry.type;
        let multiPolyCoords: PointLonLat[][][];

        if (geomType === 'Polygon') {
          multiPolyCoords = [rawFeature.geometry.coordinates];
        } else if (geomType === 'MultiPolygon') {
          multiPolyCoords = rawFeature.geometry.coordinates;
        } else {
          multiPolyCoords = [];
        }

        sourceCentroid = [selectedCountry.centroid_lon, selectedCountry.centroid_lat];
        trueAreaKm2 = selectedCountry.sphere_area_visible_km2;
        origInflation = selectedCountry.mercator_inflation;

        if (multiPolyCoords.length > 0) {
          const targetAnchor: PointLonLat = [destLon, destLat];
          const rotRes = rotateMultiPolygonOnSphere(multiPolyCoords, sourceCentroid, targetAnchor, 85.0);
          isClipped = rotRes.exceedsClipLatitude;

          rotatedFeature = {
            type: 'Feature',
            geometry: {
              type: 'MultiPolygon',
              coordinates: rotRes.rotatedCoordinates,
            },
          };
        }
      }
    } else if (mode === 'continent' && selectedContinent) {
      let continentFeatures: any[] = [];
      if (selectedContinent.id === 'antarctica') {
        continentFeatures = geoData.features.filter((f: any) => f.id === '010' || f.id === 'ATA' || f.id === '260');
      } else if (selectedContinent.id === 'south_america') {
        continentFeatures = geoData.features.filter((f: any) => {
          const c = countries.find((item) => item.entity_id === f.id);
          return c?.region_id === 'latin_america' && c.centroid_lat < 13;
        });
      } else {
        continentFeatures = geoData.features.filter((f: any) => {
          const c = countries.find((item) => item.entity_id === f.id);
          return c?.region_id === selectedContinent.regionId;
        });
      }

      if (continentFeatures.length > 0) {
        originalFeatures = continentFeatures;
        let combinedCoords: PointLonLat[][][] = [];

        continentFeatures.forEach((f: any) => {
          if (f.geometry.type === 'Polygon') {
            combinedCoords.push(f.geometry.coordinates);
          } else if (f.geometry.type === 'MultiPolygon') {
            f.geometry.coordinates.forEach((poly: any) => combinedCoords.push(poly));
          }
        });

        sourceCentroid = [selectedContinent.origCentroid[0], selectedContinent.origCentroid[1]];
        
        const memberCountries = countries.filter((c) =>
          continentFeatures.some((f) => f.id === c.entity_id)
        );
        trueAreaKm2 = memberCountries.reduce((sum, c) => sum + c.sphere_area_visible_km2, 0);
        if (trueAreaKm2 === 0) trueAreaKm2 = selectedContinent.approxAreaKm2;

        const targetAnchor: PointLonLat = [destLon, destLat];
        const rotRes = rotateMultiPolygonOnSphere(combinedCoords, sourceCentroid, targetAnchor, 85.0);
        isClipped = rotRes.exceedsClipLatitude;

        rotatedFeature = {
          type: 'Feature',
          geometry: {
            type: 'MultiPolygon',
            coordinates: rotRes.rotatedCoordinates,
          },
        };
      }
    }

    const destCos = Math.cos((destLat * Math.PI) / 180.0);
    const origCos = Math.cos((sourceCentroid[1] * Math.PI) / 180.0);
    const destJ = 1.0 / Math.max(0.001, destCos * destCos);
    const origJ = 1.0 / Math.max(0.001, origCos * origCos);

    movedAf = Math.max(1.0, origInflation * (destJ / origJ));
  }

  useEffect(() => {
    if (!geoData || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg.append('g').attr('class', 'move-map-content');

    const projection = geoMercator()
      .scale(150)
      .translate([width / 2, height / 2 + 35])
      .center([0, 25]);

    const pathGen = geoPath().projection(projection);

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.8, 8])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    zoomBehaviorRef.current = zoom;
    svg.call(zoom as any);

    g.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', '#000000');

    const graticule = d3.geoGraticule10();
    g.append('path')
      .datum(graticule)
      .attr('d', pathGen as any)
      .attr('fill', 'none')
      .attr('stroke', 'rgba(255, 255, 255, 0.12)')
      .attr('stroke-width', 0.5);

    g.selectAll('path.world-country')
      .data(geoData.features)
      .enter()
      .append('path')
      .attr('class', 'world-country')
      .attr('d', (d: any) => pathGen(d) || '')
      .attr('fill', '#1c1c1c')
      .attr('stroke', 'rgba(255, 255, 255, 0.18)')
      .attr('stroke-width', 0.5)
      .attr('opacity', 0.9);

    if (originalFeatures.length > 0) {
      originalFeatures.forEach((feat) => {
        g.append('path')
          .datum(feat)
          .attr('d', pathGen as any)
          .attr('fill', 'rgba(249, 115, 22, 0.15)')
          .attr('stroke', 'var(--color-accent)')
          .attr('stroke-width', 1.8)
          .attr('stroke-dasharray', '4,3');
      });
    }

    if (rotatedFeature) {
      g.append('path')
        .datum(rotatedFeature)
        .attr('d', pathGen as any)
        .attr('fill', isClipped ? 'rgba(239, 68, 68, 0.85)' : '#38bdf8')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 1.8)
        .style('filter', 'drop-shadow(0 6px 16px rgba(56, 189, 248, 0.4))');
    }

    const anchorCoord = projection([destLon, destLat]);
    if (anchorCoord) {
      g.append('circle')
        .attr('cx', anchorCoord[0])
        .attr('cy', anchorCoord[1])
        .attr('r', 6)
        .attr('fill', '#f97316')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 2);
    }

    svg.on('click', (event) => {
      const [mouseX, mouseY] = d3.pointer(event, g.node());
      const inverted = projection.invert ? projection.invert([mouseX, mouseY]) : null;
      if (inverted) {
        setDestLon(Number(inverted[0].toFixed(1)));
        setDestLat(Number(Math.max(-80, Math.min(80, inverted[1])).toFixed(1)));
      }
    });
  }, [geoData, originalFeatures, destLon, destLat, rotatedFeature, isClipped]);

  const activeTitle = mode === 'continent' ? selectedContinent.name : selectedCountry?.display_name || 'Country';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 className="serif" style={{ fontSize: '2.4rem', marginBottom: '0.25rem' }}>
          Move Anything Laboratory
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
          Compare true scale by rotating any individual country <strong>or an entire continent</strong> across the 3D globe.
          Click anywhere on the world map or use the sliders to test true landmass proportions.
        </p>
      </div>

      <div className="card" style={{ position: 'relative', zIndex: 50, overflow: 'visible', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ background: 'var(--bg-subtle)', padding: '0.35rem 0.5rem', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '0 0.4rem', color: 'var(--text-secondary)' }}>
              Move Target:
            </span>
            <button
              className={`btn ${mode === 'country' ? 'btn-primary' : ''}`}
              onClick={() => handleModeChange('country')}
              style={{ fontSize: '0.82rem', padding: '0.35rem 0.75rem' }}
            >
              Country
            </button>
            <button
              className={`btn ${mode === 'continent' ? 'btn-primary' : ''}`}
              onClick={() => handleModeChange('continent')}
              style={{ fontSize: '0.82rem', padding: '0.35rem 0.75rem' }}
            >
              Entire Continent
            </button>
          </div>

          {mode === 'country' ? (
            <CountrySearchSelect
              countries={countries}
              selectedId={selectedCountryId}
              onSelect={(c) => handleCountrySelect(c.entity_id)}
              label="Search & Select Country (170+):"
              placeholder="Type country name or code..."
              accentColor="var(--color-primary)"
              minWidth="270px"
            />
          ) : (
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>
                Select Continent:
              </label>
              <select
                value={selectedContinentId}
                onChange={(e) => handleContinentSelect(e.target.value)}
                style={{
                  padding: '0.5rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                }}
              >
                {CONTINENTS.map((cont) => (
                  <option key={cont.id} value={cont.id}>
                    {cont.name} (~{(cont.approxAreaKm2 / 1000000).toFixed(1)}M km²)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>
              Comparison Presets:
            </label>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {mode === 'continent' ? (
                <>
                  <button className="btn" onClick={() => { setSelectedContinentId('africa'); setDestLat(38); setDestLon(-95); }} style={{ fontSize: '0.78rem', padding: '0.3rem 0.65rem' }}>
                    Africa over USA
                  </button>
                  <button className="btn" onClick={() => { setSelectedContinentId('africa'); setDestLat(55); setDestLon(35); }} style={{ fontSize: '0.78rem', padding: '0.3rem 0.65rem' }}>
                    Africa over Europe/Russia
                  </button>
                  <button className="btn" onClick={() => { setSelectedContinentId('south_america'); setDestLat(42); setDestLon(-95); }} style={{ fontSize: '0.78rem', padding: '0.3rem 0.65rem' }}>
                    South America over USA
                  </button>
                  <button className="btn" onClick={() => { setSelectedContinentId('europe'); setDestLat(-25); setDestLon(135); }} style={{ fontSize: '0.78rem', padding: '0.3rem 0.65rem' }}>
                    Europe over Australia
                  </button>
                </>
              ) : (
                <>
                  <button className="btn" onClick={() => { setSelectedCountryId('GRL'); setDestLat(0); setDestLon(20); }} style={{ fontSize: '0.78rem', padding: '0.3rem 0.65rem' }}>
                    Greenland to Equator
                  </button>
                  <button className="btn" onClick={() => { setSelectedCountryId('USA'); setDestLat(70); setDestLon(100); }} style={{ fontSize: '0.78rem', padding: '0.3rem 0.65rem' }}>
                    USA to Arctic
                  </button>
                  <button className="btn" onClick={() => { setSelectedCountryId('IND'); setDestLat(55); setDestLon(10); }} style={{ fontSize: '0.78rem', padding: '0.3rem 0.65rem' }}>
                    India over Europe
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <button className="btn" onClick={handleReset} style={{ fontSize: '0.85rem' }}>
          <RotateCcw size={15} /> Reset Origin
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>
        <div className="card" style={{ position: 'relative', padding: 0, overflow: 'hidden', backgroundColor: '#000000', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${width} ${height}`}
            style={{ width: '100%', height: 'auto', display: 'block', cursor: 'crosshair', maxHeight: '580px' }}
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
              title="Reset View"
            >
              <RotateCcw size={15} />
            </button>
          </div>

          <div
            style={{
              position: 'absolute',
              top: '1rem',
              left: '1rem',
              background: 'rgba(10, 10, 10, 0.92)',
              backdropFilter: 'blur(8px)',
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem',
              boxShadow: '0 8px 24px rgba(0,0,0,0.8)',
              border: '1px solid var(--border-color)',
              color: '#f8fafc',
            }}
          >
            <MapPin size={14} style={{ display: 'inline', marginRight: 4, color: 'var(--color-accent)' }} />
            <strong>Click anywhere</strong> on the world map to move <strong>{activeTitle}</strong>
          </div>

          {isClipped && (
            <div
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'rgba(217, 83, 47, 0.95)',
                color: 'white',
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <AlertTriangle size={16} /> Extreme polar distortion (&gt;85° Lat)
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem' }}>
              {activeTitle} Scale Analysis
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ background: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Spherical True Land Area
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                  {Math.round(trueAreaKm2).toLocaleString()} km²
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.2rem' }}>
                  <CheckCircle2 size={13} /> 100.0% area preserved via 3D rotation
                </div>
              </div>

              <div style={{ background: 'var(--color-accent-light)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(249, 115, 22, 0.3)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-accent)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Mercator Projected Footprint
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-accent)' }}>
                  {movedAf.toFixed(2)}× Inflation
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Apparent area at {destLat.toFixed(1)}° Lat: ~{Math.round(trueAreaKm2 * movedAf).toLocaleString()} km²
                </div>
              </div>

              {mode === 'continent' && (
                <div style={{ background: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', lineHeight: '1.45', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.25rem' }}>
                    <Sparkles size={14} /> Geographic Truth:
                  </div>
                  <span style={{ color: 'var(--text-secondary)' }}>{selectedContinent.funFact}</span>
                </div>
              )}
            </div>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Target Position Sliders</h3>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: 700 }}>
                <span>Target Latitude</span>
                <span>{destLat.toFixed(1)}° {destLat >= 0 ? 'N' : 'S'}</span>
              </div>
              <input
                type="range"
                min="-80"
                max="80"
                step="0.5"
                value={destLat}
                onChange={(e) => setDestLat(Number(e.target.value))}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: 700 }}>
                <span>Target Longitude</span>
                <span>{destLon.toFixed(1)}° {destLon >= 0 ? 'E' : 'W'}</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                step="1"
                value={destLon}
                onChange={(e) => setDestLon(Number(e.target.value))}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
