// Initialize demo user
if (!localStorage.getItem('conferenceUsers')) {
  const demoUser = {
    fullName: 'Demo User',
    email: 'demo@example.com',
    password: 'demo123',
    affiliation: 'Demo University',
    country: 'USA'
  };
  localStorage.setItem('conferenceUsers', JSON.stringify([demoUser]));
}

// Check if user is logged in
window.onload = function () {
  const loggedInUser = localStorage.getItem('loggedInUser');
  if (loggedInUser) {
    const user = JSON.parse(loggedInUser);
    updateAuthUI(true, user.name);
  }
};

// Navigation
function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(sectionId).classList.add('active');

  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  if (typeof event !== 'undefined') event.target.classList.add('active');

  document.getElementById('mainNav').classList.remove('active');
  window.scrollTo(0, 0);
}

function toggleMobileMenu() {
  document.getElementById('mainNav').classList.toggle('active');
}

// Toast notification
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast show ' + type;
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// Contact form
function toggleOtherTopic() {
  const reason = document.getElementById('contactReason').value;
  const otherGroup = document.getElementById('otherTopicGroup');
  const otherInput = document.getElementById('otherTopic');
  if (reason === 'other') {
    otherGroup.style.display = 'block';
    otherInput.required = true;
  } else {
    otherGroup.style.display = 'none';
    otherInput.required = false;
  }
}

function handleContactSubmit(event) {
  event.preventDefault();
  const reason = document.getElementById('contactReason').value;
  const otherTopic = document.getElementById('otherTopic').value;
  if (reason === 'other' && !otherTopic) {
    showToast('Please specify the topic for your question', 'error');
    return;
  }
  showToast('Your message has been submitted successfully! We will contact you soon.', 'success');
  document.getElementById('contactForm').reset();
  document.getElementById('otherTopicGroup').style.display = 'none';
}

// Slideshow
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const indicators = document.querySelectorAll('.indicator');

function showSlide(n) {
  slides.forEach(s => s.classList.remove('active'));
  indicators.forEach(i => i.classList.remove('active'));
  currentSlide = (n + slides.length) % slides.length;
  slides[currentSlide].classList.add('active');
  indicators[currentSlide].classList.add('active');
}

function changeSlide(direction) { showSlide(currentSlide + direction); }
function setSlide(n) { showSlide(n); }

// Auto-advance slideshow
setInterval(() => changeSlide(1), 5000);

// Authentication
function switchAuthTab(tab) {
  const tabs = document.querySelectorAll('.auth-tab');
  const contents = document.querySelectorAll('.form-tab-content');
  tabs.forEach(t => t.classList.remove('active'));
  contents.forEach(c => c.classList.remove('active'));
  if (tab === 'login') {
    tabs[0].classList.add('active');
    document.getElementById('loginForm').classList.add('active');
  } else {
    tabs[1].classList.add('active');
    document.getElementById('registerForm').classList.add('active');
  }
}

function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const users = JSON.parse(localStorage.getItem('conferenceUsers') || '[]');
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    localStorage.setItem('loggedInUser', JSON.stringify({ email: user.email, name: user.fullName }));
    updateAuthUI(true, user.fullName);
    showToast('Welcome back, ' + user.fullName + '!', 'success');
    showSection('conference');
  } else {
    showToast('Invalid email or password', 'error');
  }
}

function handleRegister(event) {
  event.preventDefault();
  const name = document.getElementById('registerName').value;
  const email = document.getElementById('registerEmail').value;
  const affiliation = document.getElementById('registerAffiliation').value;
  const country = document.getElementById('registerCountry').value;
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('registerConfirmPassword').value;

  if (password !== confirmPassword) {
    showToast('Passwords do not match', 'error'); return;
  }
  const users = JSON.parse(localStorage.getItem('conferenceUsers') || '[]');
  if (users.find(u => u.email === email)) {
    showToast('An account with this email already exists', 'error'); return;
  }
  users.push({ fullName: name, email, password, affiliation, country });
  localStorage.setItem('conferenceUsers', JSON.stringify(users));
  showToast('Registration successful! You can now login.', 'success');
  switchAuthTab('login');
  document.getElementById('registerForm').querySelector('form').reset();
}

function handleAuth() {
  const loggedInUser = localStorage.getItem('loggedInUser');
  if (loggedInUser) {
    localStorage.removeItem('loggedInUser');
    updateAuthUI(false, '');
    showToast('You have been logged out', 'success');
    showSection('conference');
  } else {
    showSection('membership');
  }
}

function updateAuthUI(isLoggedIn, userName) {
  const userInfo = document.getElementById('userInfo');
  const authBtn = document.getElementById('authBtn');
  if (isLoggedIn) {
    userInfo.textContent = 'Welcome, ' + userName;
    userInfo.style.display = 'inline';
    authBtn.textContent = 'Logout';
  } else {
    userInfo.style.display = 'none';
    authBtn.textContent = 'Login';
  }
}