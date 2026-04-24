// ==========================================
// HOME PAGE
// ==========================================
import { games, models, animations, writings } from '../data/content.js'

export function renderHome(container) {
  container.innerHTML = `
    <div class="page-enter">
      <!-- UNIFIED GLASS PANEL CONTAINER (Global) -->
      <!-- Content will be wrapped globally -->

      <!-- HERO SECTION -->
      <section class="home-hero">
        <div class="hero-content">
          <div class="hero-profile">
            <div class="hero-profile-image-wrap">
              <img src="/arnob.png" alt="MD. Al-Amin Mozumder" class="hero-profile-image">
            </div>
            <div class="hero-profile-content">
              <h1 class="hero-profile-name">MD. Al-Amin Mozumder<br>Arnob</h1>
              <p class="hero-profile-title">3D Artist, Animator, and Developer</p>
              <p class="hero-profile-description">
                with expertise in Blender, Unity, Threejs, and Photoshop, delivering creative and technical solutions.
              </p>
              <a href="#/writings" class="hero-story-link">My Story-></a>
              <div class="hero-socials">
                <a href="https://linkedin.com" class="social-icon linkedin-icon" aria-label="LinkedIn" title="LinkedIn">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/></svg>
                </a>
                <a href="https://instagram.com/arnob_mozumder" class="social-icon instagram-icon" aria-label="Instagram" title="Instagram">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><circle cx="17.5" cy="6.5" r="1.5"/></svg>
                </a>
                <a href="https://facebook.com" class="social-icon facebook-icon" aria-label="Facebook" title="Facebook">
                  <svg viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="https://wa.me/8801621550311" class="social-icon whatsapp-icon" aria-label="WhatsApp" title="WhatsApp">
                  <img src="/whatsapp.png" alt="WhatsApp">
                </a>
                <a href="https://www.fiverr.com/arnob_mozumder" class="social-icon fiverr-icon" aria-label="Fiverr" title="Fiverr">
                  <img src="/fiverr.png" alt="Fiverr">
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ABOUT SECTION -->
      <section class="about-section">
        <div class="about-container">
          <div class="about-left">
            <div class="about-content">
              <h2 class="about-title">Hi, I'm Arnob</h2>
              <p class="about-text">Welcome to my website, <strong>Eunoia</strong>.</p>
              <p class="about-text">This space is a collection of my work, ranging from game development and 3D modeling to animation and writing. Feel free to explore the site and take your time discovering each section.</p>
              <p class="about-text">Before you leave, I would truly appreciate it if you shared a few words in <a href="#/messages" class="about-link">Chithi</a>. You can write anonymously if you prefer, the only thing that matters is your thoughts.</p>
              <p class="about-text">Thank you for visiting, and enjoy exploring.</p>
            </div>
          </div>
          <div class="about-right">
            <div class="about-image-box">
              <img src="/eunoia.png" alt="Eunoia" class="about-image">
            </div>
          </div>
        </div>
      </section>

      <!-- PROFILE SECTION -->
      <section class="profile-section">
        <div class="profile-inner">
          <div class="profile-avatar-wrap">
            <img src="/aru.png" alt="Aru" class="profile-avatar-image">
            <div class="profile-status">
              <span class="status-dot"></span>
              Available for work
            </div>
          </div>
          <div class="profile-info">
            <h2 class="profile-name">How can a miracle ever happen if you hate being delusional?</h2>
            <p class="profile-bio">
              Hello stranger, Welcome.
            </p>
            <p class="profile-bio">
              In a world obsessed with perfection, I find my inspiration in the beauty of imperfection. I call myself an "unpredictable engineer" I refuse to be defined by just one path. My process is simple: try everything.
            </p>
            <p class="profile-bio">
              They say a "jack of all trades is a master of none," but they often forget the rest it is often better than a master of one. I am here to explore my limits and document the journey. Whether I am writing, developing, or designing, My goal is to explore my limits, learn as much as I can, and share that journey here.
            </p>
            <p class="profile-bio">
              I am looking to dive into new challenges and make great memories along the way. I don't have all the answers yet, and that is exactly who I am.
            </p>
            <div class="profile-contacts">
              <a href="https://www.fiverr.com/arnob_mozumder" target="_blank" class="contact-chip fiverr-chip" title="Fiverr">
                <img src="/fiverr.png" alt="Fiverr">
              </a>
              <a href="https://www.facebook.com/amozumder8" target="_blank" class="contact-chip" title="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="https://wa.me/8801621550311" target="_blank" class="contact-chip" title="WhatsApp">
                <img src="/whatsapp.png" alt="WhatsApp">
              </a>
              <a href="#/messages" class="contact-chip" title="Send Chithi">
                <svg viewBox="0 0 24 24" fill="white">
                  <circle cx="12" cy="12" r="12" fill="white"/>
                  <path d="M6 8h12c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2v-8c0-1.1.9-2 2-2zm0 2v2l6 4 6-4v-2l-6 4-6-4z" fill="black"/>
                </svg>
              </a>
            </div>

          </div>
        </div>
      </section>

      <!-- QUICK PREVIEW CARDS -->
      <section class="preview-section">
        <div class="container">
          <div class="section-header reveal">
            <p class="section-eyebrow">Explore</p>
            <h2 class="section-title">What's Inside</h2>
            <p class="section-subtitle">Browse my work across games, 3D art, animations, and writing.</p>
          </div>
          <div class="preview-cards">
            <a href="#/games" class="preview-card reveal" style="--delay:0.1s">
              <div class="preview-icon"><img src="/game.png" alt="Games"></div>
              <div class="preview-label">Games</div>
              <div class="preview-desc">Play web games or download PC games. ${games.length} titles available.</div>
              <div class="preview-arrow">Explore →</div>
            </a>
            <a href="#/models" class="preview-card reveal" style="--delay:0.15s">
              <div class="preview-icon"><img src="/3dmodel.png" alt="3D Models"></div>
              <div class="preview-label">3D Models</div>
              <div class="preview-desc">Interactive 3D viewer. Rotate, zoom, inspect every model.</div>
              <div class="preview-arrow">Explore →</div>
            </a>
            <a href="#/animations" class="preview-card reveal" style="--delay:0.2s">
              <div class="preview-icon"><img src="/animation.png" alt="Animations"></div>
              <div class="preview-label">Animations</div>
              <div class="preview-desc">Video animations and motion work. ${animations.length} pieces.</div>
              <div class="preview-arrow">Explore →</div>
            </a>
            <a href="#/writings" class="preview-card reveal" style="--delay:0.25s">
              <div class="preview-icon"><img src="/writing.png" alt="Writings"></div>
              <div class="preview-label">Writings</div>
              <div class="preview-desc">3 A.M. thoughts, sehri tales, reviews & more.</div>
              <div class="preview-arrow">Explore →</div>
            </a>
            <a href="#/messages" class="preview-card reveal" style="--delay:0.3s">
              <div class="preview-icon"><img src="/chithi.png" alt="Chithi"></div>
              <div class="preview-label">Chithi</div>
              <div class="preview-desc">Send me an anonymous message. I'd love to hear from you.</div>
              <div class="preview-arrow">Write →</div>
            </a>
          </div>
        </div>
      </section>

      ${renderFooter()}
    </div>
  `

  // Initialize scroll reveal animation
  requestAnimationFrame(() => {
    initScrollReveal()
  })
}

export function unmountHome() {
  // Particle background is global, no cleanup needed per-page
}

function initScrollReveal() {
  const els = document.querySelectorAll('.reveal')
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target) } })
  }, { threshold: 0.1 })
  els.forEach(el => obs.observe(el))
}

export function renderFooter() {
  return `
    <footer class="site-footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <div style="display:flex; align-items:center; gap:10px;">
            <div class="logo-mark"><img src="/eunoiaf.png" alt="Eunoia" class="logo-image"></div>
            <span class="logo-text">Eunoia<span class="logo-dot">.</span></span>
          </div>
          <p class="footer-bio">
            Eunoia-a thoughtfully designed workspace where ideas live, grow, and remain secure, built with a vision to organize my work.
          </p>
        </div>
      </div>
      <div class="footer-bottom">
        <p class="footer-copy">© ${new Date().getFullYear()} Arnob Mozumder. All rights reserved.</p>
        <div style="text-align: right;">
          <p class="footer-copy" title="Email" style="margin-bottom: 2px;">amozumder0@gmail.com</p>
          <div class="social-links-mini">
            <a href="https://www.fiverr.com/arnob_mozumder" target="_blank" class="social-link-mini" title="Fiverr">
              <img src="/fiverr.png" alt="Fiverr">
            </a>
            <a href="https://www.facebook.com/amozumder8" target="_blank" class="social-link-mini" title="Facebook">
              <svg viewBox="0 0 24 24" fill="white">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a href="https://wa.me/8801621550311" target="_blank" class="social-link-mini" title="WhatsApp">
              <img src="/whatsapp.png" alt="WhatsApp">
            </a>
            <a href="#/messages" class="social-link-mini" title="Send Chithi">
              <svg viewBox="0 0 24 24" fill="white">
                <circle cx="12" cy="12" r="12" fill="white"/>
                <path d="M6 8h12c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2v-8c0-1.1.9-2 2-2zm0 2v2l6 4 6-4v-2l-6 4-6-4z" fill="black"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  `
}
