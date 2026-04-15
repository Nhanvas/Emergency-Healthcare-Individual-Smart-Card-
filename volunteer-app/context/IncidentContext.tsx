import React, { createContext, useContext, useState } from 'react';

// FIX 4: Thêm activePatientData vào context
// Lý do: map.tsx không thể đọc patients/ trực tiếp (bị block bởi Security Rules)
// Flow mới: home.tsx nhận patientData từ acceptIncident Cloud Function
//           → lưu vào context → map.tsx đọc từ context
interface IncidentContextType {
  activeIncidentId: string | null;
  setActiveIncidentId: (id: string | null) => void;
  activePatientData: any | null;
  setActivePatientData: (data: any | null) => void;
}

const IncidentContext = createContext<IncidentContextType>({
  activeIncidentId: null,
  setActiveIncidentId: () => {},
  activePatientData: null,
  setActivePatientData: () => {},
});

export function IncidentProvider({ children }: { children: React.ReactNode }) {
  const [activeIncidentId, setActiveIncidentId] = useState<string | null>(null);
  const [activePatientData, setActivePatientData] = useState<any | null>(null);

  return (
    <IncidentContext.Provider
      value={{
        activeIncidentId,
        setActiveIncidentId,
        activePatientData,
        setActivePatientData,
      }}
    >
      {children}
    </IncidentContext.Provider>
  );
}

export const useIncident = () => useContext(IncidentContext);
