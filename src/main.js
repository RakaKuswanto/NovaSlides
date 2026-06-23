import { loadShader } from './shader-loader.js';
import { setupUI } from './ui.js';

let isPresentationMode = true; // Default true agar jalan di browser normal

Office.onReady((info) => {
  if (info.host === Office.HostType.PowerPoint) {
    Office.context.document.getActiveViewAsync((result) => {
      if (result.status === Office.AsyncResultStatus.Succeeded) {
        updateViewState(result.value === 'read');
      }
    });

    Office.context.document.addHandlerAsync(
      Office.EventType.ActiveViewChanged,
      (eventArgs) => updateViewState(eventArgs.activeView === 'read')
    );
  }
});

const canvas = document.getElementById('glcanvas');
const fallbackBg = document.getElementById('fallbackBg');
let gl = canvas.getContext('webgl', { antialias: false, depth: false, powerPreference: "low-power" });

if (!gl) {
  console.warn("WebGL tidak didukung. Menampilkan gambar fallback.");
  canvas.style.display = 'none';
  if(fallbackBg) fallbackBg.style.display = 'block';
  setupUI(() => {}); // Prevent UI crashes if manipulated
  throw new Error("WebGL is unsupported");
}

let shaderProgram = null;
let nextShaderProgram = null;
let animationFrameId = null;
let isVisible = true;

let RESOLUTION_SCALE = 0.5;
const TARGET_FPS = 30;
const FRAME_MIN_TIME = 1000 / TARGET_FPS; 

// Auto-scaling metrics
let frameCount = 0;
let lastFpsTime = performance.now();
let lowFpsStreak = 0;

// Custom Settings
let speedMultiplier = 1.0;
let manualQuality = 'auto';

// Waktu Custom Shader
let lastSystemTime = 0;
let shaderTime = 0; 
let currentShaderFile = 'nebula.frag'; 

// Context Loss Handling
canvas.addEventListener('webglcontextlost', (e) => {
  e.preventDefault(); 
  console.warn("WebGL Context Lost! Menampilkan fallback...");
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  canvas.style.display = 'none';
  if(fallbackBg) fallbackBg.style.display = 'block';
}, false);

canvas.addEventListener('webglcontextrestored', () => {
  console.log("WebGL Context Restored! Memuat ulang shader...");
  canvas.style.display = 'block';
  if(fallbackBg) fallbackBg.style.display = 'none';
  start(currentShaderFile); 
}, false);

let mouseX = 0, mouseY = 0;
window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX * RESOLUTION_SCALE; 
  mouseY = (window.innerHeight - e.clientY) * RESOLUTION_SCALE; 
});
window.addEventListener('touchmove', (e) => {
  mouseX = e.touches[0].clientX * RESOLUTION_SCALE; 
  mouseY = (window.innerHeight - e.touches[0].clientY) * RESOLUTION_SCALE;
});

function updateViewState(isSlideShow) {
  isPresentationMode = isSlideShow;
  const uiContainer = document.querySelector('.ui-container');
  if (isSlideShow) {
    if(uiContainer) uiContainer.style.display = 'none'; 
    if (!animationFrameId && isVisible && !gl.isContextLost()) {
      lastSystemTime = performance.now(); 
      renderLoop(lastSystemTime); 
    }
  } else {
    if(uiContainer) uiContainer.style.display = 'flex'; 
    shaderTime = 0; 
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId); 
      animationFrameId = null;
    }
    if (shaderProgram && !gl.isContextLost()) {
      requestAnimationFrame(() => shaderProgram.render(0, mouseX, mouseY));
    }
  }
}

function resizeCanvas() {
  canvas.width = Math.floor(canvas.clientWidth * RESOLUTION_SCALE);
  canvas.height = Math.floor(canvas.clientHeight * RESOLUTION_SCALE);
  if (shaderProgram && shaderProgram.reload) shaderProgram.reload();
}

function renderLoop(systemTime) {
  if (gl.isContextLost()) return;

  if (isVisible && isPresentationMode) {
    animationFrameId = requestAnimationFrame(renderLoop);
  }
  
  const deltaTime = systemTime - lastSystemTime;
  if (deltaTime < FRAME_MIN_TIME) return;
  lastSystemTime = systemTime;
  
  shaderTime += deltaTime * speedMultiplier; 

  // Adaptive Quality Scaling
  if (manualQuality === 'auto') {
    frameCount++;
    if (systemTime - lastFpsTime >= 1000) {
      const fps = frameCount;
      if (fps < 20 && RESOLUTION_SCALE > 0.25) {
        lowFpsStreak++;
        if (lowFpsStreak >= 3) {
          RESOLUTION_SCALE -= 0.15; 
          if (RESOLUTION_SCALE < 0.25) RESOLUTION_SCALE = 0.25;
          console.warn(`Performa rendah (${fps} FPS). Menurunkan resolusi ke ${RESOLUTION_SCALE}`);
          resizeCanvas();
          lowFpsStreak = 0;
        }
      } else if (fps >= 28) {
        lowFpsStreak = 0; 
      }
      frameCount = 0;
      lastFpsTime = systemTime;
    }
  }

  if (nextShaderProgram) {
    shaderProgram = nextShaderProgram;
    nextShaderProgram = null;
    resizeCanvas();
  }

  if (shaderProgram && shaderProgram.render) {
    shaderProgram.render(shaderTime * 0.001, mouseX, mouseY); 
  }
}

async function start(shaderFile) {
  currentShaderFile = shaderFile;
  const newProgram = await loadShader(gl, shaderFile, canvas);
  if (newProgram) {
    nextShaderProgram = newProgram;
  }
  
  if (!animationFrameId && isVisible && isPresentationMode && !gl.isContextLost()) {
    lastSystemTime = performance.now();
    renderLoop(lastSystemTime);
  } else if (!isPresentationMode && newProgram && !gl.isContextLost()) {
    requestAnimationFrame(() => {
      if (nextShaderProgram) { shaderProgram = nextShaderProgram; nextShaderProgram = null; resizeCanvas(); }
      if (shaderProgram) shaderProgram.render(0, mouseX, mouseY); 
    });
  }
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === 'visible') {
    isVisible = true;
    if (isPresentationMode && !gl.isContextLost()) {
      lastSystemTime = performance.now(); 
      renderLoop(lastSystemTime);
    }
  } else {
    isVisible = false;
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }
});

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function handleSettingsChange(settings) {
  speedMultiplier = settings.speed;
  manualQuality = settings.quality;
  
  if (manualQuality !== 'auto') {
    RESOLUTION_SCALE = parseFloat(manualQuality);
    resizeCanvas();
  } else {
    // Reset back to safe default when returning to auto
    RESOLUTION_SCALE = 0.5;
    lowFpsStreak = 0;
    resizeCanvas();
  }
}

setupUI(start, handleSettingsChange);
start(currentShaderFile);