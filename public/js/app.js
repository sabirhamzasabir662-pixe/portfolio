/**
 * HAMZA PORTFOLIO - CLIENT-SIDE APPLICATION SCRIPT
 * Handles Dynamic API Data Loading, Interactive Contact Form,
 * Mobile Navigation, and Micro-interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initNavbarScroll();
  initActiveNavHighlight();
  initCopyButtons();
  initDynamicProjects();
  initDynamicServices();
  initContactForm();
  updateCurrentYear();
});

/* --------------------------------------------------------------------------
   1. Mobile Navigation
   -------------------------------------------------------------------------- */
function initMobileMenu() {
  const toggleBtn = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  if (!toggleBtn || !navLinks) return;

  toggleBtn.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    toggleBtn.classList.toggle('open', isOpen);
    toggleBtn.setAttribute('aria-expanded', String(isOpen));
  });

  // Close menu on link click
  navLinks.querySelectorAll('.nav-link, .nav-cta').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      toggleBtn.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    });
  });

  // Close menu on click outside
  document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('open') && !navLinks.contains(e.target) && !toggleBtn.contains(e.target)) {
      navLinks.classList.remove('open');
      toggleBtn.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

/* --------------------------------------------------------------------------
   2. Navbar Scroll Blur Effect
   -------------------------------------------------------------------------- */
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const handleScroll = () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/* --------------------------------------------------------------------------
   3. Active Section Link Highlight via IntersectionObserver
   -------------------------------------------------------------------------- */
function initActiveNavHighlight() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach((link) => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, {
    rootMargin: '-30% 0px -60% 0px'
  });

  sections.forEach((section) => observer.observe(section));
}

/* --------------------------------------------------------------------------
   4. Copy to Clipboard Utility
   -------------------------------------------------------------------------- */
function initCopyButtons() {
  const copyButtons = document.querySelectorAll('.copy-btn');
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-message');

  copyButtons.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const textToCopy = btn.getAttribute('data-copy');
      if (!textToCopy) return;

      try {
        await navigator.clipboard.writeText(textToCopy);
        showToast(`Copied ${textToCopy} to clipboard!`);
        
        const copyTextEl = btn.querySelector('.copy-text');
        if (copyTextEl) {
          const originalText = copyTextEl.textContent;
          copyTextEl.textContent = 'Copied!';
          setTimeout(() => {
            copyTextEl.textContent = originalText;
          }, 2000);
        }
      } catch (err) {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast(`Copied to clipboard!`);
      }
    });
  });

  let toastTimeout;
  function showToast(message) {
    if (!toast || !toastMsg) return;
    toastMsg.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
}

/* --------------------------------------------------------------------------
   5. Dynamic Projects Loading (From Node.js Express Backend /api/projects)
   -------------------------------------------------------------------------- */
async function initDynamicProjects() {
  const container = document.getElementById('projects-container');
  if (!container) return;

  try {
    const response = await fetch('/api/projects');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const result = await response.json();

    if (result.success && Array.isArray(result.data) && result.data.length > 0) {
      renderProjects(result.data, container);
    }
  } catch (error) {
    // If backend is not running or serving static file directly, 
    // the pre-rendered HTML in index.html acts as instant fallback
    console.info('[*] Backend API not reached; utilizing pre-rendered project data.');
  }
}

function renderProjects(projects, container) {
  const cardsHtml = projects.map((p, index) => {
    const isPtb = p.title.toLowerCase().includes('tobacco');
    const badgeClass = isPtb ? 'client-badge' : 'client-badge badge-school';
    
    const highlightsHtml = (p.highlights || []).map((h) => `
      <li>
        <svg class="check-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
        </svg>
        <span>${escapeHtml(h)}</span>
      </li>
    `).join('');

    const tagsHtml = (p.tags || []).map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join('');

    // Visual Preview for PTB or School
    let visualHtml = '';
    if (isPtb) {
      visualHtml = `
        <div class="project-visual">
          <div class="project-preview-box">
            <div class="window-bar">
              <span class="window-dot red"></span>
              <span class="window-dot yellow"></span>
              <span class="window-dot green"></span>
              <span class="window-title">ptb-enterprise-system // active-instance</span>
            </div>
            <div class="code-terminal">
              <div class="terminal-line"><span class="cmd-prompt">$</span> status --organization "${escapeHtml(p.client)}"</div>
              <div class="terminal-line text-success"><span class="cmd-output">&gt; System: Operational (99.98% Uptime)</span></div>
              <div class="terminal-line"><span class="cmd-output">&gt; Region: Peshawar, Khyber Pakhtunkhwa</span></div>
              <div class="terminal-line"><span class="cmd-output">&gt; Modules: Record Tracking, User Auth, Compliance</span></div>
              <div class="terminal-line"><span class="cmd-output">&gt; Security: Encrypted at Rest &amp; in Transit</span></div>
              <div class="terminal-line text-accent"><span class="cmd-output">&gt; Status: In Production</span></div>
            </div>
            <div class="project-highlight-badge">
              <svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              <span>Flagship Enterprise Project</span>
            </div>
          </div>
        </div>
      `;
    } else {
      visualHtml = `
        <div class="project-visual">
          <div class="project-preview-box">
            <div class="window-bar">
              <span class="window-dot red"></span>
              <span class="window-dot yellow"></span>
              <span class="window-dot green"></span>
              <span class="window-title">portal-dashboard // production</span>
            </div>
            <div class="mockup-ui">
              <div class="mockup-header-row">
                <div class="mock-avatar"></div>
                <div class="mock-text-col">
                  <span class="mock-name">${escapeHtml(p.client)}</span>
                  <span class="mock-sub">${escapeHtml(p.category)}</span>
                </div>
              </div>
              <div class="mockup-stats-row">
                <div class="mock-stat-box">
                  <span class="mock-num">1,200+</span>
                  <span class="mock-label">Students Tracked</span>
                </div>
                <div class="mock-stat-box">
                  <span class="mock-num">100%</span>
                  <span class="mock-label">Paperless Fees</span>
                </div>
                <div class="mock-stat-box">
                  <span class="mock-num">Instant</span>
                  <span class="mock-label">Report Cards</span>
                </div>
              </div>
              <div class="mockup-badge-footer">
                <span class="status-indicator"></span>
                <span>Serving administrators, teachers &amp; students smoothly</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    return `
      <article class="project-card card" id="project-${p.id || index}">
        <div class="project-header">
          <div class="project-meta">
            <span class="${badgeClass}">${escapeHtml(p.sector)}</span>
            <span class="project-year">${escapeHtml(p.category)}</span>
          </div>
          <h3 class="project-title">${escapeHtml(p.title)}</h3>
          <p class="project-tagline">${escapeHtml(p.description)}</p>
        </div>

        <div class="project-body">
          <div class="project-content">
            <h4 class="project-section-heading">Key Deliverables &amp; Features</h4>
            <ul class="project-deliverables">
              ${highlightsHtml}
            </ul>

            <div class="project-tags">
              ${tagsHtml}
            </div>
          </div>

          ${visualHtml}
        </div>
      </article>
    `;
  }).join('');

  container.innerHTML = cardsHtml;
}

/* --------------------------------------------------------------------------
   6. Dynamic Services Loading (From Node.js Express Backend /api/services)
   -------------------------------------------------------------------------- */
async function initDynamicServices() {
  const container = document.getElementById('services-container');
  if (!container) return;

  try {
    const response = await fetch('/api/services');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const result = await response.json();

    if (result.success && Array.isArray(result.data) && result.data.length > 0) {
      renderServices(result.data, container);
    }
  } catch (error) {
    console.info('[*] Using pre-rendered services catalog.');
  }
}

function renderServices(services, container) {
  const servicesHtml = services.map((s) => {
    const featuresHtml = (s.features || []).map((f) => `<li>${escapeHtml(f)}</li>`).join('');
    return `
      <div class="service-card card">
        <div class="service-icon-box">
          <svg class="icon icon-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
        </div>
        <h3 class="service-card-title">${escapeHtml(s.title)}</h3>
        <p class="service-card-desc">${escapeHtml(s.description)}</p>
        <ul class="service-card-features">
          ${featuresHtml}
        </ul>
      </div>
    `;
  }).join('');

  container.innerHTML = servicesHtml;
}

/* --------------------------------------------------------------------------
   7. Interactive Client Contact Form (POST /api/contact)
   -------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const alertBox = document.getElementById('form-alert');
  const submitBtn = document.getElementById('contact-submit-btn');
  const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;
  const btnIcon = submitBtn ? submitBtn.querySelector('.btn-icon') : null;
  const btnSpinner = document.getElementById('btn-spinner');
  const quickWaLink = document.getElementById('quick-whatsapp-link');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Reset status alert
    hideAlert();

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const phone = form.phone.value.trim();
    const message = form.message.value.trim();

    // Client-side validations
    if (!name || name.length < 2) {
      showAlert('error', 'Please enter your name (at least 2 characters).');
      form.name.focus();
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      showAlert('error', 'Please enter a valid email address so Hamza can contact you.');
      form.email.focus();
      return;
    }

    if (!message || message.length < 5) {
      showAlert('error', 'Please provide a message or project outline (at least 5 characters).');
      form.message.focus();
      return;
    }

    // Set UI loading state
    setLoading(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, phone, message })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showAlert('success', `✓ ${data.message || 'Thank you! Your message has been sent to Hamza.'}`);
        form.reset();

        // Update pre-filled WhatsApp link with their inquiry for instant dual contact
        if (quickWaLink) {
          const encodedMsg = encodeURIComponent(`Hi Hamza, I just sent you a message through your website form: "${message.substring(0, 100)}..."`);
          quickWaLink.href = `https://wa.me/923109820233?text=${encodedMsg}`;
          quickWaLink.textContent = 'Also send this via WhatsApp for immediate response →';
        }
      } else {
        showAlert('error', data.error || 'Unable to deliver message right now. Please message directly on WhatsApp (03109820233).');
      }
    } catch (err) {
      console.error('Contact form submission error:', err);
      // Helpful fallback if server isn't running
      showAlert('error', 'Could not reach server. You can also chat directly on WhatsApp at 03109820233 or email sabirhamzasabir662@gmail.com.');
    } finally {
      setLoading(false);
    }
  });

  function setLoading(isLoading) {
    if (!submitBtn) return;
    submitBtn.disabled = isLoading;
    if (btnText) btnText.textContent = isLoading ? 'Sending Message...' : 'Send Message';
    if (btnIcon) btnIcon.style.display = isLoading ? 'none' : 'inline-block';
    if (btnSpinner) btnSpinner.style.display = isLoading ? 'inline-block' : 'none';
  }

  function showAlert(type, text) {
    if (!alertBox) return;
    alertBox.className = `form-alert ${type}`;
    alertBox.innerHTML = text;
    alertBox.style.display = 'block';
  }

  function hideAlert() {
    if (!alertBox) return;
    alertBox.style.display = 'none';
    alertBox.className = 'form-alert';
    alertBox.innerHTML = '';
  }
}

/* --------------------------------------------------------------------------
   8. Footer Dynamic Year
   -------------------------------------------------------------------------- */
function updateCurrentYear() {
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

/* --------------------------------------------------------------------------
   9. Helper: HTML Sanitization
   -------------------------------------------------------------------------- */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
