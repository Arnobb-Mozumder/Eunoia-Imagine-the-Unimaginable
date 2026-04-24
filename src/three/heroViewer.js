// ==========================================
// THREE.JS — Hero Viewer
// Rotating interactive 3D element for homepage
// ==========================================

import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

let scene, camera, renderer, mesh, animId
let logoModels = []
let currentLogoIndex = 0
let logoAnimationTime = 0
let scrollRotationX = 0 // Track scroll rotation
const LOGO_ROTATION_INTERVAL = 3000 // Rotate every 3 seconds
const LOGO_MODELS = [
  { name: 'ThreeJs', path: '/static/ThreeJs.glb' },
  { name: 'Blender', path: '/static/Blender.glb' },
  { name: 'Unity', path: '/static/Unity.glb' },
  { name: 'Notion', path: '/static/Notion.glb' },
  { name: 'Photoshop', path: '/static/Photoshop.glb' }
]

export function initHeroViewer(canvasEl) {
  if (!canvasEl) return
  cleanup()
  
  console.log('Initializing Hero Viewer...', canvasEl)

  const W = window.innerWidth
  const H = window.innerHeight
  
  // Set canvas size directly
  canvasEl.width = W
  canvasEl.height = H
  console.log(`Canvas size set to ${W}x${H}`)

  // Scene
  scene = new THREE.Scene()
  scene.background = null // Transparent background

  // Camera - simple setup
  camera = new THREE.PerspectiveCamera(75, W / H, 0.1, 1000)
  camera.position.z = 3

  // Renderer - with alpha for transparency
  renderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: true, alpha: true })
  renderer.setSize(W, H)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x000000, 0) // Transparent clear
  console.log('Renderer created and sized')
  console.log('Canvas element:', canvasEl)
  console.log('Canvas size:', canvasEl.width, 'x', canvasEl.height)
  console.log('Renderer domElement:', renderer.domElement)

  // Simple lighting
  const light1 = new THREE.PointLight(0xffffff, 1.5, 100)
  light1.position.set(5, 5, 5)
  scene.add(light1)
  
  const light2 = new THREE.PointLight(0xff6600, 1.2, 100)
  light2.position.set(-5, 0, 5)
  scene.add(light2)
  
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
  scene.add(ambientLight)
  console.log('Lights added')

  // Create a simple test sphere
  const testGeo = new THREE.SphereGeometry(1, 32, 32)
  const testMat = new THREE.MeshPhongMaterial({ color: 0xff6600, emissive: 0xff3300 })
  const testSphere = new THREE.Mesh(testGeo, testMat)
  testSphere.position.z = 0
  scene.add(testSphere)
  console.log('Test sphere created and added to scene')
  
  // Load models after test sphere is visible
  loadLogoModels()
  addParticles()

  // Handle window resize
  window.addEventListener('resize', () => {
    const w = window.innerWidth
    const h = window.innerHeight
    canvasEl.width = w
    canvasEl.height = h
    renderer.setSize(w, h)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  })

  // Add scroll listener
  window.addEventListener('wheel', (e) => {
    scrollRotationX += e.deltaY * 0.001
    scrollRotationX = Math.max(-Math.PI, Math.min(Math.PI, scrollRotationX))
  }, { passive: true })

  console.log('Hero Viewer initialization complete. Starting animation loop.')
  animate()
}

function loadLogoModels() {
  const loader = new GLTFLoader()
  const groupContainer = new THREE.Group()
  
  let loadedCount = 0
  console.log('Starting to load logo models...')
  
  LOGO_MODELS.forEach((logoData, index) => {
    const path = logoData.path
    console.log(`Loading model: ${logoData.name} from ${path}`)
    
    loader.load(path, (gltf) => {
      const model = gltf.scene
      console.log(`Loaded: ${logoData.name}`, model)
      
      // Ensure all materials are visible and emissive
      model.traverse((child) => {
        if (child.material) {
          child.material.emissive = new THREE.Color(0x444444)
          child.material.emissiveIntensity = 0.6
          if (child.material.map) child.material.map.encoding = THREE.sRGBEncoding
        }
      })
      
      // Scale model appropriately for background
      model.scale.set(2.5, 2.5, 2.5)
      
      // All logos positioned at center, in front of camera
      model.position.set(0, 0, 0.3)
      
      // Store metadata
      model.userData = {
        index: index,
        name: logoData.name
      }
      
      logoModels.push(model)
      groupContainer.add(model)
      
      loadedCount++
      console.log(`Models loaded: ${loadedCount}/${LOGO_MODELS.length}`)
      
      if (loadedCount === LOGO_MODELS.length) {
        // Center group at origin
        groupContainer.position.set(0, 0, 0)
        mesh = groupContainer
        scene.add(mesh)
        console.log('All models loaded and added to scene')
        console.log(`Number of models in scene: ${logoModels.length}`)
        console.log(`Mesh position: ${mesh.position.x}, ${mesh.position.y}, ${mesh.position.z}`)
        console.log(`Camera position: ${camera.position.x}, ${camera.position.y}, ${camera.position.z}`)
      }
    }, undefined, (error) => {
      console.error(`Error loading ${logoData.path}:`, error)
    })
  })
}


function addParticles() {
  const count = 300
  const geo = new THREE.BufferGeometry()
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20
  }
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const mat = new THREE.PointsMaterial({ color: 0x8b5cf6, size: 0.1, transparent: true, opacity: 0.8, sizeAttenuation: true })
  const points = new THREE.Points(geo, mat)
  scene.add(points)
  console.log('Particles added')
}

function animate() {
  animId = requestAnimationFrame(animate)
  
  // Rotate all objects in scene
  scene.children.forEach(child => {
    if (child instanceof THREE.Mesh || child instanceof THREE.Group) {
      child.rotation.x += 0.005
      child.rotation.y += 0.008
    }
  })
  
  // Log once per second (60 frames)
  if (animId % 60 === 0) {
    console.log('Rendering... Scene has', scene.children.length, 'children')
  }
  
  // Render
  renderer.render(scene, camera)
}

// No user interaction - background animation only

export function cleanup() {
  if (animId) cancelAnimationFrame(animId)
  if (renderer) { renderer.dispose(); renderer = null }
  scene = null; camera = null; mesh = null
  logoModels = []
  currentLogoIndex = 0
  logoAnimationTime = 0
}
