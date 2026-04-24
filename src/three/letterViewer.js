
import * as THREE from 'three'

let scene, camera, renderer, model, mixer, animId
let resizeObs
let clock = new THREE.Clock()

export async function initLetterViewer(canvas) {
  cleanupLetterViewer()

  const W = canvas.clientWidth || canvas.offsetWidth
  const H = canvas.clientHeight || canvas.offsetHeight

  scene = new THREE.Scene()
  // Transparent background to fit the page theme
  scene.background = null

  camera = new THREE.PerspectiveCamera(35, W / H, 0.1, 1000)
  camera.position.set(0, 0.5, 3)
  camera.lookAt(0, 0, 0)

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setSize(W, H)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.0

  // Intense Candle light effect (warm SpotLight)
  const candleLight = new THREE.SpotLight(0xff9933, 50) // Brighter warm orange
  candleLight.position.set(2, 2.5, 2) // Closer to model
  candleLight.angle = Math.PI / 4
  candleLight.penumbra = 0.3
  candleLight.decay = 2
  candleLight.distance = 10
  candleLight.castShadow = true
  scene.add(candleLight)
  scene.add(candleLight.target) // Ensure target is in scene
  candleLight.target.position.set(0, 0, 0)

  // Extra warm point light right above the model for "glow"
  const glowLight = new THREE.PointLight(0xff6600, 20, 5)
  glowLight.position.set(0, 1, 0)
  scene.add(glowLight)

  // Higher ambient for general visibility
  const ambient = new THREE.AmbientLight(0xffffff, 0.4)
  scene.add(ambient)

  const rimLight = new THREE.PointLight(0xffffff, 0.5)
  rimLight.position.set(-2, 1, -2)
  scene.add(rimLight)

  // Load the letter.glb model
  try {
    const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js')
    const loader = new GLTFLoader()

    loader.load('/static/letter.glb', (gltf) => {
      model = gltf.scene

      // Center and scale
      const box = new THREE.Box3().setFromObject(model)
      const size = box.getSize(new THREE.Vector3())
      const maxDim = Math.max(size.x, size.y, size.z)
      model.scale.multiplyScalar(1.5 / maxDim)

      model.traverse(child => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true
        }
      })

      scene.add(model)

      // Animations
      if (gltf.animations && gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(model)
        // Find animation named "1."
        const clip = gltf.animations.find(a => a.name === '1.' || a.name === '1') || gltf.animations[0]
        if (clip) {
          const action = mixer.clipAction(clip)
          action.play()
        }
      }
    })
  } catch (err) {
    console.error('Error loading letter.glb:', err)
  }

  resizeObs = new ResizeObserver(() => {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    renderer.setSize(w, h)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  })
  resizeObs.observe(canvas)

  function animate() {
    animId = requestAnimationFrame(animate)
    const delta = clock.getDelta()
    const time = clock.getElapsedTime()

    if (mixer) mixer.update(delta)

    // Candle flicker effect
    candleLight.intensity = 50 + Math.sin(time * 10) * 10 + Math.random() * 5
    glowLight.intensity = 20 + Math.cos(time * 8) * 5

    if (model) {
      // Subtle hovering effect
      model.position.y = Math.sin(time * 1.5) * 0.05
      model.rotation.y += 0.005
    }

    renderer.render(scene, camera)
  }

  animate()
}

export function cleanupLetterViewer() {
  if (animId) cancelAnimationFrame(animId)
  if (resizeObs) resizeObs.disconnect()
  if (renderer) {
    renderer.dispose()
    renderer = null
  }
  scene = null
  camera = null
  model = null
  mixer = null
}
