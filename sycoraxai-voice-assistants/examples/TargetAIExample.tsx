import React, { useState } from 'react';
import { createVoiceAssistant, TargetAIConnectionDetails } from 'sycoraxai-voice-assistants';

const TargetAIExample: React.FC = () => {
  const [assistant, setAssistant] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState('idle');

  const initializeAssistant = () => {
    const newAssistant = createVoiceAssistant('targetai', {
      onCallStarted: () => {
        console.log('TargetAI call started');
        setIsConnected(true);
        setStatus('connected');
      },
      onCallEnded: () => {
        console.log('TargetAI call ended');
        setIsConnected(false);
        setStatus('disconnected');
      },
      onAgentStartTalking: () => {
        console.log('TargetAI agent started talking');
        setStatus('speaking');
      },
      onAgentStopTalking: () => {
        console.log('TargetAI agent stopped talking');
        setStatus('listening');
      },
      onError: (error) => {
        console.error('TargetAI error:', error);
        setStatus('error');
        setIsConnected(false);
      }
    });

    setAssistant(newAssistant);
  };

  const connectToTargetAI = async () => {
    if (!assistant) return;

    const connectionDetails: TargetAIConnectionDetails = {
      serverUrl: 'https://your-runtime-server.com',
      tokenServerUrl: 'https://your-token-server.com',
      provider: 'targetai',
      agentUuid: 'your-agent-uuid',
      allowedResponses: ['text', 'voice'],
      sampleRate: 24000,
      emitRawAudioSamples: false,
      dataInput: { 
        userId: 'user123',
        context: 'customer_support'
      },
      messages: [
        { type: 'system', content: 'You are a helpful customer support assistant' }
      ]
    };

    try {
      setStatus('connecting');
      await assistant.connect(connectionDetails);
    } catch (error) {
      console.error('Failed to connect:', error);
      setStatus('error');
    }
  };

  const disconnect = () => {
    if (assistant && isConnected) {
      assistant.disconnect();
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>TargetAI Voice Assistant Example</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <p><strong>Status:</strong> {status}</p>
        <p><strong>Connected:</strong> {isConnected ? 'Yes' : 'No'}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        {!assistant && (
          <button onClick={initializeAssistant} style={{ marginRight: '10px' }}>
            Initialize Assistant
          </button>
        )}
        
        {assistant && !isConnected && (
          <button onClick={connectToTargetAI} style={{ marginRight: '10px' }}>
            Connect to TargetAI
          </button>
        )}
        
        {assistant && isConnected && (
          <button onClick={disconnect} style={{ marginRight: '10px' }}>
            Disconnect
          </button>
        )}
      </div>

      <div style={{ 
        padding: '15px', 
        backgroundColor: '#f5f5f5', 
        borderRadius: '5px',
        marginTop: '20px'
      }}>
        <h3>Instructions:</h3>
        <ol>
          <li>Click "Initialize Assistant" to create a TargetAI voice assistant instance</li>
          <li>Update the connection details with your actual TargetAI server URLs and agent UUID</li>
          <li>Click "Connect to TargetAI" to establish a voice connection</li>
          <li>Start speaking to interact with your TargetAI agent</li>
          <li>Click "Disconnect" when you're done</li>
        </ol>
        
        <h3>Required Setup:</h3>
        <ul>
          <li>TargetAI account with API access</li>
          <li>Authentication server running (see TargetAI docs)</li>
          <li>Agent configured in TargetAI dashboard</li>
        </ul>
      </div>
    </div>
  );
};

export default TargetAIExample;

