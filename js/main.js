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
});
