import React from 'react';

export type AgentStatus = 
  // LiveKit states
  | 'disconnected'
  | 'connecting'
  | 'initializing'
  | 'listening'
  | 'thinking'
  | 'speaking'
  // Retell states
  | 'idle';

interface StatusIndicatorProps {
  status: AgentStatus;
  isConnected: boolean;
}

export function StatusIndicator({ status, isConnected }: StatusIndicatorProps) {
  if (!isConnected || status === 'disconnected') return null;

  const getStatusColor = () => {
    switch (status) {
      case 'speaking':
        return '#4CAF50'; // Green
      case 'listening':
        return '#2196F3'; // Blue
      case 'thinking':
        return '#FF9800'; // Orange
      case 'connecting':
      case 'initializing':
      case 'idle':
        return '#9E9E9E'; // Gray
      default:
        return '#2196F3'; // Default blue
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'speaking':
        return 'Agent is speaking';
      case 'listening':
        return 'Agent is listening';
      case 'thinking':
        return 'Agent is thinking';
      case 'connecting':
        return '';
      case 'initializing':
        return 'Initializing...';
      case 'idle':
        return 'Not active';
      default:
        return 'Agent active';
    }
  };

  const getAnimation = () => {
    switch (status) {
      case 'speaking':
        return 'pulse 1.5s infinite';
      case 'thinking':
        return 'pulse 2s infinite';
      case 'listening':
        return 'listening 1.5s infinite';
      default:
        return 'listening 1.5s infinite';
    }
  };

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
        }
        
        @keyframes listening {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
      
      <div style={styles.statusIndicator}>
        <div style={{
          ...styles.indicatorDot,
          backgroundColor: getStatusColor(),
          animation: getAnimation()
        }}></div>
        <div style={styles.statusText}>
          {getStatusText()}
        </div>
      </div>
    </>
  );
}

const styles = {
  statusIndicator: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    margin: '10px 0 20px 0',
  },
  indicatorDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    marginBottom: '8px',
  },
  statusText: {
    fontSize: '14px',
    color: '#666',
    textAlign: 'center' as const,
  },
}; 