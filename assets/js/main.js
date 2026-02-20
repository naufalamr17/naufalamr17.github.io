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

    // Intersection Observer for Reveal & Dock Active State
    const animateElements = document.querySelectorAll('.animate-in');
    const dockNavItems = document.querySelectorAll('.dock nav .dock-item');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                // Update active dock item based on visible section
                if (entry.target.tagName === 'SECTION') {
                    const sectionId = entry.target.id;
                    dockNavItems.forEach(item => {
                        const href = item.getAttribute('href');
                        if (href && href.substring(1) === sectionId) {
                            item.classList.add('active');
                        } else {
                            item.classList.remove('active');
                        }
                    });
                }
            }
        });
    }, {
        threshold: 0.3, // Lower threshold for better sensitivity
        rootMargin: '-20% 0px -20% 0px' // Focus on the middle of the screen
    });

    animateElements.forEach(el => observer.observe(el));

    // Smooth Scroll — accounts for fixed HUD bar offset
    const SCROLL_OFFSET = 140;
    dockNavItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const href = item.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const top = target.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
                    window.scrollTo({ top, behavior: 'smooth' });
                }
            }
        });
    });

    // Hero buttons scroll offset too
    document.querySelectorAll('.btn-hero').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const href = btn.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const top = target.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
                    window.scrollTo({ top, behavior: 'smooth' });
                }
            }
        });
    });
});
