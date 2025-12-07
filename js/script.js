// ====================================================================
// GLOBAL INIT
// ====================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Stan logowania + przycisk w headerze
    updateAuthState();

    // Podświetlenie aktywnego linku nawigacji
    updateActiveNavLinks();

    // Slideshow (tylko jeśli istnieją slajdy na stronie)
    if (document.querySelectorAll('#tourismSlideshow .slide').length > 0) {
        startSlideshow();
    }
});

// ====================================================================
// DEMO USER
// ====================================================================

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

// ====================================================================
// AUTHENTICATION (Login, Registration, Logout)
// ====================================================================

/**
 * Aktualizuje UI headera w zależności od stanu logowania.
 * Pokazuje nazwę użytkownika i przycisk Logout, gdy zalogowany.
 * Pokazuje przycisk Login, gdy wylogowany.
 */
function updateAuthState() {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    const userInfo = document.getElementById('userInfo');
    const authBtn = document.getElementById('authBtn');
    const isSubPage = window.location.pathname.includes('/html/');
    const membershipPath = isSubPage ? 'membership.html' : 'html/membership.html';

    if (user && userInfo && authBtn) {
        // Zalogowany
        userInfo.textContent = `Welcome, ${user.name}`;
        userInfo.classList.remove('user-hidden');
        authBtn.textContent = 'Logout';
        authBtn.href = '#';
        authBtn.onclick = (event) => {
            event.preventDefault();
            handleLogout();
        };
    } else if (userInfo && authBtn) {
        // Wylogowany
        userInfo.classList.add('user-hidden');
        userInfo.textContent = '';
        authBtn.textContent = 'Login';
        authBtn.href = membershipPath;
        authBtn.onclick = null;
    }
}

/**
 * Fallback: jeśli gdzieś w HTML jest onclick="handleAuth(event)"
 * to działa analogicznie do updateAuthState (Login/Logout + przekierowanie).
 */
function handleAuth(event) {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    const isSubPage = window.location.pathname.includes('/html/');
    const membershipPath = isSubPage ? 'membership.html' : 'html/membership.html';

    if (user) {
        if (event && event.preventDefault) event.preventDefault();
        handleLogout();
    } else {
        window.location.href = membershipPath;
    }
}

/**
 * Wylogowanie + redirect na stronę główną.
 */
function handleLogout() {
    localStorage.removeItem('loggedInUser');
    showToast('You have been logged out.', 'success');

    setTimeout(() => {
        const isSubPage = window.location.pathname.includes('/html/');
        window.location.href = isSubPage ? '../index.html' : 'index.html';
    }, 1000);
}

/**
 * Logowanie (formularz na stronie membership).
 */
function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const users = JSON.parse(localStorage.getItem('conferenceUsers') || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        localStorage.setItem('loggedInUser', JSON.stringify({ email: user.email, name: user.fullName }));
        showToast(`Welcome back, ${user.fullName}! Redirecting...`, 'success');
        setTimeout(() => {
            // membership.html jest w /html/, index w katalogu wyżej
            window.location.href = '../index.html';
        }, 1500);
    } else {
        showToast('Invalid email or password.', 'error');
    }
}

/**
 * Rejestracja (formularz na stronie membership).
 */
function handleRegister(event) {
    event.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const affiliation = document.getElementById('registerAffiliation').value;
    const country = document.getElementById('registerCountry').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;

    if (password !== confirmPassword) {
        showToast('Passwords do not match.', 'error');
        return;
    }

    const users = JSON.parse(localStorage.getItem('conferenceUsers') || '[]');
    if (users.some(u => u.email === email)) {
        showToast('An account with this email already exists.', 'error');
        return;
    }

    users.push({ fullName: name, email, password, affiliation, country });
    localStorage.setItem('conferenceUsers', JSON.stringify(users));

    showToast('Registration successful! You can now login.', 'success');
    switchAuthTab('login');
    event.target.reset();
}

/**
 * Przełączanie zakładek Login / Register (współpracuje z istniejącym HTML z .auth-tab i .form-tab-content).
 */
function switchAuthTab(tab) {
    const tabs = document.querySelectorAll('.auth-tab');
    const contents = document.querySelectorAll('.form-tab-content');

    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));

    if (tab === 'login') {
        if (tabs[0]) tabs[0].classList.add('active');
        const loginForm = document.getElementById('loginForm');
        if (loginForm) loginForm.classList.add('active');
    } else {
        if (tabs[1]) tabs[1].classList.add('active');
        const registerForm = document.getElementById('registerForm');
        if (registerForm) registerForm.classList.add('active');
    }
}

// ====================================================================
// SECTION NAVIGATION & MOBILE MENU (ze starego kodu, uzupełnione)
// ====================================================================

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(sectionId);
    if (target) target.classList.add('active');

    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    if (typeof event !== 'undefined' && event.target) {
        event.target.classList.add('active');
    }

    const nav = document.getElementById('mainNav');
    if (nav) nav.classList.remove('active');
    window.scrollTo(0, 0);
}

/**
 * Mobile menu (wersja z aria-expanded).
 */
function toggleMobileMenu() {
    const nav = document.getElementById('mainNav');
    const btn = document.querySelector('.mobile-menu-btn');
    if (!nav || !btn) return;
    const isExpanded = nav.classList.toggle('active');
    btn.setAttribute('aria-expanded', isExpanded.toString());
}

// ====================================================================
// TOAST NOTIFICATION (bezpieczna wersja z pierwszego kodu)
// ====================================================================

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => {
        toast.className = toast.className.replace('show', '');
    }, 3000);
}

// ====================================================================
// CONTACT FORM (ze starego kodu)
// ====================================================================

function toggleOtherTopic() {
    const reason = document.getElementById('contactReason')?.value;
    const otherGroup = document.getElementById('otherTopicGroup');
    const otherInput = document.getElementById('otherTopic');

    if (!otherGroup || !otherInput) return;

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
    const reason = document.getElementById('contactReason')?.value;
    const otherTopic = document.getElementById('otherTopic')?.value || '';

    if (reason === 'other' && !otherTopic) {
        showToast('Please specify the topic for your question', 'error');
        return;
    }

    showToast('Your message has been submitted successfully! We will contact you soon.', 'success');
    const form = document.getElementById('contactForm');
    if (form) form.reset();
    const otherGroup = document.getElementById('otherTopicGroup');
    if (otherGroup) otherGroup.style.display = 'none';
}

// ====================================================================
// SLIDESHOW (z pierwszego kodu, pod #tourismSlideshow)
// ====================================================================

let slideIndex = 0;
let slideshowTimeout;

function startSlideshow() {
    showSlides();
}

function changeSlide(n) {
    clearTimeout(slideshowTimeout);
    slideIndex += n;
    showSlides(true);
}

function setSlide(n) {
    clearTimeout(slideshowTimeout);
    slideIndex = n;
    showSlides(true);
}

function showSlides(manual = false) {
    const slides = document.querySelectorAll('#tourismSlideshow .slide');
    const indicators = document.querySelectorAll('#tourismSlideshow .indicator');
    if (slides.length === 0) return;

    slides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(indicator => indicator.classList.remove('active'));

    if (!manual) {
        slideIndex++;
    }

    if (slideIndex > slides.length) { slideIndex = 1; }
    if (slideIndex < 1) { slideIndex = slides.length; }

    slides[slideIndex - 1].classList.add('active');
    if (indicators[slideIndex - 1]) {
        indicators[slideIndex - 1].classList.add('active');
    }

    slideshowTimeout = setTimeout(showSlides, 5000);
}

// ====================================================================
// ACTIVE NAVIGATION LINK LOGIC (z pierwszego kodu)
// ====================================================================

function updateActiveNavLinks() {
    const navLinks = document.querySelectorAll('#mainNav .nav-link');
    const currentPath = window.location.pathname;

    navLinks.forEach(link => {
        const linkPath = new URL(link.href).pathname;
        link.classList.remove('active');
        link.removeAttribute('aria-current');

        const isRootIndex =
            (currentPath.endsWith('/') || currentPath.endsWith('/index.html')) &&
            linkPath.endsWith('/index.html');

        if (linkPath === currentPath || isRootIndex) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        }
    });
}
// js/script.js
document.addEventListener('DOMContentLoaded', () => {
    // avoid adding multiple times
    if (document.getElementById('muteBtn')) return;

    // Create button
    const btn = document.createElement('button');
    btn.id = 'muteBtn';
    btn.type = 'button';
    btn.setAttribute('aria-pressed', 'false');
    btn.setAttribute('aria-label', 'Mute background music');
    btn.title = 'Mute music';
    btn.innerHTML = speakerIcon(false);

    // Styles (sticky bottom-left, margin 8px, round, padding tuned for display)
    const css = `
    #muteBtn {
      position: fixed;
      bottom: 8px;
      left: 8px;
      z-index: 9999;
      width: 48px;
      height: 48px;
      padding: 6px;
      border-radius: 50%;
      border: none;
      background: rgba(17,17,17,0.9);
      color: #fff;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
      cursor: pointer;
      transition: background 0.15s ease, transform 0.08s ease;
      backdrop-filter: blur(6px);
    }
    #muteBtn:active { transform: scale(0.98); }
    #muteBtn:focus { outline: 2px solid rgba(255,255,255,0.9); outline-offset: 2px; }
    #muteBtn svg { width: 24px; height: 24px; display: block; }
    #muteBtn.muted { background: rgba(68,68,68,0.95); }
    @media (max-width: 420px) {
      #muteBtn { width: 44px; height: 44px; padding: 4px; }
      #muteBtn svg { width: 20px; height: 20px; }
    }
  `;
    const styleEl = document.createElement('style');
    styleEl.appendChild(document.createTextNode(css));
    document.head.appendChild(styleEl);

    document.body.appendChild(btn);

    // Find audio: prefer audio#bgm, fallback to first audio element
    const audio = document.querySelector('audio#bgm') || document.querySelector('audio');

    // Initialize state based on audio (if present)
    const setState = (muted) => {
        btn.classList.toggle('muted', muted);
        btn.innerHTML = speakerIcon(muted);
        btn.setAttribute('aria-pressed', String(muted));
        btn.title = muted ? 'Unmute music' : 'Mute music';
        btn.setAttribute('aria-label', muted ? 'Unmute background music' : 'Mute background music');
    };

    if (audio) {
        setState(!!audio.muted);
    } else {
        // If no audio present, keep unmuted icon but do not throw errors on click
        setState(false);
    }

    // Toggle handler
    const toggleMute = () => {
        if (!audio) return;
        audio.muted = !audio.muted;
        setState(audio.muted);
    };

    btn.addEventListener('click', toggleMute);

    // keyboard support (Enter / Space)
    btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            btn.click();
        }
    });

    // SVG icons
    function speakerIcon(muted) {
        if (muted) {
            // muted: speaker + slash
            return `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <line x1="23" y1="9" x2="16" y2="16"></line>
          <line x1="16" y1="9" x2="23" y2="16"></line>
        </svg>`;
        }
        // unmuted: speaker + waves
        return `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        <path d="M19.07 5.93a9 9 0 0 1 0 12.73"></path>
      </svg>`;
    }
});
