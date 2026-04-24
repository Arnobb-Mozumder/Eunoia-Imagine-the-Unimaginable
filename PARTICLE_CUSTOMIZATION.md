// ==========================================
// PARTICLE BACKGROUND — CUSTOMIZATION GUIDE
// ==========================================

/*
  This file documents how to customize the particle animation system.
  Modify the CONFIG object in particleBackground.js to change behavior.
*/

// ==========================================
// CONFIGURATION OPTIONS
// ==========================================

const CONFIG = {
  // Particle System
  particleCount: 3000,                  // Total particles (reduce for low-end devices)
  particleSize: 2,                      // Base particle size in pixels
  particleSizeVariation: 1.5,           // Size variation range (0.5-1.5)
  
  // Sphere Geometry
  sphereRadius: 8,                      // Radius of particle sphere
  
  // Visual Effects
  glowIntensity: 2,                     // Particle glow brightness (1-3)
  bloomThreshold: 0.5,                  // Bloom effect threshold (0-1)
  bloomStrength: 1.2,                   // Bloom effect strength
  bloomRadius: 0.4,                     // Bloom blur radius
  
  // Physics & Animation
  explosionForce: 0.3,                  // Force applied during click explosion
  explosionDecay: 0.98,                 // How quickly explosion momentum decays
  attractionForce: 0.02,                // Pull toward target position (spring constant)
  damping: 0.95,                        // Air resistance / friction
  morphSpeed: 0.05,                     // How fast shapes morph (0-1)
  particleDamping: 0.96,                // Damping during explosion
  
  // Performance
  minDeviceParticles: 1000              // Minimum particle count on low-end devices
}

// ==========================================
// CUSTOMIZATION EXAMPLES
// ==========================================

/*
  EXAMPLE 1: Increase Glow for Dramatic Effect
  ─────────────────────────────────────────
  glowIntensity: 3,          // More intense glow
  bloomStrength: 1.5,        // Stronger bloom effect
  bloomRadius: 0.6,          // Larger bloom spread
*/

/*
  EXAMPLE 2: Slower, More Fluid Motion
  ─────────────────────────────────────────
  attractionForce: 0.01,     // Weaker attraction (slower regrouping)
  damping: 0.97,             // More friction (softer motion)
  morphSpeed: 0.03,          // Slower shape morphing
  particleDamping: 0.98      // Slower explosion decay
*/

/*
  EXAMPLE 3: More Explosive, Energetic Behavior
  ─────────────────────────────────────────
  explosionForce: 0.5,       // Stronger explosion
  explosionDecay: 0.95,      // Slower momentum loss
  attractionForce: 0.03,     // Stronger pull back
  damping: 0.92              // Less friction (faster motion)
*/

/*
  EXAMPLE 4: Optimized for Low-End Devices
  ─────────────────────────────────────────
  particleCount: 1500,       // Fewer particles
  particleSize: 1.5,         // Slightly smaller
  bloomStrength: 0.8,        // Lighter effects
  minDeviceParticles: 800    // Lower minimum threshold
*/

/*
  EXAMPLE 5: Ultra-High-Performance with More Particles
  ─────────────────────────────────────────────────
  particleCount: 5000,       // More particles for premium devices
  sphereRadius: 10,          // Larger sphere
  glowIntensity: 2.5,        // Enhanced glow
  bloomStrength: 1.5         // Stronger bloom
*/

// ==========================================
// SHADER CUSTOMIZATION
// ==========================================

/*
  To change particle color, modify the shader uniform in particleBackground.js:
  
  In createParticleSystem():
  uniforms: {
    ...
    glowColor: { value: new THREE.Color(0x6366f1) }  // Change this color
    ...
  }
  
  Color codes:
  - 0x6366f1 = Indigo (current)
  - 0xff0080 = Hot pink
  - 0x00ffff = Cyan
  - 0x00ff00 = Lime green
  - 0xff6600 = Orange
  - 0xff0000 = Red
*/

// ==========================================
// MORPHING SHAPES CUSTOMIZATION
// ==========================================

/*
  To add custom morphing shapes, modify the shapes array in generateMorphShape():
  
  Example: Add a star shape
  ────────────────────────
  (i, theta, y) => {
    const points = 5;
    const spike = Math.sin(theta * points * 2) * 0.3;
    const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y)) * (1 + spike);
    return [
      Math.cos(theta) * radiusAtY * radius,
      y * radius,
      Math.sin(theta) * radiusAtY * radius
    ]
  }
  
  Current shapes:
  1. Blob - wavy sphere with random fluctuations
  2. Wave - undulating form with horizontal waves
  3. Torus - stretched donut-like shape
  4. Spiral - twisted/rotated form
*/

// ==========================================
// PERFORMANCE PROFILING
// ==========================================

/*
  To monitor particle performance, use:
  
  const stats = getParticleStats();
  console.log(stats);
  
  Returns:
  {
    particleCount: 3000,
    isExploding: false,
    scrollValue: "0.234",
    mouseX: "-0.421",
    mouseY: "0.567"
  }
  
  Monitor FPS using browser DevTools:
  - Chrome: Ctrl+Shift+J → Console → right-click → Run Command Menu
  - Firefox: Ctrl+Shift+K → Console
  
  Target: 60 FPS on desktop, 30 FPS minimum on mobile
*/

// ==========================================
// INTERACTION MODIFICATIONS
// ==========================================

/*
  MODIFY SCROLL SENSITIVITY:
  In onScroll():
  - Increase maxScroll divisor for slower morphing
  - Decrease for faster response
  
  MODIFY CLICK BEHAVIOR:
  In onCanvasClick():
  - Change explosionForce value for stronger/weaker explosions
  - Change timeout (2000ms) for faster/slower regrouping
  
  MODIFY MOUSE INFLUENCE:
  In animate() particle physics section:
  const mouseInfluence = 0.001;  // Change this value
  - Higher = stronger mouse influence
  - Lower = subtler effect
*/

// ==========================================
// COLOR THEMES
// ==========================================

/*
  Pre-configured color themes for glowColor:
  
  CYBERPUNK (current indigo):
  new THREE.Color(0x6366f1) - Indigo with cyan accents
  
  NEON PINK:
  new THREE.Color(0xff0080)
  
  AQUATIC:
  new THREE.Color(0x00d9ff)
  
  FOREST:
  new THREE.Color(0x00ff00)
  
  SUNSET:
  new THREE.Color(0xff6600)
  
  GALAXY:
  new THREE.Color(0x9d00ff)
  
  ICE:
  new THREE.Color(0x00ffff)
  
  FIRE:
  new THREE.Color(0xff3300)
*/

export { CONFIG }
