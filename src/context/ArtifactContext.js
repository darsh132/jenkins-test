import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const ArtifactContext = createContext();

// Create a provider component
export const ArtifactProvider = ({ children }) => {
  const [artifact, setArtifact] = useState([]);
  const [selectedArtifact, setSelectedArtifact] = useState([]);

  return (
    <ArtifactContext.Provider value={{ artifact, setArtifact, selectedArtifact, setSelectedArtifact }}>
      {children}
    </ArtifactContext.Provider>
  );
};

// Custom hook to use the artifact context
export const useArtifact = () => {
  const context = useContext(ArtifactContext);
  if (!context) {
    throw new Error('useArtifact must be used within an ArtifactProvider');
  }
  return context;
};
