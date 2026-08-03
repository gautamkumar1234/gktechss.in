// =============================================================================
//  GK Tech Software Solution — Career Form Handler (Ultra Fast Non-Blocking)
// =============================================================================

const CAREER_WEB3FORMS_KEY = 'ffad0bff-8c0a-4cbe-a50d-c2a113650377';
const CAREER_GSHEET_URL    = 'https://script.google.com/macros/s/AKfycbyDSGkvTU0-peQS6X9AjH8zNk9jI-TH5OjlFdNv48nGMBtPzz_Mp1FdpEVVJlsyzWPb/exec';

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => {
      const result = reader.result || '';
      resolve(result.includes(',') ? result.split(',')[1] : result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function handleApplySubmit(e) {
  e.preventDefault();

  const st       = document.getElementById('apply-status');
  const btn      = document.getElementById('apply-btn');
  const jobTitle = (document.getElementById('job-modal-title')?.textContent || '').replace('Apply for: ', '');
  const name     = (document.getElementById('apply-name')?.value    || '').trim();
  const email    = (document.getElementById('apply-email')?.value   || '').trim();
  const phone    = (document.getElementById('apply-phone')?.value   || '').trim();
  const linkedin = (document.getElementById('apply-linkedin')?.value|| '').trim();
  const message  = (document.getElementById('apply-message')?.value || '').trim();
  const fileInp  = document.getElementById('inp-resume');
  const file     = (fileInp && fileInp.files.length > 0) ? fileInp.files[0] : null;
  const fileName = file ? file.name : '';

  if (!name || !email) {
    if (st) { st.textContent = '⚠ Please fill in your name and email.'; st.style.color = '#EF4444'; }
    return;
  }

  if (btn) { btn.disabled = true; btn.textContent = 'Submitting... ⏳'; }
  if (st)  { st.textContent = ''; }

  try {
    // ── 1. Google Sheet Log (Instant non-blocking) ───────────────────────
    const params = new URLSearchParams({
      timestamp : new Date().toLocaleString(),
      name, email, phone,
      position  : jobTitle,
      linkedin, message,
      fileName  : fileName || 'No file'
    });

    fetch(`${CAREER_GSHEET_URL}?${params.toString()}`, {
      method : 'GET',
      mode   : 'no-cors'
    }).catch(() => {});

    // ── 2. Web3Forms Email (Instant parallel request) ────────────────────
    fetch('https://api.web3forms.com/submit', {
      method  : 'POST',
      headers : { 'Content-Type': 'application/json', Accept: 'application/json' },
      body    : JSON.stringify({
        access_key : CAREER_WEB3FORMS_KEY,
        subject    : `New Job Application: ${name} (${jobTitle})`,
        from_name  : 'GK Tech Website',
        name,
        email,
        phone,
        position   : jobTitle,
        linkedin,
        message    : `Position: ${jobTitle}\nLinkedIn: ${linkedin || 'N/A'}\nResume File: ${fileName || 'No file'}\nNotes: ${message || 'N/A'}`,
        botcheck   : ''
      })
    }).catch(() => {});

    // ── 3. Google Drive Resume Upload (Background Async) ────────────────
    if (file) {
      readFileAsBase64(file).then(fileData => {
        fetch(CAREER_GSHEET_URL, {
          method  : 'POST',
          headers : { 'Content-Type': 'text/plain' },
          body    : JSON.stringify({
            email,
            fileName : file.name,
            fileType : file.type || 'application/octet-stream',
            fileData
          })
        }).catch(() => {});
      }).catch(() => {});
    }

    // Immediate UI Success (Lightning fast!)
    st.textContent = '✅ Application submitted! Our HR team will contact you soon.';
    st.style.color = '#10B981';

    setTimeout(() => {
      if (typeof closeModal === 'function') closeModal('apply-modal');
      st.textContent = '';
      e.target.reset();
    }, 1500);

  } catch (err) {
    console.error(err);
    st.textContent = '⚠ Something went wrong. Please email your CV to sapb1.gktechss@gmail.com';
    st.style.color = '#EF4444';
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Submit Application →'; }
  }
}
