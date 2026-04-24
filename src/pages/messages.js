// ==========================================
// MESSAGES PAGE — "CHITHI"
// Messages stored in localStorage
// Only viewable via admin panel (password protected)
// ==========================================
import { renderFooter } from './home.js'
import { initLetterViewer, cleanupLetterViewer } from '../three/letterViewer.js'
import { getAPIUrl } from '../config/api.js'

const MAX_CHARS = 500

export function renderMessages(container) {
  container.innerHTML = `
    <div class="page-enter">
      <section class="messages-page">
        <div class="chithi-header">
          <div id="chithi-3d-container" style="width: 100%; height: 250px; margin-bottom: var(--space-4); cursor: grab;">
            <canvas id="chithi-canvas" style="width: 100%; height: 100%;"></canvas>
          </div>
          <h1 class="chithi-title">Write a Chithi</h1>
          <p class="chithi-subtitle">
            Leave me an anonymous message — about my work, the website,<br>
            or just something you felt like saying. I read every one.
          </p>
        </div>

        <div id="chithi-form-wrap">
          <form class="chithi-form" id="chithi-form" novalidate>
            <div class="form-group">
              <label class="form-label" for="sender-name">Your name <span style="color:var(--text-muted)">(optional)</span></label>
              <input 
                type="text" 
                id="sender-name" 
                class="form-input" 
                placeholder="Anonymous" 
                maxlength="60"
                autocomplete="off"
              />
            </div>
            <div class="form-group">
              <label class="form-label" for="chithi-message">Your message <span style="color:var(--accent-pink)"></span></label>
              <textarea 
                id="chithi-message" 
                class="form-textarea" 
                placeholder="Write anything — feedback, thoughts, a compliment, a question…" 
                maxlength="${MAX_CHARS}"
                required
              ></textarea>
              <span class="char-count"><span id="char-used">0</span> / ${MAX_CHARS}</span>
            </div>
            <div class="form-submit-area">
              <p class="chithi-privacy-note" style="color:white">Only Arnob can read these</p>
              <button type="submit" class="btn btn-primary" id="submit-btn">
                 Post
              </button>
            </div>
          </form>
        </div>
      </section>

      <!-- Decorative chithi count -->
      <div style="text-align:center;padding-bottom:var(--space-12)">
        <p style="color:var(--text-muted);font-size:var(--text-sm)">
          <span id="public-count"></span>
        </p>
      </div>

      ${renderFooter()}
    </div>
  `

  // Live char counter
  const textarea = document.getElementById('chithi-message')
  const charUsed = document.getElementById('char-used')
  textarea.addEventListener('input', () => {
    const len = textarea.value.length
    charUsed.textContent = len
    charUsed.style.color = len > MAX_CHARS * 0.85
      ? 'var(--accent-pink)'
      : 'var(--text-muted)'
  })



  // Form submit
  document.getElementById('chithi-form').addEventListener('submit', async e => {
    e.preventDefault()
    const name = document.getElementById('sender-name').value.trim()
    const message = textarea.value.trim()

    if (!message) {
      textarea.focus()
      textarea.style.borderColor = 'var(--accent-pink)'
      textarea.style.boxShadow = '0 0 0 3px rgba(236,72,153,0.15)'
      return
    }

    const submitBtn = document.getElementById('submit-btn')
    submitBtn.disabled = true
    submitBtn.textContent = 'Delivering...'

    const success = await saveMessage({ name: name || 'Anonymous', message })
    
    if (success) {
      showSuccess()
    } else {
      submitBtn.disabled = false
      submitBtn.textContent = 'Error! Try Again'
    }
  })

  // Init 3D
  const canvas = document.getElementById('chithi-canvas')
  if (canvas) {
    initLetterViewer(canvas)
  }
}

export function unmountMessages() {
  cleanupLetterViewer()
}

// ---- Storage Helpers ----
const STORAGE_KEY = 'arnob_chithi_messages'

export async function getMessages() {
  try {
    const API_URL = getAPIUrl()
    const response = await fetch(`${API_URL}/api/messages?key=arnob1812`)
    if (!response.ok) throw new Error('Failed to fetch messages')
    return await response.json()
  } catch (err) { 
    console.error('Backend error:', err)
    // Fallback to localStorage if backend fails
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
  }
}

async function saveMessage(data) {
  try {
    const API_URL = getAPIUrl()
    const response = await fetch(`${API_URL}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) throw new Error('API delivery failed')
    
    // Also save a local backup
    const messages = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
    messages.push({ ...data, id: Date.now(), time: new Date().toLocaleString() })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    
    window.dispatchEvent(new CustomEvent('chithi-new'))
    return true
  } catch (err) {
    console.error('Chithi save error:', err)
    return false
  }
}

function showSuccess() {
  const wrap = document.getElementById('chithi-form-wrap')
  wrap.innerHTML = `
    <div class="success-message">
      <span class="success-icon"><img src="/static/success.png" class="chithi-success-img" alt="success"></span>
      <h2 class="success-title">Chithi Sent!</h2>
      <p class="success-text">Your message has been delivered. Arnob will read it soon.</p>
      <button class="btn btn-primary" onclick="document.getElementById('chithi-form-wrap').innerHTML=''; window.renderMessages && window.renderMessages()">Send Another</button>
    </div>
  `
  // Re-render properly
  setTimeout(() => {
    const wrap2 = document.getElementById('chithi-form-wrap')
    if (wrap2) {
      wrap2.innerHTML = `
        <div class="success-message">
          <span class="success-icon"><img src="/static/success.png" class="chithi-success-img" alt="success"></span>
          <h2 class="success-title">Chithi Sent!</h2>
          <p class="success-text">Your message has been delivered. Arnob will read it soon.</p>
          <a href="#/" class="btn btn-primary">← Back Home</a>
        </div>
      `
    }
  }, 50)
}
