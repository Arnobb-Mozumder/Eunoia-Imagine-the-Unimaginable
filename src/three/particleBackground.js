// ==========================================
// PARTICLE BACKGROUND — Interactive 3D Particle System
// Features: Sphere morphing, scroll interaction, elastic net cursor deformation,
//           click explosion, physics
// ==========================================

import * as THREE from 'three'
import { getThreeQualitySettings } from '../utils/devicePerformance.js'

let particleScene = null
let particleRenderer = null
let particleCamera = null
let particleGroup = null
let particlePositions = null
let particleVelocities = null
let basePositions = null
let targetPositions = null
let particleCount = 0
let animationFrameId = null
let isExploding = false
let scrollValue = 0
let mouseX = 0
let mouseY = 0
let prevMouseX = 0
let prevMouseY = 0
let quality = getThreeQualitySettings()
let frameIntervalMs = 1000 / 60
let lastRenderTime = 0

// World-space cursor position (projected onto the sphere interaction plane)
let cursorWorld = new THREE.Vector3(0, 0, 0)
let cursorInsideSphere = false

const CONFIG = {
  particleCount: 1200,
  particleSize: 1.5,
  particleSizeVariation: 0.6,
  sphereRadius: 8,
  glowIntensity: 3,
  bloomThreshold: 0.8,
  bloomStrength: 0.8,
  bloomRadius: 0.5,
  explosionForce: 0.3,
  explosionDecay: 0.98,
  attractionForce: 0.02,
  damping: 0.95,
  morphSpeed: 0.08,
  particleDamping: 0.96,
  minDeviceParticles: 1200,

  // --- Elastic net deformation ---
  // How far the cursor influence reaches across the surface (in world units)
  deformRadius: 12,
  // Max outward pull distance when cursor is outside sphere
  pullStrength: 4,
  // Max inward push distance when cursor is inside sphere
  pushStrength: 4,
  // Softness of the falloff (higher = sharper edge, lower = softer blend)
  deformFalloff: 2,
  // How fast particles spring back (lower = slower/bouncier)
  springBack: 0.045,
  // Velocity damping for spring
  springDamp: 0.82
}

// GLSL Vertex Shader
const vertexShader = `
  attribute float scale;
  attribute float glow;
  
  varying float vGlow;
  varying float vDepth;
  
  void main() {
    vGlow = glow;
    vDepth = position.z;
    
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = scale * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`

// GLSL Fragment Shader
const fragmentShader = `
  uniform sampler2D texture;
  uniform vec3 glowColor;
  uniform float globalBrightness;
  
  varying float vGlow;
  varying float vDepth;
  
  void main() {
    vec2 uv = gl_PointCoord;
    float distance = length(uv - 0.5);
    
    if (distance > 0.5) discard;
    
    float brightness = mix(vGlow, vGlow * 0.6, distance * 2.0) * globalBrightness;
    vec3 color = glowColor * brightness;
    float alpha = (1.0 - distance * 2.0) * brightness;
    
    gl_FragColor = vec4(color, alpha);
  }
`

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Project normalised device coords [-1,1] to world space at a given Z depth.
 */
function ndcToWorld(nx, ny, worldZ, camera) {
  // We want the world-space point at depth worldZ that maps to this NDC xy.
  // Using the inverse of the perspective projection:
  //   tan(fov/2) * |z| gives the half-height at depth |z|
  const fovRad = THREE.MathUtils.degToRad(camera.fov)
  const halfH = Math.tan(fovRad * 0.5) * Math.abs(worldZ - camera.position.z)
  const halfW = halfH * camera.aspect
  return new THREE.Vector3(nx * halfW, ny * halfH, worldZ)
}

// ─── Control Functions ───────────────────────────────────────────────────────

export function updateParticleColor(hex) {
  if (particleGroup) {
    particleGroup.material.uniforms.glowColor.value.set(hex)
  }
}

export function updateParticleBrightness(val) {
  if (particleGroup) {
    particleGroup.material.uniforms.globalBrightness.value = val
  }
}

// ─── Init ────────────────────────────────────────────────────────────────────

export function initParticleBackground(canvasEl) {
  if (!canvasEl || particleScene) return

  console.log('Initializing particle background...')
  quality = getThreeQualitySettings()
  frameIntervalMs = 1000 / Math.max(1, quality.targetFps)
  lastRenderTime = 0

  const W = window.innerWidth
  const H = window.innerHeight

  canvasEl.style.width = '100%'
  canvasEl.style.height = '100%'
  canvasEl.width = W
  canvasEl.height = H

  const adjustedParticleCount = Math.max(
    280,
    Math.floor(CONFIG.particleCount * quality.particleCountScale)
  )
  particleCount = adjustedParticleCount

  particleScene = new THREE.Scene()
  particleScene.background = new THREE.Color(0x000000)

  particleCamera = new THREE.PerspectiveCamera(75, W / H, 0.1, 1000)
  particleCamera.position.z = 15

  particleRenderer = new THREE.WebGLRenderer({
    canvas: canvasEl,
    antialias: quality.antialias,
    alpha: false,
    powerPreference: 'high-performance'
  })
  particleRenderer.setSize(W, H)
  particleRenderer.setPixelRatio(Math.min(window.devicePixelRatio, quality.maxDpr))
  particleRenderer.setClearColor(0x000000, 1)

  createParticleSystem()

  window.addEventListener('resize', onWindowResize)
  window.addEventListener('scroll', onScroll)
  window.addEventListener('click', onCanvasClick)
  window.addEventListener('touchstart', onCanvasClick, { passive: true })
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('deviceorientation', onDeviceOrientation)

  animate()
  console.log(`✅ Particle background initialized (${particleCount} particles)`)
}

// ─── Particle System ─────────────────────────────────────────────────────────

function createParticleSystem() {
  const geometry = new THREE.BufferGeometry()

  particlePositions = new Float32Array(particleCount * 3)
  particleVelocities = new Float32Array(particleCount * 3)
  basePositions = new Float32Array(particleCount * 3)
  targetPositions = new Float32Array(particleCount * 3)

  const scales = new Float32Array(particleCount)
  const glows = new Float32Array(particleCount)

  createSphere(particlePositions, basePositions, targetPositions)

  for (let i = 0; i < particleCount; i++) {
    scales[i] = CONFIG.particleSize * (0.7 + Math.random() * CONFIG.particleSizeVariation)
    glows[i] = 0.8 + Math.random() * 0.3
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
  geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1))
  geometry.setAttribute('glow', new THREE.BufferAttribute(glows, 1))

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      texture: { value: null },
      glowColor: { value: new THREE.Color(0xE0FFFF) },
      globalBrightness: { value: 1.0 }
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  })

  particleGroup = new THREE.Points(geometry, material)
  particleScene.add(particleGroup)

  const light = new THREE.AmbientLight(0xFFF4C9, 0.1)
  particleScene.add(light)

  const pointLight = new THREE.PointLight(0xFFF4C9, 0.15, 50)
  pointLight.position.set(10, 10, 15)
  particleScene.add(pointLight)
}

function createSphere(positions, base, target) {
  const radius = CONFIG.sphereRadius

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3
    const golden_angle = Math.PI * (3.0 - Math.sqrt(5.0))
    const theta = golden_angle * i
    const y = 1 - (i / (particleCount - 1)) * 2
    const radiusAtY = Math.sqrt(1 - y * y)
    const x = Math.cos(theta) * radiusAtY
    const z = Math.sin(theta) * radiusAtY

    base[i3] = x * radius
    base[i3 + 1] = y * radius
    base[i3 + 2] = z * radius

    positions[i3] = base[i3]
    positions[i3 + 1] = base[i3 + 1]
    positions[i3 + 2] = base[i3 + 2]

    target[i3] = base[i3]
    target[i3 + 1] = base[i3 + 1]
    target[i3 + 2] = base[i3 + 2]

    particleVelocities[i3] = 0
    particleVelocities[i3 + 1] = 0
    particleVelocities[i3 + 2] = 0
  }
}

// ─── Morphing (scroll) ───────────────────────────────────────────────────────

function generateMorphShape(scrollProgress) {
  const radius = CONFIG.sphereRadius
  const shapes = [
    (i, theta, y) => {
      return [
        Math.cos(theta) * Math.sqrt(1 - y * y) * radius,
        y * radius,
        Math.sin(theta) * Math.sqrt(1 - y * y) * radius
      ]
    },
    (i, theta, y) => {
      const wave = Math.sin(theta * 4 + y * 2) * 0.3
      const r = Math.sqrt(Math.max(0, 1 - y * y)) * (1 + wave)
      return [Math.cos(theta) * r * radius, y * radius, Math.sin(theta) * r * radius]
    },
    (i, theta, y) => {
      const wave = Math.sin(theta * 6 + y * 3) * 0.4
      const r = Math.sqrt(Math.max(0, 1 - y * y)) * (1 + wave)
      return [Math.cos(theta) * r * radius, y * radius, Math.sin(theta) * r * radius]
    },
    (i, theta, y) => {
      const twist = theta + y * Math.PI * 1.5
      const wave = Math.sin(twist * 3) * 0.3
      const r = Math.sqrt(Math.max(0, 1 - y * y)) * (1 + wave)
      return [Math.cos(twist) * r * radius, y * radius, Math.sin(twist) * r * radius]
    }
  ]

  const shapeIndex = Math.floor(scrollProgress * (shapes.length - 1))
  const shapeProgress = (scrollProgress * (shapes.length - 1)) % 1

  for (let i = 0; i < particleCount; i++) {
    const golden_angle = Math.PI * (3.0 - Math.sqrt(5.0))
    const theta = golden_angle * i
    const y = 1 - (i / (particleCount - 1)) * 2

    const cur = shapes[shapeIndex]
    const nxt = shapes[Math.min(shapeIndex + 1, shapes.length - 1)]

    const [x1, y1, z1] = cur(i, theta, y)
    const [x2, y2, z2] = nxt(i, theta, y)

    const i3 = i * 3
    basePositions[i3] = THREE.MathUtils.lerp(x1, x2, shapeProgress)
    basePositions[i3 + 1] = THREE.MathUtils.lerp(y1, y2, shapeProgress)
    basePositions[i3 + 2] = THREE.MathUtils.lerp(z1, z2, shapeProgress)
  }
}

// ─── Elastic Net Cursor Deformation ──────────────────────────────────────────
//
// Strategy:
//   1. Project cursor NDC onto the sphere's "front face" Z plane (z=0 of the
//      sphere group, which sits at world origin).
//   2. For each particle, compute the GREAT-CIRCLE distance on the sphere
//      surface between the particle's base position and the cursor's closest
//      point on the sphere surface (the "contact point").
//   3. Within deformRadius, push/pull particles along their own outward normal:
//      - cursor OUTSIDE sphere  → pull outward (stretch toward cursor)
//      - cursor INSIDE sphere   → push inward (dent/bend inward)
//   4. Smooth falloff gives the elastic-net soft feel.

function applyCursorDeformation() {
  const R = CONFIG.sphereRadius
  const deformR = CONFIG.deformRadius
  const falloff = CONFIG.deformFalloff

  // --- Find cursor world position ---
  // Project NDC cursor onto the z=0 plane (sphere centre plane)
  // We use the camera ray and solve for z=0 intersection.
  const fovRad = THREE.MathUtils.degToRad(particleCamera.fov)
  const camZ = particleCamera.position.z          // e.g. 15
  // At z=0 plane, distance from camera = camZ
  const halfH = Math.tan(fovRad * 0.5) * camZ
  const halfW = halfH * particleCamera.aspect
  const cx = mouseX * halfW
  const cy = mouseY * halfH
  cursorWorld.set(cx, cy, 0)

  // Is the cursor inside the sphere (projected distance from sphere centre < R)?
  const cursorDistFromCentre = Math.sqrt(cx * cx + cy * cy)
  cursorInsideSphere = cursorDistFromCentre < R

  // The "contact point" on the sphere surface closest to the cursor direction:
  // This is the point on the sphere at the same azimuth/elevation as cursorWorld.
  let contactX, contactY, contactZ
  if (cursorDistFromCentre < 0.001) {
    // Cursor exactly at centre – no meaningful contact point, skip deformation
    return
  }

  if (cursorInsideSphere) {
    // Contact is on the surface in the direction of cursor from centre
    const norm = R / cursorDistFromCentre
    contactX = cx * norm
    contactY = cy * norm
    contactZ = 0
  } else {
    // Contact is on the near face of the sphere:
    // Intersect cursor ray with sphere. Ray: P = camPos + t*(cursorWorld - camPos)
    // Sphere: |P|^2 = R^2
    // camPos = (0, 0, camZ), direction d = normalise(cursorWorld - camPos)
    const dx = cx - 0
    const dy = cy - 0
    const dz = 0 - camZ
    const dLen = Math.sqrt(dx * dx + dy * dy + dz * dz)
    const dnx = dx / dLen, dny = dy / dLen, dnz = dz / dLen

    // Quadratic: t^2 + 2*(camPos·d)*t + (|camPos|^2 - R^2) = 0
    const b = dnx * 0 + dny * 0 + dnz * camZ  // camPos·d = camZ*dnz
    const c = camZ * camZ - R * R
    const disc = b * b - c
    if (disc < 0) {
      // Ray misses sphere — use closest surface point by direction
      const norm = R / cursorDistFromCentre
      contactX = cx * norm
      contactY = cy * norm
      contactZ = 0
    } else {
      const t = -b - Math.sqrt(disc)           // front intersection
      contactX = 0 + dnx * t
      contactY = 0 + dny * t
      contactZ = camZ + dnz * t
    }
  }

  // ── Apply deformation to each particle ──
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3
    const bx = basePositions[i3]
    const by = basePositions[i3 + 1]
    const bz = basePositions[i3 + 2]

    // Arc distance on sphere surface ≈ R * angle between base and contact
    // We use chord distance as a fast proxy (monotonically related)
    const ddx = bx - contactX
    const ddy = by - contactY
    const ddz = bz - contactZ
    const chordDist = Math.sqrt(ddx * ddx + ddy * ddy + ddz * ddz)

    // Only affect particles within deformation radius
    if (chordDist > deformR) {
      targetPositions[i3] = bx
      targetPositions[i3 + 1] = by
      targetPositions[i3 + 2] = bz
      continue
    }

    // Smooth falloff: 1 at contact, 0 at deformR edge
    // Using smooth-step squared for that "membrane" feel
    const t = 1.0 - chordDist / deformR
    const influence = Math.pow(t, falloff)

    // Outward normal of the particle (unit vector from sphere centre)
    const bLen = Math.sqrt(bx * bx + by * by + bz * bz)
    if (bLen < 0.001) continue
    const nx = bx / bLen
    const ny = by / bLen
    const nz = bz / bLen

    let displacement
    if (!cursorInsideSphere) {
      // ── Pull outward (stretch toward cursor) ──
      // Amount of pull tapers to 0 at deformR
      displacement = CONFIG.pullStrength * influence
      targetPositions[i3] = bx + nx * displacement
      targetPositions[i3 + 1] = by + ny * displacement
      targetPositions[i3 + 2] = bz + nz * displacement
    } else {
      // ── Push inward (dent/bend) ──
      displacement = CONFIG.pushStrength * influence
      targetPositions[i3] = bx - nx * displacement
      targetPositions[i3 + 1] = by - ny * displacement
      targetPositions[i3 + 2] = bz - nz * displacement
    }
  }
}

// ─── Events ──────────────────────────────────────────────────────────────────

function onScroll() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight
  scrollValue = maxScroll > 0 ? window.scrollY / maxScroll : 0
}

function onMouseMove(e) {
  prevMouseX = mouseX
  prevMouseY = mouseY
  mouseX = (e.clientX / window.innerWidth) * 2 - 1
  mouseY = -(e.clientY / window.innerHeight) * 2 + 1
}

function onDeviceOrientation(e) {
  if (e.gamma === null || e.beta === null) return
  // gamma is left/right (-90 to 90). Normal max tilt is around 45.
  let x = e.gamma / 45
  // beta is front/back. Normal holding angle is ~60 deg.
  let y = (e.beta - 60) / 45
  
  prevMouseX = mouseX
  prevMouseY = mouseY
  mouseX = Math.max(-1, Math.min(1, x))
  mouseY = -Math.max(-1, Math.min(1, y))
}

function onCanvasClick() {
  isExploding = true

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3
    const targetX = (Math.random() - 0.5) * 4
    const targetY = (Math.random() - 0.5) * 4
    const targetZ = (Math.random() - 0.5) * 20
    const dx = targetX - particlePositions[i3]
    const dy = targetY - particlePositions[i3 + 1]
    const dz = targetZ - particlePositions[i3 + 2]
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
    const force = CONFIG.explosionForce * (1 + Math.random() * 2)
    if (distance > 0) {
      particleVelocities[i3] = (dx / distance) * force
      particleVelocities[i3 + 1] = (dy / distance) * force
      particleVelocities[i3 + 2] = (dz / distance) * force
    }
  }

  setTimeout(() => { isExploding = false }, 2000)
}

// ─── Animation Loop ───────────────────────────────────────────────────────────

function animate() {
  animationFrameId = requestAnimationFrame(animate)
  const now = performance.now()
  if (document.hidden || now - lastRenderTime < frameIntervalMs) return
  lastRenderTime = now

  // 1. Compute base positions from scroll morph shape
  generateMorphShape(scrollValue)

  // 2. Apply cursor elastic-net deformation on top of base positions
  //    This writes into targetPositions[]
  //    First copy base into target so non-affected particles have correct targets
  for (let i = 0; i < particleCount * 3; i++) {
    targetPositions[i] = basePositions[i]
  }
  if (!isExploding) {
    applyCursorDeformation()
  }

  // 3. Physics step: spring toward target
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3

    const dx = targetPositions[i3] - particlePositions[i3]
    const dy = targetPositions[i3 + 1] - particlePositions[i3 + 1]
    const dz = targetPositions[i3 + 2] - particlePositions[i3 + 2]

    // Spring force — use tighter spring when exploding so particles snap back
    const spring = isExploding ? CONFIG.attractionForce : CONFIG.springBack
    particleVelocities[i3] += dx * spring
    particleVelocities[i3 + 1] += dy * spring
    particleVelocities[i3 + 2] += dz * spring

    // Damping
    const damp = isExploding ? CONFIG.particleDamping : CONFIG.springDamp
    particleVelocities[i3] *= damp
    particleVelocities[i3 + 1] *= damp
    particleVelocities[i3 + 2] *= damp

    // Integrate
    particlePositions[i3] += particleVelocities[i3]
    particlePositions[i3 + 1] += particleVelocities[i3 + 1]
    particlePositions[i3 + 2] += particleVelocities[i3 + 2]
  }

  particleGroup.geometry.attributes.position.needsUpdate = true
  particleRenderer.render(particleScene, particleCamera)
}

// ─── Resize ───────────────────────────────────────────────────────────────────

function onWindowResize() {
  const W = window.innerWidth
  const H = window.innerHeight
  particleCamera.aspect = W / H
  particleCamera.updateProjectionMatrix()
  particleRenderer.setSize(W, H)
  particleRenderer.setPixelRatio(Math.min(window.devicePixelRatio, quality.maxDpr))
}

// ─── Cleanup ──────────────────────────────────────────────────────────────────

export function cleanupParticleBackground() {
  if (animationFrameId) cancelAnimationFrame(animationFrameId)

  window.removeEventListener('resize', onWindowResize)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('click', onCanvasClick)
  window.removeEventListener('touchstart', onCanvasClick)
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('deviceorientation', onDeviceOrientation)

  if (particleGroup) {
    particleScene.remove(particleGroup)
    particleGroup.geometry.dispose()
    particleGroup.material.dispose()
  }
  if (particleRenderer) particleRenderer.dispose()

  particleScene = null
  particleRenderer = null
  particleCamera = null
  particleGroup = null
  particlePositions = null
  particleVelocities = null
  basePositions = null
  targetPositions = null
  animationFrameId = null
}

// ─── Debug ────────────────────────────────────────────────────────────────────

export function getParticleStats() {
  return {
    particleCount,
    isExploding,
    cursorInsideSphere,
    scrollValue: scrollValue.toFixed(3),
    mouseX: mouseX.toFixed(3),
    mouseY: mouseY.toFixed(3)
  }
}
