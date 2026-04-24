// ==========================================
// 3D MODELS PAGE
// ==========================================
import { models } from '../data/content.js'
import { initModelViewer, cleanupModelViewer } from '../three/modelViewer.js'
import { renderFooter } from './home.js'

export function renderModels(container) {
  container.innerHTML = `
    <div class="page-enter">
      <section class="page-hero">
        <div class="page-hero-inner">
          <div class="section-header" style="margin-bottom:0">
            <p class="section-eyebrow">Library</p>
            <h1 class="section-title">3D Model Library</h1>
            <p class="section-subtitle">Click any model to open the interactive viewer — rotate, zoom, and inspect from any angle.</p>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="grid-3" id="models-grid">
            ${models.map(model => renderModelCard(model)).join('')}
          </div>
        </div>
      </section>
      ${renderFooter()}
    </div>

    <!-- Fullscreen Model Viewer -->
    <div id="model-viewer-overlay" class="model-viewer-overlay" style="display:none">
      <div class="model-viewer-header">
        <div>
          <h2 class="model-viewer-title" id="viewer-title">Model Viewer</h2>
          <p id="viewer-meta" style="font-size:var(--text-sm);color:var(--text-muted);margin-top:4px"></p>
        </div>
        <div style="display:flex;gap:12px;align-items:center">
          <p class="viewer-hint" style="display:none" id="viewer-hint-desktop">🖱 Drag to rotate · Scroll to zoom</p>
          <button class="btn btn-ghost" id="close-viewer">✕ Close</button>
        </div>
      </div>
      <canvas id="model-viewer-canvas" class="model-viewer-canvas"></canvas>
      <div class="model-viewer-footer">
        <p class="viewer-hint">🖱 Drag to rotate &nbsp;|&nbsp; Scroll to zoom &nbsp;|&nbsp; Right-drag to pan</p>
      </div>
    </div>
  `

  // Bind card clicks
  document.querySelectorAll('.model-card').forEach(card => {
    card.addEventListener('click', () => openModelViewer(card.dataset.id))
  })

  // Close viewer
  document.getElementById('close-viewer').addEventListener('click', closeModelViewer)
  document.addEventListener('keydown', onEscKey)
}

function renderModelCard(model) {
  return `
    <div class="model-card" data-id="${model.id}" style="cursor:pointer">
      <div class="model-preview">
        ${model.thumbnail
          ? `<img src="${model.thumbnail}" alt="${model.title}" style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0">`
          : `<div class="model-preview-icon">🧊</div>`
        }
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.3);opacity:0;transition:opacity 0.25s" class="model-hover-overlay">
          <div class="btn btn-primary" style="pointer-events:none">👁 View Model</div>
        </div>
      </div>
      <div class="model-card-body">
        <h3 class="model-card-title">${model.title}</h3>
        <p class="model-card-meta">${model.software || 'Blender'} · ${model.polygons || '—'} polys · ${model.year}</p>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px">
          ${model.tags.map(t => `<span class="badge badge-cyan">${t}</span>`).join('')}
        </div>
      </div>
    </div>
  `
}

// Hover overlay effect
document.addEventListener('mouseover', e => {
  const card = e.target.closest('.model-card')
  if (card) card.querySelector('.model-hover-overlay')?.style && (card.querySelector('.model-hover-overlay').style.opacity = '1')
})
document.addEventListener('mouseout', e => {
  const card = e.target.closest('.model-card')
  if (card) card.querySelector('.model-hover-overlay')?.style && (card.querySelector('.model-hover-overlay').style.opacity = '0')
})

function openModelViewer(modelId) {
  const model = models.find(m => m.id === modelId)
  if (!model) return

  const overlay = document.getElementById('model-viewer-overlay')
  const canvas = document.getElementById('model-viewer-canvas')
  const title = document.getElementById('viewer-title')
  const meta = document.getElementById('viewer-meta')

  overlay.style.display = 'flex'
  overlay.style.flexDirection = 'column'
  title.textContent = model.title
  meta.textContent = `${model.software || 'Blender'} · ${model.polygons || '—'} polygons · ${model.year}`

  document.body.style.overflow = 'hidden'

  // Init the 3D viewer
  requestAnimationFrame(() => {
    initModelViewer(canvas, model.file || null)
  })
}

function closeModelViewer() {
  const overlay = document.getElementById('model-viewer-overlay')
  if (overlay) overlay.style.display = 'none'
  document.body.style.overflow = ''
  cleanupModelViewer()
  document.removeEventListener('keydown', onEscKey)
}

function onEscKey(e) {
  if (e.key === 'Escape') closeModelViewer()
}

export function unmountModels() {
  cleanupModelViewer()
  document.removeEventListener('keydown', onEscKey)
}
