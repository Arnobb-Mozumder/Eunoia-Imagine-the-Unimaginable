// ==========================================
// WRITINGS PAGE
// ==========================================
import { writings, writingCategories } from '../data/content.js'
import { getAPIUrl } from '../config/api.js'
import { renderFooter } from './home.js'
import { isAdmin, showToast } from '../utils/adminAuth.js'
import { initScrollReveal } from '../main.js'

let activeCategory = null
let activePost = null
let cachedWritings = []  // Cache API writings

export async function renderWritings(container, categoryId = null, postId = null) {
  activeCategory = categoryId
  activePost = postId

  // Fetch writings from API on first load or when needed
  if (cachedWritings.length === 0) {
    await fetchWritingsFromAPI()
  }

  if (postId) {
    await renderPost(container, postId)
    return
  }
  if (categoryId) {
    await renderCategory(container, categoryId)
    return
  }
  await renderHub(container)
}

// Fetch writings from backend API
async function fetchWritingsFromAPI() {
  try {
    const API_URL = getAPIUrl()
    const response = await fetch(`${API_URL}/api/writings`, { timeout: 5000 })
    
    if (response.ok) {
      const data = await response.json()
      if (Array.isArray(data) && data.length > 0) {
        cachedWritings = data
        console.log('✅ Fetched', cachedWritings.length, 'writings from API')
        return
      }
    }
  } catch (err) {
    console.warn('❌ API error:', err.message)
  }
  
  // Fallback to static array
  console.log('📝 Using static writings data (', writings.length, 'posts)')
  cachedWritings = writings
}

// ---- Writing Hub ----
async function renderHub(container) {
  container.innerHTML = `
    <div class="page-enter">
      <section class="page-hero">
        <div class="page-hero-inner">
          <div class="section-header" style="margin-bottom:0">
            <p class="section-eyebrow">Words</p>
            <h1 class="section-title">Writings</h1>
            <p class="section-subtitle">Essays, stories, reviews, and late-night thoughts. Pick a collection below.</p>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <!-- BROWSE CATEGORIES -->
          <div class="section-header reveal" style="margin-top:var(--space-12)">
            <p class="section-eyebrow">Explore</p>
            <h2 class="section-title" style="font-size:var(--text-3xl)">Collections</h2>
          </div>
          <div class="writings-categories">
            ${writingCategories.map(cat => {
              const count = cachedWritings.filter(w => {
                if (!w.category) return false
                const walk = w.category.toLowerCase().replace(/-/g, '').replace(/\s+/g, '')
                const target = cat.id.toLowerCase().replace(/-/g, '').replace(/\s+/g, '')
                return walk === target || walk.includes(target) || target.includes(walk)
              }).length
              return `
                <a href="#/writings/${cat.id}" class="writing-category-card reveal">
                  <div class="category-icon">${cat.icon}</div>
                  <h2 class="category-title">${cat.title}</h2>
                  <p class="category-desc">${cat.description}</p>
                  <span class="category-count">${count} ${count === 1 ? 'piece' : 'pieces'}</span>
                </a>`
            }).join('')}
          </div>

          <div class="section-header reveal" style="margin-top:var(--space-12)">
            <p class="section-eyebrow">Recent</p>
            <h2 class="section-title" style="font-size:var(--text-3xl)">Latest Posts</h2>
          </div>
          <div style="display:flex;flex-direction:column;gap:var(--space-4)">
            ${[...cachedWritings].reverse().slice(0, 4).map(post => renderPostCard(post)).join('')}
          </div>
        </div>
      </section>
      ${renderFooter()}
    </div>
  `
  
  initScrollReveal()
}

// ---- Category View ----
async function renderCategory(container, catId) {
  const cat = writingCategories.find(c => c.id === catId)
  const posts = cachedWritings.filter(w => {
    if (!w.category) return false
    const walk = w.category.toLowerCase().replace(/-/g, '').replace(/\s+/g, '')
    const target = catId.toLowerCase().replace(/-/g, '').replace(/\s+/g, '')
    return walk === target || walk.includes(target) || target.includes(walk)
  })

  container.innerHTML = `
    <div class="page-enter">
      <section class="page-hero">
        <div class="page-hero-inner">
          <button class="back-btn" onclick="window.location.hash='/writings'">← All Writings</button>
          <div class="section-header" style="margin-bottom:0">
            <p class="section-eyebrow">${cat?.icon || '✍️'} Collection</p>
            <h1 class="section-title">${cat?.title || catId}</h1>
            <p class="section-subtitle">${cat?.description || ''}</p>
          </div>
        </div>
      </section>
       <section class="section">
        <div class="container">
          ${posts.length
            ? `<div class="writings-posts">
                ${posts.map(post => renderPostCard(post)).join('')}
              </div>`
            : `<div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <div class="empty-state-title">Nothing here yet</div>
                <p class="empty-state-desc">Pieces in this collection will appear here soon.</p>
              </div>`
          }
        </div>
      </section>
      ${renderFooter()}
    </div>
  `

  initScrollReveal()
}

function renderPostCard(post) {
  const cat = writingCategories.find(c => c.id === post.category)
  const isAdm = isAdmin()
  
  return `
    <div class="post-card-wrapper reveal" id="post-wrapper-${post.id}">
      <a href="#/writings/${post.category}/${post.id}" class="post-card">
        <div class="post-header">
          <div class="post-badges">
            <span class="badge badge-purple">${cat?.icon || '✍️'} ${cat?.title || post.category}</span>
            <span class="badge badge-cyan">${post.readTime}</span>
          </div>
          ${post.mood ? `<div class="post-mood">${post.mood}</div>` : ''}
        </div>
        <h3 class="post-title">${post.title}</h3>
        <p class="post-excerpt">${post.excerpt}</p>
        <div class="post-meta">
          <span>📅 ${post.date}</span>
          <span style="margin-left:auto;color:var(--accent-purple);font-weight:600">Read more →</span>
        </div>
      </a>
      ${isAdm ? `<button class="delete-post-btn" onclick="deletePost('${post.id}', '${post.category}')" title="Delete Piece">🗑️</button>` : ''}
    </div>
  `
}

// Global window function for the onclick
window.deletePost = async (postId, catId) => {
  if (!confirm('Are you sure you want to delete this piece forever?')) return

  const originalContent = document.getElementById(`post-wrapper-${postId}`)
  const API_URL = getAPIUrl()
  const ADMIN_KEY = 'arnob1812' // Re-using the key for headers

  try {
    const response = await fetch(`${API_URL}/api/writings/${postId}`, {
      method: 'DELETE',
      headers: { 'x-admin-key': ADMIN_KEY }
    })

    if (response.ok) {
      showToast('Piece deleted successfully')
      // Refresh the writings data
      cachedWritings = []
      const container = document.getElementById('page-container')
      renderWritings(container, catId)
    } else {
      showToast('❌ Failed to delete piece')
    }
  } catch (err) {
    showToast('❌ Network error')
  }
}

// ---- Single Post View ----
async function renderPost(container, postId) {
  const post = cachedWritings.find(w => w.id === postId)
  if (!post) {
    container.innerHTML = `<div class="container section"><div class="empty-state"><div class="empty-state-icon">😕</div><div class="empty-state-title">Post not found</div><a href="#/writings" class="btn btn-secondary" style="margin-top:16px">Back to Writings</a></div></div>`
    return
  }
  const cat = writingCategories.find(c => c.id === post.category)

  // Parse simple markdown-like content
  const htmlContent = parseContent(post.content)

  container.innerHTML = `
    <div class="page-enter">
      <section class="section">
        <div class="post-reader">
          <button class="back-btn" onclick="window.location.hash='/writings/${post.category}'">← ${cat?.title || 'Writings'}</button>
          <div style="margin-bottom:16px">
            <span class="badge badge-purple">${cat?.icon || '✍️'} ${cat?.title || post.category}</span>
          </div>
          <h1 class="post-reader-title">${post.title}</h1>
          <div class="post-reader-meta">
            <span>📅 ${post.date}</span>
            <span>⏱ ${post.readTime}</span>
            ${post.mood ? `<span>${post.mood}</span>` : ''}
          </div>
          <div class="post-reader-body">${htmlContent}</div>

          <!-- Navigation -->
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:var(--space-12);padding-top:var(--space-8);border-top:1px solid var(--border-color)">
            <a href="#/writings/${post.category}" class="btn btn-ghost">← More from collection</a>
            <a href="#/messages" class="btn btn-primary">💬 Send Chithi</a>
          </div>
        </div>
      </section>
      ${renderFooter()}
    </div>
  `
}

function parseContent(text) {
  return text
    .split('\n\n')
    .map(block => {
      if (block.startsWith('## ')) return `<h2>${block.slice(3)}</h2>`
      if (block.startsWith('### ')) return `<h3>${block.slice(4)}</h3>`
      if (block.startsWith('> ')) return `<blockquote>${block.slice(2)}</blockquote>`
      // Inline bold & italic
      let html = block
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
      return `<p>${html}</p>`
    })
    .join('\n')
}

