
import { writingCategories } from '../data/content.js'
import { getAPIUrl } from '../config/api.js'

// Password key
const ADMIN_KEY = 'arnob1812'
let isAuthenticated = false

export function renderAdmin(container) {
  if (!isAuthenticated) {
    renderLogin(container)
    return
  }

  const categoryOptions = writingCategories.map(cat => 
    `<option value="${cat.id}">${cat.icon} ${cat.title}</option>`
  ).join('')

  container.innerHTML = `
    <div class="page-enter">
      <section class="page-hero">
        <div class="page-hero-inner">
          <div class="section-header" style="margin-bottom:0">
            <p class="section-eyebrow">Creator</p>
            <h1 class="section-title">Admin Panel</h1>
            <p class="section-subtitle">Write posts, upload games, and manage your portfolio.</p>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="admin-tabs">
            <button class="admin-tab active" data-tab="write">Write Post</button>
            <button class="admin-tab" data-tab="manage">Manage Pieces</button>
            <button class="admin-tab" data-tab="animation">Add Animation</button>
            <button class="admin-tab" data-tab="game">Add Game</button>
            <button class="admin-tab" data-tab="model">Upload Model</button>
            <button class="admin-tab" data-tab="inbox">Inbox</button>
          </div>

          <div class="admin-tab-content active" data-tab="write">
            <div class="admin-form-card">
              <h2>Create New Writing Piece</h2>
              <form id="write-form">
                <div class="form-group">
                  <label>Title</label>
                  <input type="text" id="write-title" placeholder="e.g., The Midnight Coffee" required>
                </div>
                
                <div class="form-group">
                  <label>Category</label>
                  <select id="write-category" required>
                    ${categoryOptions}
                  </select>
                </div>

                <div class="form-group">
                  <label>Excerpt (shown on cards)</label>
                  <input type="text" id="write-excerpt" placeholder="A short hook..." required>
                </div>

                <div class="form-group">
                  <label>Full Content (Markdown/HTML supported)</label>
                  <textarea id="write-content" rows="12" placeholder="Write your piece here..." required></textarea>
                  <small>Tip: Use **bold** for bold text, *italic* for italics</small>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Mood/Emoji (optional)</label>
                    <input type="text" id="write-mood" placeholder="e.g., 🌙 or ☀️" maxlength="2">
                  </div>
                  <div class="form-group">
                    <label>Read Time</label>
                    <input type="text" id="write-readtime" placeholder="e.g., 3 min read" value="4 min read">
                  </div>
                </div>

                <button type="submit" class="btn btn-primary" style="width:100%">Create Post Code</button>
                <div id="write-status" class="form-status"></div>
              </form>

              <div class="admin-help">
                <strong>🚀 Auto-Save:</strong> Click the button above to save your post automatically. No copy/paste needed! Backend handles everything.
              </div>
            </div>
          </div>

          <div class="admin-tab-content" data-tab="manage">
            <div class="admin-form-card">
              <h2>Manage Existing Content</h2>
              
              <div class="admin-manage-tabs">
                <button class="manage-subtab active" data-subtab="writings">Writings</button>
                <button class="manage-subtab" data-subtab="games">Games</button>
                <button class="manage-subtab" data-subtab="models">Models</button>
                <button class="manage-subtab" data-subtab="animations">Animations</button>
              </div>

              <div id="manage-content-list" class="admin-manage-list">
                <div class="loading-simple">Select a category to manage...</div>
              </div>
            </div>
          </div>

          <div class="admin-tab-content" data-tab="animation">
            <div class="admin-form-card">
              <h2>Upload Animation</h2>
              <form id="animation-form">

                <div class="form-group">
                  <label>Animation Title</label>
                  <input type="text" id="animation-title" placeholder="e.g., Character Walk Cycle" required>
                </div>

                <div class="form-group">
                  <label>Animation Description</label>
                  <textarea id="animation-desc" placeholder="Describe your animation..." rows="3" required></textarea>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Software Used</label>
                    <input type="text" id="animation-software" placeholder="e.g., Blender, Maya" value="Blender">
                  </div>
                  <div class="form-group">
                    <label>Format</label>
                    <input type="text" id="animation-format" value="MP4">
                  </div>
                </div>

                <div class="form-row">
                   <div class="form-group">
                    <label>Duration</label>
                    <input type="text" id="animation-duration" placeholder="e.g., 0:30">
                  </div>
                  <div class="form-group">
                    <label>Frame Rate</label>
                    <input type="text" id="animation-framerate" value="30fps">
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Resolution</label>
                    <input type="text" id="animation-resolution" value="1080p">
                  </div>
                  <div class="form-group">
                    <label>Year</label>
                    <input type="number" id="animation-year" value="2025">
                  </div>
                </div>

                <div class="form-group">
                  <label>Tags</label>
                  <input type="text" id="animation-tags" placeholder="3D, Character, Animation">
                </div>

                <div class="form-group">
                  <label>Video File (Direct URL or Upload)</label>
                   <input type="file" id="animation-file" accept="video/*" class="form-input">
                </div>

                <div class="form-group">
                  <label>Custom Thumbnail (optional)</label>
                  <input type="file" id="animation-thumb-file" accept="image/*" class="form-input">
                  <div id="animation-thumb-preview" style="margin-top:10px; max-width:200px"></div>
                </div>

                <button type="submit" class="btn btn-primary" style="width:100%">Upload Animation</button>
                <div id="animation-status" class="form-status"></div>
              </form>
            </div>
          </div>

          <div class="admin-tab-content" data-tab="game">
            <div class="admin-form-card">
              <h2>Add New Game</h2>
              <form id="game-form">
                <div class="form-group">
                  <label>Game Title</label>
                  <input type="text" id="game-title" placeholder="e.g., Space Explorer" required>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Type/Engine</label>
                    <input type="text" id="game-type" placeholder="e.g., Three.js, Unity" value="Three.js">
                  </div>
                   <div class="form-group">
                    <label>Platform</label>
                    <input type="text" id="game-platform" value="Web">
                  </div>
                </div>

                <div class="form-row">
                   <div class="form-group">
                    <label>Genre</label>
                    <input type="text" id="game-genre" placeholder="e.g., Adventure, Puzzle">
                  </div>
                  <div class="form-group">
                    <label>Year</label>
                    <input type="number" id="game-year" value="2025">
                  </div>
                </div>

                <div class="form-group">
                  <label>Game Description</label>
                  <textarea id="game-desc" placeholder="Describe the game..." rows="3" required></textarea>
                </div>

                <div class="form-group">
                  <label>Play URL (Direct Play link)</label>
                  <input type="url" id="game-play-url" placeholder="https://...">
                </div>

                 <div class="form-group">
                  <label>Embed URL (for iframe)</label>
                  <input type="url" id="game-embed" placeholder="https://...">
                </div>

                <div class="form-group">
                  <label>Download URL (optional)</label>
                  <input type="url" id="game-download" placeholder="https://...">
                </div>

                <div class="form-group">
                  <label>Cover Image URL (or upload below)</label>
                  <input type="text" id="game-thumb" placeholder="https://...">
                  <input type="file" id="game-thumb-file" accept="image/*" class="form-input" style="margin-top:8px">
                  <div id="game-thumb-preview" style="margin-top:10px; max-width:200px"></div>
                </div>

                <div class="form-group">
                  <label>How to Play (one per line)</label>
                  <textarea id="game-howtop" rows="3" placeholder="WASD to move..."></textarea>
                </div>

                <div class="form-group">
                  <label>Tags</label>
                  <input type="text" id="game-tags" placeholder="3D, Retro, Simulation">
                </div>

                <div class="form-group" style="flex-direction:row; align-items:center; gap:10px">
                  <input type="checkbox" id="game-featured" style="width:auto">
                  <label for="game-featured" style="margin:0">Featured Project</label>
                </div>

                <button type="submit" class="btn btn-primary" style="width:100%">Add Game</button>
                <div id="game-status" class="form-status"></div>
              </form>
            </div>
          </div>

          <div class="admin-tab-content" data-tab="model">
            <div class="admin-form-card">
              <h2>Upload 3D Model</h2>
              <form id="model-form">
                <div class="form-group">
                  <label>Model Title</label>
                  <input type="text" id="model-title" placeholder="e.g., Cyberpunk Cycle" required>
                </div>

                <div class="form-group">
                  <label>Description</label>
                  <textarea id="model-desc" rows="3" placeholder="Details about topology, textures..." required></textarea>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Type</label>
                    <input type="text" id="model-type" value="3D Asset">
                  </div>
                  <div class="form-group">
                    <label>Software</label>
                    <input type="text" id="model-software" value="Blender">
                  </div>
                </div>

                <div class="form-group">
                  <label>Polygon Count</label>
                  <input type="text" id="model-polygons" placeholder="e.g., 24.5k">
                </div>

                <div class="form-group">
                  <label>Model File (GLB required)</label>
                  <input type="file" id="model-file" accept=".glb" required class="form-input">
                </div>

                <div class="form-group">
                  <label>Thumbnail URL (optional)</label>
                  <input type="text" id="model-thumb" placeholder="https://...">
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Year</label>
                    <input type="number" id="model-year" placeholder="2025" value="2025" min="2000" max="2099">
                  </div>
                  <div class="form-group">
                    <label>Tags (comma separated)</label>
                    <input type="text" id="model-tags" placeholder="Character, Humanoid, Rigged">
                  </div>
                </div>

                <button type="submit" class="btn btn-primary" style="width:100%">Create Model Code</button>
                <div id="model-status" class="form-status"></div>
              </form>

              <div class="admin-help">
                <strong>📦 Auto-Upload:</strong> Select your 3D model file and submit. File uploads to Firebase Storage automatically. No manual folder creation needed!
              </div>
            </div>
          </div>

          <div class="admin-tab-content" data-tab="inbox">
            <div class="admin-form-card">
              <h2>Chithi Inbox</h2>
              <div id="admin-inbox-list" class="admin-manage-list">
                <div class="loading-simple">⏳ Loading messages...</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `
  setupAdminPanel(container)
  loadManageContent('writings') // Initial load
}

async function loadManageContent(type) {
  const list = document.getElementById('manage-content-list')
  if (!list) return
  
  if (type === 'inbox') {
    loadInbox()
    return
  }

  list.innerHTML = `<div class="loading-simple">⏳ Loading ${type}...</div>`

  try {
    const API_URL = getAPIUrl()
    const response = await fetch(`${API_URL}/api/${type}`)
    const items = await response.json()

    if (items.length === 0) {
      list.innerHTML = `<p style="color:var(--text-muted);text-align:center;padding:20px;">No ${type} found.</p>`
      return
    }

    list.innerHTML = items.map(item => `
      <div class="manage-item" id="manage-item-${item.id}">
        <div class="manage-item-info">
          <strong>${item.title}</strong>
          ${item.category ? `<span class="badge" style="font-size:10px;padding:2px 6px">${item.category}</span>` : ''}
          ${item.type ? `<span class="badge" style="font-size:10px;padding:2px 6px">${item.type}</span>` : ''}
        </div>
        <button class="btn btn-sm btn-danger" onclick="adminDeletePiece('${item.id}', '${type}')">Delete</button>
      </div>
    `).join('')
  } catch (err) {
    list.innerHTML = `<p style="color:var(--accent-pink);text-align:center;">Failed to load ${type}.</p>`
  }
}

window.adminDeletePiece = async (id, type) => {
  if (!confirm(`Are you sure you want to delete this ${type.slice(0, -1)} forever?`)) return
  
  const ADMIN_KEY = 'arnob1812'
  const API_URL = getAPIUrl()
  
  try {
    const response = await fetch(`${API_URL}/api/${type}/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-key': ADMIN_KEY }
    })
    
    if (response.ok) {
      document.getElementById(`manage-item-${id}`)?.remove()
    } else {
      alert('Delete failed')
    }
  } catch (err) {
    alert('Network error')
  }
}

function setupAdminPanel(container) {
  const API_URL = getAPIUrl()

  // Main Tabs
  document.querySelectorAll('.admin-tab').forEach(btn => {
    btn.addEventListener('click', e => {
      const tab = e.target.dataset.tab
      document.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('active'))
      document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'))
      e.target.classList.add('active')
      const content = document.querySelector('.admin-tab-content[data-tab="' + tab + '"]')
      if (content) content.classList.add('active')
      
      if (tab === 'inbox') loadInbox()
    })
  })

  // Manage Sub-tabs
  document.addEventListener('click', e => {
    if (e.target.classList.contains('manage-subtab')) {
      const type = e.target.dataset.subtab
      document.querySelectorAll('.manage-subtab').forEach(b => b.classList.remove('active'))
      e.target.classList.add('active')
      loadManageContent(type)
    }
  })

  // ---- FORM SUBMITS ----

  const writeForm = document.getElementById('write-form')
  if (writeForm) {
    writeForm.addEventListener('submit', async e => {
      e.preventDefault()
      const status = document.getElementById('write-status')
      const submitBtn = writeForm.querySelector('button[type="submit"]')
      const originalText = submitBtn.textContent

      const payload = {
        category: document.getElementById('write-category').value,
        title: document.getElementById('write-title').value,
        excerpt: document.getElementById('write-excerpt').value,
        content: document.getElementById('write-content').value,
        mood: document.getElementById('write-mood').value || '🌙',
        readTime: document.getElementById('write-readtime').value || '4 min read',
        date: new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })
      }

      try {
        submitBtn.disabled = true
        submitBtn.textContent = '⏳ Saving...'
        const response = await fetch(`${API_URL}/api/writings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-admin-key': ADMIN_KEY },
          body: JSON.stringify(payload)
        })
        const data = await response.json()
        if (data.success) {
          showStatus('write-status', '✅ Post saved!')
          writeForm.reset()
        } else throw new Error(data.error)
      } catch (err) {
        showStatus('write-status', '❌ Error: ' + err.message)
      } finally {
        submitBtn.disabled = false
        submitBtn.textContent = originalText
      }
    })
  }

  // Animation Form
  const animationForm = document.getElementById('animation-form')
  if (animationForm) {
    animationForm.addEventListener('submit', async e => {
      e.preventDefault()
      const status = document.getElementById('animation-status')
      const fileInput = document.getElementById('animation-file')
      const file = fileInput.files[0]
      const submitBtn = animationForm.querySelector('button[type="submit"]')
      const originalText = submitBtn.textContent

      try {
        if (!file) { showStatus('animation-status', '❌ Please select a file'); return }
        submitBtn.disabled = true; submitBtn.textContent = '⏳ Uploading...'
        
        const formData = new FormData()
        formData.append('title', document.getElementById('animation-title').value)
        formData.append('description', document.getElementById('animation-desc').value)
        formData.append('file', file)
        formData.append('software', document.getElementById('animation-software').value)
        formData.append('format', document.getElementById('animation-format').value)
        formData.append('duration', document.getElementById('animation-duration').value)
        formData.append('year', document.getElementById('animation-year').value)
        formData.append('tags', document.getElementById('animation-tags').value)

        const response = await fetch(`${API_URL}/api/animations`, {
          method: 'POST',
          headers: { 'x-admin-key': ADMIN_KEY },
          body: formData
        })
        const data = await response.json()
        if (data.success) {
          showStatus('animation-status', '✅ Animation uploaded!')
          animationForm.reset()
        } else throw new Error(data.error)
      } catch (err) {
        showStatus('animation-status', '❌ Error: ' + err.message)
      } finally {
        submitBtn.disabled = false; submitBtn.textContent = originalText
      }
    })
  }

  // Game Form
  const gameForm = document.getElementById('game-form')
  if (gameForm) {
    gameForm.addEventListener('submit', async e => {
      e.preventDefault()
      const status = document.getElementById('game-status')
      const submitBtn = gameForm.querySelector('button[type="submit"]')
      const originalText = submitBtn.textContent

      try {
        const title = document.getElementById('game-title').value.trim()
        const typeInput = document.getElementById('game-type').value.trim().toLowerCase()
        const platform = document.getElementById('game-platform').value.trim()
        const genre = document.getElementById('game-genre').value.trim()
        const description = document.getElementById('game-desc').value.trim()
        const embedUrl = document.getElementById('game-embed').value.trim()
        const playUrl = document.getElementById('game-play-url').value.trim()
        const downloadUrl = document.getElementById('game-download').value.trim()

        // Backend and UI use these categories for filtering/display.
        const normalizedType = ['web', 'unity', 'pc', 'mobile'].includes(typeInput)
          ? typeInput
          : 'web'

        if (!title || !platform || !genre || !description) {
          showStatus('game-status', '❌ Please fill title, platform, genre, and description')
          return
        }

        submitBtn.disabled = true; submitBtn.textContent = '⏳ Saving...'

        const formData = new FormData()
        formData.append('title', title)
        formData.append('type', normalizedType)
        formData.append('platform', platform)
        formData.append('genre', genre)
        formData.append('description', description)
        formData.append('embedUrl', embedUrl)
        formData.append('downloadUrl', downloadUrl || playUrl)
        formData.append('year', document.getElementById('game-year').value)
        formData.append('tags', document.getElementById('game-tags').value)
        formData.append('featured', document.getElementById('game-featured').checked ? 'true' : 'false')

        const howToPlayLines = document.getElementById('game-howtop').value
          .split('\n')
          .map(line => line.trim())
          .filter(Boolean)
        if (howToPlayLines.length) {
          formData.append('howToPlay', JSON.stringify(howToPlayLines))
        }

        const thumbUrl = document.getElementById('game-thumb').value.trim()
        if (thumbUrl) formData.append('thumbnail', thumbUrl)
        const thumbFile = document.getElementById('game-thumb-file').files?.[0]
        if (thumbFile) formData.append('thumbnailFile', thumbFile)

        console.log('Sending game data to:', `${API_URL}/api/games`)
        const response = await fetch(`${API_URL}/api/games`, {
          method: 'POST',
          headers: { 'x-admin-key': ADMIN_KEY },
          body: formData
        })
        
        const data = await response.json()
        console.log('Server response:', data)

        if (data.success) {
          showStatus('game-status', '✅ Game added!')
          gameForm.reset()
        } else throw new Error(data.error || 'Server returned failure')
      } catch (err) {
        console.error('Submission error:', err)
        showStatus('game-status', '❌ Error: ' + err.message)
      } finally {
        submitBtn.disabled = false; submitBtn.textContent = originalText
      }
    })
  }

  // Model Form
  const modelForm = document.getElementById('model-form')
  if (modelForm) {
    modelForm.addEventListener('submit', async e => {
      e.preventDefault()
      const status = document.getElementById('model-status')
      const submitBtn = modelForm.querySelector('button[type="submit"]')
      const originalText = submitBtn.textContent
      const file = document.getElementById('model-file').files[0]

      try {
        if (!file) { showStatus('model-status', '❌ Please select a GLB file'); return }
        submitBtn.disabled = true; submitBtn.textContent = '⏳ Uploading...'

        const formData = new FormData()
        formData.append('title', document.getElementById('model-title').value)
        formData.append('description', document.getElementById('model-desc').value)
        formData.append('file', file)
        formData.append('type', document.getElementById('model-type').value)
        formData.append('software', document.getElementById('model-software').value)
        formData.append('year', document.getElementById('model-year').value)
        formData.append('tags', document.getElementById('model-tags').value)

        const response = await fetch(`${API_URL}/api/models`, {
          method: 'POST',
          headers: { 'x-admin-key': ADMIN_KEY },
          body: formData
        })
        const data = await response.json()
        if (data.success) {
          showStatus('model-status', '✅ Model uploaded!')
          modelForm.reset()
        } else throw new Error(data.error)
      } catch (err) {
        showStatus('model-status', '❌ Error: ' + err.message)
      } finally {
        submitBtn.disabled = false; submitBtn.textContent = originalText
      }
    })
  }
}

function renderLogin(container) {
  container.innerHTML = `
    <div class="page-enter">
      <section class="section" style="min-height: 80vh; display: flex; align-items: center; justify-content: center;">
        <div class="container">
          <div class="admin-form-card" style="max-width: 400px; margin: 0 auto; text-align: center;">
            <div style="font-size: 48px; margin-bottom: var(--space-4)">🔒</div>
            <h1 class="section-title" style="font-size: var(--text-2xl)">Admin Access</h1>
            <p style="color: var(--text-muted); margin-bottom: var(--space-6)">Only Arnob can manage content here.</p>
            
            <div class="form-group" style="text-align: left">
              <label>Secret Key</label>
              <input type="password" id="admin-page-pw" class="form-input" placeholder="Enter key..." autofocus>
              <p id="login-error" class="admin-error hidden" style="margin-top: 8px">❌ Invalid secret key</p>
            </div>
            
            <button id="admin-page-login" class="btn btn-primary" style="width: 100%; margin-top: var(--space-4)">Unlock Panel</button>
          </div>
        </div>
      </section>
    </div>
  `

  const pwInput = document.getElementById('admin-page-pw')
  const loginBtn = document.getElementById('admin-page-login')
  const errorEl = document.getElementById('login-error')

  const attemptLogin = () => {
    if (pwInput.value === ADMIN_KEY) {
      isAuthenticated = true
      sessionStorage.setItem('isAdmin', 'true')
      renderAdmin(container)
    } else {
      errorEl.classList.remove('hidden')
      pwInput.value = ''
      pwInput.focus()
    }
  }

  loginBtn.addEventListener('click', attemptLogin)
  pwInput.addEventListener('keydown', e => { if (e.key === 'Enter') attemptLogin() })
}

async function loadInbox() {
  const list = document.getElementById('admin-inbox-list')
  if (!list) return

  list.innerHTML = `<div class="loading-simple">⏳ Loading messages...</div>`

  try {
    const { getMessages } = await import('./messages.js')
    const messages = await getMessages()

    if (messages.length === 0) {
      list.innerHTML = `<p style="color:var(--text-muted);text-align:center;padding:20px;">Inbox is empty.</p>`
      return
    }

    list.innerHTML = messages.map(msg => `
      <div class="manage-item" id="msg-item-${msg._id || msg.id}">
        <div class="manage-item-info">
          <div style="display:flex; justify-content:between; align-items:center; gap:10px">
             <strong>From: ${msg.name}</strong>
             ${!msg.read ? `<span class="badge" style="background:var(--accent-pink); font-size:10px">NEW</span>` : ''}
          </div>
          <p style="font-size:13px; margin:5px 0; color:var(--text-secondary)">${msg.message}</p>
          <small style="color:var(--text-muted)">${msg.time}</small>
        </div>
        <div style="display:flex; gap:5px">
           <button class="btn btn-sm" onclick="adminMarkRead('${msg._id || msg.id}')">Read</button>
           <button class="btn btn-sm btn-danger" onclick="adminDeleteMsg('${msg._id || msg.id}')">Delete</button>
        </div>
      </div>
    `).join('')
  } catch (err) {
    list.innerHTML = `<p style="color:var(--accent-pink);text-align:center;">Failed to load messages.</p>`
  }
}

window.adminMarkRead = async (id) => {
  const API_URL = getAPIUrl()
  try {
    await fetch(`${API_URL}/api/messages/${id}/read?key=arnob1812`, { method: 'PATCH' })
    loadInbox()
  } catch (err) { alert('Error marking as read') }
}

window.adminDeleteMsg = async (id) => {
  if (!confirm('Delete this Chithi?')) return
  const API_URL = getAPIUrl()
  try {
    await fetch(`${API_URL}/api/messages/${id}?key=arnob1812`, { method: 'DELETE' })
    loadInbox()
  } catch (err) { alert('Error deleting message') }
}

function showStatus(id, message) {
  const el = document.getElementById(id)
  if (!el) return
  el.textContent = message
  el.classList.add('visible')
  setTimeout(() => el.classList.remove('visible'), 4000)
}

