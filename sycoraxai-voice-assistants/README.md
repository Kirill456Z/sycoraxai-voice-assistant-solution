# SycoraxAI Voice Assistants

A React component library for building voice assistant applications with support for multiple providers including LiveKit, Retell, and TargetAI.

## Installation

```bash
npm install sycoraxai-voice-assistants
```

## Peer Dependencies

Make sure you have the following peer dependencies installed:

```bash
npm install @livekit/components-react livekit-client retell-client-js-sdk targetai-client-js-sdk react
```

## Usage

### Basic Usage with LiveKit

```jsx
import { VoiceAssistant } from 'sycoraxai-voice-assistants';

const connectionDetails = {
  serverUrl: 'wss://your-livekit-server.com',
  participantToken: 'your-participant-token',
  provider: 'livekit'
};

const config = {
  onDeviceFailure: (error) => {
    console.error('Device failure:', error);
  }
};

function App() {
  return (
    <VoiceAssistant 
      connectionDetails={connectionDetails} 
      config={config} 
    />
  );
}
```

### Basic Usage with Retell

```jsx
import { createVoiceAssistant } from 'sycoraxai-voice-assistants';

const assistant = createVoiceAssistant('retell', {
  onCallStarted: () => console.log('Call started'),
  onCallEnded: () => console.log('Call ended'),
  onAgentStartTalking: () => console.log('Agent speaking'),
  onAgentStopTalking: () => console.log('Agent stopped speaking'),
  onError: (error) => console.error('Error:', error)
});

const connectionDetails = {
  access_token: 'your-retell-access-token',
  provider: 'retell',
  sample_rate: 24000,
  emit_raw_audio_samples: false
};

await assistant.connect(connectionDetails);
```

### Basic Usage with TargetAI

```jsx
import { createVoiceAssistant } from 'sycoraxai-voice-assistants';

const assistant = createVoiceAssistant('targetai', {
  onCallStarted: () => console.log('Call started'),
  onCallEnded: () => console.log('Call ended'),
  onAgentStartTalking: () => console.log('Agent speaking'),
  onAgentStopTalking: () => console.log('Agent stopped speaking'),
  onError: (error) => console.error('Error:', error)
});

const connectionDetails = {
  serverUrl: 'https://your-runtime-server.com',
  tokenServerUrl: 'https://your-token-server.com',
  provider: 'targetai',
  agentUuid: 'your-agent-uuid',
  allowedResponses: ['text', 'voice'],
  sampleRate: 24000,
  emitRawAudioSamples: false,
  dataInput: { userId: 'user123' },
  messages: [
    { type: 'system', content: 'You are a helpful assistant' }
  ]
};

await assistant.connect(connectionDetails);
```

### Components

- `VoiceAssistant` - Main voice assistant component
- `SimpleVoiceAssistant` - Simplified version with minimal UI
- `AgentVisualizer` - Visual representation of agent state
- `ControlBar` - UI controls for voice assistant
- `TranscriptionView` - Real-time transcription display
- `RetellSimpleVoiceAssistant` - Retell-specific simple voice assistant

### Factory Functions

```typescript
// Create provider-specific assistants
const livekitAssistant = createLiveKitVoiceAssistant(config);
const retellAssistant = createRetellVoiceAssistant(config);
const targetaiAssistant = createTargetAIVoiceAssistant(config);

// Or use the generic factory
const assistant = createVoiceAssistant('targetai', config);
```

### Types

```typescript
interface LiveKitConnectionDetails {
  serverUrl: string;
  participantToken: string;
  provider: 'livekit';
}

interface RetellConnectionDetails {
  access_token: string;
  provider: 'retell';
  sample_rate?: number;
  capture_device_id?: string;
  emit_raw_audio_samples?: boolean;
}

interface TargetAIConnectionDetails {
  serverUrl: string;
  tokenServerUrl: string;
  provider: 'targetai';
  agentUuid: string;
  allowedResponses?: Array<'text' | 'voice'>;
  sampleRate?: number;
  emitRawAudioSamples?: boolean;
  dataInput?: object;
  messages?: Array<{ type: string; content: string }>;
}

type ConnectionDetails = LiveKitConnectionDetails | RetellConnectionDetails | TargetAIConnectionDetails;

interface VoiceAssistantConfig {
  onDeviceFailure?: (error: Error) => void;
  onCallStarted?: () => void;
  onCallEnded?: () => void;
  onAgentStartTalking?: () => void;
  onAgentStopTalking?: () => void;
  onError?: (error: Error) => void;
}
```

## Supported Providers

- **LiveKit**: Real-time communication platform
- **Retell**: Voice AI platform for conversational applications
- **TargetAI**: Advanced voice AI agent platform

## Development

```bash
# Install dependencies
npm install --legacy-peer-deps

# Build the package
npm run build

# Test locally
npm pack
```

## License

MIT

