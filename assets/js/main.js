// =============================================================================
//  GK Tech Software Solution — Static Site JS
// =============================================================================

const WEB3FORMS_KEY = 'ffad0bff-8c0a-4cbe-a50d-c2a113650377';
const GSHEET_URL    = 'https://script.google.com/macros/s/AKfycbwXmX4r4v732AwViBuwtFLHWoOlqkvwLtGwQOW1xGL4LceEkq-hl6gOmMCsiStu__o/exec';

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

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

// ── FORM SUBMISSION ──────────────────────────────────────────────────────────
const form     = document.getElementById('lead-form');
const statusEl = document.getElementById('form-status');
const btn      = document.getElementById('submit-btn');
const btnLabel = document.getElementById('btn-label');

const serviceMap = {
  'ai':       'Artificial Intelligence',
  'web':      'Web Design & Development',
  'social':   'Social Media Marketing',
  'cloud':    'Cloud Storage',
  'software': 'Software Development',
  'app':      'App Development',
  'other':    'Not sure yet'
};

if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();

    const getVal = (id) => {
      const el = document.getElementById(id);
      return el ? (el.value || '').trim() : '';
    };

    const name  = getVal('inp-name');
    const email = getVal('inp-email');
    const phone = getVal('inp-phone');

    const serviceEl   = document.getElementById('inp-service') || document.getElementById('inp-role');
    const rawVal      = serviceEl ? serviceEl.value.trim() : '';
    const selectedText = serviceEl && serviceEl.options && serviceEl.selectedIndex >= 0
      ? serviceEl.options[serviceEl.selectedIndex].text.trim()
      : rawVal;
    
    const service = serviceMap[rawVal] || selectedText || rawVal || 'General Inquiry';
    const message = getVal('inp-message');

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

    try {
      // 1. Web3Forms (Email)
      const w3Req = fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `New Lead: ${name} (${service})`,
          from_name: 'GK Tech Website',
          name,
          email,
          phone,
          service,
          message,
          botcheck: ''
        })
      });

      // 2. Google Sheets
      const sheetParams = new URLSearchParams();
      sheetParams.append('timestamp', new Date().toLocaleString());
      sheetParams.append('name', name);
      sheetParams.append('email', email);
      sheetParams.append('phone', phone);
      sheetParams.append('service', service);
      sheetParams.append('message', message);

      const sheetReq = fetch(GSHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: sheetParams.toString()
      });

      const [w3Res] = await Promise.all([w3Req, sheetReq.catch(() => {})]);
      const w3Data = await w3Res.json();

      if (w3Data.success) {
        showStatus('✅ Request sent! We will reply within one business day.', 'success');
        form.reset();
      } else {
        showStatus('⚠ ' + (w3Data.message || 'Something went wrong.'), 'error');
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
