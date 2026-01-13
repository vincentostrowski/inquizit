import React, { createContext, useContext, useState, ReactNode } from 'react';

type ViewMode = 'cards' | 'list';
type FilterMode = 'all' | 'main' | 'saved';

interface ViewModeContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  filterMode: FilterMode;
  setFilterMode: (mode: FilterMode) => void;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

interface ViewModeProviderProps {
  children: ReactNode;
}

export function ViewModeProvider({ children }: ViewModeProviderProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');

  return (
    <ViewModeContext.Provider value={{ viewMode, setViewMode, filterMode, setFilterMode }}>
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  const context = useContext(ViewModeContext);
  if (context === undefined) {
    throw new Error('useViewMode must be used within a ViewModeProvider');
  }
  return context;
}
