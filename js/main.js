document.addEventListener('DOMContentLoaded', () => {
    // 1. Navigation Bar (Shadow transition & Auto-hide)
    const navbar = document.getElementById('navbar');
    let lastScrollY = window.scrollY;

    const handleNavbarScroll = () => {
        if (!navbar) return;
        const currentScrollY = window.scrollY;

        // Toggle shadow based on scroll position
        if (currentScrollY > 20) {
            navbar.classList.add('shadow-md');
            navbar.classList.remove('shadow-sm');
        } else {
            navbar.classList.remove('shadow-md');
            navbar.classList.add('shadow-sm');
        }

        // Autohide navbar logic (Smart Navbar)
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
            // Scrolling down - hide navbar
            navbar.classList.add('-translate-y-full');
        } else {
            // Scrolling up - show navbar
            navbar.classList.remove('-translate-y-full');
        }

        lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleNavbarScroll);
    handleNavbarScroll(); // Run once on load to set initial shadow state

    // 2. Mobile Menu Drawer Toggle Logic
    const menuToggleBtn = document.querySelector('button[aria-label="Open menu"]');
    const closeMenuBtn = document.getElementById('close-menu');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    const mobileMenuPanel = document.getElementById('mobile-menu-panel');
    
    if (mobileMenu && mobileMenuOverlay && mobileMenuPanel) {
        const mobileMenuLinks = mobileMenu.querySelectorAll('nav a, a.mt-auto');

        const openMobileMenu = () => {
            mobileMenu.classList.remove('invisible');
            setTimeout(() => {
                mobileMenuOverlay.classList.remove('opacity-0');
                mobileMenuPanel.classList.remove('translate-x-full');
            }, 10);
        };

        const closeMobileMenu = () => {
            mobileMenuOverlay.classList.add('opacity-0');
            mobileMenuPanel.classList.add('translate-x-full');
            setTimeout(() => {
                mobileMenu.classList.add('invisible');
            }, 300);
        };

        if (menuToggleBtn) menuToggleBtn.addEventListener('click', openMobileMenu);
        if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMobileMenu);
        mobileMenuOverlay.addEventListener('click', closeMobileMenu);
        
        mobileMenuLinks.forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });
    }

    // 3. Scroll Reveal Observer
    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target); // Stop observing once revealed
            }
        });
    };

    const revealObserver = new IntersectionObserver(revealCallback, {
        root: null,
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.scroll-reveal').forEach(el => {
        revealObserver.observe(el);
    });

    // 4. Scrollspy Active State Logic (only for same-page hash links)
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('#navbar div.hidden.md\\:flex a');

    if (sections.length > 0 && navLinks.length > 0) {
        const handleScrollspy = () => {
            const currentScrollY = window.scrollY;
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop - 120; // Header offset
                const sectionHeight = section.offsetHeight;
                const sectionId = section.getAttribute('id');

                if (currentScrollY >= sectionTop && currentScrollY < sectionTop + sectionHeight) {
                    navLinks.forEach(link => {
                        const href = link.getAttribute('href');
                        // Match index.html#id or just #id depending on current page context
                        if (href === `#${sectionId}` || href === `index.html#${sectionId}`) {
                            link.classList.add('border-primary', 'text-primary', 'font-bold');
                            link.classList.remove('border-transparent', 'text-on-surface-variant');
                        } else if (href.includes('#')) {
                            link.classList.remove('border-primary', 'text-primary', 'font-bold');
                            link.classList.add('border-transparent', 'text-on-surface-variant');
                        }
                    });
                }
            });
        };

        window.addEventListener('scroll', handleScrollspy);
        handleScrollspy(); // Run once on load
    }

    // 5. Contact Form Submission Logic (with Turnstile & Web3Forms backend)
    const contactForm = document.getElementById('contactForm');
    const contactSubmitBtn = document.getElementById('contactSubmitBtn');
    const feedbackBanner = document.getElementById('contact-feedback');

    if (contactForm && contactSubmitBtn && feedbackBanner) {
        const showFeedback = (message, type) => {
            feedbackBanner.innerText = message;
            feedbackBanner.classList.remove('hidden');

            if (type === 'success') {
                feedbackBanner.className = 'p-4 rounded-lg font-body-sm text-body-sm border border-primary/30 bg-primary-fixed/20 text-on-primary-fixed block';
            } else {
                feedbackBanner.className = 'p-4 rounded-lg font-body-sm text-body-sm border border-error/30 bg-error-container text-on-error-container block';
            }
        };

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Clear any active feedback
            feedbackBanner.classList.add('hidden');
            feedbackBanner.classList.remove('block');

            const formData = new FormData(contactForm);
            const name = formData.get('name')?.trim();
            const email = formData.get('email')?.trim();
            const message = formData.get('message')?.trim();
            const turnstileToken = formData.get('cf-turnstile-response');

            // Client-side validations
            if (!name || !email || !message) {
                showFeedback('Please fill in all required fields.', 'error');
                return;
            }

            if (!turnstileToken) {
                showFeedback('Please complete the CAPTCHA verification.', 'error');
                return;
            }

            // Set sending state
            contactSubmitBtn.disabled = true;
            contactSubmitBtn.innerHTML = `
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-on-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Sending...</span>
            `;

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(Object.fromEntries(formData))
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    showFeedback('Thank you! Your message has been sent successfully.', 'success');
                    contactForm.reset();
                } else {
                    showFeedback(result.message || 'Failed to send the message. Please try again.', 'error');
                }
            } catch (error) {
                console.error('Contact submission error:', error);
                showFeedback('A network error occurred. Please check your connection and try again.', 'error');
            } finally {
                // Reset Turnstile token for the next attempt
                if (typeof turnstile !== 'undefined') {
                    turnstile.reset();
                }
                // Reset submit button state
                contactSubmitBtn.disabled = false;
                contactSubmitBtn.innerHTML = `<span>Send Message</span>`;
            }
        });
    }
});
