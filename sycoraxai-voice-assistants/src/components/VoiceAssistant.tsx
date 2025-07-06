import React, { ReactNode, useEffect, useState } from 'react';
import { GeneralConnectionDetails, VoiceAssistantConfig, LiveKitVoiceAssistant, RetellVoiceAssistant, LiveKitConnectionDetails, RetellConnectionDetails } from '../types';
import { createLiveKitVoiceAssistant, createRetellVoiceAssistant } from '../index';
import { LiveKitProvider } from './LiveKitProvider';
import { RetellProvider } from './RetellProvider';
import { SimpleVoiceAssistant } from './SimpleVoiceAssistant';
import { RetellSimpleVoiceAssistant } from './RetellSimpleVoiceAssistant';

interface VoiceAssistantProps {
  connectionDetails: GeneralConnectionDetails | null;
  config?: VoiceAssistantConfig;
  children?: ReactNode;
  onAssistantReady?: (disconnect: () => void) => void;
}

export function VoiceAssistant({ connectionDetails, config, children, onAssistantReady }: VoiceAssistantProps) {
  const [assistant, setAssistant] = useState<LiveKitVoiceAssistant | RetellVoiceAssistant | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!connectionDetails) return;
    const payload = connectionDetails.payload;

    // Reset connection state when connection details change
    setIsConnected(false);
    setIsConnecting(false);
    setError(null);

    // Create assistant based on provider
    try {
      if (connectionDetails.provider === 'livekit') {
        const liveKitAssistant = createLiveKitVoiceAssistant(config);
        setAssistant(liveKitAssistant);
      } else if (connectionDetails.provider === 'retell') {
        const retellAssistant = createRetellVoiceAssistant(config);
        setAssistant(retellAssistant);
      } else {
        setError(`Provider ${(connectionDetails as any).provider} is not supported yet`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create voice assistant');
    }
  }, [connectionDetails, config]);

  // Auto-connect when assistant is ready
  useEffect(() => {
    if (!assistant || !connectionDetails || isConnecting || isConnected) return;

    const handleConnect = async () => {
      setIsConnecting(true);
      setError(null);
      
      try {
        if (connectionDetails.provider === 'livekit') {
          await (assistant as LiveKitVoiceAssistant).connect(connectionDetails.payload as LiveKitConnectionDetails);
        } else if (connectionDetails.provider === 'retell') {
          await (assistant as RetellVoiceAssistant).connect(connectionDetails.payload.payload as RetellConnectionDetails);
        }
        
        setIsConnected(true);
        
        // Call onAssistantReady with the disconnect function
        if (onAssistantReady) {
          onAssistantReady(() => {
            assistant.disconnect();
            setIsConnected(false);
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Connection failed');
      } finally {
        setIsConnecting(false);
      }
    };

    handleConnect();
  }, [assistant, connectionDetails, isConnecting, isConnected]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!connectionDetails) {
    return (
      <div className="flex items-center justify-center h-full">
        <div>Loading connection details...</div>
      </div>
    );
  }

  if (!assistant) {
    return (
      <div className="flex items-center justify-center h-full">
        <div>Initializing voice assistant...</div>
      </div>
    );
  }

  if (isConnecting) {
    return (
      <div className="flex items-center justify-center h-full">
        <div>Connecting...</div>
      </div>
    );
  }

  // Render based on provider
  if (connectionDetails.provider === 'livekit') {
    return (
      <LiveKitProvider voiceAssistant={assistant as LiveKitVoiceAssistant}>
        <SimpleVoiceAssistant>
          {children}
        </SimpleVoiceAssistant>
      </LiveKitProvider>
    );
  }

  if (connectionDetails.provider === 'retell') {
    return (
      <RetellProvider voiceAssistant={assistant as RetellVoiceAssistant}>
        <RetellSimpleVoiceAssistant>
          {children}
        </RetellSimpleVoiceAssistant>
      </RetellProvider>
    );
  }

  // Fallback for unsupported providers
  return (
    <div className="flex items-center justify-center h-full">
      <div>Provider {(connectionDetails as any).provider} not implemented yet</div>
    </div>
  );
} 