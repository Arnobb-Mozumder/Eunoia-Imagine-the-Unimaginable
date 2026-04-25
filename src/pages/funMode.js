
import * as THREE from 'three'
const gsap = window.gsap

let scene, camera, renderer, clock, pathCurve, player
let stableFrames = null
let windParticles = null
let speedLinesContainer = null
let sunGroup = null, ambientLight = null, sunLight = null, sunMesh = null, horizonSmokeMat = null
let currentPhase = -1
let progress = 0
let targetProgress = 0
let mouseX = 0, mouseY = 0, targetMouseX = 0, targetMouseY = 0
let touchStartY = 0
let isInitialized = false

const elementsData = [
  { type: 'intro', dist: 0.05, img: '/arnob.png' },
  { type: 'eunoia', dist: 0.20, companionText: 'This space is a collection of my work, ranging from game development and 3D modeling to animation and writing. Feel free to explore the site and take your time discovering each section.', img: '/eunoia.png' },
  { type: 'models', dist: 0.35, side: 'left', title: 'Models', subtitle: 'My 3D modeling projects', img: '/3dmodel.png', link: '#/models', companionText: 'Would you like to see some works from this amateur artist?' },
  { type: 'games', dist: 0.50, side: 'right', title: 'Games', subtitle: 'Playable game experiences', img: '/game.png', link: '#/games', companionText: "Let's play my games!" },
  { type: 'animations', dist: 0.65, side: 'left', title: 'Animations', subtitle: 'Animated visual stories', img: '/animation.png', link: '#/animations', companionText: 'Wanna watch some cool stuff?' },
  { type: 'writings', dist: 0.80, side: 'right', title: 'Writings', subtitle: 'Thoughts and stories', img: '/writing.png', link: '#/writings', companionText: 'I think a lot, would you mind giving this a try?' },
  { type: 'chithi', dist: 0.95, side: 'left', title: 'Chithi', subtitle: 'Send an anonymous message', img: '/chithi.png', link: '#/messages', companionText: 'I would truly appreciate it if you shared a few words in Chithi. You can write anonymously if you prefer; the only thing that matters is your thoughts.<br><br>Thank you for visiting and exploring.' }
]

export function initFunMode() {
  if (isInitialized) return
  window.exitFunMode = exitFunMode
  
  const container = document.createElement('div')
  container.id = 'fun-mode-container'
  container.className = 'fun-mode-container'
  container.innerHTML = `
    <button id="fun-exit-btn" class="fun-exit-btn glass">✕ Exit Ride</button>
    <div class="scroll-indicator">Scroll Down to Move Forward</div>
  `
  document.body.appendChild(container)

  document.getElementById('fun-exit-btn').onclick = () => {
    exitFunMode({ returnToSelector: true })
  }

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x050510) // Night sky
  scene.fog = new THREE.FogExp2(0x050510, 0.00025)

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 200000)
  
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  container.appendChild(renderer.domElement)

  ambientLight = new THREE.AmbientLight(0x111133, 1.5) // Dark blue ambient
  scene.add(ambientLight)
  
  sunLight = new THREE.DirectionalLight(0xaaaaee, 0.5) // Moonlight
  sunLight.position.set(0, 8000, 100000) 
  scene.add(sunLight)
  
  sunGroup = new THREE.Group()
  
  const sunGeo = new THREE.SphereGeometry(15000, 32, 32)
  const sunMat = new THREE.MeshBasicMaterial({ color: 0xeeeeff, fog: false }) // Moon color
  sunMesh = new THREE.Mesh(sunGeo, sunMat)
  sunMesh.scale.set(0.4, 0.4, 0.4) // Smaller moon
  sunGroup.add(sunMesh)
  
  const horizonSmokeGeo = new THREE.PlaneGeometry(200000, 30000)
  horizonSmokeMat = new THREE.MeshBasicMaterial({ 
      color: 0x111122, // Dark night clouds
      transparent: true, 
      opacity: 0.9, 
      fog: true 
  })
  
  for(let i = 0; i < 4; i++) {
     const smoke = new THREE.Mesh(horizonSmokeGeo, horizonSmokeMat)
     smoke.position.set(0, -15000 - (i * 2000), 5000 + (i * 5000))
     sunGroup.add(smoke)
  }
  
  scene.add(sunGroup)
  
  player = new THREE.Group()
  scene.add(player)

  const points = []
  const count = 500
  for (let i = 0; i < count; i++) {
    let x = Math.sin(i * 0.04) * 400
    let z = i * 200
    let y = 0
    if (i > 50 && i < 150) y = Math.sin((i - 50) / 100 * Math.PI) * 1800
    if (i > 200 && i < 300) {
      const t = (i - 200) / 100
      const a = t * Math.PI * 2
      y = Math.sin(a) * 600 + 600
      z = 200 * 200 + Math.cos(a) * 600
    }
    points.push(new THREE.Vector3(x, y, z))
  }
  pathCurve = new THREE.CatmullRomCurve3(points)
  stableFrames = computeStableFrames(pathCurve, 2000)

  createRoad()
  createKingdom()
  createNature()
  createAtmosphere()
  createSmoke()
  createSpeedLines()
  
  isInitialized = true
  animate()

  window.addEventListener('wheel', onScroll, { passive: false })
  window.addEventListener('touchstart', onTouchStart, { passive: true })
  window.addEventListener('touchmove', onTouchMove, { passive: false })
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('deviceorientation', onDeviceOrientation)
  window.addEventListener('resize', onResize)
}

function computeStableFrames(curve, segments) {
  const tangents = []
  const normals = []
  const binormals = []
  let up = new THREE.Vector3(0, 1, 0)

  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const tangent = curve.getTangentAt(t).normalize()
    tangents.push(tangent.clone())

    const right = new THREE.Vector3().crossVectors(tangent, up)
    if (right.lengthSq() < 0.00001) {
      if (binormals.length > 0) right.copy(binormals[binormals.length - 1])
      else right.set(1, 0, 0)
    } else {
      right.normalize()
    }

    up.crossVectors(right, tangent).normalize()
    normals.push(up.clone())
    binormals.push(right.clone())
  }
  return { tangents, normals, binormals }
}

function createRoad() {
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.9 })
  const laneMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
  const edgeMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 })
  const grassMat = new THREE.MeshStandardMaterial({ color: 0x4d7a36, roughness: 1.0 })
  const segments = 1500
  
  // Blue Tunnel Materials & Geometry
  const tunnelGeo = new THREE.CylinderGeometry(55, 55, 1, 32, 1, true)
  tunnelGeo.rotateX(Math.PI / 2)
  const tunnelMat = new THREE.MeshStandardMaterial({ 
     color: 0x0033ff, 
     roughness: 0.2, 
     metalness: 0.8, 
     side: THREE.DoubleSide,
     emissive: 0x001166
  })
  
  for (let i = 0; i < segments; i++) {
    const t = i / segments
    const nextT = Math.min(1, (i + 1) / segments)
    
    const pos = pathCurve.getPointAt(t)
    const nextPos = pathCurve.getPointAt(nextT)
    const segmentLength = pos.distanceTo(nextPos)
    
    const idx = Math.floor(t * 2000)
    
    const tangent = stableFrames.tangents[idx]
    const upVector = stableFrames.normals[idx]
    const rightVector = stableFrames.binormals[idx]
    
    const zAxis = tangent.clone().negate()
    const matrix = new THREE.Matrix4().makeBasis(rightVector, upVector, zAxis)
    const quaternion = new THREE.Quaternion().setFromRotationMatrix(matrix)

    // Solid concrete road
    const road = new THREE.Mesh(new THREE.BoxGeometry(40, 2, segmentLength + 1), roadMat)
    const roadPos = pos.clone().add(tangent.clone().multiplyScalar(segmentLength / 2))
    road.position.copy(roadPos)
    road.quaternion.copy(quaternion)
    scene.add(road)
    
    // Dashed center lane
    if (i % 3 !== 0) {
      const lane = new THREE.Mesh(new THREE.BoxGeometry(1, 2.2, segmentLength * 0.8), laneMat)
      lane.position.copy(roadPos)
      lane.quaternion.copy(quaternion)
      scene.add(lane)
    }
    
    const edgeL = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.1, segmentLength + 1), edgeMat)
    edgeL.position.copy(roadPos).add(rightVector.clone().multiplyScalar(-18))
    edgeL.quaternion.copy(quaternion)
    scene.add(edgeL)
    
    const edgeR = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.1, segmentLength + 1), edgeMat)
    edgeR.position.copy(roadPos).add(rightVector.clone().multiplyScalar(18))
    edgeR.quaternion.copy(quaternion)
    scene.add(edgeR)
    
    const inTunnel1 = t >= 0.28 && t <= 0.33
    const inTunnel2 = t >= 0.63 && t <= 0.68
    
    if (inTunnel1 || inTunnel2) {
      // Create Blue Tunnel
      const tunnel = new THREE.Mesh(tunnelGeo, tunnelMat)
      tunnel.scale.set(1, 1, segmentLength + 1)
      tunnel.position.copy(roadPos).add(upVector.clone().multiplyScalar(20))
      tunnel.quaternion.copy(quaternion)
      scene.add(tunnel)
    } else {
      // Grass base outside tunnels
      if (i % 2 === 0) {
        const nextGrassT = Math.min(1, (i + 2) / segments)
        const grassDist = pos.distanceTo(pathCurve.getPointAt(nextGrassT))
        const grass = new THREE.Mesh(new THREE.BoxGeometry(180, 1, grassDist + 1), grassMat)
        grass.position.copy(pos).add(tangent.clone().multiplyScalar(grassDist / 2)).add(upVector.clone().multiplyScalar(-1.5))
        grass.quaternion.copy(quaternion)
        scene.add(grass)
      }
    }
  }
}

function createNature() {
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 })
  const leavesMat = new THREE.MeshStandardMaterial({ color: 0x2d4c1e, roughness: 0.8 })
  
  const segments = 800
  for (let i = 0; i < segments; i++) {
    if (Math.random() > 0.5) continue // Spacing
    
    const t = i / segments
    if ((t >= 0.28 && t <= 0.33) || (t >= 0.63 && t <= 0.68)) continue; // No trees inside tunnel

    const idx = Math.floor(t * 2000)
    const pos = pathCurve.getPointAt(t)
    const upVector = stableFrames.normals[idx]
    const rightVector = stableFrames.binormals[idx]
    const zAxis = stableFrames.tangents[idx].clone().negate()
    
    const matrix = new THREE.Matrix4().makeBasis(rightVector, upVector, zAxis)
    const quaternion = new THREE.Quaternion().setFromRotationMatrix(matrix)

    const placeTree = (sideMultiplier) => {
       if (Math.random() > 0.4) return
       
       const dist = 30 + Math.random() * 40 // Place between road and castles
       const basePos = pos.clone().add(rightVector.clone().multiplyScalar(dist * sideMultiplier))
       
       const trunkH = 15 + Math.random() * 15
       const trunk = new THREE.Mesh(new THREE.CylinderGeometry(2, 3, trunkH, 5), trunkMat)
       trunk.position.copy(basePos).add(upVector.clone().multiplyScalar(trunkH/2 - 1))
       trunk.quaternion.copy(quaternion)
       scene.add(trunk)
       
       const leavesH = 30 + Math.random() * 20
       const leaves = new THREE.Mesh(new THREE.ConeGeometry(12 + Math.random()*8, leavesH, 6), leavesMat)
       leaves.position.copy(basePos).add(upVector.clone().multiplyScalar(trunkH + leavesH/2 - 4))
       leaves.quaternion.copy(quaternion)
       scene.add(leaves)
    }
    
    placeTree(1)
    placeTree(-1)
  }
}

function createKingdom() {
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x1a0f14, roughness: 0.9 })
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x3a0a14, roughness: 0.8 })
  const windowMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 })
  
  const segments = 600
  for (let i = 0; i < segments; i++) {
    const t = i / segments
    if ((t >= 0.28 && t <= 0.33) || (t >= 0.63 && t <= 0.68)) continue; // No castles in tunnel
    const idx = Math.floor(t * 2000)
    const pos = pathCurve.getPointAt(t)
    
    const upVector = stableFrames.normals[idx]
    const rightVector = stableFrames.binormals[idx]
    const zAxis = stableFrames.tangents[idx].clone().negate()
    
    const matrix = new THREE.Matrix4().makeBasis(rightVector, upVector, zAxis)
    const quaternion = new THREE.Quaternion().setFromRotationMatrix(matrix)

    const buildCastle = (sideMultiplier) => {
      if (Math.random() > 0.3) return // Spacing
      
      const width = 40 + Math.random() * 50
      const height = 150 + Math.random() * 300
      const depth = 40 + Math.random() * 50
      
      // Main Tower
      const bld = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), wallMat)
      bld.position.copy(pos).add(rightVector.clone().multiplyScalar(sideMultiplier * (100 + Math.random() * 150)))
      bld.position.add(upVector.clone().multiplyScalar(height / 2 - 30))
      bld.quaternion.copy(quaternion)
      scene.add(bld)
      
      // Roof
      const roofHeight = 50 + Math.random() * 50
      const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(width, depth) * 0.7, roofHeight, 4), roofMat)
      roof.position.copy(bld.position).add(upVector.clone().multiplyScalar(height / 2 + roofHeight / 2))
      roof.quaternion.copy(quaternion)
      roof.rotateY(Math.PI / 4)
      scene.add(roof)
      
      // Glowing Window
      if (Math.random() > 0.4) {
        const win = new THREE.Mesh(new THREE.PlaneGeometry(15, 25), windowMat)
        win.position.copy(bld.position).add(upVector.clone().multiplyScalar(height * 0.3))
        win.position.add(rightVector.clone().multiplyScalar(-sideMultiplier * (width/2 + 1)))
        win.quaternion.copy(quaternion)
        if (sideMultiplier > 0) win.rotateY(-Math.PI/2)
        else win.rotateY(Math.PI/2)
        scene.add(win)
      }
    }
    
    buildCastle(1)  // Right side
    buildCastle(-1) // Left side
  }
}

function createAtmosphere() {
  // Dynamic Wind Lines (speed particles)
  const windGeo = new THREE.BufferGeometry()
  const windCount = 1000
  const windPos = new Float32Array(windCount * 3)
  for(let i=0; i < windCount * 3; i += 3) {
    windPos[i] = (Math.random() - 0.5) * 2000     // X
    windPos[i+1] = (Math.random() - 0.5) * 2000   // Y
    windPos[i+2] = (Math.random() - 0.5) * 2000   // Z
  }
  windGeo.setAttribute('position', new THREE.BufferAttribute(windPos, 3))
  const windMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 3,
    transparent: true,
    opacity: 0.6,
    fog: false
  })
  windParticles = new THREE.Points(windGeo, windMat)
  scene.add(windParticles)
}

function createSmoke() {
  const smokeGeo = new THREE.SphereGeometry(150, 8, 8)
  const smokeMat = new THREE.MeshBasicMaterial({ 
    color: 0xffddbb, // Peach sunset mist
    transparent: true, 
    opacity: 0.03, 
    depthWrite: false,
    fog: true
  })
  
  // Create low-lying ground mist
  for (let i = 0; i < 800; i++) {
    const smoke = new THREE.Mesh(smokeGeo, smokeMat)
    const t = Math.random()
    const pos = pathCurve.getPointAt(t)
    
    // Cluster near the road
    smoke.position.copy(pos).add(new THREE.Vector3(
      (Math.random() - 0.5) * 400,
      -10 + Math.random() * 30, // Low to the ground
      (Math.random() - 0.5) * 400
    ))
    
    smoke.scale.set(2.5, 0.15, 2.5) // Flattened disks to look like mist layers
    smoke.rotation.y = Math.random() * Math.PI
    scene.add(smoke)
  }
}

function createSpeedLines() {
  speedLinesContainer = new THREE.Group()
  const lineGeo = new THREE.BoxGeometry(0.5, 0.5, 80)
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 })
  
  // Create 3 lines on left, 3 on right
  for(let i = 0; i < 3; i++) {
    const lineL = new THREE.Mesh(lineGeo, lineMat.clone())
    lineL.position.set(-20 - (Math.random() * 5), 10 + i * 8, -100 - Math.random() * 50)
    speedLinesContainer.add(lineL)
    
    const lineR = new THREE.Mesh(lineGeo, lineMat.clone())
    lineR.position.set(20 + (Math.random() * 5), 10 + i * 8, -100 - Math.random() * 50)
    speedLinesContainer.add(lineR)
  }
  scene.add(speedLinesContainer)
}

function onScroll(e) {
  e.preventDefault()
  
  let speedMultiplier = 2 // Constant base speed
  if (pathCurve) {
    const tan = pathCurve.getTangentAt(progress)
    // Determine slope direction using the Y-component of the tangent
    if (tan.y > 0.15) {
      speedMultiplier = 1 // Slower moving upward
    } else if (tan.y < -0.15) {
      speedMultiplier = 4 // Faster moving downward
    }
  }
  
  // Base sensitivity multiplier
  const baseSensitivity = 0.000015
  targetProgress += e.deltaY * (baseSensitivity * speedMultiplier)
  targetProgress = Math.max(0, Math.min(0.99, targetProgress))
}

function onTouchStart(e) {
  touchStartY = e.touches[0].clientY
}

function onTouchMove(e) {
  // e.preventDefault() // prevent standard scrolling
  const touchY = e.touches[0].clientY
  const deltaY = touchStartY - touchY
  touchStartY = touchY
  
  let speedMultiplier = 2
  if (pathCurve) {
    const tan = pathCurve.getTangentAt(progress)
    if (tan.y > 0.15) speedMultiplier = 1
    else if (tan.y < -0.15) speedMultiplier = 4
  }
  
  const baseSensitivity = 0.00005
  targetProgress += deltaY * (baseSensitivity * speedMultiplier)
  targetProgress = Math.max(0, Math.min(0.99, targetProgress))
}

function onMouseMove(e) {
  targetMouseX = (e.clientX / window.innerWidth) * 2 - 1
  targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1
}

function onDeviceOrientation(e) {
  if (e.gamma === null || e.beta === null) return
  let x = e.gamma / 45
  let y = (e.beta - 60) / 45
  targetMouseX = Math.max(-1, Math.min(1, x))
  targetMouseY = -Math.max(-1, Math.min(1, y))
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

function updateEnvironment(p) {
  let newPhase = 0; // Night
  if (p > 0.305 && p < 0.655) newPhase = 1; // Morning (between tunnels)
  if (p >= 0.655) newPhase = 2; // Evening (after tunnel 2)
  
  if (newPhase !== currentPhase) {
    currentPhase = newPhase;
    
    let targetBg, targetAmb, targetDirColor, targetDirInt, targetBodyColor, targetSmokeColor, targetScale;
    
    if (currentPhase === 0) { // Night
       targetBg = new THREE.Color(0x050510)
       targetAmb = new THREE.Color(0x111133)
       targetDirColor = new THREE.Color(0xaaaaee)
       targetDirInt = 0.5
       targetBodyColor = new THREE.Color(0xeeeeff)
       targetSmokeColor = new THREE.Color(0x111122)
       targetScale = 0.4
    } else if (currentPhase === 1) { // Morning
       targetBg = new THREE.Color(0x87ceeb)
       targetAmb = new THREE.Color(0x99aacc)
       targetDirColor = new THREE.Color(0xffffff)
       targetDirInt = 2.5
       targetBodyColor = new THREE.Color(0xffffee)
       targetSmokeColor = new THREE.Color(0xffffff)
       targetScale = 0.7
    } else if (currentPhase === 2) { // Evening
       targetBg = new THREE.Color(0xdda578)
       targetAmb = new THREE.Color(0xcc8866)
       targetDirColor = new THREE.Color(0xffddbb)
       targetDirInt = 2.5
       targetBodyColor = new THREE.Color(0xff6600)
       targetSmokeColor = new THREE.Color(0xffeedd)
       targetScale = 1.0
    }
    
    // 3 second smooth transition while inside the tunnel
    gsap.to(scene.background, { r: targetBg.r, g: targetBg.g, b: targetBg.b, duration: 3 })
    gsap.to(scene.fog.color, { r: targetBg.r, g: targetBg.g, b: targetBg.b, duration: 3 })
    gsap.to(ambientLight.color, { r: targetAmb.r, g: targetAmb.g, b: targetAmb.b, duration: 3 })
    gsap.to(sunLight.color, { r: targetDirColor.r, g: targetDirColor.g, b: targetDirColor.b, duration: 3 })
    gsap.to(sunLight, { intensity: targetDirInt, duration: 3 })
    
    if (sunMesh) {
       gsap.to(sunMesh.material.color, { r: targetBodyColor.r, g: targetBodyColor.g, b: targetBodyColor.b, duration: 3 })
       gsap.to(sunMesh.scale, { x: targetScale, y: targetScale, z: targetScale, duration: 3 })
    }
    if (horizonSmokeMat) {
       gsap.to(horizonSmokeMat.color, { r: targetSmokeColor.r, g: targetSmokeColor.g, b: targetSmokeColor.b, duration: 3 })
    }
  }
}

function updatePosition() {
  if (!isInitialized || !stableFrames) return
  progress += (targetProgress - progress) * 0.05
  
  updateEnvironment(progress)
  
  const idx = Math.floor(progress * 2000)
  const pos = pathCurve.getPointAt(progress)
  
  const tangent = stableFrames.tangents[idx]
  const upVector = stableFrames.normals[idx]
  const rightVector = stableFrames.binormals[idx]
  
  const zAxis = tangent.clone().negate()
  
  // Place player ON TOP of the road
  player.position.copy(pos).add(upVector.clone().multiplyScalar(5))
  
  const matrix = new THREE.Matrix4().makeBasis(rightVector, upVector, zAxis)
  player.quaternion.setFromRotationMatrix(matrix)
  
  // Perfectly centralized camera base position
  const offset = new THREE.Vector3(0, 10, 10) 
  offset.applyQuaternion(player.quaternion)
  camera.position.copy(player.position).add(offset)
  
  // Smooth mouse interpolation
  mouseX += (targetMouseX - mouseX) * 0.1
  mouseY += (targetMouseY - mouseY) * 0.1
  
  // Lock the camera to player's rotation, then apply mouse look
  camera.quaternion.copy(player.quaternion)
  
  // Limit camera rotation to 200 degrees total (100 left, 100 right)
  const maxRotation = (100 * Math.PI) / 180
  camera.rotateY(-mouseX * maxRotation) 
  
  // Limited up/down look
  camera.rotateX(mouseY * (Math.PI / 3))

  // Animate dynamic wind particles relative to camera
  const speed = Math.abs(targetProgress - progress) * 20000
  
  if (sunGroup) {
     // Anchor sun infinitely far ahead (+Z direction) so we never pass through it
     // But keep its height relative to the player so it always looks like dawn
     sunGroup.position.x = player.position.x
     sunGroup.position.y = player.position.y + 8000 
     sunGroup.position.z = player.position.z + 140000 // Always 140,000 units away
  }
  
  if (windParticles) {
    windParticles.position.copy(camera.position)
    windParticles.quaternion.copy(camera.quaternion)
    
    const positions = windParticles.geometry.attributes.position.array
    const windSpeed = speed + 20 
    
    for(let i = 2; i < positions.length; i += 3) {
       positions[i] += windSpeed 
       if (positions[i] > 1000) positions[i] -= 2000
    }
    windParticles.geometry.attributes.position.needsUpdate = true
  }
  
  // Animate speed streaks
  if (speedLinesContainer) {
    speedLinesContainer.position.copy(player.position)
    speedLinesContainer.quaternion.copy(player.quaternion)
    
    const targetOpacity = speed > 5 ? Math.min(speed / 100, 0.8) : 0
    
    speedLinesContainer.children.forEach((line) => {
      line.material.opacity += (targetOpacity - line.material.opacity) * 0.1
      if (line.material.opacity > 0.01) {
        line.position.z += (speed * 0.3) + 10 
        if (line.position.z > 150) {
          line.position.z = -150 - Math.random() * 100 
        }
      }
    })
  }
  
  checkElements()
}

function checkElements() {
  elementsData.forEach((el) => {
    const dist = Math.abs(progress - el.dist)
    if (dist < 0.03 && !el.active) {
      el.active = true
      spawnElement(el)
    } else if (dist > 0.06 && el.active) {
      el.active = false
      removeElement(el)
    }
  })
}

function spawnElement(data) {
  if (data.type === 'intro') {
    // Left Element (Photo and Name)
    const divLeft = document.createElement('div')
    divLeft.className = `fun-element left jumpscare`
    divLeft.id = `fun-el-${data.type}-left`
    divLeft.innerHTML = `
      <div class="glass" style="display: flex; flex-direction: column; align-items: center; gap: 1.5rem; padding: 2.5rem; border-radius: 30px; width: 90vw; max-width: 350px; text-align: center; border: 1px solid rgba(255,255,255,0.1);">
        <div class="fun-intro-avatar" style="width: 180px; height: 180px; background: rgba(0,0,0,0.4); border-radius: 50%;">
          <img src="${data.img}" alt="Arnob" style="width: 100%; height: 100%; border-radius: 50%; object-fit: contain;">
        </div>
        <div class="fun-intro-right" style="text-align: center;">
          <h2 style="font-size: 1.8rem; margin-bottom: 0.5rem; line-height: 1.2;">MD. Al-Amin Mozumder Arnob</h2>
          <h4 style="font-size: 1.1rem; color: #e2e8f0; margin: 0; font-weight: 500;">3D Artist, Animator, and Developer</h4>
        </div>
      </div>
    `
    document.getElementById('fun-mode-container').appendChild(divLeft)
    gsap.fromTo(divLeft, { opacity: 0, scale: 0, x: -1000 }, { opacity: 1, scale: 1, x: 0, duration: 0.5 })

    // Right Element (Writings and Links)
    const divRight = document.createElement('div')
    divRight.className = `fun-element right jumpscare`
    divRight.id = `fun-el-${data.type}-right`
    divRight.innerHTML = `
      <div class="glass" style="padding: 2.5rem; border-radius: 30px; width: 90vw; max-width: 350px; text-align: left; border: 1px solid rgba(255,255,255,0.1);">
        <p style="font-size: 1.05rem; color: #cbd5e1; line-height: 1.6; margin: 0 0 2rem 0;">with expertise in Blender, Unity, Threejs, and Photoshop, delivering creative and technical solutions.</p>
        <div class="fun-story-container">
          <a href="#/story" class="fun-story-link" onclick="window.location.hash='#/story'; window.exitFunMode && window.exitFunMode(); return false;">My Story &rarr;</a>
        </div>
        <div class="fun-socials">
          <a href="#" class="social-icon">in</a>
          <a href="#" class="social-icon">ig</a>
          <a href="#" class="social-icon">fb</a>
          <a href="#" class="social-icon">wa</a>
          <a href="#" class="social-icon">fi</a>
        </div>
      </div>
    `
    document.getElementById('fun-mode-container').appendChild(divRight)
    gsap.fromTo(divRight, { opacity: 0, scale: 0, x: 1000 }, { opacity: 1, scale: 1, x: 0, duration: 0.5 })
    
  } else if (data.type === 'eunoia') {
    // Eunoia Layout
    const divLeft = document.createElement('div')
    divLeft.className = `fun-element left jumpscare`
    divLeft.id = `fun-el-${data.type}-left`
    divLeft.innerHTML = `
      <div class="glass" style="padding: 3rem; border-radius: 30px; width: 90vw; max-width: 400px; text-align: left; border: 1px solid rgba(255,255,255,0.1);">
        <h2 style="font-size: 2.8rem; color: #fff; margin-bottom: 1.5rem;">Eunoia</h2>
        <p style="font-size: 1.15rem; color: #cbd5e1; line-height: 1.6;">${data.companionText}</p>
      </div>
    `
    document.getElementById('fun-mode-container').appendChild(divLeft)
    gsap.fromTo(divLeft, { opacity: 0, scale: 0, x: -1000 }, { opacity: 1, scale: 1, x: 0, duration: 0.5 })

    const divRight = document.createElement('div')
    divRight.className = `fun-element right jumpscare`
    divRight.id = `fun-el-${data.type}-right`
    divRight.innerHTML = `
      <div class="glass" style="padding: 1.5rem; border-radius: 30px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.1);">
         <img src="${data.img}" style="width: 350px; height: auto; border-radius: 20px; filter: drop-shadow(0 0 20px rgba(255,255,255,0.2)); object-fit: contain;">
      </div>
    `
    document.getElementById('fun-mode-container').appendChild(divRight)
    gsap.fromTo(divRight, { opacity: 0, scale: 0, x: 1000 }, { opacity: 1, scale: 1, x: 0, duration: 0.5 })

  } else {
    // Standard Card
    const cardDiv = document.createElement('div')
    cardDiv.className = `fun-element ${data.side} jumpscare`
    cardDiv.id = `fun-el-${data.type}`
    cardDiv.innerHTML = `<div class="fun-element-content glass"><img src="${data.img}" class="fun-img" style="object-fit: contain;"><div class="fun-info"><h3>${data.title}</h3><p>${data.subtitle}</p></div></div>`
    cardDiv.onclick = () => { if (data.link) { window.location.hash = data.link; exitFunMode(); } }
    document.getElementById('fun-mode-container').appendChild(cardDiv)
    gsap.fromTo(cardDiv, { opacity: 0, scale: 0, x: data.side === 'left' ? -1000 : 1000 }, { opacity: 1, scale: 1, x: 0, duration: 0.5 })

    // Companion Text (on the opposite side)
    const textSide = data.side === 'left' ? 'right' : 'left'
    const textDiv = document.createElement('div')
    textDiv.className = `fun-element ${textSide} jumpscare`
    textDiv.id = `fun-el-${data.type}-text`
    textDiv.innerHTML = `
      <div class="glass" style="padding: 2.5rem; border-radius: 20px; width: 90vw; max-width: 350px; text-align: left; border: 1px solid rgba(255,255,255,0.1);">
        <p style="font-size: 1.3rem; color: #fff; line-height: 1.6; margin: 0;">${data.companionText}</p>
      </div>
    `
    document.getElementById('fun-mode-container').appendChild(textDiv)
    gsap.fromTo(textDiv, { opacity: 0, scale: 0, x: textSide === 'left' ? -1000 : 1000 }, { opacity: 1, scale: 1, x: 0, duration: 0.5, delay: 0.1 })
  }
}

function removeElement(data) {
  if (data.type === 'intro' || data.type === 'eunoia') {
    const divL = document.getElementById(`fun-el-${data.type}-left`)
    const divR = document.getElementById(`fun-el-${data.type}-right`)
    if (divL) gsap.to(divL, { opacity: 0, scale: 15, x: -2000, duration: 0.5, ease: "power2.in", onComplete: () => divL.remove() })
    if (divR) gsap.to(divR, { opacity: 0, scale: 15, x: 2000, duration: 0.5, ease: "power2.in", onComplete: () => divR.remove() })
  } else {
    const cardDiv = document.getElementById(`fun-el-${data.type}`)
    const textDiv = document.getElementById(`fun-el-${data.type}-text`)
    if (cardDiv) gsap.to(cardDiv, { opacity: 0, scale: 15, x: data.side === 'left' ? -2000 : 2000, duration: 0.5, ease: "power2.in", onComplete: () => cardDiv.remove() })
    if (textDiv) gsap.to(textDiv, { opacity: 0, scale: 15, x: data.side === 'left' ? 2000 : -2000, duration: 0.5, ease: "power2.in", onComplete: () => textDiv.remove() })
  }
}

export function exitFunMode(options = {}) {
  const { returnToSelector = false } = options
  const c = document.getElementById('fun-mode-container')
  if (c) {
    c.remove()
    isInitialized = false
    const app = document.getElementById('app')
    const selector = document.getElementById('mode-selector')

    if (returnToSelector) {
      app?.classList.add('hidden')
      selector?.classList.remove('hidden')
    } else {
      app?.classList.remove('hidden')
    }
    
    // Cleanup listeners
    window.removeEventListener('wheel', onScroll)
    window.removeEventListener('touchstart', onTouchStart)
    window.removeEventListener('touchmove', onTouchMove)
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('deviceorientation', onDeviceOrientation)
    window.removeEventListener('resize', onResize)
  }
}

function animate() {
  if (!isInitialized) return
  requestAnimationFrame(animate)
  updatePosition()
  renderer.render(scene, camera)
}
