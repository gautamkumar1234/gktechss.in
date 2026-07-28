// =============================================================================
//  GK Tech Software Solution — Main Frontend Script
//  File: assets/js/main.js
// =============================================================================

/* ── Year ─────────────────────────────────────────────────────────────────── */
document.getElementById('year').textContent = new Date().getFullYear();

/* ── Scroll Progress Bar + Nav Shadow + Scroll-to-Top ────────────────────── */
const progress    = document.getElementById('progress');
const nav         = document.getElementById('nav');
const scrollTopBtn = document.getElementById('scroll-top');

window.addEventListener('scroll', () => {
  const h   = document.documentElement;
  const pct = h.scrollTop / (h.scrollHeight - h.clientHeight) * 100;
  if (progress) progress.style.width = pct + '%';
  if (nav)      nav.classList.toggle('scrolled', h.scrollTop > 10);
  if (scrollTopBtn) scrollTopBtn.classList.toggle('visible', h.scrollTop > 400);
  updateActiveNav();
});

/* ── Active Nav Link on Scroll ────────────────────────────────────────────── */
const navLinks = document.querySelectorAll('.nav-link[data-section]');
const sections  = ['top', 'services', 'about', 'team', 'testimonials', 'contact'];

function updateActiveNav() {
  const scrollY = window.scrollY + 100;
  let current   = 'top';
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el && el.offsetTop <= scrollY) current = id;
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.dataset.section === current);
  });
}
updateActiveNav();

/* ── Mobile Hamburger Menu ────────────────────────────────────────────────── */
const menuBtn    = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

window.toggleMenu = function () {
  const isOpen = mobileMenu.classList.toggle('open');
  menuBtn.classList.toggle('open', isOpen);
  menuBtn.setAttribute('aria-expanded', isOpen);
};

window.closeMenu = function () {
  mobileMenu.classList.remove('open');
  menuBtn.classList.remove('open');
};

document.addEventListener('click', e => {
  if (nav && !nav.contains(e.target)) closeMenu();
});

/* ── Rotating Headline Word ───────────────────────────────────────────────── */
const words   = ['AI-powered apps', 'web platforms', 'mobile apps', 'SAP support', 'cloud infrastructure'];
let wi        = 0;
const rotator = document.getElementById('rotator');
if (rotator) {
  setInterval(() => {
    wi = (wi + 1) % words.length;
    rotator.style.opacity = 0;
    setTimeout(() => {
      rotator.textContent  = words[wi];
      rotator.style.opacity = 1;
    }, 250);
  }, 2400);
}

/* ── Scroll Reveal (IntersectionObserver) ─────────────────────────────────── */
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => io.observe(el));

/* ── Animated Counters ────────────────────────────────────────────────────── */
const counters = document.querySelectorAll('.counter');
const cio = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el     = entry.target;
    const target = parseInt(el.dataset.target, 10);
    const dur    = 1400;
    const start  = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.floor(p * target);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    }
    requestAnimationFrame(tick);
    cio.unobserve(el);
  });
}, { threshold: 0.4 });
counters.forEach(el => cio.observe(el));

/* ── Dynamic CMS Content Loading ─────────────────────────────────────────── */
async function loadDynamicContent() {
  try {
    const res  = await fetch('/api/content');
    const data = await res.json();
    if (!data.success) return;

    // Render Team cards dynamically
    if (data.team && data.team.length) {
      const teamGrid = document.getElementById('team-grid');
      if (teamGrid) {
        teamGrid.innerHTML = data.team.map(t => `
          <div class="card rounded-2xl p-7 text-center">
            <div class="avatar-wrap">
              <img src="${t.image || 'assets/images/khushbu.jpg'}" alt="${t.name}" class="w-full h-full object-cover">
            </div>
            <h3 class="font-display font-semibold mt-4 text-base" style="color:var(--brand);">${t.name}</h3>
            <p class="text-sm mt-1" style="color:var(--muted);">${t.role}</p>
            <div class="mt-5 pt-5 border-t flex items-center justify-center gap-4" style="border-color:var(--line);">
              ${t.facebook  ? `<a href="${t.facebook}"  target="_blank" aria-label="Facebook"  class="social-icon">${fbSVG()}</a>`  : ''}
              ${t.instagram ? `<a href="${t.instagram}" target="_blank" aria-label="Instagram" class="social-icon">${igSVG()}</a>`  : ''}
              ${t.linkedin  ? `<a href="${t.linkedin}"  target="_blank" aria-label="LinkedIn"  class="social-icon">${liSVG()}</a>`  : ''}
              ${t.phone     ? `<a href="tel:${t.phone}"               aria-label="Call"      class="social-icon">${phoneSVG()}</a>` : ''}
            </div>
          </div>
        `).join('');
      }
    }

    // Company Settings & Social Links
    if (data.settings) {
      const s = data.settings;
      const setHref = (id, href) => { const el = document.getElementById(id); if (el) { el.href = href; el.target = '_blank'; } };
      if (s.facebook)  setHref('footer-fb',       s.facebook);
      if (s.instagram) setHref('footer-insta',     s.instagram);
      if (s.linkedin)  setHref('footer-linkedin',  s.linkedin);
      if (s.phone) {
        const ph = document.getElementById('footer-phone');
        if (ph) { ph.href = `tel:${s.phone}`; ph.textContent = s.phone; }
      }
      if (s.email) {
        const em = document.getElementById('footer-email');
        if (em) { em.href = `mailto:${s.email}`; em.textContent = s.email; }
      }
      if (s.address) {
        const ad = document.getElementById('footer-address');
        if (ad) ad.textContent = s.address;
      }
      if (s.whatsapp) {
        const wa = document.getElementById('whatsapp-btn');
        if (wa) wa.href = `https://wa.me/${s.whatsapp}?text=Hi%20GK%20Tech%2C%20I%20am%20interested%20in%20your%20services.`;
      }
    }
  } catch (e) {
    console.log('Dynamic content: using static fallback.');
  }
}
loadDynamicContent();

// SVG helpers for team cards
function fbSVG()    { return `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 9h3V6h-3a4 4 0 0 0-4 4v2H8v3h2v6h3v-6h3l1-3h-4v-2a1 1 0 0 1 1-1z"/></svg>`; }
function igSVG()    { return `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1"/></svg>`; }
function liSVG()    { return `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7 10v7M7 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 13v4"/></svg>`; }
function phoneSVG() { return `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M15 3l3 3-1.5 1.5a12 12 0 0 0 4 4L22 10l3 3-2 3a3 3 0 0 1-3 1 18 18 0 0 1-14-14 3 3 0 0 1 1-3z"/></svg>`; }

/* ── Contact Form Submit ──────────────────────────────────────────────────── */
const form     = document.getElementById('lead-form');
const statusEl = document.getElementById('form-status');
const btn      = document.getElementById('submit-btn');
const btnLabel = document.getElementById('btn-label');

if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const payload = Object.fromEntries(new FormData(form).entries());

    if (!payload.name.trim())                               { showStatus('Please enter your name.',         'error'); return; }
    if (!payload.email.trim() || !payload.email.includes('@')) { showStatus('Please enter a valid email.', 'error'); return; }

    btn.disabled         = true;
    btnLabel.textContent = 'Sending...';
    statusEl.textContent = '';

    try {
      const res  = await fetch('/api/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        showStatus("✓ Thank you! We'll be in touch within one business day.", 'success');
        form.reset();
      } else {
        showStatus('⚠ ' + (data.message || 'Something went wrong.'), 'error');
      }
    } catch {
      showStatus('⚠ Server not reachable. Please contact us directly.', 'error');
    } finally {
      btn.disabled         = false;
      btnLabel.textContent = 'Send request →';
    }
  });
}

function showStatus(msg, type) {
  statusEl.textContent = msg;
  statusEl.style.color = type === 'success' ? '#10B981' : '#EF4444';
}
