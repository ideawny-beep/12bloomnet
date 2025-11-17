document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    
    const messageDiv = document.getElementById('formMessage');
    messageDiv.className = 'mt-4 p-4 bg-green-100 text-green-700 rounded';
    messageDiv.textContent = 'Thank you for your message! We will get back to you soon.';
    messageDiv.classList.remove('hidden');
    
    this.reset();
    
    setTimeout(() => {
        messageDiv.classList.add('hidden');
    }, 5000);
});
