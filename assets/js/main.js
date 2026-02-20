document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Live Clock
    const clock = document.getElementById('live-clock');
    if (clock) {
        const updateClock = () => {
            const now = new Date();
            clock.textContent = now.toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        };
        updateClock();
        setInterval(updateClock, 1000);
    }

    // --- SIDEBAR ACTIVE STATE LOGIC ---
    const sections = document.querySelectorAll('section[id]');
    const dockNavItems = document.querySelectorAll('.dock .dock-item');
    let isManualScrolling = false;

    // Responsive scroll offset
    const getScrollOffset = () => window.innerWidth <= 1024 ? 80 : 140;

    // Helper to set active dock item
    const setActiveDockItem = (targetId) => {
        dockNavItems.forEach(item => {
            const href = item.getAttribute('href');
            if (href === targetId || href === `#${targetId}`) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    };

    // Scroll-based active section detection (picks ONE closest section)
    const updateActiveSection = () => {
        if (isManualScrolling) return;

        // Check if at page bottom first
        const scrollBottom = window.innerHeight + window.pageYOffset;
        const pageHeight = document.documentElement.scrollHeight;
        if (scrollBottom >= pageHeight - 50) {
            setActiveDockItem('contact');
            return;
        }

        // Find the section closest to the top of the viewport
        const offset = getScrollOffset() + 20;
        let currentSection = null;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - offset;
            if (window.pageYOffset >= sectionTop) {
                currentSection = section;
            }
        });

        if (currentSection) {
            setActiveDockItem(currentSection.id);
        }
    };

    // Run on scroll (passive for performance)
    window.addEventListener('scroll', updateActiveSection, { passive: true });
    // Run once on load
    updateActiveSection();


    // --- SMOOTH SCROLL LOGIC ---
    const scrollToTarget = (targetId) => {
        const target = document.querySelector(targetId);
        if (target) {
            isManualScrolling = true;
            setActiveDockItem(targetId);

            const top = target.getBoundingClientRect().top + window.scrollY - getScrollOffset();
            window.scrollTo({ top, behavior: 'smooth' });

            setTimeout(() => {
                isManualScrolling = false;
            }, 800);
        }
    };

    // Click Listeners
    dockNavItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const href = item.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                scrollToTarget(href);
            }
        });
    });

    document.querySelectorAll('.btn-hero').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const href = btn.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                scrollToTarget(href);
            }
        });
    });
});
