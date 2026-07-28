// =============================================================================
//  GK Tech Software Solution — Static Site JS
// =============================================================================

const WEB3FORMS_KEY = 'ffad0bff-8c0a-4cbe-a50d-c2a113650377';
const GSHEET_URL    = 'https://script.google.com/macros/s/AKfycbwXmX4r4v732AwViBuwtFLHWoOlqkvwLtGwQOW1xGL4LceEkq-hl6gOmMCsiStu__o/exec';

// 1. Year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// 2. Scroll Progress & Navigation
const progress     = document.getElementById('progress');
const nav          = document.getElementById('nav');
const scrollTopBtn = document.getElementById('scroll-top');

window.addEventListener('scroll', () => {
  const h = document.documentElement;
  const pct = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
  if (progress) progress.style.width = pct + '%';
  if (nav) nav.classList.toggle('scrolled', h.scrollTop > 10);
  if (scrollTopBtn) scrollTopBtn.classList.toggle('visible', h.scrollTop > 400);
  updateActiveNav();
});

const navLinks = document.querySelectorAll('.nav-link[data-section]');
const sections = ['top', 'services', 'about', 'team', 'testimonials', 'contact'];

function updateActiveNav() {
  const scrollY = window.scrollY + 100;
  let current = 'top';
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el && el.offsetTop <= scrollY) current = id;
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.dataset.section === current);
  });
}
updateActiveNav();

// 3. Mobile Menu
const menuBtn    = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

window.toggleMenu = function () {
  if (!mobileMenu || !menuBtn) return;
  const isOpen = mobileMenu.classList.toggle('open');
  menuBtn.classList.toggle('open', isOpen);
  menuBtn.setAttribute('aria-expanded', isOpen);
};

window.closeMenu = function () {
  if (!mobileMenu || !menuBtn) return;
  mobileMenu.classList.remove('open');
  menuBtn.classList.remove('open');
};

document.addEventListener('click', e => {
  if (nav && !nav.contains(e.target)) closeMenu();
});

// 4. Rotating Headline Word
const words   = ['AI-powered apps', 'web platforms', 'mobile apps', 'SAP support', 'cloud infrastructure'];
let wi        = 0;
const rotator = document.getElementById('rotator');
if (rotator) {
  setInterval(() => {
    wi = (wi + 1) % words.length;
    rotator.style.opacity = 0;
    setTimeout(() => {
      rotator.textContent = words[wi];
      rotator.style.opacity = 1;
    }, 250);
  }, 2400);
}

// 5. Scroll Animations
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => io.observe(el));
}

const counters = document.querySelectorAll('.counter');
if (counters.length) {
  const cio = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const dur = 1400;
      const start = performance.now();
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
}

// 6. CONTACT FORM SUBMIT (Using Exact 5 IDs)
const form     = document.getElementById('lead-form');
const statusEl = document.getElementById('form-status');
const btn      = document.getElementById('submit-btn');
const btnLabel = document.getElementById('btn-label');

if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();

    // Exact 5 IDs matching your form:
    const name    = (document.getElementById('inp-name')?.value || '').trim();
    const email   = (document.getElementById('inp-email')?.value || '').trim();
    const phone   = (document.getElementById('inp-phone')?.value || '').trim();
    const service = (document.getElementById('inp-service')?.value || document.getElementById('inp-role')?.value || '').trim();
    const message = (document.getElementById('inp-message')?.value || '').trim();

    if (!name) {
      showStatus('⚠ Please enter your name.', 'error');
      return;
    }
    if (!email || !email.includes('@')) {
      showStatus('⚠ Please enter a valid email ID.', 'error');
      return;
    }

    if (btn) btn.disabled = true;
    if (btnLabel) btnLabel.textContent = 'Sending... ⏳';
    if (statusEl) statusEl.textContent = '';

    const payload = { name, email, phone, service, message };

    try {
      // Send Email via Web3Forms
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `New Lead from ${name} (${service})`,
          from_name: 'GK Tech Website',
          name,
          email,
          phone,
          service,
          message,
          botcheck: ''
        }),
      });
      const data = await res.json();

      // Log in Google Sheet
      if (GSHEET_URL) {
        fetch(GSHEET_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, timestamp: new Date().toISOString() }),
        }).catch(() => {});
      }

      if (data.success) {
        showStatus('✅ Request sent! We will reply within one business day.', 'success');
        form.reset();
      } else {
        showStatus('⚠ ' + (data.message || 'Something went wrong.'), 'error');
      }
    } catch (err) {
      showStatus('⚠ Network error. Please email sapb1.gktechss@gmail.com directly.', 'error');
    } finally {
      if (btn) btn.disabled = false;
      if (btnLabel) btnLabel.textContent = 'Send Request →';
    }
  });
}

function showStatus(msg, type) {
  if (!statusEl) return;
  statusEl.textContent = msg;
  statusEl.style.color = type === 'success' ? '#10B981' : '#EF4444';
  statusEl.style.fontWeight = '500';
}
