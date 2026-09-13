import React from 'react';
import { OpeningComparison } from '../features/OpeningComparison';
import { DataProvider } from '../data/dataProvider';

interface PageProps {
  dataProvider: DataProvider;
}

export const HomePage: React.FC<PageProps> = ({ dataProvider }) => {
  return (
    <div>
      <OpeningComparison dataProvider={dataProvider} />
    </div>
  );
};
