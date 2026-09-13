import React, { useState, useEffect } from 'react';
import { WorldChoropleth } from '../features/WorldChoropleth';
import { RankingTable } from '../features/RankingTable';
import { DataProvider } from '../data/dataProvider';
import { CountryRecord } from '@map-distortion/contracts';

interface PageProps {
  dataProvider: DataProvider;
}

export const ExplorePage: React.FC<PageProps> = ({ dataProvider }) => {
  const [countries, setCountries] = useState<CountryRecord[]>([]);

  useEffect(() => {
    dataProvider.getCountries().then(setCountries);
  }, [dataProvider]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 className="serif">Country Distortion Explorer</h1>
        <p>
          Inspect country-level Mercator Area Inflation Factors (AF), surface areas, and distortion metrics.
        </p>
      </div>

      <WorldChoropleth dataProvider={dataProvider} />

      <RankingTable countries={countries} />
    </div>
  );
};
