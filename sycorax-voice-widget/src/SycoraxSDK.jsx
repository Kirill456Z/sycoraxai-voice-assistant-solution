/**
 * SycoraxAI Voice Assistant SDK
 * Embeddable voice assistant widget for websites
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import VoiceWidget from './components/VoiceWidget';

class SycoraxSDK {
  constructor() {
    this.widget = null;
    this.config = {};
    this.isInitialized = false;
    this.callbacks = {};
  }

  /**
   * Initialize the SDK with configuration
   * @param {Object} config - Configuration object
   * @param {string} config.companyId - Unique token for the website
   * @param {string} config.baseUrl - Base URL of the token server
   * @param {string} [config.userId] - User ID for the session
   * @param {string} [config.position=\'bottom-right\'] - Widget position
   * @param {Object} [config.theme] - Theme customization
   * @param {Array} [config.allowedResponses] - Allowed response types
   * @param {number} [config.sampleRate] - Audio sample rate
   */
  run(config = {}) {
    if (this.isInitialized) {
      console.warn("SycoraxSDK is already initialized");
      return;
    }

    this.config = {
      position: 'bottom-right',
      companyId: config.companyId,
      baseUrl: config.baseUrl,
      userId: this.generateUserId(),
      allowedResponses: ['voice'],
      sampleRate: 24000,
      emitRawAudioSamples: true,
      theme: {
        primaryColor: '#667eea',
        secondaryColor: '#764ba2'
      },
      ...config
    };

    // Validate required config
    if (!this.config.companyId) {
      throw new Error("companyId is required");
    }
    if (!this.config.baseUrl) {
      throw new Error("baseUrl is required");
    }

    this.initializeWidget();
    this.isInitialized = true;
  }

  /**
   * Initialize the widget by creating and mounting it
   */
  async initializeWidget() {
    try {
      // Create container for the widget
      const container = this.createWidgetContainer();
      document.body.appendChild(container);

      // Load React and render the widget
      this.loadReactWidget(container);
    } catch (error) {      console.error("Failed to initialize SycoraxSDK widget:", error);
      this.triggerCallback("error", error);
    }
  }

  /**
   * Create the container element for the widget
   */
  createWidgetContainer() {
    const container = document.createElement('div');
    container.id = 'sycorax-voice-widget';
    container.className = `simple-widget ${this.config.position}`;
    container.style.pointerEvents = 'auto'; // Allow interaction
    return container;
  }

  /**
   * Load React and render the widget
   */
  loadReactWidget(container) {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <VoiceWidget 
          config={{
            ...this.config,
            tokenServerUrl: this.config.baseUrl // Ensure tokenServerUrl is passed
          }}
          onStatusChange={(status) => this.triggerCallback('statusChange', status)}
          onError={(error) => this.triggerCallback('error', error)}
        />
      </React.StrictMode>
    );
  }

  /**
   * Generate a unique user ID
   */
  generateUserId() {
    return 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  /**
   * Register callback functions
   */
  on(event, callback) {
    if (!this.callbacks[event]) {
      this.callbacks[event] = [];
    }
    this.callbacks[event].push(callback);
  }

  /**
   * Trigger callback functions
   */
  triggerCallback(event, data) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} callback:`, error);
        }
      });
    }
  }

  /**
   * Destroy the widget and clean up
   */
  destroy() {
    const container = document.getElementById('sycorax-voice-widget');
    if (container) {
      // Unmount React component
      const root = createRoot(container);
      root.unmount();
      container.remove();
    }
    this.isInitialized = false;
    this.callbacks = {};
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    // Re-render the widget with updated config if already initialized
    if (this.isInitialized && this.widget) {
      const container = document.getElementById('sycorax-voice-widget');
      if (container) {
        this.loadReactWidget(container); // Re-render with new config
      }
    }
  }

  /**
   * Get current status
   */
  getStatus() {
    // This would ideally be managed by the VoiceWidget component and exposed via ref or context
    // For now, it's a placeholder.
    console.warn('getStatus is a placeholder and does not reflect real-time status from VoiceWidget.');
    return 'Unknown';
  }
}

// Create global SDK instance
window.sycoraxSDK = new SycoraxSDK();

// Auto-initialize if config is provided via data attributes
document.addEventListener('DOMContentLoaded', () => {
  const script = document.querySelector('script[src*="sycorax-sdk"]');
  if (script) {
    const config = {};
    
    // Read configuration from data attributes
    const attrs = script.attributes;
    for (let i = 0; i < attrs.length; i++) {
      const attr = attrs[i];
      if (attr.name.startsWith('data-')) {
        const key = attr.name.replace('data-', '').replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        config[key] = attr.value;
      }
    }
    
    // Auto-run if companyId and baseUrl are provided
    if (config.companyId && config.baseUrl) {
      window.sycoraxSDK.run(config);
    }
  }
});

export default SycoraxSDK;


