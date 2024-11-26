import { createContext, useContext, useState, ReactNode } from 'react';

interface ZIndexContextType {
  getNextZIndex: () => number;
}

const ZIndexContext = createContext<ZIndexContextType | null>(null);

export function ZIndexProvider({ children }: { children: ReactNode }) {
  const [currentZIndex, setCurrentZIndex] = useState(1);

  const getNextZIndex = () => {
    setCurrentZIndex(prev => prev + 1);
    return currentZIndex + 1;
  };

  return (
    <ZIndexContext.Provider value={{ getNextZIndex }}>
      {children}
    </ZIndexContext.Provider>
  );
}

export function useZIndex() {
  const context = useContext(ZIndexContext);
  if (!context) {
    throw new Error('useZIndex must be used within a ZIndexProvider');
  }
  return context;
}