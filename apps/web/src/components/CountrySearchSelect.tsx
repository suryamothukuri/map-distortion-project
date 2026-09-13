import React, { useState, useRef, useEffect } from 'react';
import { CountryRecord } from '@map-distortion/contracts';
import { Search, ChevronDown, X, MapPin } from 'lucide-react';

interface CountrySearchSelectProps {
  countries: CountryRecord[];
  selectedId: string;
  onSelect: (country: CountryRecord) => void;
  label?: string;
  placeholder?: string;
  accentColor?: string;
  minWidth?: string;
}

export const CountrySearchSelect: React.FC<CountrySearchSelectProps> = ({
  countries,
  selectedId,
  onSelect,
  label,
  placeholder = 'Search country or code...',
  accentColor = 'var(--color-primary)',
  minWidth = '240px',
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedCountry = countries.find((c) => c.entity_id === selectedId) || countries[0];

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCountries = countries.filter((c) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase().trim();
    return (
      c.display_name.toLowerCase().includes(q) ||
      (c.iso3 && c.iso3.toLowerCase().includes(q)) ||
      c.region_name.toLowerCase().includes(q)
    );
  });

  const handleOpen = () => {
    setIsOpen(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleSelect = (c: CountryRecord) => {
    onSelect(c);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        minWidth,
        display: 'inline-block',
        zIndex: isOpen ? 9999 : 'auto',
      }}
    >
      {label && (
        <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>
          {label}
        </label>
      )}

      {/* Button trigger when closed */}
      {!isOpen ? (
        <button
          type="button"
          onClick={handleOpen}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            padding: '0.5rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            border: `1.5px solid ${accentColor}`,
            background: 'var(--bg-surface-solid)',
            cursor: 'pointer',
            textAlign: 'left',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', overflow: 'hidden' }}>
            <MapPin size={14} style={{ color: accentColor, flexShrink: 0 }} />
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {selectedCountry ? selectedCountry.display_name : 'Select country...'}
            </span>
            {selectedCountry?.iso3 && (
              <span style={{ fontSize: '0.72rem', background: 'rgba(255, 255, 255, 0.12)', padding: '1px 6px', borderRadius: '4px', color: '#94a3b8', fontWeight: 700 }}>
                {selectedCountry.iso3}
              </span>
            )}
          </div>
          <ChevronDown size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        </button>
      ) : (
        /* Search Input when open */
        <div style={{ position: 'relative', width: '100%', zIndex: 9999 }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setIsOpen(false);
                setQuery('');
              } else if (e.key === 'Enter' && filteredCountries.length > 0) {
                handleSelect(filteredCountries[0]);
              }
            }}
            style={{
              width: '100%',
              padding: '0.5rem 2rem 0.5rem 2.2rem',
              borderRadius: 'var(--radius-sm)',
              border: `2px solid ${accentColor}`,
              background: '#090e1c',
              color: '#ffffff',
              fontSize: '0.9rem',
              outline: 'none',
              boxShadow: `0 0 20px ${accentColor}55`,
            }}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
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
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {/* Autocomplete Dropdown List */}
      {isOpen && (
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
            boxShadow: '0 20px 50px rgba(0,0,0,0.85)',
            zIndex: 9999,
          }}
        >
          {filteredCountries.length === 0 ? (
            <div style={{ padding: '0.75rem', fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              No countries match "{query}"
            </div>
          ) : (
            filteredCountries.map((c) => {
              const isSelected = c.entity_id === selectedId;
              return (
                <div
                  key={c.entity_id}
                  onClick={() => handleSelect(c)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid var(--bg-subtle)',
                    backgroundColor: isSelected ? 'var(--bg-subtle)' : 'transparent',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-subtle)')}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = isSelected ? 'var(--bg-subtle)' : 'transparent')
                  }
                >
                  <div style={{ overflow: 'hidden', marginRight: '0.5rem' }}>
                    <div style={{ fontWeight: isSelected ? 700 : 500, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      {c.display_name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {c.region_name} • {c.iso3 || c.entity_id}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: '3px',
                      backgroundColor: c.mercator_inflation > 2.0 ? 'var(--color-accent-light)' : '#e6f0f7',
                      color: c.mercator_inflation > 2.0 ? 'var(--color-accent)' : 'var(--color-primary)',
                      flexShrink: 0,
                    }}
                  >
                    {c.mercator_inflation.toFixed(1)}× AF
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
