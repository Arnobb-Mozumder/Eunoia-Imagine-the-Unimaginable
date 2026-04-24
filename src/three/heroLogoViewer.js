// ==========================================
// THREE.JS — Hero Logos Background Viewer
// All 5 logos positioned around hero background
// ==========================================

import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

let heroScene = null
let heroRenderer = null

const LOGO_PATHS = [
  '/static/ThreeJs.glb',
  '/static/Blender.glb',
  '/static/Unity.glb',
  '/static/Notion.glb',
  '/static/Photoshop.glb'
]

const LOGO_POSITIONS = [
  { x: 4, y: 2, z: -8 },
  { x: 6, y: -3, z: -10 },
  { x: 8, y: 3, z: -7 },
  { x: 3, y: -2, z: -9 },
  { x: 7, y: 4, z: -8.5 }
]

export function initHeroLogos(canvasEl) {
  if (!canvasEl || heroScene) return
  
  console.log('Initializing hero logos background...')
  
  const W = window.innerWidth
  const H = window.innerHeight
  
  canvasEl.style.width = '100%'
  canvasEl.style.height = '100%'
  canvasEl.width = W
  canvasEl.height = H
  
  // Scene
  heroScene = new THREE.Scene()
  heroScene.background = null
  
  // Camera
  const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000)
  camera.position.set(0, 0, 5)
  
  // Renderer - transparent
  heroRenderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: true, alpha: true })
  heroRenderer.setSize(W, H)
  heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  heroRenderer.setClearColor(0x000000, 0)
  
  // Balanced lighting for texture visibility - bright daylight
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.1)
  heroScene.add(ambientLight)
  
  const dirLight = new THREE.DirectionalLight(0xffffee, 0.9)
  dirLight.position.set(10, 12, 15)
  heroScene.add(dirLight)
  
  const fillLight = new THREE.PointLight(0xffff99, 0.7, 150)
  fillLight.position.set(-12, 6, 10)
  heroScene.add(fillLight)
  
  // AQUARIUM EFFECT: Enhanced lighting
  const cyanSpotlight = new THREE.DirectionalLight(0x00d9ff, 1.5)
  cyanSpotlight.position.set(-8, 10, 5)
  heroScene.add(cyanSpotlight)
  
  const rimLight = new THREE.DirectionalLight(0x8b5cf6, 0.8)
  rimLight.position.set(5, -5, 8)
  heroScene.add(rimLight)
  
  console.log('Lights added (with aquarium effect), loading logos...')
  
  // AQUARIUM EFFECT: Water plane
  const waterGeo = new THREE.PlaneGeometry(30, 30, 128, 128)
  const waterMat = new THREE.MeshBasicMaterial({
    color: 0x0066ff,
    wireframe: false,
    transparent: true,
    opacity: 0.5
  })
  const water = new THREE.Mesh(waterGeo, waterMat)
  water.rotation.x = -Math.PI / 2
  water.position.y = -6
  heroScene.add(water)
  
  // Store water for animation
  if (!window.heroState) window.heroState = {}
  window.heroState.waterGeo = waterGeo
  window.heroState.waterPositions = waterGeo.attributes.position.array.slice()
  
  console.log('✅ Water plane added to hero scene')
  
  // INTERACTIVE BUBBLE SYSTEM: Cursor-following bubbles
  const bubbles = []
  const raycaster = new THREE.Raycaster()
  const mouseVector = new THREE.Vector2()
  let lastMousePos = { x: -999, y: -999 }
  let cursorBubble = null
  
  const createBubble = (worldPos) => {
    const bubbleRadius = 0.15 + Math.random() * 0.25
    const bubbleGeo = new THREE.SphereGeometry(bubbleRadius, 32, 32)
    
    // Glassy bubble material - transparent with reflections
    const bubbleMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,       // White/clear color
      metalness: 0.8,        // Highly reflective for glass effect
      roughness: 0.1,        // Very smooth for glassy appearance
      emissive: 0x000000,    // No self-glow
      emissiveIntensity: 0,
      wireframe: false,
      transparent: true,
      opacity: 0.3           // More transparent for glass effect
    })
    
    const bubble = new THREE.Mesh(bubbleGeo, bubbleMat)
    bubble.position.copy(worldPos)
    
    bubble.userData = {
      targetPos: worldPos.clone(),
      speed: 0.03,
      wobbleSpeedX: Math.random() * 0.8 + 0.5,
      wobbleSpeedZ: Math.random() * 0.8 + 0.5,
      lifespan: 2.0,  // seconds
      age: 0
    }
    
    heroScene.add(bubble)
    bubbles.push(bubble)
    return bubble
  }
  
  const onMouseMove = (e) => {
    lastMousePos = { x: e.clientX, y: e.clientY }
    
    // Convert 2D screen coords to 3D world position
    const W = window.innerWidth
    const H = window.innerHeight
    mouseVector.x = (e.clientX / W) * 2 - 1
    mouseVector.y = -(e.clientY / H) * 2 + 1
    
    raycaster.setFromCamera(mouseVector, camera)
    
    // Get point 5 units along the ray (in front of camera)
    const worldPos = new THREE.Vector3()
    raycaster.ray.at(5, worldPos)
    
    // Create cursor-following bubble
    if (!cursorBubble) {
      cursorBubble = createBubble(worldPos)
    } else {
      // Move existing bubble toward cursor
      cursorBubble.userData.targetPos = worldPos.clone()
    }
  }
  
  const onMouseClick = (e) => {
    // Burst all bubbles on click
    bubbles.forEach(bubble => {
      heroScene.remove(bubble)
    })
    bubbles.length = 0
    
    if (cursorBubble) {
      heroScene.remove(cursorBubble)
      cursorBubble = null
    }
  }
  
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('click', onMouseClick)
  
  window.heroState = window.heroState || {}
  window.heroState.bubbles = bubbles
  window.heroState.cursorBubble = () => cursorBubble
  
  console.log('✅ Interactive cursor bubbles initialized')
  
  // Load all logos
  const loader = new GLTFLoader()
  let loadedCount = 0
  
  LOGO_PATHS.forEach((path, idx) => {
    loader.load(path, (gltf) => {
      const model = gltf.scene
      const pos = LOGO_POSITIONS[idx]
      
      console.log(`Logo ${idx} loaded`)
      
      // Get bounds and scale - bigger models
      const box = new THREE.Box3().setFromObject(model)
      const size = box.getSize(new THREE.Vector3())
      const maxDim = Math.max(size.x, size.y, size.z)
      const scale = 3.5 / maxDim
      
      // Apply materials - preserve textures
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.material) {
            // Preserve existing texture
            child.material.roughness = 0.5
            child.material.metalness = 0.3
            child.material.emissiveIntensity = 0.05
          } else {
            // Default for non-textured
            child.material = new THREE.MeshStandardMaterial({ color: 0xcccccc })
          }
          child.castShadow = true
          child.receiveShadow = true
        }
      })
      
      // Scale and position
      model.scale.set(scale, scale, scale)
      model.position.set(pos.x, pos.y, pos.z)
      
      // Center model at its own position
      const bbox = new THREE.Box3().setFromObject(model)
      const center = bbox.getCenter(new THREE.Vector3())
      model.position.sub(center)
      model.position.x += pos.x
      model.position.y += pos.y
      model.position.z += pos.z
      
      heroScene.add(model)
      loadedCount++
      console.log(`Logos loaded: ${loadedCount}/5`)
    }, undefined, (error) => {
      console.error(`Error loading logo ${idx}:`, error)
    })
  })
  
  // Subtle rotation and floating animation
  let time = 0
  const animate = () => {
    requestAnimationFrame(animate)
    time += 0.0005
    
    // Water effect disabled
    
    // INTERACTIVE BUBBLES: Follow cursor and burst on click
    if (window.heroState && window.heroState.bubbles) {
      const bubblesArray = window.heroState.bubbles
      
      // Update cursor bubble (main interactive bubble following cursor)
      if (cursorBubble && cursorBubble.userData) {
        const targetPos = cursorBubble.userData.targetPos
        // Smooth follow: stay slightly behind cursor
        const followSpeed = 0.15
        cursorBubble.position.lerp(targetPos, followSpeed)
        
        // Wobble effect
        cursorBubble.position.x += Math.sin(time * cursorBubble.userData.wobbleSpeedX) * 0.008
        cursorBubble.position.z += Math.cos(time * cursorBubble.userData.wobbleSpeedZ) * 0.008
        
        // Pulse scale
        const pulseScale = 1 + Math.sin(time * 3) * 0.12
        cursorBubble.scale.set(pulseScale, pulseScale, pulseScale)
      }
      
      // Update trail bubbles (left behind as cursor moves)
      const bubblesForRemoval = []
      bubblesArray.forEach((bubble, idx) => {
        if (!bubble.userData) return
        
        bubble.userData.age += 0.016  // Assume 60fps
        
        // Fade out as they age
        const lifeRatio = bubble.userData.age / bubble.userData.lifespan
        const currentOpacity = Math.max(0, 0.3 * (1 - lifeRatio))
        
        bubble.material.opacity = currentOpacity
        
        // Float upward
        bubble.position.y += bubble.userData.speed
        
        // Wobble
        bubble.position.x += Math.sin(time * bubble.userData.wobbleSpeedX) * 0.01
        bubble.position.z += Math.cos(time * bubble.userData.wobbleSpeedZ) * 0.01
        
        // Pulse scale
        const scale = 1 + Math.sin(time * 2 + bubble.position.y) * 0.08
        bubble.scale.set(scale, scale, scale)
        
        // Remove old bubbles
        if (bubble.userData.age > bubble.userData.lifespan) {
          heroScene.remove(bubble)
          bubblesForRemoval.push(idx)
        }
      })
      
      // Remove dead bubbles from array
      bubblesForRemoval.reverse().forEach(idx => bubblesArray.splice(idx, 1))
    }
    
    // Gentle rotation and floating for all models
    heroScene.children.forEach((child) => {
      if (child instanceof THREE.Group || child.type === 'Group') {
        child.rotation.y += 0.0008
        child.rotation.x += Math.sin(time) * 0.0001
        child.position.y += Math.sin(time) * 0.0015
      }
    })
    
    heroRenderer.render(heroScene, camera)
  }
  animate()
  
  // Handle resize
  const handleResize = () => {
    const w = window.innerWidth
    const h = window.innerHeight
    
    canvasEl.width = w
    canvasEl.height = h
    heroRenderer.setSize(w, h)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  
  window.addEventListener('resize', handleResize)
  
  return { scene: heroScene, renderer: heroRenderer, camera }
}

export function cleanupHeroLogos() {
  if (heroRenderer) {
    heroRenderer.dispose()
    heroRenderer = null
    heroScene = null
  }
}
