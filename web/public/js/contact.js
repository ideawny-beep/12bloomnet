// Contact page script
// Handles form submission, client-side validation, and POST to /api/messages
(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');

  function setLoading(isLoading) {
    if (!submitBtn) return;
    submitBtn.disabled = isLoading;
    submitBtn.style.opacity = isLoading ? '0.7' : '';
  }

  function showAlert(message, isError = false) {
    // Create a small unobtrusive alert above the form
    let alertEl = document.getElementById('contact-form-alert');
    if (!alertEl) {
      alertEl = document.createElement('div');
      alertEl.id = 'contact-form-alert';
      alertEl.className = 'mb-4 rounded-xl p-3 text-sm';
      form.parentNode.insertBefore(alertEl, form);
    }
    alertEl.textContent = message;
    alertEl.style.background = isError ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)';
    alertEl.style.color = isError ? '#991b1b' : '#064e3b';
    // auto-dismiss after 6s
    clearTimeout(alertEl._dismissTimer);
    alertEl._dismissTimer = setTimeout(() => {
      if (alertEl) alertEl.remove();
    }, 6000);
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const elements = form.elements;
    const name = elements[0].value.trim();
    const email = elements[1].value.trim();
    const subject = elements[2].value.trim();
    const message = elements[3].value.trim();

    if (!name || !email || !message) {
      showAlert('Please complete your name, email, and message.', true);
      return;
    }

    const payload = {
      name,
      email,
      subject,
      message,
      timestamp: new Date().toISOString()
    };

    try {
      setLoading(true);
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to send message');
      }

      showAlert('Thank you — your message was sent. We will get back to you soon.');
      form.reset();
    } catch (err) {
      console.error('Contact form error:', err);
      showAlert('Unable to send message. Please try again later or email info@bloomnet.org.', true);
    } finally {
      setLoading(false);
    }
  });
})();
