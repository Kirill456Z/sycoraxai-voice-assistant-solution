# SycoraxAI Voice Assistants: Comprehensive Integration Guide

This documentation provides a comprehensive overview of the `sycoraxai-voice-assistants` NPM package, focusing on the recent integration of TargetAI, the universal backend token server, and detailed deployment instructions for production environments.

## Table of Contents

1.  [Introduction](#1-introduction)
2.  [NPM Package Overview](#2-npm-package-overview)
3.  [TargetAI Integration Details](#3-targetai-integration-details)
4.  [Universal Backend Token Server](#4-universal-backend-token-server)
5.  [Production Deployment Guide](#5-production-deployment-guide)
6.  [API Reference](#6-api-reference)
7.  [Troubleshooting](#7-troubleshooting)

---

## 1. Introduction

The `sycoraxai-voice-assistants` NPM package is designed to simplify the integration of various voice AI agent providers into React applications. It provides a unified API to interact with different services like LiveKit, RetellAI, and now, TargetAI. This document details the enhancements made to the package and the accompanying universal backend service, enabling seamless and secure token management for all supported providers.

Our goal is to provide a robust, scalable, and easy-to-use solution for developers looking to incorporate real-time voice AI capabilities into their applications.

---

## 2. NPM Package Overview

### 2.1 Purpose and Features

The `sycoraxai-voice-assistants` package abstracts away the complexities of integrating with different voice AI providers. It offers a consistent interface, allowing developers to switch between providers with minimal code changes. Key features include:

-   **Unified API**: A single `createVoiceAssistant` function to initialize assistants for various providers.
-   **Type Safety**: Comprehensive TypeScript definitions for all configurations and callbacks.
-   **Event-Driven Callbacks**: Standardized event handling for call lifecycle, agent speaking status, and errors.
-   **React Components**: (Existing) Reusable React components for common UI elements related to voice assistants.

### 2.2 Package Structure

The relevant files and their roles in the enhanced package are:

```
sycoraxai-voice-assistants/
├── src/
│   ├── index.ts              # Main entry point, includes `createVoiceAssistant` and provider implementations.
│   ├── types.ts              # Global TypeScript type definitions for all providers and their connection details.
│   └── components/           # Contains React components (e.g., `SimpleVoiceAssistant`, `ControlBar`).
├── examples/
│   └── TargetAIExample.tsx   # A new example demonstrating how to use the TargetAI integration within a React component.
├── package.json              # Defines package metadata, scripts, dependencies, and peer dependencies.
├── README.md                 # Updated with installation, usage, and TargetAI-specific instructions.
└── CHANGELOG.md              # Documents all version changes, including the TargetAI integration.
```

### 2.3 Installation and Usage

To use the `sycoraxai-voice-assistants` package in your React project:

1.  **Install the package**: 
    ```bash
    npm install sycoraxai-voice-assistants
    # or yarn add sycoraxai-voice-assistants
    ```

2.  **Install peer dependencies**: Ensure you have `react`, `livekit-client`, `@livekit/components-react`, `retell-client-js-sdk`, and `targetai-client-js-sdk` installed.
    ```bash
    npm install react livekit-client @livekit/components-react retell-client-js-sdk targetai-client-js-sdk --legacy-peer-deps
    # or yarn add react livekit-client @livekit/components-react retell-client-js-sdk targetai-client-js-sdk
    ```

3.  **Basic Usage Example (TargetAI)**:
    ```typescript
    import React, { useState, useEffect } from 'react';
    import { createVoiceAssistant, TargetAIConnectionDetails } from 'sycoraxai-voice-assistants';

    const MyTargetAIAssistant: React.FC = () => {
      const [assistant, setAssistant] = useState<any>(null);
      const [status, setStatus] = useState('idle');

      useEffect(() => {
        // Initialize the assistant when the component mounts
        const newAssistant = createVoiceAssistant('targetai', {
          onCallStarted: () => setStatus('connected'),
          onCallEnded: () => setStatus('disconnected'),
          onAgentStartTalking: () => setStatus('speaking'),
          onAgentStopTalking: () => setStatus('listening'),
          onError: (error) => {
            console.error('Assistant error:', error);
            setStatus('error');
          }
        });
        setAssistant(newAssistant);

        // Clean up on unmount
        return () => {
          if (assistant && assistant.disconnect) {
            assistant.disconnect();
          }
        };
      }, []);

      const connect = async () => {
        if (!assistant) return;

        try {
          // In a real application, request connection details from your backend token server
          const detailsResponse = await fetch('http://localhost:5000/connectionDetails', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ company_id: 'my_company_id', provider: 'targetai' })
          });
          const connectionDetails = await detailsResponse.json();

          await assistant.connect({
            serverUrl: connectionDetails.server_url,
            tokenServerUrl: 'http://localhost:5000', // Your token server URL
            provider: connectionDetails.provider,
            agentUuid: connectionDetails.agent_uuid,
            allowedResponses: connectionDetails.allowedResponses,
            sampleRate: connectionDetails.sampleRate || 24000,
            emitRawAudioSamples: connectionDetails.emitRawAudioSamples,
            dataInput: connectionDetails.dataInput,
            messages: connectionDetails.messages
          } as TargetAIConnectionDetails);
          setStatus('connected');
        } catch (error) {
          console.error('Failed to connect:', error);
          setStatus('error');
        }
      };

      const disconnect = () => {
        if (assistant) {
          assistant.disconnect();
        }
      };

      return (
        <div>
          <h2>TargetAI Assistant</h2>
          <p>Status: {status}</p>
          <button onClick={connect} disabled={status === 'connected' || status === 'connecting'}>Connect</button>
          <button onClick={disconnect} disabled={status === 'disconnected' || status === 'idle' || status === 'error'}>Disconnect</button>
        </div>
      );
    };

    export default MyTargetAIAssistant;
    ```

---

## 3. TargetAI Integration Details

### 3.1 Implementation Approach

The integration of TargetAI followed the existing pattern established by LiveKit and RetellAI, ensuring consistency and extensibility. Key aspects of the implementation include:

-   **`TargetAIVoiceAssistantImpl` Class**: A new class was created to encapsulate TargetAI-specific logic, implementing the `VoiceAssistant` interface.
-   **Type Definitions**: New types (`TargetAIConnectionDetails`, `TargetAIVoiceAssistant`) were added to `src/types.ts` to provide strong typing for TargetAI-specific configurations.
-   **`createVoiceAssistant` Extension**: The main factory function in `src/index.ts` was updated to recognize and instantiate `TargetAIVoiceAssistantImpl` when `provider: 'targetai'` is specified.
-   **Event Mapping**: Callbacks from the `targetai-client-js-sdk` are mapped to the unified `VoiceAssistantConfig` events (`onCallStarted`, `onCallEnded`, `onAgentStartTalking`, `onAgentStopTalking`, `onError`).

### 3.2 Code Changes Summary

-   **`src/types.ts`**: Added `TargetAIConnectionDetails` interface and extended `ConnectionDetails` and `VoiceAssistant` union types.
-   **`src/index.ts`**: 
    -   Imported `TargetAITokenClient` from `targetai-client-js-sdk`.
    -   Implemented `TargetAIVoiceAssistantImpl` class with `connect` and `disconnect` methods.
    -   Modified `createVoiceAssistant` to handle the `targetai` provider, instantiating `TargetAIVoiceAssistantImpl`.
-   **`package.json`**: 
    -   Added `targetai-client-js-sdk` to `dependencies` and `peerDependencies`.
    -   Updated `keywords` and `description` to reflect TargetAI support.
    -   Bumped version to `1.2.0`.
-   **`README.md`**: Updated usage instructions and added a section for TargetAI.
-   **`examples/TargetAIExample.tsx`**: Provided a full-fledged React component example demonstrating TargetAI integration.

### 3.3 TargetAI-Specific Configuration

When using `createVoiceAssistant('targetai', config)`, the `connectionDetails` object should conform to `TargetAIConnectionDetails`:

```typescript
interface TargetAIConnectionDetails extends GeneralConnectionDetails {
  provider: 'targetai';
  serverUrl: string;        // The base URL for TargetAI's runtime API (e.g., 'https://api.targetai.ai')
  tokenServerUrl: string;   // Your backend token server URL (e.g., 'http://localhost:5000')
  agentUuid: string;        // The UUID of your TargetAI agent
  allowedResponses?: string[]; // e.g., ['text', 'voice']
  sampleRate?: number;      // Audio sample rate (e.g., 24000)
  emitRawAudioSamples?: boolean; // Whether to emit raw audio samples
  dataInput?: Record<string, any>; // Custom data to send to the agent
  messages?: Array<{ type: 'system' | 'user' | 'agent'; content: string }>; // Initial conversation context
}
```

---

## 4. Universal Backend Token Server

To securely manage API keys and generate tokens for different voice AI providers, a universal Flask-based backend token server has been implemented. This server centralizes token generation, preventing exposure of sensitive API keys in client-side code.

### 4.1 Server Purpose and Features

-   **Secure Token Generation**: Generates temporary access tokens for voice AI providers.
-   **Multi-Provider Support**: Supports TargetAI, RetellAI, and LiveKit from a single endpoint.
-   **Centralized Configuration**: API keys and secrets are stored server-side.
-   **CORS Enabled**: Allows cross-origin requests from your frontend applications.
-   **Health & Status Endpoints**: Provides endpoints for monitoring server health and provider configuration status.

### 4.2 Server Structure

```
targetai-token-server/
├── src/
│   ├── main.py               # Main Flask application entry point, registers blueprints and handles static files.
│   ├── routes/
│   │   ├── connectionDetails.py   # NEW: Unified route returning provider-specific connection details
│   │   ├── token.py              # Legacy route for generating raw TargetAI JWT tokens
│   │   └── user.py               # (Template) Example user management routes.
│   └── static/
│       ├── index.html        # A simple web interface to test token generation for all providers.
│       └── test-integration.html # A more comprehensive test page demonstrating frontend-backend integration.
├── venv/                     # Python virtual environment for dependencies.
├── requirements.txt          # Lists all Python dependencies (Flask, Flask-CORS, TargetAI, PyJWT).
└── README.md                 # Basic server documentation.
```

### 4.3 API Endpoints

The backend now exposes a **new, recommended** endpoint for obtaining all connection parameters in one step.

- **`POST /connectionDetails`**
  - **Description**: Returns everything the frontend needs to establish a connection with the correct provider (TargetAI, Retell, or LiveKit). This replaces most use-cases of the old `/api/token` route.
  - **Request Body**:
    ```json
    {
      "provider": "targetai" | "retell" | "livekit",   // optional – default decided by server
      "company_id": "your-company-id",                  // unique identifier for the website/client
      "language": "ru"                                  // optional – preferred language
    }
    ```
  - **Response Example (TargetAI)**:
    ```json
    {
      "provider": "targetai",
      "server_url": "https://app.targetai.ai",
      "agent_uuid": "3af19e89-3253-4a8d-a1e3-cd3872291e4a",
      "user_id": "your-company-id",
      "allowedResponses": ["voice"],
      "emitRawAudioSamples": true,
      "messages": [
        { "role": "user", "content": "You are a helpful voice assistant." }
      ],
      "dataInput": {
        "name": "John Doe",
        "language": "ru"
      },
      "expires_in": 1800,
      "ok": true
    }
    ```

The legacy **`POST /api/token`** endpoint is still available but is now primarily used internally by the server to mint TargetAI JWT tokens. New integrations should prefer `/connectionDetails`.

### 4.4 Configuration

All provider API keys and secrets are configured within the `PROVIDERS_CONFIG` dictionary in `src/routes/token.py`. You **MUST** update these placeholders with your actual credentials for RetellAI and LiveKit to enable their functionality.

```python
# src/routes/token.py
PROVIDERS_CONFIG = {
    'targetai': {
        'tos_base_url': 'https://app.targetai.ai',
        'api_key': 'sk_WqEcgjCswspJmxlDxfyKa6Tgan4vm4S0', # Your TargetAI API Key
        'agent_uuid': '18f695f5-5a49-47b4-8ce7-bc089208db53' # Your TargetAI Agent UUID
    },
    'retell': {
        'api_key': 'YOUR_RETELL_API_KEY_HERE',  # Replace with your Retell API Key
        'agent_id': 'YOUR_RETELL_AGENT_ID_HERE'  # Replace with your Retell Agent ID
    },
    'livekit': {
        'api_key': 'YOUR_LIVEKIT_API_KEY_HERE',  # Replace with your LiveKit API Key
        'api_secret': 'YOUR_LIVEKIT_API_SECRET_HERE',  # Replace with your LiveKit API Secret
        'server_url': 'wss://your-livekit-server.com'  # Replace with your LiveKit Server URL
    }
}
```

---

## 5. Production Deployment Guide

This section outlines the steps to deploy both the enhanced NPM package and the universal backend token server to a production environment.

### 5.1 Deploying the NPM Package

To make your enhanced `sycoraxai-voice-assistants` package available for use in other projects or for public distribution:

1.  **Navigate to the package directory**:
    ```bash
    cd sycoraxai-voice-assistants/
    ```

2.  **Build the package**: This compiles the TypeScript source code into JavaScript and generates declaration files.
    ```bash
    npm run build
    ```

3.  **Create a package tarball**: This creates a `.tgz` file that can be published to an NPM registry or installed locally.
    ```bash
    npm pack
    ```
    This will generate a file like `sycoraxai-voice-assistants-1.2.0.tgz`.

4.  **Publish to NPM (Optional - for public distribution)**:
    If you intend to publish this package to the public npm registry, ensure you are logged in and have the necessary permissions.
    ```bash
    npm publish sycoraxai-voice-assistants-1.2.0.tgz
    ```
    For private registries, consult your registry's documentation.

5.  **Using the deployed package in your application**:
    Once published, you can install it like any other NPM package:
    ```bash
    npm install sycoraxai-voice-assistants
    # or yarn add sycoraxai-voice-assistants
    ```

### 5.2 Deploying the Universal Backend Token Server

The Flask token server can be deployed using a production-ready WSGI server like Gunicorn, behind a reverse proxy like Nginx.

1.  **Navigate to the server directory**:
    ```bash
    cd targetai-token-server/
    ```

2.  **Activate the virtual environment**: Ensure all dependencies are installed within the virtual environment.
    ```bash
    source venv/bin/activate
    ```

3.  **Install dependencies**: If you haven't already, install all required Python packages.
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure API Keys**: **IMPORTANT**: Edit `src/routes/token.py` and replace the placeholder API keys and secrets for RetellAI and LiveKit with your actual production credentials. For better security, consider using environment variables instead of hardcoding them directly in the file.

5.  **Run with Gunicorn (Production WSGI Server)**:
    Install Gunicorn if you haven't already:
    ```bash
    pip install gunicorn
    ```
    Start the server using Gunicorn. It's recommended to bind to `0.0.0.0` to allow external access.
    ```bash
    gunicorn --bind 0.0.0.0:5000 src.main:app
    ```
    This will run the Flask application on port `5000`.

6.  **Set up a Reverse Proxy (Nginx/Apache - Recommended)**:
    For production, it's highly recommended to place a reverse proxy (like Nginx) in front of your Gunicorn application. This provides:
    -   **SSL/TLS Termination**: Secure HTTPS connections.
    -   **Load Balancing**: Distribute traffic across multiple Gunicorn instances.
    -   **Static File Serving**: Efficiently serve static assets (like `index.html` and `test-integration.html`).
    -   **Rate Limiting**: Protect your API endpoints from abuse.

    **Example Nginx Configuration (simplified)**:
    ```nginx
    server {
        listen 80;
        server_name your_domain.com;

        location / {
            proxy_pass http://127.0.0.1:5000; # Forward requests to Gunicorn
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Optional: Serve static files directly via Nginx
        location /static/ {
            alias /home/ubuntu/targetai-token-server/src/static/;
        }
    }
    ```
    Remember to restart Nginx after making changes.

7.  **Process Management (Systemd/Supervisor - Recommended)**:
    Use a process manager (like Systemd or Supervisor) to ensure your Gunicorn application runs continuously and restarts automatically if it crashes.

    **Example Systemd Service File (`/etc/systemd/system/token_server.service`)**:
    ```ini
    [Unit]
    Description=Gunicorn instance for Universal Token Server
    After=network.target

    [Service]
    User=ubuntu # Or your deployment user
    Group=www-data # Or your deployment group
    WorkingDirectory=/home/ubuntu/targetai-token-server
    ExecStart=/home/ubuntu/targetai-token-server/venv/bin/gunicorn --workers 3 --bind 0.0.0.0:5000 src.main:app
    Restart=always

    [Install]
    WantedBy=multi-user.target
    ```
    Reload systemd and start the service:
    ```bash
    sudo systemctl daemon-reload
    sudo systemctl start token_server
    sudo systemctl enable token_server # To start on boot
    ```

### 5.3 Frontend Application Integration

Once your token server is deployed and accessible (e.g., at `https://your-token-server.com`):

1.  **Update `tokenServerUrl`**: In your frontend application (where you use the `sycoraxai-voice-assistants` package), update the `tokenServerUrl` in your `connectionDetails` to point to your deployed backend server.
    ```typescript
    const connectionDetails: TargetAIConnectionDetails = {
      // ... other details
      tokenServerUrl: 'https://your-token-server.com', // <--- Update this URL
      // ...
    };
    ```

2.  **Test End-to-End**: Thoroughly test your application in the production environment to ensure that token generation and voice assistant connections work as expected.

---

## 6. API Reference

This section provides a detailed API reference for the `sycoraxai-voice-assistants` NPM package and the Universal Backend Token Server.

### 6.1 `sycoraxai-voice-assistants` NPM Package

#### `createVoiceAssistant(provider: Provider, config: VoiceAssistantConfig): VoiceAssistant`

-   **`provider`**: A string literal indicating the voice AI provider.
    -   `'livekit'`
    -   `'retell'`
    -   `'targetai'`

-   **`config`**: An object conforming to `VoiceAssistantConfig`.
    -   `onCallStarted?: () => void`: Callback when the voice call starts.
    -   `onCallEnded?: () => void`: Callback when the voice call ends.
    -   `onAgentStartTalking?: () => void`: Callback when the agent starts speaking.
    -   `onAgentStopTalking?: () => void`: Callback when the agent stops speaking.
    -   `onError?: (error: Error) => void`: Callback for any errors during the call.

-   **Returns**: An instance of `VoiceAssistant` specific to the chosen provider.

#### `VoiceAssistant` Interface

All voice assistant implementations adhere to this interface:

-   `connect(connectionDetails: ConnectionDetails): Promise<void>`: Establishes a connection to the voice AI service.
-   `disconnect(): void`: Disconnects from the voice AI service.
-   `isCallActive: boolean`: Read-only property indicating if a call is currently active.
-   `agentStatus: 'idle' | 'speaking' | 'listening'`: Read-only property indicating the agent's current status.

#### `ConnectionDetails` Union Type

This type is a union of provider-specific connection details:

-   `LiveKitConnectionDetails`
-   `RetellConnectionDetails`
-   `TargetAIConnectionDetails` (detailed in Section 3.3)

### 6.2 Universal Backend Token Server API

(Refer to Section 4.3 for detailed API endpoints and examples.)

---

## 7. Troubleshooting

### 7.1 Frontend Issues

-   **`ModuleNotFoundError: No module named 'targetai-client-js-sdk'`**: Ensure `targetai-client-js-sdk` is installed as a peer dependency in your project.
    ```bash
    npm install targetai-client-js-sdk
    ```
-   **`createVoiceAssistant` returns `null` or `undefined`**: Check if the `provider` string passed to `createVoiceAssistant` is correct (`'livekit'`, `'retell'`, or `'targetai'`).
-   **Callbacks not firing**: Ensure your `VoiceAssistantConfig` object is correctly passed and its functions are properly defined.

### 7.2 Backend Server Issues

-   **`ModuleNotFoundError: No module named 'jwt'` or similar**: Ensure all Python dependencies are installed by running `pip install -r requirements.txt` within the virtual environment.
-   **`'coroutine' object is not subscriptable`**: This indicates an asynchronous function was called without `await`. Ensure `client.get_token()` is properly awaited or handled with `asyncio.run_until_complete()` as shown in `src/routes/token.py`.
-   **`Failed to generate TargetAI token: 'TokenResponse' object is not subscriptable`**: This means you are trying to access `token_response` as a dictionary (`token_response['token']`) when it's an object. Access it as an attribute (`token_response.token`). This has been fixed in the provided `src/routes/token.py`.
-   **`CORS error`**: Ensure `Flask-CORS` is installed (`pip install flask-cors`) and `CORS(app, origins="*")` is enabled in `src/main.py`.
-   **Server not starting**: Check the console output for any error messages. Ensure the correct Python interpreter is used (within the virtual environment) and the `main.py` file is executable.

### 7.3 Integration Issues

-   **`Token request failed: 400 Bad Request`**: Check the `provider` value in your frontend token request. It must be one of `'targetai'`, `'retell'`, or `'livekit'`.
-   **`Token request failed: 500 Internal Server Error`**: Check the backend server logs for detailed error messages. This often indicates an issue with API keys or an unhandled exception in the token generation logic.
-   **`Token request failed: 501 Not Implemented` (for Retell/LiveKit)**: This means you are trying to get a token for a provider whose API keys are still placeholders in `src/routes/token.py`. Update the `PROVIDERS_CONFIG` with your actual credentials.
-   **`Connection refused` when fetching token**: Ensure your backend token server is running and accessible at the `tokenServerUrl` specified in your frontend. Check firewall rules if deploying to a remote server.

---

This concludes the comprehensive documentation for the `sycoraxai-voice-assistants` package and its universal backend token server. For further assistance, please refer to the respective provider documentation or raise an issue in the project repository. Good luck with your voice AI integrations!

