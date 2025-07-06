import React, { ReactNode, useState, useEffect } from 'react';
import { AnimatePresence, motion } from "framer-motion";
import { useRetellVoiceAssistant } from './RetellProvider';
import { StatusIndicator } from './StatusIndicator';

interface RetellSimpleVoiceAssistantProps {
  onConnectButtonClicked?: () => void;
  children?: ReactNode;
}

export function RetellSimpleVoiceAssistant({ onConnectButtonClicked, children }: RetellSimpleVoiceAssistantProps) {
  const voiceAssistant = useRetellVoiceAssistant();
  const [agentState, setAgentState] = useState<'disconnected' | 'connected'>('disconnected');
  const [agentStatus, setAgentStatus] = useState<'idle' | 'connecting' | 'listening' | 'speaking'>('idle');

  useEffect(() => {
    // Poll for state changes since Retell client state might not trigger re-renders
    const interval = setInterval(() => {
      setAgentState(voiceAssistant.isCallActive ? 'connected' : 'disconnected');
      setAgentStatus(voiceAssistant.agentStatus);
    }, 100);

    return () => clearInterval(interval);
  }, [voiceAssistant]);

  const handleEndCall = () => {
    voiceAssistant.disconnect();
  };

  // If no connect button handler is provided, always show connected state
  if (!onConnectButtonClicked) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.09, 1.04, 0.245, 1.055] }}
        className="relative h-full"
      >
        <div className="absolute top-0 left-0 right-0 flex justify-center">
          <StatusIndicator 
            status={agentStatus} 
            isConnected={agentState === 'connected'} 
          />
        </div>
        <div className="pt-16">
          {children}
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {agentState === "disconnected" ? (
          <motion.div
            key="disconnected"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.09, 1.04, 0.245, 1.055] }}
            className="grid items-center justify-center h-full"
          >
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="uppercase px-4 py-2 bg-white text-black rounded-md"
              onClick={onConnectButtonClicked}
            >
              Start a conversation
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="connected"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.09, 1.04, 0.245, 1.055] }}
            className="relative h-full"
          >
            <div className="absolute top-0 flex justify-center">
              <StatusIndicator 
                status={agentStatus} 
                isConnected={agentState === 'connected'} 
              />
            </div>
            <div className="pt-16">
              {children}
            </div>
            <div className="absolute bottom-0 left-0 right-0 flex justify-center">
              <button
                onClick={handleEndCall}
                className="px-6 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                End Call
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 