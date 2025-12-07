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
