import React from 'react';
import { CountryVsCountry } from '../features/CountryVsCountry';
import { DataProvider } from '../data/dataProvider';

interface PageProps {
  dataProvider: DataProvider;
}

export const ComparePage: React.FC<PageProps> = ({ dataProvider }) => {
  return (
    <div>
      <CountryVsCountry dataProvider={dataProvider} />
    </div>
  );
};
