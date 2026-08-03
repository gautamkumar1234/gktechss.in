// =============================================================================
//  GK Tech Software Solution — Main Site JS
//  Handles: Nav, Scroll, Animations, Counters
//  Form/Email/Google Sheets → see assets/js/form-handler.js
// =============================================================================

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

const progress     = document.getElementById('progress');
const nav          = document.getElementById('nav');
const scrollTopBtn = document.getElementById('scroll-top');
const whatsappBtn  = document.getElementById('whatsapp-btn');

window.addEventListener('scroll', () => {
  const h = document.documentElement;
  const pct = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
  if (progress) progress.style.width = pct + '%';
  if (nav) nav.classList.toggle('scrolled', h.scrollTop > 10);
  
  const isScrollTopVisible = h.scrollTop > 400;
  if (scrollTopBtn) scrollTopBtn.classList.toggle('visible', isScrollTopVisible);
  if (whatsappBtn) whatsappBtn.classList.toggle('shifted', isScrollTopVisible);
  
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
  document.body.style.overflow = isOpen ? 'hidden' : '';
};

window.closeMenu = function () {
  if (!mobileMenu || !menuBtn) return;
  mobileMenu.classList.remove('open');
  menuBtn.classList.remove('open');
  document.body.style.overflow = '';
  
  // Collapse mobile services accordion on menu close
  const accordion = document.getElementById('mobile-services-accordion');
  const chevron   = document.getElementById('mobile-sub-chevron');
  if (accordion) accordion.classList.add('hidden');
  if (chevron) chevron.style.transform = 'rotate(0deg)';
};

window.toggleMobileSubmenu = function (e) {
  if (e) e.stopPropagation();
  const accordion = document.getElementById('mobile-services-accordion');
  const chevron   = document.getElementById('mobile-sub-chevron');
  const button    = e ? e.currentTarget : null;
  
  if (!accordion) return;
  const isHidden = accordion.classList.contains('hidden');
  
  if (isHidden) {
    accordion.classList.remove('hidden');
    if (chevron) chevron.style.transform = 'rotate(180deg)';
    if (button) button.setAttribute('aria-expanded', 'true');
  } else {
    accordion.classList.add('hidden');
    if (chevron) chevron.style.transform = 'rotate(0deg)';
    if (button) button.setAttribute('aria-expanded', 'false');
  }
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

