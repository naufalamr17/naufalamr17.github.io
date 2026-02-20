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
    const animateElements = document.querySelectorAll('.animate-in');
    const dockNavItems = document.querySelectorAll('.dock .dock-item');
    let isManualScrolling = false;

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

    const observer = new IntersectionObserver((entries) => {
        if (isManualScrolling) return;

        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                if (entry.target.tagName === 'SECTION') {
                    setActiveDockItem(entry.target.id);
                }
            }
        });
    }, {
        threshold: 0.2, // More sensitive
        rootMargin: '-10% 0px -40% 0px' 
    });

    animateElements.forEach(el => observer.observe(el));

    // Handle Page Bottom explicitly
    window.addEventListener('scroll', () => {
        if (isManualScrolling) return;
        
        // Detect if user has reached bottom (with some tolerance)
        const scrollBottom = window.innerHeight + window.pageYOffset;
        const pageHeight = document.documentElement.scrollHeight;
        
        if (scrollBottom >= pageHeight - 50) {
            setActiveDockItem('contact');
        }
    }, { passive: true });


    // --- SMOOTH SCROLL LOGIC ---
    const SCROLL_OFFSET = 140;
    const scrollToTarget = (targetId) => {
        const target = document.querySelector(targetId);
        if (target) {
            isManualScrolling = true;
            setActiveDockItem(targetId);

            const top = target.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
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
