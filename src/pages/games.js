// ==========================================
// GAMES PAGE
// ==========================================
import { games as staticGames } from '../data/content.js'
import { renderFooter } from './home.js'
import { getAPIUrl } from '../config/api.js'

let currentFilter = 'all'
let games = []

export async function renderGames(container) {
  currentFilter = 'all'
  
  // Try to fetch from API, then merge with static content
  try {
    const API_URL = getAPIUrl()
    const response = await fetch(`${API_URL}/api/games`)
    if (response.ok) {
      const dbGames = await response.json()
      
      // Intelligent Merge:
      // 1. Start with static games as the base
      const mergedGames = staticGames.map(sg => {
        // Try to find by ID or Title
        const dbGame = dbGames.find(dg => dg.id === sg.id || dg.title.toLowerCase() === sg.title.toLowerCase())
        if (!dbGame) return sg
        
        // Use DB values, but fall back to static if DB value is empty/null
        const merged = { ...sg }
        Object.keys(dbGame).forEach(key => {
          if (dbGame[key] !== null && dbGame[key] !== '' && dbGame[key] !== undefined) {
            merged[key] = dbGame[key]
          }
        })
        return merged
      })

      // 2. Add any games that exist in DB but NOT in static (checking by ID and Title)
      const staticTitles = new Set(staticGames.map(sg => sg.title.toLowerCase()))
      const staticIds = new Set(staticGames.map(sg => sg.id))
      
      const uniqueDbGames = dbGames.filter(dg => 
        !staticIds.has(dg.id) && !staticTitles.has(dg.title.toLowerCase())
      )
      
      games = [...mergedGames, ...uniqueDbGames]
      
      // 3. Post-process: If a web game has a downloadUrl but no embedUrl, swap them
      games = games.map(g => {
        if ((g.type === 'web' || g.type === 'unity') && !g.embedUrl && g.downloadUrl) {
          return { ...g, embedUrl: g.downloadUrl }
        }
        return g
      })
    } else {
      games = staticGames
    }
  } catch (error) {
    console.warn('Failed to fetch games from API, using static content:', error)
    games = staticGames
  }

  container.innerHTML = `
    <div class="page-enter">
      <section class="page-hero">
        <div class="page-hero-inner">
          <div class="section-header" style="margin-bottom:0">
            <p class="section-eyebrow">Portfolio</p>
            <h1 class="section-title">Games</h1>
            <p class="section-subtitle">Play directly in your browser or download to your platform.</p>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="filter-tabs" id="games-filter">
            <button class="filter-tab active" data-filter="all">All Games</button>
            <button class="filter-tab" data-filter="web">🌐 Web / WebGL</button>
            <button class="filter-tab" data-filter="unity">🎮 Unity</button>
            <button class="filter-tab" data-filter="pc">💻 PC Download</button>
            <button class="filter-tab" data-filter="mobile">📱 Mobile</button>
          </div>

          <div class="grid-auto" id="games-grid">
            ${games.map(game => renderGameCard(game)).join('')}
          </div>
        </div>
      </section>
      ${renderFooter()}
    </div>
  `

  // Bind game card click handlers
  bindGameCardHandlers()

  // Filter logic
  document.getElementById('games-filter').addEventListener('click', e => {
    const tab = e.target.closest('.filter-tab')
    if (!tab) return
    document.querySelectorAll('#games-filter .filter-tab').forEach(t => t.classList.remove('active'))
    tab.classList.add('active')
    currentFilter = tab.dataset.filter
    filterGames()
  })
}

function bindGameCardHandlers() {
  const grid = document.getElementById('games-grid')
  grid.querySelectorAll('.game-card').forEach(card => {
    card.addEventListener('click', () => {
      window.location.hash = `/games/${card.dataset.id}`
    })
  })
}

function filterGames() {
  const grid = document.getElementById('games-grid')
  const filtered = currentFilter === 'all' ? games : games.filter(g => g.type === currentFilter)
  grid.innerHTML = filtered.length
    ? filtered.map(g => renderGameCard(g)).join('')
    : `<div class="empty-state" style="grid-column:1/-1">
        <div class="empty-state-icon">🎮</div>
        <div class="empty-state-title">No games yet</div>
        <p class="empty-state-desc">Games in this category will appear here.</p>
      </div>`
  
  // Bind click handlers to newly rendered cards
  bindGameCardHandlers()
}

function renderGameCard(game) {
  const typeColor = { web: 'cyan', unity: 'purple', pc: 'green', mobile: 'pink' }
  const typeLabel = { web: '🌐 WebGL', unity: '🎮 Unity', pc: '💻 PC', mobile: '📱 Mobile' }
  return `
    <div class="game-card" data-id="${game.id}" style="cursor:pointer">
      <div class="game-card-thumb">
        ${game.thumbnail
          ? `<img src="${game.thumbnail}" alt="${game.title}" loading="lazy">`
          : `<div class="game-card-thumb-placeholder">🎮</div>`
        }
        <div class="game-card-overlay">
          <button class="game-play-btn">${game.type === 'pc' || game.type === 'mobile' ? '⬇ Download' : '▶ Play'}</button>
        </div>
        ${game.featured ? '<span class="badge badge-purple" style="position:absolute;top:12px;left:12px;">⭐ Featured</span>' : ''}
      </div>
      <div class="game-card-body">
        <h3 class="game-card-title">${game.title}</h3>
        <p class="game-card-desc">${game.description}</p>
      </div>
      <div class="game-card-footer">
        <span class="badge badge-${typeColor[game.type] || 'purple'}">${typeLabel[game.type] || game.platform}</span>
        <span style="font-size:var(--text-xs);color:var(--text-muted)">${game.year}</span>
      </div>
    </div>
  `
}

// Click binding (called from router after render)
export function bindGameCards() {
  document.querySelectorAll('.game-card').forEach(card => {
    card.addEventListener('click', () => {
      window.location.hash = `/games/${card.dataset.id}`
    })
  })
}

// ==========================================
// GAME DETAIL PAGE
// ==========================================
export function renderGameDetail(container, gameId) {
  const game = games.find(g => g.id === gameId)
  if (!game) {
    container.innerHTML = `<div class="container section"><div class="empty-state"><div class="empty-state-icon">😕</div><div class="empty-state-title">Game not found</div><a href="#/games" class="btn btn-secondary" style="margin-top:16px">Back to Games</a></div></div>`
    return
  }

  const typeLabel = { web: '🌐 WebGL', unity: '🎮 Unity', pc: '💻 PC', mobile: '📱 Mobile' }

  container.innerHTML = `
    <div class="page-enter">
      <section class="section">
        <div class="container">
          <button class="back-btn" onclick="history.back()">← Back to Games</button>

          <div class="game-detail-header">
            <div class="game-detail-cover">
              ${game.thumbnail
                ? `<img src="${game.thumbnail}" alt="${game.title}">`
                : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:72px;background:var(--bg-tertiary)">🎮</div>`
              }
            </div>
            <div class="game-detail-info">
              <div class="game-detail-tags">
                <span class="badge badge-purple">${typeLabel[game.type] || game.platform}</span>
                ${game.tags.map(t => `<span class="badge badge-cyan">${t}</span>`).join('')}
                <span class="badge badge-green">${game.year}</span>
              </div>
              <h1 class="game-title">${game.title}</h1>
              <p class="game-detail-desc">${game.description}</p>
              <div class="game-detail-actions">
                ${game.embedUrl
                  ? `<button class="btn btn-primary" id="play-btn">▶ Play Now</button>`
                  : ''
                }
                ${game.downloadUrl
                  ? `<a href="${game.downloadUrl}" target="_blank" class="btn btn-secondary">⬇ Download</a>`
                  : ''
                }
                ${!game.embedUrl && !game.downloadUrl
                  ? `<span class="btn btn-ghost" style="cursor:default;opacity:0.6">🚧 Coming Soon</span>`
                  : ''
                }
              </div>
            </div>
          </div>

          <!-- Game embed area -->
          <div id="game-embed-area"></div>

          <!-- How to Play -->
          ${game.howToPlay && game.howToPlay.length ? `
            <div class="how-to-play reveal">
              <h3>🕹 How to Play</h3>
              <ul>
                ${game.howToPlay.map(tip => `<li>${tip}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      </section>
      ${renderFooter()}
    </div>
  `

  // Play button
  const playBtn = document.getElementById('play-btn')
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      const area = document.getElementById('game-embed-area')
      if (game.embedUrl) {
        area.innerHTML = `
          <div class="game-iframe-wrapper" id="game-wrapper">
            <button class="fullscreen-btn" id="fullscreen-toggle" title="Toggle fullscreen (F)">⛶ Fullscreen</button>
            <iframe src="${game.embedUrl}" allowfullscreen allow="fullscreen" id="game-iframe"></iframe>
          </div>
        `
        setupFullscreen()
      } else {
        area.innerHTML = `
          <div class="game-iframe-wrapper">
            <div class="iframe-placeholder">
              <span style="font-size:48px">🎮</span>
              <p>Add your game's embed URL to <code>src/data/content.js</code> to enable browser play.</p>
            </div>
          </div>
        `
      }
      area.scrollIntoView({ behavior: 'smooth' })
    })
  }

  // Fullscreen functionality
  function setupFullscreen() {
    const wrapper = document.getElementById('game-wrapper')
    const btn = document.getElementById('fullscreen-toggle')
    const iframe = document.getElementById('game-iframe')

    if (!btn || !wrapper) return

    btn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        // Enter fullscreen
        if (wrapper.requestFullscreen) {
          wrapper.requestFullscreen()
        } else if (wrapper.webkitRequestFullscreen) {
          wrapper.webkitRequestFullscreen()
        } else if (wrapper.mozRequestFullScreen) {
          wrapper.mozRequestFullScreen()
        } else if (wrapper.msRequestFullscreen) {
          wrapper.msRequestFullscreen()
        }
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          document.exitFullscreen()
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen()
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen()
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen()
        }
      }
    })

    // Update button text on fullscreen change
    document.addEventListener('fullscreenchange', updateFullscreenBtn)
    document.addEventListener('webkitfullscreenchange', updateFullscreenBtn)
    document.addEventListener('mozfullscreenchange', updateFullscreenBtn)
    document.addEventListener('msfullscreenchange', updateFullscreenBtn)

    function updateFullscreenBtn() {
      if (document.fullscreenElement) {
        btn.textContent = '⛶ Exit Fullscreen'
        btn.classList.add('fullscreen-active')
      } else {
        btn.textContent = '⛶ Fullscreen'
        btn.classList.remove('fullscreen-active')
      }
    }

    // Keyboard shortcut: F key
    const handleKeydown = (e) => {
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault()
        btn.click()
      }
    }

    document.addEventListener('keydown', handleKeydown)
  }
}
