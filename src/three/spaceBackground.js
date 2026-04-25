import * as THREE from 'three'
import { getThreeQualitySettings } from '../utils/devicePerformance.js'

let particleScene = null
let particleRenderer = null
let particleCamera = null
let starGroup = null
let asteroidGroup = null
let animationFrameId = null
let mouseX = 0
let mouseY = 0
let targetMouseX = 0
let targetMouseY = 0
let quality = getThreeQualitySettings()
let frameIntervalMs = 1000 / 60
let lastRenderTime = 0

// Space configurations
const STAR_COUNT = 3000
const ASTEROID_COUNT = 5
const DEPTH = 2000
const RADIUS = 1500
const SPEED_STARS = 6
const SPEED_ASTEROIDS = 18

let asteroidSpawnTimes = null

export function initParticleBackground(canvasEl) {
  if (!canvasEl || particleScene) return
  quality = getThreeQualitySettings()
  frameIntervalMs = 1000 / Math.max(1, quality.targetFps)
  lastRenderTime = 0

  const W = window.innerWidth
  const H = window.innerHeight

  canvasEl.style.width = '100%'
  canvasEl.style.height = '100%'
  canvasEl.width = W
  canvasEl.height = H

  particleScene = new THREE.Scene()
  particleScene.background = new THREE.Color(0x050510) // Deep dark space
  particleScene.fog = new THREE.FogExp2(0x050510, 0.001)

  particleCamera = new THREE.PerspectiveCamera(75, W / H, 0.1, 3000)
  particleCamera.position.z = 0

  particleRenderer = new THREE.WebGLRenderer({
    canvas: canvasEl,
    antialias: quality.antialias,
    alpha: false,
    powerPreference: 'high-performance'
  })
  particleRenderer.setSize(W, H)
  particleRenderer.setPixelRatio(Math.min(window.devicePixelRatio, quality.maxDpr))

  createStars()
  createAsteroids()

  window.addEventListener('resize', onWindowResize)
  window.addEventListener('mousemove', onMouseMove)

  animate()
}

function createStars() {
  const starCount = Math.max(700, Math.floor(STAR_COUNT * quality.particleCountScale))
  const geo = new THREE.BufferGeometry()
  const pos = new Float32Array(starCount * 3)
  const sizes = new Float32Array(starCount)

  for(let i=0; i<starCount; i++) {
    const i3 = i * 3
    pos[i3] = (Math.random() - 0.5) * RADIUS * 2
    pos[i3+1] = (Math.random() - 0.5) * RADIUS * 2
    pos[i3+2] = -Math.random() * DEPTH
    sizes[i] = 2.0 + Math.random() * 4.0 // Bigger sizes for visible glow
  }

  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(0xddeeff) } // Ice blue star color
    },
    vertexShader: `
      attribute float size;
      varying float vDepth;
      void main() {
        vDepth = position.z;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      void main() {
        vec2 uv = gl_PointCoord;
        float d = length(uv - 0.5);
        if (d > 0.5) discard;
        
        // Intense core and soft glowing edges
        float core = smoothstep(0.5, 0.0, d * 4.0);
        float glow = smoothstep(0.5, 0.0, d);
        
        float intensity = core * 2.0 + glow * 0.8;
        gl_FragColor = vec4(color * intensity, glow);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  })

  starGroup = new THREE.Points(geo, mat)
  particleScene.add(starGroup)
}

function createAsteroids() {
  const asteroidCount = Math.max(2, Math.floor(ASTEROID_COUNT * Math.max(0.5, quality.particleCountScale)))
  const geo = new THREE.BufferGeometry()
  const pos = new Float32Array(asteroidCount * 3)
  const sizes = new Float32Array(asteroidCount)
  const rotations = new Float32Array(asteroidCount)
  asteroidSpawnTimes = new Float32Array(asteroidCount)

  for(let i=0; i<asteroidCount; i++) {
    const i3 = i * 3
    pos[i3] = 0
    pos[i3+1] = 0
    pos[i3+2] = 100 // start off-screen
    sizes[i] = 15 + Math.random() * 25 // Asteroid size
    rotations[i] = Math.random() * Math.PI * 2
    // Initial delay: 5 to 6 seconds
    asteroidSpawnTimes[i] = Date.now() + 5000 + Math.random() * 1000
  }

  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
  geo.setAttribute('rotation', new THREE.BufferAttribute(rotations, 1))

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(0x444455) } // Dark grey rock
    },
    vertexShader: `
      attribute float size;
      attribute float rotation;
      varying float vRot;
      void main() {
        vRot = rotation;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      varying float vRot;
      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        // Apply individual asteroid rotation
        float s = sin(vRot);
        float c = cos(vRot);
        vec2 rUv = vec2(uv.x * c - uv.y * s, uv.x * s + uv.y * c);
        
        // Procedural rock shape
        float r = length(rUv);
        float angle = atan(rUv.y, rUv.x);
        float radius = 0.4 + 0.1 * sin(angle * 5.0) + 0.05 * cos(angle * 12.0) + 0.05 * sin(angle * 8.0);
        
        if (r > radius) discard;
        
        // Lighting / 3D shading illusion
        vec3 normal = normalize(vec3(rUv, sqrt(max(0.0, radius*radius - r*r))));
        vec3 lightDir = normalize(vec3(-1.0, 1.0, 1.0));
        float lighting = 0.3 + 0.7 * max(0.0, dot(normal, lightDir));
        
        gl_FragColor = vec4(color * lighting, 1.0);
      }
    `,
    transparent: true
  })

  asteroidGroup = new THREE.Points(geo, mat)
  particleScene.add(asteroidGroup)
}

function onMouseMove(e) {
  targetMouseX = (e.clientX / window.innerWidth) * 2 - 1
  targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1
}

function animate() {
  animationFrameId = requestAnimationFrame(animate)
  const nowForFrame = performance.now()
  if (document.hidden || nowForFrame - lastRenderTime < frameIntervalMs) return
  lastRenderTime = nowForFrame

  // Subtle camera tilt for depth feel
  mouseX += (targetMouseX - mouseX) * 0.05
  mouseY += (targetMouseY - mouseY) * 0.05
  particleCamera.rotation.y = -mouseX * 0.1
  particleCamera.rotation.x = mouseY * 0.1

  // Move Stars forward
  if (starGroup) {
    const positions = starGroup.geometry.attributes.position.array
    for(let i=2; i<positions.length; i+=3) {
      positions[i] += SPEED_STARS
      if (positions[i] > 50) {
        positions[i] -= DEPTH
        positions[i-2] = (Math.random() - 0.5) * RADIUS * 2 // respawn X
        positions[i-1] = (Math.random() - 0.5) * RADIUS * 2 // respawn Y
      }
    }
    starGroup.geometry.attributes.position.needsUpdate = true
  }

  // Move Asteroids forward & tumble
  if (asteroidGroup && asteroidSpawnTimes) {
    const now = Date.now()
    const positions = asteroidGroup.geometry.attributes.position.array
    const rotations = asteroidGroup.geometry.attributes.rotation.array
    const asteroidCount = asteroidSpawnTimes.length
    
    for(let i=0; i<asteroidCount; i++) {
      const i3 = i * 3
      
      // Check if it's time to spawn
      if (now < asteroidSpawnTimes[i]) {
        positions[i3+2] = 100 // Keep off-screen
        continue
      }
      
      // Just spawned
      if (positions[i3+2] === 100) {
        positions[i3+2] = -DEPTH
        positions[i3] = (Math.random() - 0.5) * RADIUS * 1.2
        positions[i3+1] = (Math.random() - 0.5) * RADIUS * 1.2
      }

      positions[i3+2] += SPEED_ASTEROIDS
      rotations[i] += 0.02 // tumble speed
      
      if (positions[i3+2] > 50) {
        // Destroy (move out of frame) and schedule next spawn
        positions[i3+2] = 100
        // Spawn again after 3 to 6 seconds
        asteroidSpawnTimes[i] = now + 3000 + Math.random() * 3000
      }
    }
    asteroidGroup.geometry.attributes.position.needsUpdate = true
    asteroidGroup.geometry.attributes.rotation.needsUpdate = true
  }

  particleRenderer.render(particleScene, particleCamera)
}

function onWindowResize() {
  const W = window.innerWidth
  const H = window.innerHeight
  particleCamera.aspect = W / H
  particleCamera.updateProjectionMatrix()
  particleRenderer.setSize(W, H)
  particleRenderer.setPixelRatio(Math.min(window.devicePixelRatio, quality.maxDpr))
}

export function cleanupParticleBackground() {
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
  window.removeEventListener('resize', onWindowResize)
  window.removeEventListener('mousemove', onMouseMove)

  if (starGroup) {
    particleScene.remove(starGroup)
    starGroup.geometry.dispose()
    starGroup.material.dispose()
  }
  if (asteroidGroup) {
    particleScene.remove(asteroidGroup)
    asteroidGroup.geometry.dispose()
    asteroidGroup.material.dispose()
  }
  if (particleRenderer) particleRenderer.dispose()

  particleScene = null
  particleRenderer = null
  particleCamera = null
  starGroup = null
  asteroidGroup = null
}

export function updateParticleColor() {}
export function updateParticleBrightness() {}