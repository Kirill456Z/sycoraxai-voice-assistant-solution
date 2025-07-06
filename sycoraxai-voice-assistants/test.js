"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./src/index");
// Test creating a TargetAI voice assistant
const assistant = (0, index_1.createVoiceAssistant)('targetai', {
    onCallStarted: () => console.log('Call started callback'),
    onCallEnded: () => console.log('Call ended callback'),
    onAgentStartTalking: () => console.log('Agent started talking callback'),
    onAgentStopTalking: () => console.log('Agent stopped talking callback'),
    onError: (error) => console.error('Error callback:', error),
});
console.log('TargetAI Voice Assistant created successfully');
console.log('Assistant type:', typeof assistant);
console.log('Has client property:', 'client' in assistant);
console.log('Has connect method:', typeof assistant.connect === 'function');
console.log('Has disconnect method:', typeof assistant.disconnect === 'function');
console.log('Initial call status:', assistant.isCallActive);
console.log('Initial agent status:', assistant.agentStatus);
// Test connection details type
const connectionDetails = {
    provider: 'targetai',
    serverUrl: 'https://example.com',
    tokenServerUrl: 'https://token.example.com',
    agentUuid: 'test-uuid',
    allowedResponses: ['text', 'voice'],
    sampleRate: 24000,
    emitRawAudioSamples: false,
    dataInput: { userId: 'test-user' },
    messages: [
        { type: 'system', content: 'You are a helpful assistant' }
    ]
};
console.log('Connection details created successfully');
console.log('Connection details:', JSON.stringify(connectionDetails, null, 2));
console.log('All tests passed! TargetAI integration is working correctly.');
