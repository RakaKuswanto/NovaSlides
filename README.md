# NovaSlides - Shader Engine for PowerPoint 🌌

**NovaSlides** is a high-performance, real-time WebGL shader engine packaged as a Microsoft Office Add-in. It allows presenters to inject cinematic, interactive, and hardware-accelerated visual effects directly into their PowerPoint slides.

![NovaSlides Preview](https://img.shields.io/badge/Status-Active-success) ![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

- **19+ Premium Shaders**: A curated collection of WebGL fragment shaders categorized into Nature, Sci-Fi, Abstract, and Interactive themes (e.g., Black Hole, Cyber Grid, Golden Fluid, Matrix Rain).
- **Text Masking Engine**: Advanced SVG Alpha Masking and Compositor layer techniques to punch out text from the shaders with buttery-smooth anti-aliasing.
- **Dynamic Typography**: Integrated with premium Google Fonts (Outfit, Bebas Neue, Cinzel, etc.) with real-time sliders for Size, Weight, and Spacing.
- **Text Effects**: Multiple render modes including Solid, Neon Glow, Hollow Outline, Cyber Flicker, Retro 80s 3D, and Digital Glitch.
- **Performance Optimized**: Variable render quality (Ultra HD to Low) and Auto-FPS capping to ensure PowerPoint remains responsive even on low-end laptops.
- **Responsive Glassmorphism UI**: A sleek, floating control panel that adapts to the presentation window size.

## 🛠️ Tech Stack

- **Core**: Vanilla JavaScript (ES6+), HTML5, CSS3.
- **Graphics**: WebGL (Custom Render Loop via `glslCanvas` / raw context).
- **Integration**: Microsoft `Office.js` API for PowerPoint integration.
- **Build Tool**: [Parcel](https://parceljs.org/) (Zero-configuration web application bundler).

## 🚀 Local Development (Sideloading)

To run and test the add-in locally inside your PowerPoint application:

1. **Install Dependencies:**
   ```bash
   npm install
   ```
2. **Start the Local Dev Server:**
   ```bash
   npm start
   ```
   *This will start a local HTTPS server (usually at `https://localhost:1234`).*

3. **Sideload into PowerPoint (Windows):**
   - Create a shared network folder on your computer and place `manifest.xml` inside it.
   - Open PowerPoint > Options > Trust Center > Trust Center Settings > Trusted Add-in Catalogs.
   - Add the network share path and check "Show in Menu".
   - Restart PowerPoint, go to **Insert > Get Add-ins > Shared Folder**, and select NovaSlides.

## 📦 Deployment (GitHub Pages)

To host the add-in so anyone can use it (or for AppSource publication):

1. **Build the Project:**
   ```bash
   npm run build
   ```
   *This bundles all assets into the `dist/` directory.*

2. **Host on GitHub Pages:**
   - Push the code to a GitHub repository.
   - Enable GitHub Pages in the repository settings, pointing to the `gh-pages` branch or the root/dist folder.
   - Note the deployed HTTPS URL (e.g., `https://username.github.io/NovaSlides/`).

3. **Update Production Manifest:**
   - Open `manifest-prod.xml`.
   - Replace `YOUR_GITHUB_PAGES_URL_HERE` with your actual hosted URL.
   - This `manifest-prod.xml` is the file you will distribute to users or submit to Microsoft.

## 🛒 Publishing to Microsoft AppSource

If you wish to make NovaSlides available to the public via the official Microsoft Store:

1. Register for the [Microsoft Partner Center](https://partner.microsoft.com/).
2. Create a new "Office Add-in" offer.
3. Upload the fully configured `manifest-prod.xml`.
4. Ensure your hosted URL (e.g., GitHub Pages) has a valid privacy policy and terms of service linked.
5. Submit for certification review.

## 📝 Folder Structure

\`\`\`
NovaSlides/
├── public/
│   ├── index.html       # Main add-in UI and WebGL canvas
│   └── assets/          # Icons and images
├── src/
│   ├── main.js          # Core WebGL initialization and render loop
│   ├── ui.js            # UI event listeners and DOM manipulation
│   └── shaders.js       # GLSL Fragment Shader registry
├── manifest.xml         # Local development manifest
├── manifest-prod.xml    # Production/AppSource manifest
├── package.json         # Node.js dependencies and scripts
└── README.md            # You are here
\`\`\`

## 📄 License

This project is licensed under the MIT License. Feel free to use, modify, and distribute!
