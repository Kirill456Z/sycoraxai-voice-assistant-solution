import React, { createContext, useContext, ReactNode } from 'react';
import { RetellVoiceAssistant } from '../types';

interface RetellContextType {
  voiceAssistant: RetellVoiceAssistant;
}

const RetellContext = createContext<RetellContextType | null>(null);

interface RetellProviderProps {
  voiceAssistant: RetellVoiceAssistant;
  children: ReactNode;
}

export function RetellProvider({ voiceAssistant, children }: RetellProviderProps) {
  return (
    <RetellContext.Provider value={{ voiceAssistant }}>
      {children}
    </RetellContext.Provider>
  );
}

export function useRetellVoiceAssistant() {
  const context = useContext(RetellContext);
  if (!context) {
    throw new Error('useRetellVoiceAssistant must be used within a RetellProvider');
  }
  return context.voiceAssistant;
} 