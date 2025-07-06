import React, { ReactNode } from 'react';
import { AnimatePresence, motion } from "framer-motion";
import { RoomAudioRenderer, useVoiceAssistant } from "@livekit/components-react";
import { AgentVisualizer } from './AgentVisualizer';
import { TranscriptionView } from './TranscriptionView';
import { StatusIndicator } from './StatusIndicator';

interface SimpleVoiceAssistantProps {
  onConnectButtonClicked?: () => void;
  children?: ReactNode;
}

export function SimpleVoiceAssistant({ onConnectButtonClicked, children }: SimpleVoiceAssistantProps) {
  const { state: agentState } = useVoiceAssistant();

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
            status={agentState} 
            isConnected={true} 
          />
        </div>
        <div className="pt-16">
          <RoomAudioRenderer />
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
            <div className="absolute top-0 left-0 right-0 flex justify-center">
              <StatusIndicator 
                status={agentState} 
                isConnected={true} 
              />
            </div>
            <div className="pt-16">
              <RoomAudioRenderer />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
