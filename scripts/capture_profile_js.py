PROFILE_PROMO_JS = """() => {
  const sub = document.querySelector('p.text-slate-500');
  if (sub) sub.textContent = 'Enter your 10-character PAN to verify your identity.';
  document.querySelectorAll('p').forEach((p) => {
    const t = (p.textContent || '').trim();
    if (t.includes('auto-fill') || t.includes('auto-filled') || t.includes('Fetching PAN')) {
      p.style.display = 'none';
    }
  });
  const pan = document.querySelector('input[maxlength="10"], input.uppercase');
  if (pan) {
    pan.value = '';
    pan.placeholder = 'Enter PAN number';
  }
  const name = document.querySelector('input[placeholder*="Full name"]');
  if (name) {
    name.value = '';
    name.removeAttribute('readonly');
  }
  const dob = document.querySelector('input[type="date"]');
  if (dob) {
    dob.value = '';
    dob.removeAttribute('readonly');
  }
}"""
