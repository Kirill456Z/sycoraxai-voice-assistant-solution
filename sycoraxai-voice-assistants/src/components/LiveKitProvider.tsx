import React, { ReactNode } from 'react';
import { RoomContext } from "@livekit/components-react";
import { LiveKitVoiceAssistant } from '../types';

interface LiveKitProviderProps {
  voiceAssistant: LiveKitVoiceAssistant;
  children: ReactNode;
}

export function LiveKitProvider({ voiceAssistant, children }: LiveKitProviderProps) {
  return (
    <RoomContext.Provider value={voiceAssistant.room}>
      {children}
    </RoomContext.Provider>
  );
} 