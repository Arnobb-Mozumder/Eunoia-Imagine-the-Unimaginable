// ==========================================
// THEME CUSTOMIZER COMPONENT
// ==========================================

import { updateParticleColor, updateParticleBrightness } from '../three/particleBackground.js';

export function initThemeCustomizer() {
  const customizerHTML = `
    <div id="theme-customizer-panel" class="theme-customizer-panel">
      <div class="customizer-header">
        <h3>Customizer</h3>
      </div>

      <div class="customizer-section">
        <span class="customizer-label">Particles</span>
        <div class="control-group">
          <div class="color-picker-row">
            <span>Color</span>
            <input type="color" id="particle-color-input" class="color-input" value="#E0FFFF">
          </div>
          <div class="slider-group">
            <div class="slider-header">
              <span>Emission</span>
              <span id="particle-brightness-val">1.0</span>
            </div>
            <input type="range" id="particle-brightness-slider" class="custom-slider" min="0.1" max="5.0" step="0.1" value="1.0">
          </div>
        </div>
      </div>

      <div class="customizer-section">
        <span class="customizer-label">Interface</span>
        <div class="control-group">
          <div class="color-picker-row">
            <span>Primary Text</span>
            <input type="color" id="text-primary-input" class="color-input" value="#FFFFFF">
          </div>
          <div class="color-picker-row">
            <span>Secondary Text</span>
            <input type="color" id="text-secondary-input" class="color-input" value="#9CA3AF">
          </div>
          <div class="color-picker-row">
            <span>Accent Color</span>
            <input type="color" id="accent-color-input" class="color-input" value="#8B5CF6">
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', customizerHTML);

  const btn = document.getElementById('theme-customizer-btn');
  const panel = document.getElementById('theme-customizer-panel');
  const particleColorInput = document.getElementById('particle-color-input');
  const particleBrightnessSlider = document.getElementById('particle-brightness-slider');
  const particleBrightnessVal = document.getElementById('particle-brightness-val');
  const textPrimaryInput = document.getElementById('text-primary-input');
  const textSecondaryInput = document.getElementById('text-secondary-input');
  const accentColorInput = document.getElementById('accent-color-input');

  // Toggle Panel
  btn.addEventListener('click', () => {
    panel.classList.toggle('active');
  });

  // Close panel on click outside
  document.addEventListener('mousedown', (e) => {
    if (!panel.contains(e.target) && !btn.contains(e.target)) {
      panel.classList.remove('active');
    }
  });

  // Particle Listeners
  particleColorInput.addEventListener('input', (e) => {
    updateParticleColor(e.target.value);
  });

  particleBrightnessSlider.addEventListener('input', (e) => {
    const val = e.target.value;
    particleBrightnessVal.textContent = val;
    updateParticleBrightness(parseFloat(val));
  });

  // UI Listeners
  textPrimaryInput.addEventListener('input', (e) => {
    document.documentElement.style.setProperty('--text-primary', e.target.value);
  });

  textSecondaryInput.addEventListener('input', (e) => {
    const color = e.target.value;
    document.documentElement.style.setProperty('--text-secondary', color);
    document.documentElement.style.setProperty('--text-muted', color);
  });

  accentColorInput.addEventListener('input', (e) => {
    const color = e.target.value;
    document.documentElement.style.setProperty('--accent-purple', color);
    document.documentElement.style.setProperty('--accent-purple-light', color + 'cc');
  });
}
