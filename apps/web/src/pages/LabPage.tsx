import React from 'react';
import { MoveCountryLab } from '../features/MoveCountryLab';
import { DataProvider } from '../data/dataProvider';

interface PageProps {
  dataProvider: DataProvider;
}

export const LabPage: React.FC<PageProps> = ({ dataProvider }) => {
  return (
    <div>
      <MoveCountryLab dataProvider={dataProvider} />
    </div>
  );
};
