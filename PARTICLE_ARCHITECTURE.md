# 🏗️ Particle System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      BROWSER WINDOW                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                    VIEWPORT (Window)                  │   │
│  │                                                       │   │
│  │  ┌───────────────────────────────────────────────┐   │   │
│  │  │    LAYER 1: Particle Background Canvas       │   │   │
│  │  │    z-index: 1                                │   │   │
│  │  │  ─────────────────────────────────────────   │   │   │
│  │  │  • Three.js Scene                           │   │   │
│  │  │  • WebGL Renderer                           │   │   │
│  │  │  • Particle Geometry (3000 points)          │   │   │
│  │  │  • GLSL Shaders (Vertex + Fragment)         │   │   │
│  │  │  • Lighting & Effects                       │   │   │
│  │  │                                              │   │   │
│  │  │  ✨ Glowing indigo sphere morphing on scroll │   │   │
│  │  │  💥 Explodes on click                       │   │   │
│  │  │  🎯 Responds to mouse movement              │   │   │
│  │  └───────────────────────────────────────────┘   │   │
│  │                                                       │   │
│  │  ┌───────────────────────────────────────────────┐   │   │
│  │  │  LAYER 2: Glass Panel Container              │   │   │
│  │  │  z-index: 100                                │   │   │
│  │  │  ─────────────────────────────────────────   │   │   │
│  │  │  background: rgba(15, 23, 42, 0.75)         │   │   │
│  │  │  backdrop-filter: blur(20px) saturate(180%) │   │   │
│  │  │  border: 1px solid rgba(255,255,255, 0.1)   │   │   │
│  │  │                                              │   │   │
│  │  │  ┌─────────────────────────────────────────┐ │   │   │
│  │  │  │  HOME HERO SECTION                    │ │   │   │
│  │  │  │  • Name & Title                       │ │   │   │
│  │  │  │  • Description                        │ │   │   │
│  │  │  │  • Social Media Links                 │ │   │   │
│  │  │  └─────────────────────────────────────────┘ │   │   │
│  │  │                                              │   │   │
│  │  │  ┌─────────────────────────────────────────┐ │   │   │
│  │  │  │  ABOUT SECTION                        │ │   │   │
│  │  │  │  • Bio text                           │ │   │   │
│  │  │  │  • Story links                        │ │   │   │
│  │  │  └─────────────────────────────────────────┘ │   │   │
│  │  │                                              │   │   │
│  │  │  ┌─────────────────────────────────────────┐ │   │   │
│  │  │  │  PREVIEW CARDS SECTION                │ │   │   │
│  │  │  │  • Games, Models, Animations, etc.   │ │   │   │
│  │  │  └─────────────────────────────────────────┘ │   │   │
│  │  │                                              │   │   │
│  │  │  ┌─────────────────────────────────────────┐ │   │   │
│  │  │  │  FOOTER                                │ │   │   │
│  │  │  │  • Links, Social media                │ │   │   │
│  │  │  │  • Copyright info                     │ │   │   │
│  │  │  └─────────────────────────────────────────┘ │   │   │
│  │  └───────────────────────────────────────────────┘   │   │
│  │                                                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │             FIXED NAVBAR (z-index: 1000)             │   │
│  │             (Always on top, position: fixed)         │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow & Interactions

```
┌──────────────────────────────────────────────────────────────┐
│                    USER INTERACTIONS                         │
└──────────────────────────────────────────────────────────────┘
                            ↓
    ┌───────────────────────┬───────────────────────┐
    ↓                       ↓                       ↓
 SCROLL              CLICK                    MOUSE MOVE
    ↓                       ↓                       ↓
    │                       │                       │
    ├─→ onScroll()         ├─→ onCanvasClick()    └─→ onMouseMove()
    │   • Calculate       │   • Set isExploding     • Store mouseX
    │     scroll%        │   • Apply random        • Store mouseY
    │                     │     velocities to     • Use in particle
    │   ↓                │     particles          physics
    │                    │   • Reset after 2s     ↓
    │   generateMorphShape()
    │   • Select shape based on scroll%
    │   • Interpolate between 4 shapes:
    │     1. Sphere (0-25%)
    │     2. Blob (25-50%)
    │     3. Wave (50-75%)
    │     4. Torus (75-100%)
    │   ↓
    └─→ targetPositions array updated
        ↓
    ┌───────────────────────────────────────┐
    │      ANIMATION LOOP (RequestAnimFrame) │
    └───────────────────────────────────────┘
        ↓
    For each of 3000 particles:
    ├─ Calculate distance to target
    ├─ Apply spring force (attraction)
    ├─ Apply damping (friction)
    ├─ Apply mouse influence
    ├─ Update velocity
    └─ Update position
        ↓
    Update Particle Geometry Buffer
        ↓
    Render with Three.js + Shaders
        ↓
    Display on Canvas (60 FPS)
```

## Shader Pipeline

```
┌─────────────────────────────────────────────────────────┐
│           VERTEX SHADER (per particle)                  │
├─────────────────────────────────────────────────────────┤
│ Input:                                                  │
│  • position (3D coordinate of particle)                │
│  • scale (particle size)                               │
│  • glow (particle brightness)                          │
│                                                         │
│ Processing:                                             │
│  • Transform position to camera space (MVP matrix)     │
│  • Calculate point size based on depth                 │
│  • Pass glow value to fragment shader                  │
│                                                         │
│ Output:                                                 │
│  • gl_Position (final vertex position in clip space)  │
│  • gl_PointSize (pixel radius of particle)            │
│  • vGlow (glow intensity for fragment shader)          │
└─────────────────────────────────────────────────────────┘
                          ↓
            (Rasterization - convert to pixels)
                          ↓
┌─────────────────────────────────────────────────────────┐
│           FRAGMENT SHADER (per pixel)                   │
├─────────────────────────────────────────────────────────┤
│ Input:                                                  │
│  • gl_PointCoord (2D coordinate within particle)      │
│  • vGlow (glow intensity from vertex shader)          │
│  • glowColor (uniform: indigo #6366f1)                │
│                                                         │
│ Processing:                                             │
│  • Calculate distance from pixel to circle center      │
│  • Create soft circular falloff (smoothstep)           │
│  • Calculate glow based on distance                    │
│  • Combine color with glow intensity                   │
│  • Output with additive blending                       │
│                                                         │
│ Output:                                                 │
│  • gl_FragColor (final pixel color + alpha)           │
│  • With additive blending: color += previous color    │
│  • Creates glowing effect where particles overlap      │
└─────────────────────────────────────────────────────────┘
                          ↓
                  Final Screen Render
                          ↓
                   Visible to User
```

## Physics System

```
┌────────────────────────────────────────────────────────────┐
│              PARTICLE PHYSICS EACH FRAME                   │
└────────────────────────────────────────────────────────────┘

For each particle i:

1. CALCULATE ATTRACTION
   ─────────────────────
   direction = targetPos[i] - currentPos[i]
   springForce = direction * attractionForce (0.02)
   velocity += springForce


2. APPLY DAMPING (Friction)
   ──────────────────────────
   if (isExploding)
     velocity *= particleDamping (0.96)  // More friction during explosion
   else
     velocity *= damping (0.99)          // Less friction normally


3. APPLY MOUSE INFLUENCE
   ──────────────────────
   velocity.x += mouseX * mouseInfluence (0.001)
   velocity.z += mouseY * mouseInfluence (0.001)


4. UPDATE POSITION
   ────────────────
   position += velocity


5. BOUNDS CHECKING (Optional)
   ──────────────────────────
   if (particle too far away)
     reset to target position


                        ↓
                    Repeat for all particles
                        ↓
                    Update GPU buffer
                        ↓
                    Render
```

## Configuration Hierarchy

```
┌──────────────────────────────────────────────────────┐
│  CONFIG OBJECT in particleBackground.js              │
├──────────────────────────────────────────────────────┤
│                                                       │
│  Particle System                                     │
│  ├─ particleCount: 3000                             │
│  ├─ particleSize: 2                                 │
│  └─ particleSizeVariation: 1.5                      │
│                                                       │
│  Geometry                                            │
│  └─ sphereRadius: 8                                 │
│                                                       │
│  Visual Effects                                      │
│  ├─ glowIntensity: 2                                │
│  ├─ bloomThreshold: 0.5                             │
│  ├─ bloomStrength: 1.2                              │
│  └─ bloomRadius: 0.4                                │
│                                                       │
│  Physics & Animation                                │
│  ├─ explosionForce: 0.3                             │
│  ├─ explosionDecay: 0.98                            │
│  ├─ attractionForce: 0.02                           │
│  ├─ damping: 0.95                                   │
│  ├─ morphSpeed: 0.05                                │
│  └─ particleDamping: 0.96                           │
│                                                       │
│  Performance                                        │
│  └─ minDeviceParticles: 1000                        │
│                                                       │
└──────────────────────────────────────────────────────┘
        ↓
  Loaded in initParticleBackground()
        ↓
  Used throughout animation loop
        ↓
  Adjustable on the fly (see CUSTOMIZATION.md)
```

## Memory Layout

```
┌─────────────────────────────────────────────────────────┐
│              PARTICLE SYSTEM MEMORY                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  particlePositions: Float32Array(3000 * 3)             │
│  └─ 9,000 floats = 36 KB                               │
│                                                          │
│  particleVelocities: Float32Array(3000 * 3)            │
│  └─ 9,000 floats = 36 KB                               │
│                                                          │
│  basePositions: Float32Array(3000 * 3)                 │
│  └─ 9,000 floats = 36 KB (sphere geometry)             │
│                                                          │
│  targetPositions: Float32Array(3000 * 3)               │
│  └─ 9,000 floats = 36 KB (morphing targets)            │
│                                                          │
│  GPU Buffer Objects                                     │
│  ├─ Position Buffer: 36 KB                             │
│  ├─ Scale Buffer: 12 KB (1000 floats)                  │
│  └─ Glow Buffer: 12 KB (1000 floats)                   │
│                                                          │
│  Total CPU Memory: ~150 KB                              │
│  Total GPU Memory: ~60 KB                               │
│                                                          │
│  Three.js Scene Graph:                                  │
│  ├─ Scene (1)                                          │
│  ├─ Camera (1)                                         │
│  ├─ Lights (2-3)                                       │
│  └─ Mesh: Points (1 - all particles in 1 mesh)         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## File Structure

```
GameServer/
├── src/
│   ├── pages/
│   │   └── home.js ..................... Updated with particle system
│   ├── three/
│   │   ├── particleBackground.js ....... NEW: Main animation engine
│   │   ├── heroLogoViewer.js ........... DEPRECATED (can delete)
│   │   └── heroViewer.js .............. DEPRECATED (can delete)
│   └── styles/
│       ├── pages.css ................... Updated with glass panel styles
│       └── global.css ................. Updated body background
│
├── PARTICLE_GUIDE.md .................... NEW: Complete guide
├── PARTICLE_CUSTOMIZATION.md ........... NEW: How to customize
├── PARTICLE_IMPLEMENTATION.md ......... NEW: Technical summary
└── PARTICLE_QUICK_START.md ............ NEW: Quick reference
```

---

**Architecture Version:** 1.0  
**Last Updated:** April 2026  
**Status:** ✅ Production Ready
