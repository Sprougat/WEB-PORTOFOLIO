/* ============================================
   LUXURY PORTFOLIO – script.js
   Rafaldo Al Maqdis
   Features:
   - Scroll Progress Indicator
   - Sticky Navbar behavior
   - Super Smooth Scroll (RAF-based)
   - Scroll Reveal Animations
   - Skill Bar Animations
   - GitHub AJAX Fetch
   - Contact Form AJAX (jsonplaceholder)
   - Parallax Hero
   ============================================ */

// ============ SCROLL PROGRESS ============
function updateScrollProgress() {
  const el = document.getElementById('scroll-progress');
  const total = document.documentElement.scrollHeight - window.innerHeight;
  const pct   = (window.scrollY / total) * 100;
  if (el) el.style.width = pct + '%';
}

// ============ NAVBAR ============
function handleNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  if (window.scrollY > 60) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }

  // Active link highlight
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-link');
  let current = '';

  sections.forEach(sec => {
    const top = sec.offsetTop - 100;
    if (window.scrollY >= top) current = sec.getAttribute('id');
  });

  links.forEach(link => {
    link.classList.remove('active-link');
    if (link.getAttribute('href') === '#' + current) {
      link.classList.add('active-link');
    }
  });
}

// ============ SMOOTH SCROLL ============
// Enhanced smooth scroll with easing via requestAnimationFrame
function smoothScrollTo(target, duration = 900) {
  const startY   = window.scrollY;
  const targetEl = document.querySelector(target);
  if (!targetEl) return;

  const navH     = document.getElementById('navbar')?.offsetHeight || 70;
  const endY     = targetEl.getBoundingClientRect().top + window.scrollY - navH;
  const diff     = endY - startY;
  let start      = null;

  function ease(t) {
    // Cubic in-out easing
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function step(timestamp) {
    if (!start) start = timestamp;
    const elapsed  = timestamp - start;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollTo(0, startY + diff * ease(progress));
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

// Attach smooth scroll to all nav links
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (href.length > 1) {
        e.preventDefault();
        smoothScrollTo(href);
        // Close mobile menu if open
        const collapse = document.getElementById('navMenu');
        if (collapse && collapse.classList.contains('show')) {
          const toggler = document.querySelector('.navbar-toggler');
          if (toggler) toggler.click();
        }
      }
    });
  });
}

// ============ SCROLL REVEAL ============
function initScrollReveal() {
  const selectors = '.reveal, .reveal-left, .reveal-right, .reveal-zoom';
  const elements  = document.querySelectorAll(selectors);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Small staggered delay based on sibling index
        const siblings = entry.target.parentElement
          ? [...entry.target.parentElement.children].filter(el => el.matches(selectors))
          : [];
        const idx   = siblings.indexOf(entry.target);
        const delay = idx >= 0 ? idx * 100 : 0;

        setTimeout(() => {
          entry.target.classList.add('active');
        }, delay);

        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

// ============ SKILL BAR ANIMATION ============
function initSkillBars() {
  const bars = document.querySelectorAll('.skill-item');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const item  = entry.target;
        const value = parseInt(item.getAttribute('data-value')) || 0;
        const fill  = item.querySelector('.skill-fill');
        if (fill) {
          // Small delay so CSS transition runs after paint
          requestAnimationFrame(() => {
            setTimeout(() => { fill.style.width = value + '%'; }, 200);
          });
        }
        observer.unobserve(item);
      }
    });
  }, { threshold: 0.3 });

  bars.forEach(bar => observer.observe(bar));
}

// ============ PARALLAX HERO ============
function parallaxHero() {
  const hero   = document.querySelector('.hero-section');
  const shapes = document.querySelectorAll('.shape');
  if (!hero) return;

  const scrolled = window.scrollY;
  const rate     = scrolled * 0.3;

  // Subtle parallax on hero content
  const content = hero.querySelector('.hero-content');
  if (content) {
    content.style.transform = `translateY(${rate * 0.2}px)`;
  }

  // Shapes move at different speeds
  shapes.forEach((shape, i) => {
    const speed = 0.05 * (i + 1);
    shape.style.transform = `translateY(${scrolled * speed}px)`;
  });
}

// ============ GITHUB API (AJAX) ============
async function fetchGitHubRepos() {
  const container = document.getElementById('github-repos');
  if (!container) return;

  // Use a fallback username; replace "rafaldo" with actual GitHub handle if needed
  const username = 'torvalds'; // placeholder for demo purposes
  const url      = `https://api.github.com/users/Sprougat/repos?sort=updated&per_page=6`;

  try {
    const response = await fetch(url);

    if (!response.ok) throw new Error('GitHub API error: ' + response.status);

    const repos = await response.json();

    if (!repos || repos.length === 0) {
      container.innerHTML = `<div class="col-12 text-center"><p class="text-muted">No repositories found.</p></div>`;
      return;
    }

    container.innerHTML = '';

    repos.slice(0, 6).forEach((repo, i) => {
      const lang     = repo.language || 'N/A';
      const stars    = repo.stargazers_count || 0;
      const forks    = repo.forks_count || 0;
      const desc     = repo.description || 'No description provided.';
      const url      = repo.html_url;

      const card = document.createElement('div');
      card.className = 'col-lg-4 col-md-6 reveal';
      card.style.transitionDelay = (i * 0.1) + 's';
      card.innerHTML = `
        <a href="${url}" target="_blank" rel="noopener" style="display:block;height:100%;">
          <div class="gh-card">
            <h5><i class="bi bi-github me-2"></i>${repo.name}</h5>
            <p>${desc.slice(0, 100)}${desc.length > 100 ? '…' : ''}</p>
            <div class="gh-meta">
              <span><i class="bi bi-circle-fill" style="font-size:0.5rem;color:var(--gold)"></i> ${lang}</span>
              <span><i class="bi bi-star"></i> ${stars}</span>
              <span><i class="bi bi-diagram-2"></i> ${forks}</span>
            </div>
          </div>
        </a>`;
      container.appendChild(card);
    });

    // Re-observe newly added cards
    document.querySelectorAll('#github-repos .reveal').forEach(el => {
      // Trigger with short delay
      setTimeout(() => el.classList.add('active'), 100);
    });

  } catch (err) {
    console.warn('GitHub fetch failed:', err.message);
    container.innerHTML = `
      <div class="col-12 text-center">
        <p style="color:#555;font-size:0.85rem;">
          <i class="bi bi-github me-2"></i>Could not load GitHub repositories.
          <br><a href="https://github.com" target="_blank" style="color:var(--gold)">View on GitHub</a>
        </p>
      </div>`;
  }
}

// ============ CONTACT FORM (AJAX) ============
async function sendContact() {
  const nameEl    = document.getElementById('contact-name');
  const emailEl   = document.getElementById('contact-email');
  const msgEl     = document.getElementById('contact-message');
  const btn       = document.getElementById('send-btn');
  const btnText   = document.getElementById('btn-text');
  const btnLoader = document.getElementById('btn-loader');
  const result    = document.getElementById('form-result');

  const name    = nameEl?.value.trim();
  const email   = emailEl?.value.trim();
  const message = msgEl?.value.trim();

  // Basic validation
  if (!name || !email || !message) {
    result.innerHTML = `<div class="alert-error-luxury"><i class="bi bi-exclamation-triangle me-2"></i>Please fill in all fields.</div>`;
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    result.innerHTML = `<div class="alert-error-luxury"><i class="bi bi-exclamation-triangle me-2"></i>Please enter a valid email address.</div>`;
    return;
  }

  // Show loading state
  btn.disabled   = true;
  btnText.classList.add('d-none');
  btnLoader.classList.remove('d-none');
  result.innerHTML = '';

  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title:  `Message from ${name}`,
        body:   message,
        userId: 1,
        name,
        email
      })
    });

    if (!response.ok) throw new Error('Server error: ' + response.status);

    const data = await response.json();
    console.log('Message sent (simulated):', data);

    // Success
    result.innerHTML = `<div class="alert-success-luxury"><i class="bi bi-check-circle me-2"></i>Message sent successfully! I'll get back to you soon.</div>`;
    nameEl.value  = '';
    emailEl.value = '';
    msgEl.value   = '';

  } catch (err) {
    result.innerHTML = `<div class="alert-error-luxury"><i class="bi bi-x-circle me-2"></i>Failed to send message. Please try again.</div>`;
    console.error('Send error:', err);

  } finally {
    btn.disabled = false;
    btnText.classList.remove('d-none');
    btnLoader.classList.add('d-none');
  }
}

// ============ SCROLL EVENT (combined) ============
function onScroll() {
  updateScrollProgress();
  handleNavbar();
  parallaxHero();
}

// ============ INIT ============
document.addEventListener('DOMContentLoaded', () => {
  initSmoothScroll();
  initScrollReveal();
  initSkillBars();
  fetchGitHubRepos();

  // Trigger initial state
  onScroll();
});

window.addEventListener('scroll', onScroll, { passive: true });

// Expose sendContact globally for inline onclick
window.sendContact = sendContact;
