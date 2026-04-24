// ==========================================
// THREE.JS — Carousel Logo Viewer
// Individual logos for carousel panels
// ==========================================

import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const carouselLogos = new Map()

export function initCarouselLogo(canvasEl, logoPath, logoName) {
  if (!canvasEl) return
  
  if (carouselLogos.has(canvasEl)) {
    return carouselLogos.get(canvasEl)
  }
  
  console.log(`Initializing carousel logo: ${logoName}`)
  
  // Get container dimensions (left half of carousel panel)
  const containerEl = canvasEl.closest('.carousel-logo-container')
  const W = containerEl.clientWidth || window.innerWidth / 2
  const H = containerEl.clientHeight || 500
  
  canvasEl.style.width = '100%'
  canvasEl.style.height = '100%'
  canvasEl.width = W
  canvasEl.height = H
  
  // Scene
  const scene = new THREE.Scene()
  scene.background = null
  
  // Camera
  const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000)
  camera.position.set(0, 0, 4)
  
  // Renderer
  const renderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: true, alpha: true })
  renderer.setSize(W, H)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x000000, 0)
  
  // Lighting - bright daylight
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.2)
  scene.add(ambientLight)
  
  // Main key light - simulates sun
  const dirLight = new THREE.DirectionalLight(0xffffee, 1.0)
  dirLight.position.set(8, 6, 10)
  scene.add(dirLight)
  
  // Fill light - bright and warm
  const fillLight = new THREE.PointLight(0xffff99, 0.8, 100)
  fillLight.position.set(-8, 4, 8)
  scene.add(fillLight)
  
  // Back light - creates separation
  const backLight = new THREE.PointLight(0xffffff, 0.6, 80)
  backLight.position.set(0, 2, -10)
  scene.add(backLight)
  
  // Load model
  const loader = new GLTFLoader()
  let model = null
  
  loader.load(logoPath, (gltf) => {
    model = gltf.scene
    
    // Get bounds and scale
    const box = new THREE.Box3().setFromObject(model)
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    const scale = 2.5 / maxDim
    
    // Apply materials - preserve existing textures
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Keep existing material if it has textures
        if (child.material) {
          // Adjust material to show textures properly
          child.material.roughness = 0.5
          child.material.metalness = 0.3
          child.material.emissiveIntensity = 0.1 // Very subtle
        } else {
          // Default material for meshes without textures
          child.material = new THREE.MeshStandardMaterial({ color: 0xcccccc })
        }
        child.castShadow = true
        child.receiveShadow = true
      }
    })
    
    // Scale and center - pivot at model's geometric center
    model.scale.set(scale, scale, scale)
    
    // Calculate bounding box after scaling
    const bbox = new THREE.Box3().setFromObject(model)
    const center = bbox.getCenter(new THREE.Vector3())
    
    // Move model so its center is at origin (0,0,0)
    model.position.sub(center)
    
    // Now the model rotates around its own center
    scene.add(model)
    console.log(`Carousel logo loaded: ${logoName}`)
  })
  
  // Animation - Y-axis only rotation
  let rotation = { y: 0 }
  let targetRotation = { y: 0 }
  let isMouseDown = false
  let lastMouseX = 0
  
  const animate = () => {
    requestAnimationFrame(animate)
    
    if (model) {
      // Smooth rotation interpolation - Y axis only
      rotation.y += (targetRotation.y - rotation.y) * 0.08
      
      // Apply ONLY Y-axis rotation
      model.rotation.order = 'YXZ'
      model.rotation.x = 0
      model.rotation.y = rotation.y
      model.rotation.z = 0
    }
    
    renderer.render(scene, camera)
  }
  animate()
  
  // Mouse controls
  canvasEl.addEventListener('mousedown', (e) => {
    isMouseDown = true
    lastMouseX = e.clientX
  })
  
  canvasEl.addEventListener('mousemove', (e) => {
    if (isMouseDown) {
      const deltaX = e.clientX - lastMouseX
      targetRotation.y += deltaX * 0.005
      lastMouseX = e.clientX
    }
  })
  
  canvasEl.addEventListener('mouseup', () => {
    isMouseDown = false
  })
  
  canvasEl.addEventListener('mouseleave', () => {
    isMouseDown = false
  })
  
  // Resize
  const resizeObs = new ResizeObserver(() => {
    const w = containerEl.clientWidth
    const h = containerEl.clientHeight
    if (w > 0 && h > 0) {
      canvasEl.width = w
      canvasEl.height = h
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
  })
  resizeObs.observe(containerEl)
  
  const state = { scene, camera, renderer, model, targetRotation }
  carouselLogos.set(canvasEl, state)
  
  return state
}

export function cleanupCarouselLogos() {
  carouselLogos.forEach(({ renderer }) => {
    renderer.dispose()
  })
  carouselLogos.clear()
}
