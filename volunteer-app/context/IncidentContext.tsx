import React, { createContext, useContext, useState } from 'react';

interface IncidentContextType {
  activeIncidentId: string | null;
  setActiveIncidentId: (id: string | null) => void;
}

const IncidentContext = createContext<IncidentContextType>({
  activeIncidentId: null,
  setActiveIncidentId: () => {},
});

export function IncidentProvider({ children }: { children: React.ReactNode }) {
  const [activeIncidentId, setActiveIncidentId] = useState<string | null>(null);
  return (
    <IncidentContext.Provider value={{ activeIncidentId, setActiveIncidentId }}>
      {children}
    </IncidentContext.Provider>
  );
}

export const useIncident = () => useContext(IncidentContext);