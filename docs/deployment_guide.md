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
`/token`  (hendler is located in `targetai-token-server/src/routes/token.py`) - 
to launch for test, inside venv with installed dependancies:
- python3 src/main.py // Running on http://localhost:8001

4) insert into a webpage:
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/sycorax-voice-widget@latest/dist-sdk/sycorax-sdk.css"
    />
    (into head)





## 1. Publish `sycoraxai-voice-assistants`

Follow these steps to bump the version, build, and publish the `sycoraxai-voice-assistants` package to npm:

1. **Bump patch version**

   ```bash
   npm version patch
   ```

   * Updates the `version` field in `package.json` (e.g. from `1.2.3` to `1.2.4`).

2. **Create tarball**

   ```bash
   npm pack
   ```

   * Generates `sycoraxai-voice-assistants-<version>.tgz` in the project root.

3. **Build for production**

   ```bash
   npm run build
   ```

   * Outputs compiled files into the `dist/` directory.

4. **Publish to npm**

   ```bash
   npm publish --access public
   ```

   * Deploys the new version to the npm registry.

---

## 2. Update `sycorax-voice-widget`

Next, update the widget to use the latest assistants package and rebuild both the app and the SDK:

1. **Update dependency**

   * In `package.json` of `sycorax-voice-widget`, update the `sycoraxai-voice-assistants` version under `dependencies`.

2. **Reinstall dependencies**

   ```bash
   rm -rf node_modules
   pnpm install
   ```

3. **Run in development mode**

   ```bash
   VITE_PORT=5000 pnpm run dev --port 5000
   ```

   * `src/App.jsx` embeds the `<VoiceWidget />` component.
   * Configuration for the widget lives alongside in `App.jsx`.
   * Core SDK logic is in `src/SycoraxSDK.jsx` (basically how we invoke VoiceWidget, how define config for VoiceWidget and how insert VoiceWidget insede a webpage).

4. **Bump package version**

   ```bash
   npm version patch
   ```

5. **Build the widget**

   ```bash
   npm run build
   ```

   * Outputs the production-ready widget to `dist/`.

6. **Build the embeddable SDK**

   ```bash
   npx vite build --config vite.config.sdk.js
   ```

   * Places the UMD/CJS SDK bundles into `dist-sdk/`.

7. **Prepare browser-ready SDK**

   ```bash
   cp dist-sdk/sycorax-sdk.umd.cjs dist-sdk/sycorax-sdk.js
   ```

   * `sycorax-sdk.js` will be loaded by client pages.

8. **Publish widget to npm**

   ```bash
   npm publish --access public
   ```

---

## 3. Backend Configuration & Endpoints

All widget behavior is driven by backend endpoints. Two routes are exposed in the token server:

| Endpoint             | Handler File                                            | Purpose                                                   |
| -------------------- | ------------------------------------------------------- | --------------------------------------------------------- |
| `/connectionDetails` | `targetai-token-server/src/routes/connectionDetails.py` | Rfirst endpoint to get general widget configurations, like provider (TargetAI, retell, livekit) and provider specific parametrs. |
| `/token`             | `targetai-token-server/src/routes/token.py`             | provides token for TargetAI provider, retell and livekit do not use it        |

To spin up the server locally (inside a Python venv):

```bash
python3 src/main.py
# Server running at http://localhost:8001
```

---

## 4. Embedding the Widget in a Web Page

1. **Include CSS** in your `<head>`:

   ```html
   <link
     rel="stylesheet"
     href="https://cdn.jsdelivr.net/npm/sycorax-voice-widget@latest/dist-sdk/sycorax-sdk.css"
   />
   ```

2. **Load the SDK** before your closing `</body>` tag:

   ```html
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


3. **Initialization Options**

   * `companyId`: Your unique company identifier.
   * `baseUrl`: URL of your token server (e.g. `https://api.myserver.com`, ).

---

*Ready to go!* Your voice widget should now be published, updated, and embeddable in any web project.
