EMAIL_APPLY_JS = """() => {
  const h2 = document.querySelector('h2');
  if (h2) h2.textContent = 'Email address';
  const inp = document.querySelector('input[type="tel"], input[inputmode="numeric"]');
  if (inp) {
    inp.type = 'email';
    inp.removeAttribute('maxLength');
    inp.inputMode = 'email';
    inp.placeholder = 'you@email.com';
    inp.value = 'ramprakash@email.com';
  }
  const span = document.querySelector('label span');
  if (span) span.textContent = 'I agree to receive OTP via email for verification.';
}"""

EMAIL_OTP_JS = """() => {
  const h2 = document.querySelector('h2');
  if (h2) h2.textContent = 'Enter OTP';
  document.querySelectorAll('p').forEach((p) => {
    const t = (p.textContent || '').trim();
    if (t.startsWith('Sent to') || t.includes('+91')) p.textContent = 'Sent to ramprakash@email.com';
    if (t.startsWith('Dev mode OTP')) p.style.display = 'none';
  });
  const btn = document.querySelector('button[type="button"]');
  if (btn && (btn.textContent || '').includes('mobile')) btn.textContent = 'Change email address';
}"""
