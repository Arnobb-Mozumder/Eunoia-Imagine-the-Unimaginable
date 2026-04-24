// ==========================================
// ANIMATIONS PAGE
// ==========================================
import { animations as staticAnimations } from '../data/content.js'
import { renderFooter } from './home.js'

// Global variable to store all animations (static + API)
let allAnimations = [...staticAnimations]

// Get API URL
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001'
  : 'https://your-backend-url.vercel.app'

export function renderAnimations(container) {
  container.innerHTML = `
    <div class="page-enter">
      <section class="page-hero">
        <div class="page-hero-inner">
          <div class="section-header" style="margin-bottom:0">
            <p class="section-eyebrow">Motion Work</p>
            <h1 class="section-title">Animations</h1>
            <p class="section-subtitle">Video animations, motion graphics, and cinematic work.</p>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="grid-auto" id="animations-grid">
            ${allAnimations.map(a => renderVideoCard(a)).join('')}
          </div>
        </div>
      </section>
      ${renderFooter()}
    </div>

    <!-- Video Modal -->
    <div id="video-modal" class="modal-overlay hidden">
      <div style="position:relative;width:100%;max-width:900px;border-radius:var(--radius-xl);overflow:hidden;background:var(--bg-secondary);border:1px solid var(--border-color)">
        <button id="close-video-modal" style="position:absolute;top:12px;right:12px;z-index:10;width:36px;height:36px;border-radius:50%;background:rgba(0,0,0,0.6);color:#fff;display:flex;align-items:center;justify-content:center;border:none;cursor:pointer;font-size:16px;">✕</button>
        <div id="video-modal-content" style="width:100%;aspect-ratio:16/9;background:#000;"></div>
        <div style="padding:20px 24px">
          <h3 id="video-modal-title" style="font-size:var(--text-xl);font-weight:600;margin-bottom:8px;"></h3>
          <p id="video-modal-desc" style="color:var(--text-secondary);font-size:var(--text-sm);line-height:1.6;"></p>
        </div>
      </div>
    </div>
  `

  // Bind play clicks
  bindAnimationEvents()

  // Fetch animations from API
  fetchAndDisplayAnimations()
}

function bindAnimationEvents() {
  document.querySelectorAll('.video-play-btn').forEach(btn => {
    btn.addEventListener('click', () => openVideo(btn.dataset.id))
  })

  const closeBtn = document.getElementById('close-video-modal')
  if (closeBtn) {
    closeBtn.addEventListener('click', closeVideo)
  }
  document.addEventListener('keydown', onEscVideo)
}

async function fetchAndDisplayAnimations() {
  try {
    const response = await fetch(`${API_URL}/api/animations`)
    if (!response.ok) throw new Error('Failed to fetch animations')
    
    const apiAnimations = await response.json()
    
    // Convert API animations to the format expected by renderVideoCard
    const formattedApiAnimations = apiAnimations.map(anim => ({
      id: anim.id,
      title: anim.title,
      description: anim.description,
      videoUrl: anim.file, // Cloudinary URL
      thumbnail: anim.thumbnail || anim.file,
      tags: anim.tags || [],
      year: anim.year,
      duration: anim.duration
    }))
    
    // Merge with static animations
    allAnimations = [...staticAnimations, ...formattedApiAnimations]
    
    // Update grid with fetched animations
    const grid = document.getElementById('animations-grid')
    if (grid) {
      grid.innerHTML = allAnimations.map(a => renderVideoCard(a)).join('')
      bindAnimationEvents()
    }
  } catch (err) {
    console.error('Error fetching animations:', err)
    // Continue with static animations if API fails
  }
}

function renderVideoCard(anim) {
  const thumbContent = anim.youtubeId
    ? `<img src="https://img.youtube.com/vi/${anim.youtubeId}/hqdefault.jpg" alt="${anim.title}" style="width:100%;height:100%;object-fit:cover">`
    : anim.thumbnail
      ? `<img src="${anim.thumbnail}" alt="${anim.title}" style="width:100%;height:100%;object-fit:cover">`
      : `<div class="video-thumb-placeholder">🎬</div>`

  return `
    <div class="video-card">
      <div class="video-thumb video-play-btn" data-id="${anim.id}" style="cursor:pointer">
        ${thumbContent}
        <div class="video-play-icon">
          <div class="play-circle">▶</div>
        </div>
        ${anim.duration ? `<span style="position:absolute;bottom:10px;right:10px;background:rgba(0,0,0,0.75);color:#fff;font-size:11px;padding:2px 8px;border-radius:4px;">${anim.duration}</span>` : ''}
      </div>
      <div class="video-card-body">
        <h3 class="video-title">${anim.title}</h3>
        <p class="video-desc">${anim.description}</p>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:12px">
          ${anim.tags.map(t => `<span class="badge badge-purple">${t}</span>`).join('')}
          ${anim.year ? `<span class="badge badge-cyan">${anim.year}</span>` : ''}
        </div>
      </div>
    </div>
  `
}

function openVideo(animId) {
  const anim = allAnimations.find(a => a.id === animId)
  if (!anim) return

  const modal = document.getElementById('video-modal')
  const content = document.getElementById('video-modal-content')
  const title = document.getElementById('video-modal-title')
  const desc = document.getElementById('video-modal-desc')

  title.textContent = anim.title
  desc.textContent = anim.description

  if (anim.youtubeId) {
    content.innerHTML = `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${anim.youtubeId}?autoplay=1" frameborder="0" allow="autoplay;fullscreen" allowfullscreen style="display:block"></iframe>`
  } else if (anim.videoUrl) {
    content.innerHTML = `<video src="${anim.videoUrl}" controls autoplay style="width:100%;height:100%;object-fit:contain"></video>`
  } else {
    content.innerHTML = `
      <div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;color:var(--text-muted);padding:40px">
        <span style="font-size:56px">🎬</span>
        <p style="text-align:center;max-width:360px;line-height:1.6">Add a YouTube ID or video file path to <code>src/data/content.js</code> to enable playback.</p>
      </div>`
  }

  modal.classList.remove('hidden')
  document.body.style.overflow = 'hidden'
}

function closeVideo() {
  const modal = document.getElementById('video-modal')
  const content = document.getElementById('video-modal-content')
  modal.classList.add('hidden')
  content.innerHTML = '' // Stop video
  document.body.style.overflow = ''
  document.removeEventListener('keydown', onEscVideo)
}

function onEscVideo(e) {
  if (e.key === 'Escape') closeVideo()
}

export function unmountAnimations() {
  document.removeEventListener('keydown', onEscVideo)
}
