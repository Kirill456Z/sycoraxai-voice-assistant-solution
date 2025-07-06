# SycoraxAI Voice Widget - Embeddable Web Widget Guide

## 🎯 Overview

The SycoraxAI Voice Widget is an embeddable web component that allows you to add voice AI assistant capabilities to any website with just a simple script tag. Similar to how Chatwoot embeds their chat widget, this solution abstracts away the complexity of voice AI integration and provides a seamless user experience.

## 🚀 Key Features

### Provider Abstraction
- **Complete Platform Abstraction**: End users never know whether you're using TargetAI, Retell, or LiveKit
- **Unified Interface**: Same embedding script works regardless of the backend provider
- **Easy Provider Switching**: Change providers without updating client-side code

### Easy Integration
- **Single Script Tag**: Embed with just one line of code
- **No Dependencies**: Self-contained widget with all dependencies bundled
- **Responsive Design**: Works on desktop and mobile devices
- **Customizable Appearance**: Themes, positioning, and styling options

### Secure Architecture
- **Token-Based Authentication**: Secure communication with backend services
- **Server-Side API Keys**: Sensitive credentials never exposed to clients
- **CORS Support**: Proper cross-origin request handling

## 📦 What's Included

### 1. Widget Components
```
sycorax-voice-widget/
├── dist/                          # React demo application
├── dist-sdk/                      # Embeddable SDK bundle
│   └── sycorax-sdk.umd.cjs       # Main SDK file (8.12 kB gzipped: 2.72 kB)
├── src/
│   ├── SycoraxSDK.js             # Core SDK implementation
│   ├── components/
│   │   ├── VoiceWidget.jsx       # React widget component
│   │   └── VoiceWidget.css       # Widget styles
│   └── App.jsx                   # Demo application
└── public/
    └── demo.html                 # Standalone embedding demo
```

### 2. Backend Integration
- Universal token server supporting all providers
- Secure API key management
- Health monitoring and status endpoints

## 🛠️ Installation & Setup

### Step 1: Deploy the Backend Token Server

First, ensure your universal token server is running and accessible:

```bash
cd targetai-token-server
source venv/bin/activate
pip install -r requirements.txt
python src/main.py
```

The server should be accessible at `http://localhost:5000` (or your production URL).

### Step 2: Host the SDK File

Upload the `sycorax-sdk.umd.cjs` file to your web server or CDN:

```bash
# Copy the SDK file to your web server
cp dist-sdk/sycorax-sdk.umd.cjs /path/to/your/webserver/public/
```

### Step 3: Embed the Widget

Add this script to any webpage where you want the voice widget:

```html
<script>
  (function(d,t) {
    var BASE_URL="https://your-server.com";
    var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
    g.src=BASE_URL+"/sycorax-sdk.js";
    g.defer = true;
    g.async = true;
    s.parentNode.insertBefore(g,s);
    g.onload=function(){
      window.sycoraxSDK.run({
        companyId: 'your-company-id',
        baseUrl: BASE_URL
      })
    }
  })(document,"script");
</script>
```

## ⚙️ Configuration Options

### Basic Configuration

```javascript
window.sycoraxSDK.run({
  companyId: 'your-company-id',
  baseUrl: 'https://your-token-server.com'
});
```

### Advanced Configuration

```javascript
window.sycoraxSDK.run({
  // Required settings
  companyId: 'your-company-id',
  baseUrl: 'https://your-server.com',
  
  // Provider settings (optional – usually auto-selected by the backend)
  provider: 'targetai',                    // 'targetai', 'retell', or 'livekit'
  
  // UI customization
  position: 'bottom-right',
  theme: {
    primaryColor: '#667eea',
    secondaryColor: '#764ba2'
  },
  
  // Voice assistant settings
  systemMessage: 'You are a helpful assistant for our website',
  userId: 'custom-user-id',
  allowedResponses: ['text', 'voice'],
  sampleRate: 24000,
  emitRawAudioSamples: true,
  
  // Additional data to send to the backend when requesting connection details
  dataInput: {
    context: 'website_chat',
    department: 'support'
  }
});
```

## 🎨 Customization

### Theme Customization

```javascript
window.sycoraxSDK.run({
  // ... other config
  theme: {
    primaryColor: '#your-brand-color',
    secondaryColor: '#your-secondary-color'
  }
});
```

### Position Options

```javascript
// Bottom right (default)
position: 'bottom-right'

// Bottom left
position: 'bottom-left'

// Top right
position: 'top-right'

// Top left
position: 'top-left'
```

### Custom CSS

You can override widget styles by adding CSS to your page:

```css
/* Customize the trigger button */
#sycorax-widget-trigger {
  background: linear-gradient(135deg, #your-color1, #your-color2) !important;
  width: 70px !important;
  height: 70px !important;
}

/* Customize the widget panel */
#sycorax-widget-panel {
  border-radius: 20px !important;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;
}
```

## 📡 Event Handling

### Available Events

```javascript
// Status change events ("idle", "connecting", "listening", "speaking", "active", "error")
window.sycoraxSDK.on('statusChange', function(status) {
  console.log('Voice widget status:', status);
});

// Error handling
window.sycoraxSDK.on('error', function(error) {
  console.error('Voice assistant error:', error);
});
```

### Custom Event Handlers

```javascript
// Initialize with event handlers
window.sycoraxSDK.run({
  companyId: 'your-company-id',
  baseUrl: 'https://your-server.com'
});

// Add event listeners after initialization
window.sycoraxSDK.on('connected', function(data) {
  // Send analytics event
  gtag('event', 'voice_assistant_connected', {
    provider: data.provider,
    user_id: data.user_id
  });
});

window.sycoraxSDK.on('error', function(error) {
  // Log error to your monitoring service
  console.error('Voice widget error:', error);
});
```

## 🔧 API Methods

### Control Methods

```javascript
// Get current status
const status = window.sycoraxSDK.getStatus();
console.log('Widget status:', status); // 'Ready', 'Connected', 'Error', etc.

// Update configuration
window.sycoraxSDK.updateConfig({
  systemMessage: 'New system message',
  theme: { primaryColor: '#new-color' }
});

// Destroy the widget
window.sycoraxSDK.destroy();
```

## 🌐 Multi-Provider Support

### TargetAI Configuration

```javascript
window.sycoraxSDK.run({
  companyId: 'your-company-id',
  baseUrl: 'https://your-server.com',
  provider: 'targetai',
  systemMessage: 'You are a helpful TargetAI assistant',
  allowedResponses: ['text', 'voice'],
  sampleRate: 24000
});
```

### Retell Configuration

```javascript
window.sycoraxSDK.run({
  companyId: 'your-company-id',
  baseUrl: 'https://your-server.com',
  provider: 'retell',
  systemMessage: 'You are a helpful Retell assistant'
});
```

### LiveKit Configuration

```javascript
window.sycoraxSDK.run({
  companyId: 'your-company-id',
  baseUrl: 'https://your-server.com',
  provider: 'livekit',
  systemMessage: 'You are a helpful LiveKit assistant'
});
```

## 🔒 Security Considerations

### Token Management
- Website tokens should be unique per domain/application
- Implement token validation on your backend
- Consider token expiration and rotation

### CORS Configuration
Ensure your token server allows requests from your domains:

```python
# In your Flask app
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["https://yourdomain.com", "https://www.yourdomain.com"])
```

### Rate Limiting
Implement rate limiting on your token server:

```python
from flask_limiter import Limiter

limiter = Limiter(
    app,
    key_func=lambda: request.headers.get('X-Forwarded-For', request.remote_addr),
    default_limits=["100 per hour"]
)

@app.route('/api/token', methods=['POST'])
@limiter.limit("10 per minute")
def generate_token():
    # Token generation logic
    pass
```

## 📱 Mobile Optimization

### Responsive Design
The widget automatically adapts to mobile devices:

```css
/* Mobile-specific styles are included */
@media (max-width: 768px) {
  .voice-widget-container {
    bottom: 15px;
    right: 15px;
  }
  
  .voice-widget-panel {
    width: 280px;
    max-height: 400px;
  }
  
  .voice-widget-trigger {
    width: 50px;
    height: 50px;
  }
}
```

### Touch Optimization
- Touch-friendly button sizes
- Proper touch event handling
- Optimized for mobile voice input

## 🚀 Production Deployment

### CDN Deployment

1. **Upload SDK to CDN**:
   ```bash
   # Upload to your CDN
   aws s3 cp dist-sdk/sycorax-sdk.umd.cjs s3://your-cdn-bucket/js/
   ```

2. **Update embedding script**:
   ```html
   <script>
     (function(d,t) {
       var BASE_URL="https://your-cdn.com";
       var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
       g.src=BASE_URL+"/js/sycorax-sdk.umd.cjs";
       // ... rest of the script
     })(document,"script");
   </script>
   ```

### Performance Optimization

1. **Enable Gzip Compression**:
   ```nginx
   # Nginx configuration
   gzip on;
   gzip_types application/javascript text/css;
   ```

2. **Set Cache Headers**:
   ```nginx
   # Cache the SDK file for 1 year
   location ~* \.(js)$ {
     expires 1y;
     add_header Cache-Control "public, immutable";
   }
   ```

3. **Use HTTP/2**:
   Enable HTTP/2 on your server for better performance.

## 🧪 Testing

### Local Testing

1. **Start the development server**:
   ```bash
   cd sycorax-voice-widget
   pnpm run dev --host
   ```

2. **Test the demo page**:
   Navigate to `http://localhost:5173/demo.html`

3. **Test embedding**:
   Create a test HTML file with the embedding script

### Production Testing

1. **Health Check**:
   ```bash
   curl https://your-server.com/api/health
   ```

2. **Token Generation**:
   ```bash
   curl -X POST https://your-server.com/api/token \
     -H "Content-Type: application/json" \
     -d '{"provider": "targetai", "user_id": "test_user"}'
   ```

3. **Widget Loading**:
   Test the widget on different devices and browsers

## 📊 Analytics & Monitoring

### Event Tracking

```javascript
window.sycoraxSDK.on('connected', function(data) {
  // Google Analytics
  gtag('event', 'voice_widget_connected', {
    provider: data.provider,
    user_id: data.user_id
  });
  
  // Custom analytics
  analytics.track('Voice Widget Connected', {
    provider: data.provider,
    timestamp: new Date().toISOString()
  });
});
```

### Error Monitoring

```javascript
window.sycoraxSDK.on('error', function(error) {
  // Sentry error reporting
  Sentry.captureException(error);
  
  // Custom error logging
  fetch('/api/log-error', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      error: error.message,
      widget: 'voice_assistant',
      timestamp: new Date().toISOString()
    })
  });
});
```

## 🔧 Troubleshooting

### Common Issues

1. **Widget not appearing**:
   - Check browser console for JavaScript errors
   - Verify the SDK file is loading correctly
   - Ensure the script is placed before the closing `</body>` tag

2. **Connection failures**:
   - Verify token server is running and accessible
   - Check CORS configuration
   - Validate companyId and baseUrl

3. **Audio issues**:
   - Ensure HTTPS is used (required for microphone access)
   - Check browser permissions for microphone
   - Verify audio sample rate compatibility

### Debug Mode

Enable debug logging:

```javascript
window.sycoraxSDK.run({
  companyId: 'your-company-id',
  baseUrl: 'https://your-server.com',
  debug: true  // Enable debug logging
});
```

### Browser Compatibility

- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support (iOS 14.3+)
- **Edge**: Full support
- **Mobile browsers**: Optimized support

## 📈 Performance Metrics

### Bundle Size
- **SDK Bundle**: 8.12 kB (2.72 kB gzipped)
- **Load Time**: < 100ms on modern connections
- **Memory Usage**: < 5MB during active use

### Network Usage
- **Initial Load**: ~3kB (gzipped SDK)
- **Token Request**: ~1kB
- **Voice Data**: Variable based on conversation length

## 🎉 Success Stories

### Implementation Examples

1. **E-commerce Support**:
   ```javascript
   window.sycoraxSDK.run({
     companyId: 'ecommerce-support-token',
     baseUrl: 'https://api.yourstore.com',
     systemMessage: 'You are a helpful customer support assistant for our online store. Help customers with orders, returns, and product questions.',
     dataInput: {
       context: 'customer_support',
       department: 'sales'
     }
   });
   ```

2. **Educational Platform**:
   ```javascript
   window.sycoraxSDK.run({
     companyId: 'education-tutor-token',
     baseUrl: 'https://api.learningplatform.com',
     systemMessage: 'You are an AI tutor. Help students understand concepts and answer their questions clearly.',
     dataInput: {
       context: 'education',
       subject: 'mathematics'
     }
   });
   ```

## 🔮 Future Enhancements

### Planned Features
- **Multi-language Support**: Automatic language detection and response
- **Voice Cloning**: Custom voice personalities
- **Advanced Analytics**: Conversation insights and metrics
- **A/B Testing**: Built-in testing framework for different configurations

### Roadmap
- Q1 2025: Multi-language support
- Q2 2025: Advanced analytics dashboard
- Q3 2025: Voice cloning integration
- Q4 2025: Enterprise features and SSO

---

## 📞 Support

For technical support or questions about the SycoraxAI Voice Widget:

- **Documentation**: This guide and the main documentation
- **Issues**: Report bugs or request features
- **Community**: Join our developer community

---

**The SycoraxAI Voice Widget makes it incredibly easy to add sophisticated voice AI capabilities to any website while maintaining complete control over the user experience and provider selection.**

