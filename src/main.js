// ==========================================
// MAIN.JS — App Entry Point & Router
// ==========================================
import { initParticleBackground, cleanupParticleBackground } from './three/particleBackground.js'
import { initParticleBackground as initSpaceBackground, cleanupParticleBackground as cleanupSpaceBackground } from './three/spaceBackground.js'
import { showToast, isAdmin } from './utils/adminAuth.js'
import { renderHome, unmountHome } from './pages/home.js'
import { renderGames, renderGameDetail } from './pages/games.js'
import { renderModels, unmountModels } from './pages/models.js'
import { renderAnimations, unmountAnimations } from './pages/animations.js'
import { renderWritings } from './pages/writings.js'
import { renderMessages, getMessages, unmountMessages } from './pages/messages.js'
import { renderAdmin } from './pages/admin.js'
import { initThemeCustomizer } from './components/ThemeCustomizer.js'
import { initFunMode } from './pages/funMode.js'

// ---- ADMIN SECRET KEY ---- (change this to your own secret!)
const ADMIN_KEY = 'arnob1812'

// ---- State ----
let currentPage = null

// ==========================================
// ROUTER
// ==========================================
async function router() {
  const hash = window.location.hash.slice(1) || '/'
  const parts = hash.split('/').filter(Boolean)
  const page = parts[0] || ''
  const sub1 = parts[1] || null
  const sub2 = parts[2] || null

  const container = document.getElementById('page-container')

  // Unmount current page
  if (currentPage === 'home') unmountHome()
  if (currentPage === 'models') unmountModels()
  if (currentPage === 'animations') unmountAnimations()
  if (currentPage === 'messages') unmountMessages()

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'instant' })

  // Update nav active state
  updateNavActive(page)

  // Route
  switch (page) {
    case '':
    case 'home':
      currentPage = 'home'
      renderHome(container)
      break

    case 'games':
      if (sub1) {
        currentPage = 'game-detail'
        renderGameDetail(container, sub1)
      } else {
        currentPage = 'games'
        await renderGames(container)
      }
      break

    case 'models':
      currentPage = 'models'
      renderModels(container)
      break

    case 'animations':
      currentPage = 'animations'
      renderAnimations(container)
      break

    case 'writings':
      currentPage = 'writings'
      // /writings → hub
      // /writings/:catId → category
      // /writings/:catId/:postId → post
      renderWritings(container, sub1, sub2)
      break

    case 'messages':
      currentPage = 'messages'
      renderMessages(container)
      break

    case 'admin':
      currentPage = 'admin'
      renderAdmin(container)
      break

    default:
      container.innerHTML = `
        <div class="container" style="padding-top:120px;text-align:center;">
          <div class="empty-state">
            <div class="empty-state-icon">🌌</div>
            <div class="empty-state-title">Page not found</div>
            <p class="empty-state-desc">This page doesn't exist in this universe.</p>
            <a href="#/" class="btn btn-primary" style="margin-top:24px">← Back Home</a>
          </div>
        </div>
      `
  }

  updateMessageBadge()
  // Trigger reveal for new page content
  setTimeout(initScrollReveal, 100)
}

// ==========================================
// NAV ACTIVE STATES
// ==========================================
function updateNavActive(page) {
  document.querySelectorAll('.nav-link, .mobile-link').forEach(link => {
    const linkPage = link.dataset.page
    const isActive = (page === '' && linkPage === 'home') || linkPage === page
    link.classList.toggle('active', isActive)
  })
}

// ==========================================
// HAMBURGER MENU
// ==========================================
function initHamburger() {
  const btn = document.getElementById('hamburger')
  const menu = document.getElementById('mobile-menu')
  if (!btn || !menu) return

  btn.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open')
    btn.setAttribute('aria-expanded', isOpen)
    const spans = btn.querySelectorAll('span')
    if (isOpen) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)'
      spans[1].style.opacity = '0'
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)'
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = '' })
    }
  })

  // Close on link click
  menu.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open')
      btn.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = '' })
    })
  })
}

// ==========================================
// ADMIN MODAL — Chithi Inbox
// ==========================================
function initAdminModal() {
  const adminBtn = document.getElementById('admin-btn')
  const modal = document.getElementById('admin-modal')
  const closeBtn = document.getElementById('admin-modal-close')
  const loginBtn = document.getElementById('admin-login-btn')
  const pwInput = document.getElementById('admin-password')
  const clearBtn = document.getElementById('clear-inbox-btn')

  if (!adminBtn || !modal) return

  adminBtn.addEventListener('click', () => {
    modal.classList.remove('hidden')
    document.body.style.overflow = 'hidden'
    // Reset state
    document.getElementById('admin-auth').classList.remove('hidden')
    document.getElementById('admin-inbox').classList.add('hidden')
    document.getElementById('admin-error').classList.add('hidden')
    if (pwInput) pwInput.value = ''
  })

  closeBtn.addEventListener('click', closeAdmin)
  modal.addEventListener('click', e => { if (e.target === modal) closeAdmin() })

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeAdmin()
  })

  // Login
  loginBtn?.addEventListener('click', () => attemptLogin())
  pwInput?.addEventListener('keydown', e => { if (e.key === 'Enter') attemptLogin() })

  // Clear all
  clearBtn?.addEventListener('click', () => {
    if (confirm('Delete all messages? This cannot be undone.')) {
      localStorage.removeItem('arnob_chithi_messages')
      renderInbox()
      updateMessageBadge()
      showToast('All messages cleared')
    }
  })
}

function attemptLogin() {
  const pw = document.getElementById('admin-password').value
  const errorEl = document.getElementById('admin-error')
  
  if (pw === ADMIN_KEY) {
    sessionStorage.setItem('isAdmin', 'true')
    document.getElementById('admin-auth').classList.add('hidden')
    document.getElementById('admin-inbox').classList.remove('hidden')
    renderInbox()
    markAllRead()
    updateMessageBadge()
  } else {
    sessionStorage.removeItem('isAdmin')
    errorEl.classList.remove('hidden')
    document.getElementById('admin-password').value = ''
    document.getElementById('admin-password').focus()
    errorEl.style.animation = 'none'
    requestAnimationFrame(() => { errorEl.style.animation = '' })
  }
}
function renderInbox() {
  const messages = getMessages()
  const list = document.getElementById('messages-list')
  const countEl = document.getElementById('inbox-count')
  if (!list) return

  countEl.textContent = `${messages.length} ${messages.length === 1 ? 'message' : 'messages'}`

  if (messages.length === 0) {
    list.innerHTML = `<div class="empty-inbox"><div style="font-size:40px;margin-bottom:12px">📭</div><p>No messages yet.</p></div>`
    return
  }

  list.innerHTML = [...messages].reverse().map(msg => `
    <div class="msg-item">
      <div class="msg-item-header">
        <span class="msg-sender">✉️  ${escapeHtml(msg.name || 'Anonymous')}</span>
        <span class="msg-time">${msg.time}</span>
      </div>
      <p class="msg-text">${escapeHtml(msg.message)}</p>
    </div>
  `).join('')
}

function markAllRead() {
  try {
    const messages = getMessages().map(m => ({ ...m, read: true }))
    localStorage.setItem('arnob_chithi_messages', JSON.stringify(messages))
  } catch {}
}

function closeAdmin() {
  document.getElementById('admin-modal').classList.add('hidden')
  document.body.style.overflow = ''
}

// ==========================================
// MESSAGE BADGE
// ==========================================
function updateMessageBadge() {
  const badge = document.getElementById('msg-badge')
  if (!badge) return
  try {
    const unread = getMessages().filter(m => !m.read).length
    if (unread > 0) {
      badge.textContent = unread > 99 ? '99+' : unread
      badge.classList.remove('hidden')
    } else {
      badge.classList.add('hidden')
    }
  } catch {
    badge.classList.add('hidden')
  }
}

// ==========================================
// TOAST
// ==========================================
// Toast is now in utils/adminAuth.js

// ==========================================
// NAVBAR SCROLL EFFECT
// ==========================================
function initNavbarScroll() {
  const navbar = document.getElementById('navbar')
  if (!navbar) return
  window.addEventListener('scroll', () => {
    navbar.style.boxShadow = window.scrollY > 20
      ? '0 4px 24px rgba(0,0,0,0.3)'
      : 'none'
  }, { passive: true })
}

// ==========================================
// HELPERS
// ==========================================
function escapeHtml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// ==========================================
// SCROLL REVEAL OBSERVER
// ==========================================
export function initScrollReveal() {
  const revealCallback = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
        observer.unobserve(entry.target)
      }
    })
  }

  const observer = new IntersectionObserver(revealCallback, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  })

  document.querySelectorAll('.reveal').forEach(el => {
    observer.observe(el)
  })
}

window.addEventListener('chithi-new', () => {
  updateMessageBadge()
  showToast('Chithi sent successfully!')
})

// ==========================================
// INIT
// ==========================================
function init() {
  // Initialize particle background globally
  const particleCanvas = document.getElementById('particle-background-canvas')
  if (particleCanvas) {
    initParticleBackground(particleCanvas)
  }

  // Initialize space background for intro screen
  const spaceCanvas = document.getElementById('space-background-canvas')
  if (spaceCanvas) {
    initSpaceBackground(spaceCanvas)
  }

  initHamburger()
  initAdminModal()
  initNavbarScroll()
  initThemeCustomizer()
  initModeSelector()

  // Init router
  window.addEventListener('hashchange', router)
  router()

  // Initial reveal check
  initScrollReveal()

  // Initial badge count
  updateMessageBadge()
}

// ==========================================
// MODE SELECTOR LOGIC
// ==========================================
function initModeSelector() {
  const selector = document.getElementById('mode-selector')
  const standardBtn = document.getElementById('standard-mode-btn')
  const funBtn = document.getElementById('fun-mode-btn')
  const app = document.getElementById('app')
  const particleCanvas = document.getElementById('particle-background-canvas')
  const spaceCanvas = document.getElementById('space-background-canvas')

  if (!selector || !standardBtn || !funBtn) return

  standardBtn.addEventListener('click', () => {
    selector.classList.add('hidden')
    app.classList.remove('hidden')
    
    // Remove space background
    if (spaceCanvas) {
      gsap.to(spaceCanvas, { opacity: 0, duration: 1, onComplete: () => {
        cleanupSpaceBackground()
        spaceCanvas.remove()
      }})
    }

    // Router will handle rendering
    router()
  })

  funBtn.addEventListener('click', () => {
    selector.classList.add('hidden')
    
    // Remove space background
    if (spaceCanvas) {
      cleanupSpaceBackground()
      spaceCanvas.remove()
    }
    
    // Hide particle background if it's visible
    if (particleCanvas) {
      cleanupParticleBackground()
      particleCanvas.style.display = 'none'
    }
    initFunMode()
  })
}

// Boot
document.addEventListener('DOMContentLoaded', init)
