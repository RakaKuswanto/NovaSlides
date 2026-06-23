export function setupUI(onShaderChange, onSettingsChange) {
  let currentQuality = 'auto';
  let currentMode = 'none';

  // Helper function to setup our custom dropdowns
  function setupDropdown(id, onChangeCallback) {
    const container = document.getElementById(`${id}Dropdown`);
    const btn = document.getElementById(`${id}DropdownBtn`);
    const menu = document.getElementById(`${id}DropdownMenu`);
    if (!container || !btn || !menu) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      // Close other open menus
      document.querySelectorAll('.custom-dropdown-menu.show').forEach(m => {
        if(m !== menu) m.classList.remove('show');
      });
      menu.classList.toggle('show');
    });

    menu.addEventListener('click', (e) => {
      if (e.target.classList.contains('dropdown-item')) {
        const val = e.target.getAttribute('data-value');
        btn.textContent = e.target.textContent;
        menu.classList.remove('show');
        if (onChangeCallback) onChangeCallback(val);
      }
    });

    document.addEventListener('click', (e) => {
      if (!container.contains(e.target)) menu.classList.remove('show');
    });
  }

  // 1. Setup Shader Dropdown
  setupDropdown('shader', (val) => onShaderChange(val));

  // 2. Setup Quality Dropdown
  setupDropdown('quality', (val) => {
    currentQuality = val;
    broadcastSettings();
  });

  // 3. Setup Text Mode Dropdown
  const textOverlayContainer = document.getElementById('textOverlayContainer');
  const glcanvas = document.getElementById('glcanvas');
  const fallbackBg = document.getElementById('fallbackBg');
  
  setupDropdown('mode', (mode) => {
    currentMode = mode;
    if (textOverlayContainer) {
      textOverlayContainer.className = '';
      textOverlayContainer.classList.add(`text-mode-${mode}`);
    }
    if (mode === 'mask') {
      document.documentElement.classList.add('bg-transparent');
      document.body.classList.add('bg-transparent');
      if (glcanvas) glcanvas.classList.add('canvas-mask');
      if (fallbackBg) fallbackBg.classList.add('canvas-mask');
    } else {
      document.documentElement.classList.remove('bg-transparent');
      document.body.classList.remove('bg-transparent');
      if (glcanvas) glcanvas.classList.remove('canvas-mask');
      if (fallbackBg) fallbackBg.classList.remove('canvas-mask');
    }
  });

  // 4. Setup Text Input & Formatting Settings
  const textInput = document.getElementById('textInput');
  const textOverlay = document.getElementById('textOverlay');
  const svgMaskText = document.getElementById('svgMaskText');
  
  const textSettingsBtn = document.getElementById('textSettingsBtn');
  const textSettingsPopup = document.getElementById('textSettingsPopup');
  
  const fontSizeSlider = document.getElementById('fontSizeSlider');
  const fontWeightSlider = document.getElementById('fontWeightSlider');
  const fontSpaceSlider = document.getElementById('fontSpaceSlider');
  
  const fontSizeVal = document.getElementById('fontSizeVal');
  const fontWeightVal = document.getElementById('fontWeightVal');
  const fontSpaceVal = document.getElementById('fontSpaceVal');

  if (textInput) {
    textInput.addEventListener('input', (event) => {
      if (textOverlay) textOverlay.textContent = event.target.value;
      if (svgMaskText) svgMaskText.textContent = event.target.value;
    });
  }

  // Toggle Text Settings Popup
  if (textSettingsBtn && textSettingsPopup) {
    textSettingsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.custom-dropdown-menu.show').forEach(m => m.classList.remove('show'));
      textSettingsPopup.classList.toggle('show');
      textSettingsBtn.classList.toggle('active');
    });
    
    // Prevent closing when clicking inside the popup
    textSettingsPopup.addEventListener('click', (e) => e.stopPropagation());

    document.addEventListener('click', (e) => {
      if (!textSettingsBtn.contains(e.target) && !textSettingsPopup.contains(e.target)) {
        textSettingsPopup.classList.remove('show');
        textSettingsBtn.classList.remove('active');
      }
    });
  }

  // Apply styles function
  function applyTextStyles(prop, value) {
    if (textOverlay) textOverlay.style[prop] = value;
    if (svgMaskText) svgMaskText.style[prop] = value;
  }

  // Font Family Setup
  setupDropdown('font', (val) => {
    applyTextStyles('fontFamily', val);
  });

  // Slider Listeners
  if (fontSizeSlider) {
    fontSizeSlider.addEventListener('input', (e) => {
      const val = e.target.value + 'vw';
      if(fontSizeVal) fontSizeVal.textContent = val;
      applyTextStyles('fontSize', val);
    });
  }
  if (fontWeightSlider) {
    fontWeightSlider.addEventListener('input', (e) => {
      const val = e.target.value;
      if(fontWeightVal) fontWeightVal.textContent = val;
      applyTextStyles('fontWeight', val);
    });
  }
  if (fontSpaceSlider) {
    fontSpaceSlider.addEventListener('input', (e) => {
      const val = e.target.value + 'px';
      if(fontSpaceVal) fontSpaceVal.textContent = val;
      applyTextStyles('letterSpacing', val);
    });
  }

  // 5. Setup Speed Slider
  const speedSlider = document.getElementById('speedSlider');
  if (speedSlider) speedSlider.addEventListener('input', broadcastSettings);

  // Broadcast settings to main loop
  function broadcastSettings() {
    if (onSettingsChange) {
      onSettingsChange({
        quality: currentQuality,
        speed: speedSlider ? parseFloat(speedSlider.value) : 1.0
      });
    }
  }

  // Handle ESC key to help user exit slide show
  const toastMessage = document.getElementById('toastMessage');
  let toastTimeout;
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.keyCode === 27) {
      if (toastMessage) {
        clearTimeout(toastTimeout);
        toastMessage.classList.add('show');
        toastTimeout = setTimeout(() => {
          toastMessage.classList.remove('show');
        }, 5000);
      }
    }
  });
}