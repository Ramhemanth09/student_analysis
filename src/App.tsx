import React from 'react';
import { DataProvider } from './context/DataContext';
import { AppContent } from './AppContent';

export const App: React.FC = () => {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
};

export default App;
