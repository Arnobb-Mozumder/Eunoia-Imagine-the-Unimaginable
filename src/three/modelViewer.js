// ==========================================
// THREE.JS — Model Viewer
// Full-screen interactive 3D model viewer
// ==========================================

import * as THREE from 'three'
import { getThreeQualitySettings } from '../utils/devicePerformance.js'

let scene, camera, renderer, model, animId
let isDown = false
let prevMouse = { x: 0, y: 0 }
let spherical = { theta: 0, phi: Math.PI / 2 }
let radius = 4
let resizeObs
let startTime = Date.now()
let quality = getThreeQualitySettings()
let frameIntervalMs = 1000 / 60
let lastRenderTime = 0

export function initModelViewer(canvas, glbUrl) {
  cleanupModelViewer()
  startTime = Date.now()
  quality = getThreeQualitySettings()
  frameIntervalMs = 1000 / Math.max(1, quality.targetFps)
  lastRenderTime = 0

  const W = canvas.clientWidth || canvas.offsetWidth
  const H = canvas.clientHeight || canvas.offsetHeight

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0a0a0f)

  camera = new THREE.PerspectiveCamera(45, W / H, 0.01, 1000)
  updateCameraFromSpherical()

  renderer = new THREE.WebGLRenderer({ canvas, antialias: quality.antialias, powerPreference: 'high-performance' })
  renderer.setSize(W, H)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, quality.maxDpr))
  renderer.shadowMap.enabled = quality.enableShadows
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.shadowMap.resolution = quality.enableShadows ? 1024 : 256
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.2

  // Lighting - proper 3-point lighting setup
  scene.add(new THREE.AmbientLight(0xffffff, 0.8))
  
  // Key light (warm)
  const key = new THREE.DirectionalLight(0xffb347, 2)
  key.position.set(8, 12, 8)
  key.castShadow = quality.enableShadows
  key.shadow.mapSize.width = quality.enableShadows ? 1024 : 256
  key.shadow.mapSize.height = quality.enableShadows ? 1024 : 256
  scene.add(key)
  
  // Fill light (cyan/blue)
  const fill = new THREE.DirectionalLight(0x00d9ff, 1.5)
  fill.position.set(-8, 10, -8)
  scene.add(fill)
  
  // Rim light
  const rim = new THREE.DirectionalLight(0x8b5cf6, 1)
  rim.position.set(0, -5, 10)
  scene.add(rim)

  // Grid (commented out - was interfering with visibility)
  // const grid = new THREE.GridHelper(12, 20, 0x8b5cf6, 0x1a1a2e)
  // grid.position.y = -2
  // scene.add(grid)

  // Load model or placeholder
  if (glbUrl) {
    loadGLB(glbUrl)
  } else {
    addPlaceholderMesh()
  }

  // Events
  canvas.addEventListener('mousedown', onDown)
  canvas.addEventListener('mousemove', onMove)
  canvas.addEventListener('mouseup', onUp)
  canvas.addEventListener('mouseleave', onUp)
  canvas.addEventListener('wheel', onWheel, { passive: true })
  canvas.addEventListener('touchstart', onTouchStart, { passive: true })
  canvas.addEventListener('touchmove', onTouchMove, { passive: true })
  canvas.addEventListener('touchend', onUp)

  resizeObs = new ResizeObserver(() => {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    renderer.setSize(w, h)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  })
  resizeObs.observe(canvas)

  animateModel()
}

async function loadGLB(url) {
  try {
    const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js')
    const loader = new GLTFLoader()
    loader.load(url, (gltf) => {
      const obj = gltf.scene
      // Auto-center and scale
      const box = new THREE.Box3().setFromObject(obj)
      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())
      const maxDim = Math.max(size.x, size.y, size.z)
      obj.position.sub(center)
      obj.scale.multiplyScalar(3 / maxDim)
      obj.traverse(child => { if (child.isMesh) child.castShadow = true })
      model = obj
      scene.add(model)
    })
  } catch (e) {
    addPlaceholderMesh()
  }
}

function addPlaceholderMesh() {
  const group = new THREE.Group()

  // Main placeholder shape
  const geo = new THREE.TorusKnotGeometry(1, 0.35, 128, 16)
  const mat = new THREE.MeshStandardMaterial({
    color: 0x8b5cf6,
    roughness: 0.15,
    metalness: 0.8,
    emissive: 0x2d1f5e,
    emissiveIntensity: 0.5
  })
  const mesh = new THREE.Mesh(geo, mat)
  mesh.castShadow = true
  group.add(mesh)

  model = group
  scene.add(model)
}

function updateCameraFromSpherical() {
  const x = radius * Math.sin(spherical.phi) * Math.sin(spherical.theta)
  const y = radius * Math.cos(spherical.phi)
  const z = radius * Math.sin(spherical.phi) * Math.cos(spherical.theta)
  camera.position.set(x, y, z)
  camera.lookAt(0, 0, 0)
}

function animateModel() {
  animId = requestAnimationFrame(animateModel)
  const now = performance.now()
  if (document.hidden || now - lastRenderTime < frameIntervalMs) return
  lastRenderTime = now
  
  // Rotate model when not dragging
  if (model && !isDown) {
    model.rotation.y += 0.003
  }
  renderer.render(scene, camera)
}

function onDown(e) {
  isDown = true
  prevMouse = { x: e.clientX, y: e.clientY }
}

function onMove(e) {
  if (!isDown) return
  const dx = e.clientX - prevMouse.x
  const dy = e.clientY - prevMouse.y
  spherical.theta -= dx * 0.005
  spherical.phi = Math.max(0.2, Math.min(Math.PI - 0.2, spherical.phi + dy * 0.005))
  updateCameraFromSpherical()
  prevMouse = { x: e.clientX, y: e.clientY }
}

function onUp() { isDown = false }

function onWheel(e) {
  radius = Math.max(1.5, Math.min(12, radius + e.deltaY * 0.005))
  updateCameraFromSpherical()
}

let lastTX = 0, lastTY = 0
function onTouchStart(e) { isDown = true; lastTX = e.touches[0].clientX; lastTY = e.touches[0].clientY }
function onTouchMove(e) {
  const dx = e.touches[0].clientX - lastTX
  const dy = e.touches[0].clientY - lastTY
  spherical.theta -= dx * 0.005
  spherical.phi = Math.max(0.2, Math.min(Math.PI - 0.2, spherical.phi + dy * 0.005))
  updateCameraFromSpherical()
  lastTX = e.touches[0].clientX; lastTY = e.touches[0].clientY
}

export function cleanupModelViewer() {
  if (animId) cancelAnimationFrame(animId)
  if (resizeObs) resizeObs.disconnect()
  if (renderer) { renderer.dispose(); renderer = null }
  scene = null; camera = null; model = null
  startTime = Date.now()
  if (window.threeState) {
    window.threeState.waterGeo = null
    window.threeState.waterPositions = null
    window.threeState.bubbles = []
  }
}
