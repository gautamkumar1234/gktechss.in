// =============================================================================
//  GK Tech Software Solution — Contact Form Handler
//  Handles: Contact Us & Lead Inquiry Submissions (Web3Forms + Google Sheets)
// =============================================================================

const CONTACT_WEB3FORMS_KEY = 'ffad0bff-8c0a-4cbe-a50d-c2a113650377';
const CONTACT_GSHEET_URL    = 'https://script.google.com/macros/s/AKfycbwiZp7vdEN69BzlUcJM8MLMf9xmFmPA2Nwt3caRZLf5N9Cttd1TWaXLuYoOBbiplr3P/exec';

const serviceMap = {
  'ai':       'Artificial Intelligence',
  'web':      'Web Design & Development',
  'sap':      'SAP Business One (SAP B1) Support',
  'social':   'Social Media Marketing',
  'cloud':    'Cloud Storage & Infrastructure',
  'software': 'Software Development',
  'app':      'App Development',
  'other':    'Not sure yet'
};

const form     = document.getElementById('lead-form');
const statusEl = document.getElementById('form-status');
const btn      = document.getElementById('submit-btn');
const btnLabel = document.getElementById('btn-label');

function showStatus(msg, type) {
  if (!statusEl) return;
  statusEl.textContent = msg;
  statusEl.style.color = type === 'success' ? '#10B981' : '#EF4444';
  statusEl.style.fontWeight = '500';
}

if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();

    const getVal = (id) => {
      const el = document.getElementById(id);
      return el ? (el.value || '').trim() : '';
    };

    const name    = getVal('inp-name');
    const email   = getVal('inp-email');
    const phone   = getVal('inp-phone');
    const message = getVal('inp-message');

    const serviceEl    = document.getElementById('inp-service') || document.getElementById('inp-role');
    const rawVal       = serviceEl ? serviceEl.value.trim() : '';
    const selectedText = serviceEl && serviceEl.options && serviceEl.selectedIndex >= 0
      ? serviceEl.options[serviceEl.selectedIndex].text.trim()
      : rawVal;

    const service = serviceMap[rawVal] || selectedText || rawVal || 'General Inquiry';

    // Basic validation
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
      // 1. Web3Forms — Email Notification
      const w3Req = fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: CONTACT_WEB3FORMS_KEY,
          subject:    `New Lead: ${name} (${service})`,
          from_name:  'GK Tech Website',
          name,
          email,
          phone,
          service,
          message,
          botcheck: ''
        })
      });

      // 2. Google Sheets — Log Entry (Sends pure POST request matching your doPost Apps Script)
      const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      const sheetPayload = { timestamp, name, email, phone, service, message };

      const sheetPostReq = fetch(CONTACT_GSHEET_URL, {
        method  : 'POST',
        mode    : 'no-cors',
        headers : { 'Content-Type': 'text/plain' },
        body    : JSON.stringify(sheetPayload)
      }).catch(err => console.warn('Google Sheet POST Error:', err));

      const [w3Res] = await Promise.all([w3Req, sheetPostReq]);
      const w3Data  = await w3Res.json();

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
