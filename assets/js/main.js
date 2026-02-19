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

                if (entry.target.tagName === 'SECTION') {
                    dockNavItems.forEach(item => {
                        item.classList.remove('active');
                        const href = item.getAttribute('href');
                        if (href && href.substring(1) === entry.target.id) {
                            item.classList.add('active');
                        }
                    });
                }
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    animateElements.forEach(el => observer.observe(el));

    // Smooth Scroll — only for nav dock items (href starting with #)
    dockNavItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const href = item.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
});
