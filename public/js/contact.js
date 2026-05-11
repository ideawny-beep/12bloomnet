document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    
    const messageDiv = document.getElementById('formMessage');
    messageDiv.style.display = 'block';
    messageDiv.style.background = 'var(--emerald-50)';
    messageDiv.style.color = 'var(--emerald-700)';
    messageDiv.textContent = 'Thank you for your message! We will get back to you soon.';
    
    this.reset();
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
});
