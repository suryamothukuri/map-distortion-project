import React from 'react';
import { DorlingCartogram } from '../features/DorlingCartogram';
import { DataProvider } from '../data/dataProvider';

interface PageProps {
  dataProvider: DataProvider;
}

export const WorldPage: React.FC<PageProps> = ({ dataProvider }) => {
  return (
    <div>
      <DorlingCartogram dataProvider={dataProvider} />
    </div>
  );
};
