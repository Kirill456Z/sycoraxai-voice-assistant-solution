1) start from updatinf sycoraxai-voice-assistants:
    1) npm version patch  // increments package.json version
    2) npm pack // creates sycoraxai-voice-assistants-x.x.x.tgz file
    3) npm run build // creates dist for production use
    4) npm publish --access public // publishes new version to the npm regestry 

2) update sycorax-voice-widger
    1) update sycoraxai-voice-assistants version in package.json dependencies
    2) delete node_modules and pnpm install
    3) VITE_PORT=5000 pnpm run dev --port 5000 (in src/App.jsx components/VoiceWidget is being embbeded. config for VoiceWidget companent is defined in the same file)
    - in src/SycoraxSDK.jsx our web sdk logic is defined (basically how we invoke VoiceWidget, how define config for VoiceWidget and how insert VoiceWidget insede a webpage)
    4) increment package.json version
    5) npm run buil // creates production build => /sycorax-voice-widget/dist/
    6) npx vite build --config vite.config.sdk.js // creates sdk to embbed in web => /sycorax-voice-widget/dist-sdk/
    7) cp dist-sdk/sycorax-sdk.umd.cjs dist-sdk/sycorax-sdk.js // sycorax-sdk.js will be downloaded into web browser
    8) npm publish --access public // delpoys our updated widget

3) all the configs to set up the widget behaviour are passed frm the backend. backend has 2 endpoints:
`/connectionDetails` (hendlers are located in `targetai-token-server/src/routes/connectionDetails.py`) - first endpoint to get general widget configurations, like provider (TargetAI, retell, livekit) and provider specific parametrs.
`/token`  (hendler is located in `targetai-token-server/src/routes/token.py`) - provides token for TargetAI provider, retell and livekit do not use it
to launch for test:
- python3 src/main.py // Running on http://localhost:8001


4) insert into a webpage:
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/sycorax-voice-widget@latest/dist-sdk/sycorax-sdk.css"
    />
    (into head)

<script>
      (function(d,t) {
          var BASE_URL= "https://cdn.jsdelivr.net/npm/sycorax-voice-widget@latest/dist-sdk"
          var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
          g.src= BASE_URL + '/sycorax-sdk.js';
          g.defer = true; 
          g.async = true;
          s.parentNode.insertBefore(g,s);
          g.onload=function(){
              window.sycoraxSDK.run({
              companyId: 'abc123',
              baseUrl: 'http://localhost:8001' // or a production server url
              })
          }
      })(document,"script");
      </script>
where

