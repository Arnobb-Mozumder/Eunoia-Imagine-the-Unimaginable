// ==========================================
// THREE.JS — Logo Section Viewer
// Individual 3D logo renderer for each section
// ==========================================

import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const logoSections = new Map() // Track canvas→scene state

export function initLogoSection(canvasEl, logoPath, logoName) {
  if (!canvasEl) return
  
  // Check if already initialized
  if (logoSections.has(canvasEl)) {
    return logoSections.get(canvasEl)
  }
  
  console.log(`Initializing logo section for ${logoName}...`)
  
  // Get canvas container dimensions (left half of panel)
  const containerEl = canvasEl.closest('.logo-canvas-container')
  const W = containerEl.clientWidth || window.innerWidth / 2
  const H = containerEl.clientHeight || window.innerHeight
  
  console.log(`Canvas section size: ${W}x${H}`)
  
  // Canvas sizing - match parent
  canvasEl.style.width = '100%'
  canvasEl.style.height = '100%'
  canvasEl.width = W
  canvasEl.height = H
  
  // Scene
  const scene = new THREE.Scene()
  scene.background = null
  
  // Camera - adjusted for smaller models
  const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000)
  camera.position.set(0, 0, 4)
  
  // Renderer - transparent
  const renderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: true, alpha: true })
  renderer.setSize(W, H)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x000000, 0)
  
  // Lighting - strong warm lighting for texture visibility
  const light1 = new THREE.PointLight(0xffffff, 4.5, 250)
  light1.position.set(20, 15, 20)
  scene.add(light1)
  
  const warmKeyLight = new THREE.DirectionalLight(0xffb347, 3.5)
  warmKeyLight.position.set(15, 12, 15)
  scene.add(warmKeyLight)
  
  const warmFillLight = new THREE.PointLight(0xff9500, 3, 250)
  warmFillLight.position.set(-20, 8, 15)
  scene.add(warmFillLight)
  
  const sideLight = new THREE.PointLight(0xffa500, 2.5, 220)
  sideLight.position.set(0, -10, 15)
  scene.add(sideLight)
  
  const backLight = new THREE.PointLight(0xffcc99, 2, 200)
  backLight.position.set(5, 5, -15)
  scene.add(backLight)
  
  const ambientLight = new THREE.AmbientLight(0xffc0a0, 2.5)
  scene.add(ambientLight)
  
  console.log(`Lights added, loading model from ${logoPath}`)
  
  // Load model
  const loader = new GLTFLoader()
  let model = null
  
  loader.load(logoPath, (gltf) => {
    model = gltf.scene
    
    console.log(`Model loaded: ${logoName}`, model)
    
    // Get model bounds to scale properly - smaller size for left half
    const box = new THREE.Box3().setFromObject(model)
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    const scale = 2.8 / maxDim
    
    // Apply materials and scale
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (!child.material) {
          child.material = new THREE.MeshStandardMaterial({ color: 0x999999 })
        }
        // Increase emissive for better texture visibility
        child.material.emissive = new THREE.Color(0x888888)
        child.material.emissiveIntensity = 1.5
        child.castShadow = true
        child.receiveShadow = true
        child.material.roughness = 0.5
        child.material.metalness = 0.3
      }
    })
    
    // Scale and center for pivot at middle
    model.scale.set(scale, scale, scale)
    
    // Center model at origin (0,0,0) for rotation from middle
    const bbox = new THREE.Box3().setFromObject(model)
    const center = bbox.getCenter(new THREE.Vector3())
    model.position.copy(center).multiplyScalar(-1)
    
    scene.add(model)
    
    console.log(`Model positioned and added, scale: ${scale}`)
  }, undefined, (error) => {
    console.error(`Error loading ${logoPath}:`, error)
  })
  
  // Animation loop
  let rotation = { y: 0 }
  let targetRotation = { y: 0 }
  let isMouseDown = false
  let lastMouseX = 0
  
  const animate = () => {
    requestAnimationFrame(animate)
    
    // Smooth rotation - Y axis only
    if (model) {
      rotation.y += (targetRotation.y - rotation.y) * 0.08
      model.rotation.y = rotation.y
    }
    
    renderer.render(scene, camera)
  }
  animate()
  
  // Mouse drag listener for Y-axis rotation only
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
  
  // Resize observer - handle container resize
  const resizeObs = new ResizeObserver(() => {
    const w = containerEl.clientWidth
    const h = containerEl.clientHeight
    if (w > 0 && h > 0) {
      canvasEl.width = w
      canvasEl.height = h
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      console.log(`Canvas resized to ${w}x${h}`)
    }
  })
  resizeObs.observe(containerEl)
  
  const state = { scene, camera, renderer, model, targetRotation }
  logoSections.set(canvasEl, state)
  
  return state
}

export function cleanup() {
  logoSections.forEach(({ renderer }) => {
    renderer.dispose()
  })
  logoSections.clear()
}
