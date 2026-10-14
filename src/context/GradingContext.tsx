import { createContext, useContext, type ReactNode } from 'react';
import { useAppStore } from '../lib/store';

const GradingContext = createContext<ReturnType<typeof useAppStore> | undefined>(undefined);

export function GradingProvider({ children }: { children: ReactNode }) {
  const store = useAppStore();

  return (
    <GradingContext.Provider value={store}>
      {children}
    </GradingContext.Provider>
  );
}

export function useGrading() {
  const context = useContext(GradingContext);
  if (!context) throw new Error('useGrading must be used within a GradingProvider');
  return context;
}