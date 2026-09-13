import React from 'react';
import { VisualPowerGap } from '../features/VisualPowerGap';
import { DataProvider } from '../data/dataProvider';

interface PageProps {
  dataProvider: DataProvider;
}

export const RepresentationPage: React.FC<PageProps> = ({ dataProvider }) => {
  return (
    <div>
      <VisualPowerGap dataProvider={dataProvider} />
    </div>
  );
};
