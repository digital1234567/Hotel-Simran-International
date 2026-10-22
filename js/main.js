/**
 * Hotel Simran International — Main Frontend Interactivity
 * =========================================================
 * Handles all UI interactions, animations, and user experience
 * enhancements for the public-facing hotel website.
 *
 * @author Hotel Simran International Dev Team
 * @version 1.0.0
 */

/* ============================================================
   0. INITIALIZATION & DOM READY
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    initStickyNav();
    initMobileMenu();
    initSmoothScrolling();
    initScrollAnimations();
    initTestimonialCarousel();
    initGalleryLightbox();
    initVideoModal();
    initTouristMapTabs();
    initBackToTop();
    initCounterAnimation();
    initBookingWidgetDates();
    initWhatsAppPulse();
    initLazyLoading();
    initContactForm();
});

/* ============================================================
   1. STICKY NAVIGATION
   ============================================================ */

/**
 * Adds a `.scrolled` class to the header when the user scrolls
 * past a threshold, transitioning the background to a solid navy.
 */
function initStickyNav() {
    const header = document.querySelector('.site-header, .header');
    if (!header) return;

    const SCROLL_THRESHOLD = 80;

    const handleScroll = () => {
        if (window.scrollY > SCROLL_THRESHOLD) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run once on load in case page is already scrolled
    handleScroll();
}

/* ============================================================
   2. MOBILE MENU TOGGLE
   ============================================================ */

/**
 * Handles the hamburger menu toggle for mobile devices.
 * Opens/closes the mobile nav overlay with slide animation.
 * Closes on link click or outside click.
 */
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const mobileNav = document.querySelector('.mobile-nav, .mobile-nav-overlay');
    const body = document.body;

    if (!hamburger || !mobileNav) return;

    const navLinks = mobileNav.querySelectorAll('a');

    /** Toggle the mobile menu open/closed */
    function toggleMenu() {
        const isOpen = mobileNav.classList.contains('active');
        if (isOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    }

    /** Open mobile menu */
    function openMenu() {
        mobileNav.classList.add('active');
        hamburger.classList.add('active');
        body.classList.add('menu-open');
        hamburger.setAttribute('aria-expanded', 'true');
    }

    /** Close mobile menu */
    function closeMenu() {
        mobileNav.classList.remove('active');
        hamburger.classList.remove('active');
        body.classList.remove('menu-open');
        hamburger.setAttribute('aria-expanded', 'false');
    }

    hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
    });

    // Close on nav link click
    navLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (mobileNav.classList.contains('active') &&
            !mobileNav.contains(e.target) &&
            !hamburger.contains(e.target)) {
            closeMenu();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
            closeMenu();
        }
    });
}

/* ============================================================
   3. SMOOTH SCROLLING
   ============================================================ */

/**
 * Smooth-scrolls to the target section when a nav link is clicked.
 * Accounts for the fixed header height offset.
 */
function initSmoothScrolling() {
    const HEADER_OFFSET = 80;
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#' || href === '#!') return;

            const target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();

            const targetPosition = target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        });
    });
}

/* ============================================================
   4. SCROLL ANIMATIONS (Intersection Observer)
   ============================================================ */

/**
 * Fade-in-up animations for sections and cards as they enter
 * the viewport using IntersectionObserver.
 */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll(
        '.section-header, .room-card, .amenity-card, .gallery-item, ' +
        '.testimonial-card, .stat-item, .attraction-card, .event-card, ' +
        '.about-content, .contact-form-wrapper, .bento-item'
    );

    if (!animatedElements.length) return;

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.15
    };

    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Stagger the animation for sibling elements
                const delay = index * 80;
                setTimeout(() => {
                    entry.target.classList.add('animate-in');
                }, delay);
                animationObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => {
        el.classList.add('animate-on-scroll');
        animationObserver.observe(el);
    });
}

/* ============================================================
   5. TESTIMONIAL CAROUSEL
   ============================================================ */

/**
 * Horizontal scroll carousel for testimonials with arrows, dots,
 * autoplay, and touch/swipe support.
 */
function initTestimonialCarousel() {
    const carousel = document.querySelector('.testimonials__carousel, .testimonial-carousel');
    const track = document.querySelector('.testimonials__carousel, .testimonial-track');
    const prevBtn = document.querySelector('#testimonialPrev, .testimonials__arrow--left, .carousel-prev');
    const nextBtn = document.querySelector('#testimonialNext, .testimonials__arrow--right, .carousel-next');
    const dotsContainer = document.querySelector('#testimonialDots, .testimonials__dots, .carousel-dots');

    if (!track) return;

    const cards = track.querySelectorAll('.testimonial-card');
    if (!cards.length) return;

    let currentIndex = 0;
    let autoplayTimer = null;
    let touchStartX = 0;
    let touchEndX = 0;
    const AUTOPLAY_INTERVAL = 5000;

    /** Calculate how many cards are visible at once */
    function getVisibleCount() {
        if (window.innerWidth < 640) return 1;
        if (window.innerWidth < 1024) return 2;
        return 3;
    }

    /** Get the maximum slide index */
    function getMaxIndex() {
        return Math.max(0, cards.length - getVisibleCount());
    }

    /** Create dot indicators */
    function createDots() {
        if (!dotsContainer) return;
        dotsContainer.innerHTML = '';
        const total = getMaxIndex() + 1;
        for (let i = 0; i < total; i++) {
            const dot = document.createElement('button');
            dot.classList.add('carousel-dot');
            dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
            if (i === currentIndex) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        }
    }

    /** Update the active dot */
    function updateDots() {
        if (!dotsContainer) return;
        const dots = dotsContainer.querySelectorAll('.carousel-dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
        });
    }

    /** Slide to a specific index */
    function goToSlide(index) {
        const maxIndex = getMaxIndex();
        currentIndex = Math.max(0, Math.min(index, maxIndex));

        const card = cards[0];
        const cardStyle = getComputedStyle(card);
        const cardWidth = card.offsetWidth +
            parseFloat(cardStyle.marginLeft) +
            parseFloat(cardStyle.marginRight);

        track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
        updateDots();
    }

    /** Go to next slide */
    function nextSlide() {
        if (currentIndex >= getMaxIndex()) {
            goToSlide(0); // Loop back
        } else {
            goToSlide(currentIndex + 1);
        }
    }

    /** Go to previous slide */
    function prevSlide() {
        if (currentIndex <= 0) {
            goToSlide(getMaxIndex()); // Loop to end
        } else {
            goToSlide(currentIndex - 1);
        }
    }

    /** Start autoplay */
    function startAutoplay() {
        stopAutoplay();
        autoplayTimer = setInterval(nextSlide, AUTOPLAY_INTERVAL);
    }

    /** Stop autoplay */
    function stopAutoplay() {
        if (autoplayTimer) {
            clearInterval(autoplayTimer);
            autoplayTimer = null;
        }
    }

    // Arrow button listeners
    if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); startAutoplay(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); startAutoplay(); });

    // Pause autoplay on hover
    if (carousel) {
        carousel.addEventListener('mouseenter', stopAutoplay);
        carousel.addEventListener('mouseleave', startAutoplay);
    }

    // Touch / swipe support
    track.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoplay();
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) nextSlide();
            else prevSlide();
        }
        startAutoplay();
    }, { passive: true });

    // Recalculate on resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            createDots();
            goToSlide(Math.min(currentIndex, getMaxIndex()));
        }, 250);
    });

    // Initialize
    createDots();
    goToSlide(0);
    startAutoplay();
}

/* ============================================================
   6. GALLERY LIGHTBOX
   ============================================================ */

/**
 * Fullscreen lightbox for gallery items with navigation,
 * keyboard support, and image counter.
 */
function initGalleryLightbox() {
    const galleryItems = document.querySelectorAll('.gallery__item, .gallery-item');
    if (!galleryItems.length) return;

    let lightbox = null;
    let currentGalleryIndex = 0;

    /** Build the lightbox DOM structure */
    function createLightbox() {
        lightbox = document.createElement('div');
        lightbox.className = 'lightbox-overlay';
        lightbox.innerHTML = `
            <div class="lightbox-container">
                <button class="lightbox-close" aria-label="Close lightbox">&times;</button>
                <button class="lightbox-nav lightbox-prev" aria-label="Previous image">&#10094;</button>
                <div class="lightbox-content">
                    <div class="lightbox-image-wrapper">
                        <img class="lightbox-image" src="" alt="" />
                    </div>
                    <div class="lightbox-caption"></div>
                </div>
                <button class="lightbox-nav lightbox-next" aria-label="Next image">&#10095;</button>
                <div class="lightbox-counter"></div>
            </div>
        `;
        document.body.appendChild(lightbox);

        // Event listeners
        lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
        lightbox.querySelector('.lightbox-prev').addEventListener('click', () => navigateLightbox(-1));
        lightbox.querySelector('.lightbox-next').addEventListener('click', () => navigateLightbox(1));
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    }

    /** Open the lightbox at a given index */
    function openLightbox(index) {
        if (!lightbox) createLightbox();

        currentGalleryIndex = index;
        updateLightboxContent();

        lightbox.classList.add('active');
        document.body.classList.add('lightbox-open');
    }

    /** Close the lightbox */
    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove('active');
        document.body.classList.remove('lightbox-open');
    }

    /** Navigate through images */
    function navigateLightbox(direction) {
        currentGalleryIndex += direction;
        if (currentGalleryIndex < 0) currentGalleryIndex = galleryItems.length - 1;
        if (currentGalleryIndex >= galleryItems.length) currentGalleryIndex = 0;
        updateLightboxContent();
    }

    /** Update the lightbox image/content */
    function updateLightboxContent() {
        if (!lightbox) return;

        const item = galleryItems[currentGalleryIndex];
        const img = item.querySelector('img');
        const lightboxImg = lightbox.querySelector('.lightbox-image');
        const caption = lightbox.querySelector('.lightbox-caption');
        const counter = lightbox.querySelector('.lightbox-counter');

        if (img) {
            lightboxImg.src = img.src || img.dataset.src || '';
            lightboxImg.alt = img.alt || '';
            lightboxImg.style.display = 'block';
        } else {
            // Gradient/placeholder – show the item's background
            lightboxImg.src = '';
            lightboxImg.style.display = 'none';
        }

        const titleEl = item.querySelector('.gallery-title, .gallery-caption, h3, h4');
        caption.textContent = titleEl ? titleEl.textContent : '';
        counter.textContent = `${currentGalleryIndex + 1} / ${galleryItems.length}`;
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox || !lightbox.classList.contains('active')) return;

        switch (e.key) {
            case 'ArrowLeft':
                navigateLightbox(-1);
                break;
            case 'ArrowRight':
                navigateLightbox(1);
                break;
            case 'Escape':
                closeLightbox();
                break;
        }
    });

    // Attach click listeners to each gallery item
    galleryItems.forEach((item, index) => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', () => openLightbox(index));
    });
}

/* ============================================================
   7. VIDEO MODAL
   ============================================================ */

/**
 * Opens a centered video modal when a video testimonial card
 * is clicked. Supports close on X or Escape.
 */
function initVideoModal() {
    const videoCards = document.querySelectorAll('.video-testimonial-card, [data-video]');
    if (!videoCards.length) return;

    let modal = null;

    /** Build the video modal DOM */
    function createVideoModal() {
        modal = document.createElement('div');
        modal.className = 'video-modal-overlay';
        modal.innerHTML = `
            <div class="video-modal-container">
                <button class="video-modal-close" aria-label="Close video">&times;</button>
                <div class="video-modal-content">
                    <div class="video-placeholder">
                        <div class="video-play-icon">
                            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                                <circle cx="32" cy="32" r="30" stroke="white" stroke-width="3"/>
                                <polygon points="26,18 26,46 48,32" fill="white"/>
                            </svg>
                        </div>
                        <p class="video-modal-text">Video playback coming soon</p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('.video-modal-close').addEventListener('click', closeVideoModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeVideoModal();
        });
    }

    /** Open the video modal */
    function openVideoModal(videoUrl) {
        if (!modal) createVideoModal();

        const content = modal.querySelector('.video-modal-content');

        if (videoUrl && videoUrl.includes('youtube')) {
            // Embed YouTube player
            const videoId = extractYouTubeId(videoUrl);
            content.innerHTML = `
                <iframe
                    src="https://www.youtube.com/embed/${videoId}?autoplay=1"
                    frameborder="0"
                    allow="autoplay; encrypted-media"
                    allowfullscreen
                    class="video-iframe"
                ></iframe>
            `;
        }

        modal.classList.add('active');
        document.body.classList.add('video-modal-open');
    }

    /** Close the video modal */
    function closeVideoModal() {
        if (!modal) return;
        modal.classList.remove('active');
        document.body.classList.remove('video-modal-open');

        // Stop any playing video
        const iframe = modal.querySelector('iframe');
        if (iframe) iframe.src = '';
    }

    /** Extract YouTube video ID from URL */
    function extractYouTubeId(url) {
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
        return match ? match[1] : '';
    }

    // Keyboard close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            closeVideoModal();
        }
    });

    // Attach click listeners
    videoCards.forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
            const videoUrl = card.dataset.video || '';
            openVideoModal(videoUrl);
        });
    });
}

/* ============================================================
   8. TOURIST MAP TABS (Explore Raipur)
   ============================================================ */

/**
 * Tab switching for the Explore Raipur section. Clicking a tab
 * switches the visible content panel with a fade transition.
 */
function initTouristMapTabs() {
    const tabContainer = document.querySelector('.nearby__tabs, .explore-tabs, .tourist-tabs');
    if (!tabContainer) return;

    const tabs = tabContainer.querySelectorAll('.nearby__tab, .tab-btn, .explore-tab');
    const panels = document.querySelectorAll('.nearby__panel, .tab-panel, .explore-panel');

    if (!tabs.length || !panels.length) return;

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.dataset.tab || tab.getAttribute('href')?.replace('#', '');
            if (!targetId) return;

            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Fade transition between panels
            panels.forEach(panel => {
                if (panel.id === targetId || panel.dataset.panel === targetId) {
                    panel.style.opacity = '0';
                    panel.classList.add('active');
                    // Trigger reflow then fade in
                    requestAnimationFrame(() => {
                        panel.style.opacity = '1';
                    });
                } else {
                    panel.classList.remove('active');
                    panel.style.opacity = '0';
                }
            });
        });
    });
}

/* ============================================================
   9. BACK TO TOP BUTTON
   ============================================================ */

/**
 * Shows a "back to top" button after scrolling 500px.
 * Smooth-scrolls to the top of the page on click.
 */
function initBackToTop() {
    const btn = document.querySelector('.back-to-top');
    if (!btn) return;

    const SHOW_THRESHOLD = 500;

    window.addEventListener('scroll', () => {
        if (window.scrollY > SHOW_THRESHOLD) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    }, { passive: true });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* ============================================================
   10. COUNTER ANIMATION
   ============================================================ */

/**
 * Animates stat numbers (25+, 10000+, 4.2★) counting up when
 * the About section enters the viewport. Triggers only once.
 */
function initCounterAnimation() {
    const counters = document.querySelectorAll('.welcome__stat-number, .stat-number, [data-count]');
    if (!counters.length) return;

    let animated = false;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animated) {
                animated = true;
                animateCounters();
                observer.disconnect();
            }
        });
    }, { threshold: 0.3 });

    // Observe the parent section or each counter
    const statsSection = document.querySelector('.about-stats, .stats-section, .stats');
    if (statsSection) {
        observer.observe(statsSection);
    } else {
        counters.forEach(counter => observer.observe(counter));
    }

    /** Run the counting animation for each counter element */
    function animateCounters() {
        counters.forEach(counter => {
            const rawText = counter.textContent.trim();
            const target = parseFloat(counter.dataset.count || rawText);
            const suffix = rawText.replace(/[\d.]/g, '').trim(); // e.g., "+", "★"
            const isDecimal = String(target).includes('.') || rawText.includes('.');
            const duration = 2000; // ms
            const startTime = performance.now();

            function updateCount(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Ease out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = eased * target;

                if (isDecimal) {
                    counter.textContent = current.toFixed(1) + suffix;
                } else {
                    counter.textContent = Math.floor(current).toLocaleString('en-IN') + suffix;
                }

                if (progress < 1) {
                    requestAnimationFrame(updateCount);
                } else {
                    // Ensure we show the exact final value
                    if (isDecimal) {
                        counter.textContent = target.toFixed(1) + suffix;
                    } else {
                        counter.textContent = target.toLocaleString('en-IN') + suffix;
                    }
                }
            }

            requestAnimationFrame(updateCount);
        });
    }
}

/* ============================================================
   11. BOOKING WIDGET DATE VALIDATION
   ============================================================ */

/**
 * Sets minimum dates on the booking widget and validates
 * that check-out is after check-in.
 */
function initBookingWidgetDates() {
    const checkInInput = document.querySelector('#check-in, #checkIn, [name="check_in"]');
    const checkOutInput = document.querySelector('#check-out, #checkOut, [name="check_out"]');

    if (!checkInInput || !checkOutInput) return;

    // Set today as minimum check-in date
    const today = new Date();
    const todayStr = formatInputDate(today);
    checkInInput.setAttribute('min', todayStr);

    // Default check-in to today if empty
    if (!checkInInput.value) {
        checkInInput.value = todayStr;
    }

    // Set minimum check-out to the day after check-in
    updateCheckOutMin();

    checkInInput.addEventListener('change', () => {
        updateCheckOutMin();

        // If check-out is before new check-in, reset it
        if (checkOutInput.value && checkOutInput.value <= checkInInput.value) {
            const nextDay = new Date(checkInInput.value);
            nextDay.setDate(nextDay.getDate() + 1);
            checkOutInput.value = formatInputDate(nextDay);
        }
    });

    checkOutInput.addEventListener('change', () => {
        if (checkOutInput.value <= checkInInput.value) {
            showToast('Check-out date must be after check-in date.', 'warning');
            const nextDay = new Date(checkInInput.value);
            nextDay.setDate(nextDay.getDate() + 1);
            checkOutInput.value = formatInputDate(nextDay);
        }
    });

    /** Update the minimum allowed check-out date */
    function updateCheckOutMin() {
        const checkInDate = new Date(checkInInput.value || todayStr);
        const minCheckOut = new Date(checkInDate);
        minCheckOut.setDate(minCheckOut.getDate() + 1);
        checkOutInput.setAttribute('min', formatInputDate(minCheckOut));

        // Default check-out if empty
        if (!checkOutInput.value) {
            checkOutInput.value = formatInputDate(minCheckOut);
        }
    }

    /**
     * Format a Date to YYYY-MM-DD for <input type="date">
     * @param {Date} date
     * @returns {string}
     */
    function formatInputDate(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }
}

/* ============================================================
   12. TOAST NOTIFICATIONS
   ============================================================ */

/**
 * Shows a toast notification that auto-dismisses.
 *
 * @param {string} message — The text to display.
 * @param {'success'|'error'|'info'|'warning'} [type='info'] — Toast type.
 * @param {number} [duration=4000] — Auto-dismiss delay in ms.
 */
function showToast(message, type = 'info', duration = 4000) {
    // Ensure container exists
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    // Icon map
    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
        warning: '⚠️'
    };

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" aria-label="Dismiss">&times;</button>
    `;

    container.appendChild(toast);

    // Trigger slide-in
    requestAnimationFrame(() => {
        toast.classList.add('toast-visible');
    });

    // Auto-dismiss
    const timer = setTimeout(() => dismissToast(toast), duration);

    // Manual close
    toast.querySelector('.toast-close').addEventListener('click', () => {
        clearTimeout(timer);
        dismissToast(toast);
    });
}

/**
 * Dismiss and remove a toast element with animation.
 * @param {HTMLElement} toast
 */
function dismissToast(toast) {
    toast.classList.remove('toast-visible');
    toast.classList.add('toast-exit');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    // Fallback removal
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 500);
}

// Expose globally so other scripts can use it
window.showToast = showToast;

/* ============================================================
   13. WHATSAPP BUTTON ANIMATION
   ============================================================ */

/**
 * Adds a subtle pulse animation class to the floating WhatsApp
 * button so it draws attention periodically.
 */
function initWhatsAppPulse() {
    const whatsappBtn = document.querySelector('.whatsapp-float, .whatsapp-btn');
    if (!whatsappBtn) return;

    whatsappBtn.classList.add('whatsapp-pulse');
}

/* ============================================================
   14. LAZY LOADING IMAGES
   ============================================================ */

/**
 * Lazy-loads images that have a `data-src` attribute using
 * IntersectionObserver for performance.
 */
function initLazyLoading() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    if (!lazyImages.length) return;

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;

                    if (img.dataset.srcset) {
                        img.srcset = img.dataset.srcset;
                    }

                    img.classList.add('lazy-loaded');
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '200px 0px' // Start loading slightly before visible
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback: load all images immediately
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            if (img.dataset.srcset) img.srcset = img.dataset.srcset;
            img.classList.add('lazy-loaded');
        });
    }
}

/* ============================================================
   15. CONTACT FORM VALIDATION
   ============================================================ */

/**
 * Validates the contact form fields inline and shows a success
 * toast on valid submission.
 */
function initContactForm() {
    const form = document.querySelector('.contact-form, #contactForm');
    if (!form) return;

    form.setAttribute('novalidate', '');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Clear previous errors
        clearFormErrors(form);

        const fields = {
            name: form.querySelector('[name="name"], #contactName'),
            email: form.querySelector('[name="email"], #contactEmail'),
            phone: form.querySelector('[name="phone"], #contactPhone'),
            message: form.querySelector('[name="message"], #contactMessage')
        };

        let isValid = true;

        // Name validation (min 2 chars)
        if (fields.name) {
            const val = fields.name.value.trim();
            if (!val || val.length < 2) {
                showFieldError(fields.name, 'Please enter your name (at least 2 characters).');
                isValid = false;
            }
        }

        // Email validation
        if (fields.email) {
            const val = fields.email.value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!val || !emailRegex.test(val)) {
                showFieldError(fields.email, 'Please enter a valid email address.');
                isValid = false;
            }
        }

        // Phone validation (Indian format: 10 digits, optionally prefixed with +91)
        if (fields.phone) {
            const val = fields.phone.value.trim();
            const phoneRegex = /^(\+91[\-\s]?)?[6-9]\d{9}$/;
            if (!val || !phoneRegex.test(val.replace(/[\s\-]/g, ''))) {
                showFieldError(fields.phone, 'Please enter a valid Indian phone number (10 digits).');
                isValid = false;
            }
        }

        // Message validation (min 10 chars)
        if (fields.message) {
            const val = fields.message.value.trim();
            if (!val || val.length < 10) {
                showFieldError(fields.message, 'Please enter a message (at least 10 characters).');
                isValid = false;
            }
        }

        if (isValid) {
            showToast('Thank you! Your message has been sent successfully. We\'ll get back to you soon.', 'success');
            form.reset();
        }
    });

    /**
     * Show an inline error message below a form field.
     * @param {HTMLElement} field
     * @param {string} message
     */
    function showFieldError(field, message) {
        field.classList.add('field-error');
        const errorEl = document.createElement('span');
        errorEl.className = 'form-error-message';
        errorEl.textContent = message;
        field.parentNode.appendChild(errorEl);
    }

    /**
     * Clear all inline error messages from the form.
     * @param {HTMLFormElement} form
     */
    function clearFormErrors(form) {
        form.querySelectorAll('.field-error').forEach(el => el.classList.remove('field-error'));
        form.querySelectorAll('.form-error-message').forEach(el => el.remove());
    }
}




/* ============================================================
   ROOM & EVENT MODAL INTERACTION CONTROLLERS
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    // Room Data Store for Preview
    const ROOM_DETAILS_MAP = {
        'standard': {
            id: 'STD',
            name: 'Standard Room',
            badge: 'Essential Comfort',
            price: '₹2,499',
            description: 'Thoughtfully designed for comfort and efficiency, featuring premium orthopedic queen bedding, dedicated work space, and modern en-suite bath.',
            specs: [
                { label: 'Occupancy', val: '2 Guests' },
                { label: 'Room Size', val: '260 sq.ft' },
                { label: 'Bed Type', val: 'Queen Size' }
            ],
            amenities: ['Complimentary High-Speed Wi-Fi', 'Individual Climate Control AC', '40" Smart LED TV', '24/7 Hot & Cold Shower', 'Tea & Coffee Maker', 'Daily Housekeeping & Laundry'],
            photos: ['Cozy Queen Bed', 'Executive Work Desk', 'Modern En-Suite Bath']
        },
        'deluxe': {
            id: 'DLX',
            name: 'Deluxe Room',
            badge: 'Most Popular',
            price: '₹3,499',
            description: 'Spacious and elegantly furnished with ambient lighting, city skyline views, plush king bedding, mini refrigerator, and premium bath amenities.',
            specs: [
                { label: 'Occupancy', val: '2 Guests' },
                { label: 'Room Size', val: '340 sq.ft' },
                { label: 'Bed Type', val: 'King Size' }
            ],
            amenities: ['Complimentary Buffet Breakfast', 'City View Balcony/Window', 'Mini Bar & Refrigerator', '43" 4K Smart TV', 'Electronic Safety Locker', 'Luxury Herbal Toiletries'],
            photos: ['Spacious King Bed', 'City View Window', 'Lounge Sitting Corner', 'Granite Bathroom']
        },
        'superior': {
            id: 'SUP',
            name: 'Superior Room',
            badge: 'Premium Luxury',
            price: '₹4,999',
            description: 'Expansive room with separate sitting lounge, custom sofa bed, and upgraded deep-soaking bathtub. Ideal for long-term travelers and families.',
            specs: [
                { label: 'Occupancy', val: '3 Guests' },
                { label: 'Room Size', val: '450 sq.ft' },
                { label: 'Bed Type', val: 'King Bed + Sofa' }
            ],
            amenities: ['Complimentary Multi-Cuisine Breakfast', 'Deep Soaking Bathtub & Rain Shower', 'Living Area with Plush Sofa', '50" Ultra-HD Smart TV', 'Espresso Capsule Machine', 'Complimentary Evening Snacks'],
            photos: ['Master Bedroom', 'Plush Sofa Lounge', 'Deep Soaking Bathtub', 'Walk-in Wardrobe']
        },
        'suite': {
            id: 'STE',
            name: 'Presidential Suite',
            badge: 'Ultimate Luxury',
            price: '₹7,999',
            description: 'The pinnacle of luxury at Simran International. Features a private master bedroom, independent living & dining hall, jacuzzi, and dedicated butler service.',
            specs: [
                { label: 'Occupancy', val: '4 Guests' },
                { label: 'Room Size', val: '720 sq.ft' },
                { label: 'Bed Type', val: 'King Bed + Twin Sofa' }
            ],
            amenities: ['Complimentary Breakfast & Chef Dinner', 'Private Jacuzzi & Hydrotherapy Bath', 'Separate Drawing & Dining Room', '55" OLED Smart Home Theater', 'Complimentary Airport Chauffeur', 'Dedicated 24/7 Butler Support'],
            photos: ['Presidential Living Room', 'Master King Bedroom', 'Luxury Jacuzzi Bath', 'Dining Table Setup']
        }
    };

    // Modal elements
    const roomModal = document.getElementById('roomPreviewModal');
    const roomCloseBtn = document.getElementById('roomPreviewClose');
    const roomBookNowBtn = document.getElementById('roomPreviewBookNowBtn');

    let currentRoomId = 'DLX';

    function openRoomModal(typeKey) {
        const key = (typeKey || 'deluxe').toLowerCase();
        const data = ROOM_DETAILS_MAP[key] || ROOM_DETAILS_MAP['deluxe'];
        currentRoomId = data.id;

        document.getElementById('roomPreviewBadge').textContent = data.badge;
        document.getElementById('roomPreviewTitle').textContent = data.name;
        document.getElementById('roomPreviewPrice').innerHTML = `${data.price} <span>/ night</span>`;
        document.getElementById('roomPreviewDescription').textContent = data.description;

        // Specs
        const specsContainer = document.getElementById('roomSpecsRow');
        specsContainer.innerHTML = data.specs.map(s => `
            <div class="room-spec-item">
                <span class="room-spec-label">${s.label}</span>
                <span class="room-spec-val">${s.val}</span>
            </div>
        `).join('');

        // Amenities
        const amenitiesList = document.getElementById('roomAmenitiesList');
        amenitiesList.innerHTML = data.amenities.map(a => `<li>✔ ${a}</li>`).join('');

        // Photos
        const photosGrid = document.getElementById('roomPhotosGrid');
        photosGrid.innerHTML = data.photos.map(p => `
            <div class="room-photo-item">📸 ${p}</div>
        `).join('');

        if (roomModal) {
            roomModal.classList.add('active');
            document.body.classList.add('modal-open');
        }
    }

    function closeRoomModal() {
        if (roomModal) {
            roomModal.classList.remove('active');
            document.body.classList.remove('modal-open');
        }
    }

    // Attach to View Details buttons on Room Cards
    document.querySelectorAll('[data-room-details]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const type = btn.getAttribute('data-room-details') || 'deluxe';
            openRoomModal(type);
        });
    });

    if (roomCloseBtn) roomCloseBtn.addEventListener('click', closeRoomModal);
    if (roomModal) {
        roomModal.addEventListener('click', (e) => {
            if (e.target === roomModal) closeRoomModal();
        });
    }

    // Connect "Book This Room" from inside preview modal to Booking Engine
    if (roomBookNowBtn) {
        roomBookNowBtn.addEventListener('click', () => {
            closeRoomModal();
            if (window.bookingFlow) {
                window.bookingFlow._openQuickBook(currentRoomId);
            }
        });
    }

    // Tabs inside Room Preview
    document.querySelectorAll('.room-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.room-tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const tabId = btn.getAttribute('data-room-tab');
            document.querySelectorAll('.room-tab-panel').forEach(p => p.classList.remove('active'));
            if (tabId === 'video') document.getElementById('roomTabVideo')?.classList.add('active');
            if (tabId === 'photos') document.getElementById('roomTabPhotos')?.classList.add('active');
            if (tabId === 'features') document.getElementById('roomTabFeatures')?.classList.add('active');
        });
    });

    // Banquet & Event Modal Logic
    const eventModal = document.getElementById('eventPreviewModal');
    const eventCloseBtn = document.getElementById('eventPreviewClose');

    function openEventModal() {
        if (eventModal) {
            eventModal.classList.add('active');
            document.body.classList.add('modal-open');
        }
    }

    function closeEventModal() {
        if (eventModal) {
            eventModal.classList.remove('active');
            document.body.classList.remove('modal-open');
        }
    }

    // Hook to Event Cards & Banquet Amenity
    document.querySelectorAll('.event-card a, [data-amenity="banquet"]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            openEventModal();
        });
    });

    if (eventCloseBtn) eventCloseBtn.addEventListener('click', closeEventModal);
    if (eventModal) {
        eventModal.addEventListener('click', (e) => {
            if (e.target === eventModal) closeEventModal();
        });
    }

    // Event Tabs
    document.querySelectorAll('.event-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.event-tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const tabId = btn.getAttribute('data-event-tab');
            document.querySelectorAll('.event-tab-panel').forEach(p => p.classList.remove('active'));
            if (tabId === 'video') document.getElementById('eventTabVideo')?.classList.add('active');
            if (tabId === 'setups') document.getElementById('eventTabSetups')?.classList.add('active');
            if (tabId === 'testimonials') document.getElementById('eventTabTestimonials')?.classList.add('active');
        });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeRoomModal();
            closeEventModal();
        }
    });
});


/* ============================================================
   COMPLETE BI-DIRECTIONAL CMS & DATA HYDRATION ENGINE
   (Updates Website Instantly When Staff Edit CRM)
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    try {
        const saved = localStorage.getItem('hsi_cms_config');
        if (saved) {
            const data = JSON.parse(saved);

            // 1. Hero Section
            if (data.tagline) {
                const titleEl = document.querySelector('.hero__title');
                if (titleEl) titleEl.textContent = data.tagline;
            }
            if (data.subtitle) {
                const subEl = document.querySelector('.hero__subtitle');
                if (subEl) subEl.textContent = data.subtitle;
            }

            // 2. Phone Numbers & WhatsApp
            if (data.phone) {
                document.querySelectorAll('.hotel-phone-display, [href^="tel:"]').forEach(el => {
                    if (el.tagName === 'A') el.href = 'tel:' + data.phone.replace(/[^0-9+]/g, '');
                    el.textContent = '📞 ' + data.phone;
                });
            }
            if (data.whatsapp) {
                const waClean = data.whatsapp.replace(/[^0-9]/g, '');
                document.querySelectorAll('[href*="wa.me"]').forEach(el => {
                    const oldHref = el.getAttribute('href');
                    const textMatch = oldHref ? oldHref.match(/text=([^&]*)/) : null;
                    const textParam = textMatch ? textMatch[1] : '';
                    el.href = 'https://wa.me/' + waClean + (textParam ? '?text=' + textParam : '');
                });
            }

            // 3. About Section & Stats
            if (data.aboutHeading) {
                const aboutTitle = document.querySelector('.about__title, #welcome .section-title');
                if (aboutTitle) aboutTitle.textContent = data.aboutHeading;
            }
            if (data.aboutText) {
                const aboutP = document.querySelector('.about__desc, #welcome .about__text p');
                if (aboutP) aboutP.textContent = data.aboutText;
            }
            if (data.stat1) {
                const stat1El = document.querySelector('.stat-item:nth-child(1) .stat-item__label');
                if (stat1El) stat1El.textContent = data.stat1;
            }
            if (data.stat2) {
                const stat2El = document.querySelector('.stat-item:nth-child(2) .stat-item__label');
                if (stat2El) stat2El.textContent = data.stat2;
            }
            if (data.stat3) {
                const stat3El = document.querySelector('.stat-item:nth-child(3) .stat-item__label');
                if (stat3El) stat3El.textContent = data.stat3;
            }

            // 4. Room Rates (STD, DLX, SUP, STE)
            const roomPrices = {
                'STD': data.priceSTD,
                'DLX': data.priceDLX,
                'SUP': data.priceSUP,
                'STE': data.priceSTE
            };
            Object.keys(roomPrices).forEach(code => {
                if (roomPrices[code]) {
                    const card = document.querySelector('.room-card[data-room="' + code + '"]');
                    if (card) {
                        const priceBadge = card.querySelector('.room-card__price-badge');
                        if (priceBadge) {
                            priceBadge.innerHTML = '₹' + Number(roomPrices[code]).toLocaleString('en-IN') + '<small>/night</small>';
                        }
                    }
                }
            });

            // 5. Dining Brands
            if (data.restName) {
                document.querySelectorAll('.dining-restaurant-name').forEach(el => el.textContent = data.restName);
            }
            if (data.barName) {
                document.querySelectorAll('.dining-bar-name').forEach(el => el.textContent = data.barName);
            }
            if (data.cafeName) {
                document.querySelectorAll('.dining-cafe-name').forEach(el => el.textContent = data.cafeName);
            }

            // 6. Banquet Hall Names
            if (data.hall1) {
                document.querySelectorAll('.hall-name-1').forEach(el => el.textContent = data.hall1);
            }
            if (data.hall2) {
                document.querySelectorAll('.hall-name-2').forEach(el => el.textContent = data.hall2);
            }
            if (data.hall3) {
                document.querySelectorAll('.hall-name-3').forEach(el => el.textContent = data.hall3);
            }

            // 7. Multi-Video URLs for Occasions
            const videoTabs = document.querySelectorAll('.event-video-tab-btn');
            if (videoTabs.length >= 4) {
                if (data.videoWedding) videoTabs[0].setAttribute('data-video-src', data.videoWedding);
                if (data.videoSangeet) videoTabs[1].setAttribute('data-video-src', data.videoSangeet);
                if (data.videoCorporate) videoTabs[2].setAttribute('data-video-src', data.videoCorporate);
                if (data.videoGala) videoTabs[3].setAttribute('data-video-src', data.videoGala);

                // Update active main video player
                const activeTab = document.querySelector('.event-video-tab-btn.active');
                const mainFrame = document.getElementById('mainEventVideoFrame');
                if (activeTab && mainFrame) {
                    mainFrame.src = activeTab.getAttribute('data-video-src');
                }
            }

            // 8. Hotel Address
            if (data.address) {
                document.querySelectorAll('.hotel-address-display').forEach(el => el.textContent = data.address);
            }

            // 9. Live Hotel Photography & Visual Assets (Section 7 CMS)
            if (data.imgHero) {
                const heroSection = document.getElementById('home') || document.querySelector('.hero');
                if (heroSection) {
                    heroSection.style.backgroundImage = `linear-gradient(rgba(15,25,35,0.7), rgba(15,25,35,0.7)), url("${data.imgHero}")`;
                }
            }
            if (data.imgLogo) {
                document.querySelectorAll('.brand-logo-img, .site-header img, .footer__brand img').forEach(img => {
                    img.src = data.imgLogo;
                });
            }
            if (data.imgRoomSTD) {
                document.querySelectorAll('.room-card[data-room="STD"] img, #room-img-STD').forEach(img => img.src = data.imgRoomSTD);
            }
            if (data.imgRoomDLX) {
                document.querySelectorAll('.room-card[data-room="DLX"] img, #room-img-DLX').forEach(img => img.src = data.imgRoomDLX);
            }
            if (data.imgRoomSUP) {
                document.querySelectorAll('.room-card[data-room="SUP"] img, #room-img-SUP').forEach(img => img.src = data.imgRoomSUP);
            }
            if (data.imgRoomSTE) {
                document.querySelectorAll('.room-card[data-room="STE"] img, #room-img-STE').forEach(img => img.src = data.imgRoomSTE);
            }
            if (data.imgRest) {
                document.querySelectorAll('.dining-card-restaurant img, #dining-img-restaurant').forEach(img => img.src = data.imgRest);
            }
            if (data.imgBar) {
                document.querySelectorAll('.dining-card-bar img, #dining-img-bar').forEach(img => img.src = data.imgBar);
            }
            if (data.imgCafe) {
                document.querySelectorAll('.dining-card-cafe img, #dining-img-cafe').forEach(img => img.src = data.imgCafe);
            }
            if (data.imgHall1) {
                document.querySelectorAll('#banquet-img-hall1, .banquet-card:nth-child(1) img').forEach(img => img.src = data.imgHall1);
            }
            if (data.imgHall2) {
                document.querySelectorAll('#banquet-img-hall2, .banquet-card:nth-child(2) img').forEach(img => img.src = data.imgHall2);
            }
            if (data.imgHall3) {
                document.querySelectorAll('#banquet-img-hall3, .banquet-card:nth-child(3) img').forEach(img => img.src = data.imgHall3);
            }
        }
    } catch(err) {
        console.warn('CMS hydration notice:', err);
    }
});


/* ============================================================
   DINING MODAL CONTROLLER & DIRECT FOOD ORDERING
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    const diningModal = document.getElementById('diningMenuModal');
    const diningCloseBtn = document.getElementById('diningMenuClose');

    const DINING_DATA = {
        'restaurant': {
            badge: 'Multi-Cuisine Fine Dining',
            title: 'The Grand Kitchen — A La Carte Menu',
            timing: 'Breakfast: 7-10:30 AM | Lunch: 12-3:30 PM | Dinner: 7-11 PM'
        },
        'bar': {
            badge: 'Craft Cocktails & Spirits',
            title: 'The Imperial Lounge — Bar & Beverages',
            timing: 'Open Daily: 12:00 PM – 11:30 PM | Live Music Weekends'
        },
        'coffee': {
            badge: 'Artisanal Cafe & Bakery',
            title: 'Brew & Bite Cafe — Hot Brews & Pastries',
            timing: 'Open 24/7 | Fresh Bakery & Hand-Pressed Coffees'
        }
    };

    function openDiningModal(type = 'restaurant') {
        const data = DINING_DATA[type] || DINING_DATA['restaurant'];
        document.getElementById('diningMenuBadge').textContent = data.badge;
        document.getElementById('diningMenuTitle').textContent = data.title;
        document.getElementById('diningMenuTiming').textContent = data.timing;

        if (diningModal) {
            diningModal.classList.add('active');
            document.body.classList.add('modal-open');
        }
    }

    function closeDiningModal() {
        if (diningModal) {
            diningModal.classList.remove('active');
            document.body.classList.remove('modal-open');
        }
    }

    // Attach to Dining Cards & Amenity Items
    document.querySelectorAll('.dining-card, [data-amenity="restaurant"], [data-amenity="bar"], [data-amenity="coffee"]').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => {
            // Avoid conflict if clicking internal link
            if (e.target.tagName === 'A' && e.target.getAttribute('href') !== '#') return;
            const text = card.textContent.toLowerCase();
            let type = 'restaurant';
            if (text.includes('bar') || text.includes('lounge')) type = 'bar';
            if (text.includes('coffee') || text.includes('brew')) type = 'coffee';
            openDiningModal(type);
        });
    });

    if (diningCloseBtn) diningCloseBtn.addEventListener('click', closeDiningModal);
    if (diningModal) {
        diningModal.addEventListener('click', (e) => {
            if (e.target === diningModal) closeDiningModal();
        });
    }

    // Tabs inside Dining Modal
    document.querySelectorAll('.dining-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.dining-tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const tabKey = btn.getAttribute('data-dining-tab');
            document.querySelectorAll('.dining-tab-panel').forEach(p => p.classList.remove('active'));
            if (tabKey === 'menu') document.getElementById('diningTabMenu')?.classList.add('active');
            if (tabKey === 'media') document.getElementById('diningTabMedia')?.classList.add('active');
            if (tabKey === 'reviews') document.getElementById('diningTabReviews')?.classList.add('active');
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeDiningModal();
    });
});



/* ============================================================
   BANQUET SHOWCASE, EVENT VIDEOS & EVENT ENQUIRY HANDLERS
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    const banquetModal = document.getElementById('banquetDetailModal');
    const enquiryModal = document.getElementById('eventEnquiryModal');

    // 1. Open Banquet Details Modal
    function openBanquetModal(targetTab = 'crystal') {
        if (!banquetModal) return;
        banquetModal.style.setProperty('display', 'flex', 'important');
        document.body.style.overflow = 'hidden';
        switchBanquetTab(targetTab);
    }

    function closeBanquetModal() {
        if (!banquetModal) return;
        banquetModal.style.setProperty('display', 'none', 'important');
        document.body.style.overflow = '';
    }

    function switchBanquetTab(tabKey) {
        document.querySelectorAll('.banquet-tab-btn').forEach(btn => {
            if (btn.getAttribute('data-hall-tab') === tabKey) {
                btn.classList.add('active');
                btn.style.borderBottomColor = '#c9983b';
                btn.style.color = '#1a2332';
            } else {
                btn.classList.remove('active');
                btn.style.borderBottomColor = 'transparent';
                btn.style.color = '#64748b';
            }
        });
        document.querySelectorAll('.banquet-tab-content').forEach(content => {
            if (content.id === 'hall-content-' + tabKey) {
                content.style.display = 'block';
            } else {
                content.style.display = 'none';
            }
        });
    }

    // Attach to Banquet buttons
    document.querySelectorAll('[data-action="open-banquet-details"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const target = btn.getAttribute('data-target-tab') || 'crystal';
            openBanquetModal(target);
        });
    });

    document.querySelectorAll('[data-action="close-banquet-modal"]').forEach(btn => {
        btn.addEventListener('click', closeBanquetModal);
    });

    if (banquetModal) {
        banquetModal.addEventListener('click', (e) => {
            if (e.target === banquetModal) closeBanquetModal();
        });
    }

    document.querySelectorAll('.banquet-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabKey = btn.getAttribute('data-hall-tab');
            switchBanquetTab(tabKey);
        });
    });

    // 2. Open / Close Event Enquiry Modal
    function openEnquiryModal(hall = 'The Crystal Ballroom') {
        if (!enquiryModal) return;
        enquiryModal.style.setProperty('display', 'flex', 'important');
        document.body.style.overflow = 'hidden';
        const venueSelect = document.getElementById('eqVenueSelect');
        if (venueSelect && hall) {
            venueSelect.value = hall;
        }
    }

    function closeEnquiryModal() {
        if (!enquiryModal) return;
        enquiryModal.style.setProperty('display', 'none', 'important');
        document.body.style.overflow = '';
    }

    document.querySelectorAll('[data-action="open-enquiry-modal"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeBanquetModal();
            const hall = btn.getAttribute('data-hall') || 'The Crystal Ballroom';
            openEnquiryModal(hall);
        });
    });

    document.querySelectorAll('[data-action="close-enquiry-modal"]').forEach(btn => {
        btn.addEventListener('click', closeEnquiryModal);
    });

    if (enquiryModal) {
        enquiryModal.addEventListener('click', (e) => {
            if (e.target === enquiryModal) closeEnquiryModal();
        });
    }

    // 3. Handle Event Enquiry Form Submission
    const enquiryForm = document.getElementById('eventEnquiryForm');
    if (enquiryForm) {
        enquiryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('eqGuestName')?.value.trim();
            const phone = document.getElementById('eqGuestPhone')?.value.trim();
            const email = document.getElementById('eqGuestEmail')?.value.trim();
            const venue = document.getElementById('eqVenueSelect')?.value;
            const occasion = document.getElementById('eqOccasionSelect')?.value;
            const date = document.getElementById('eqEventDate')?.value;
            const guests = document.getElementById('eqGuestCount')?.value;
            const notes = document.getElementById('eqNotes')?.value.trim();

            const enquiryData = {
                id: 'EVT-' + Math.floor(1000 + Math.random() * 9000),
                name,
                phone,
                email,
                venue,
                occasion,
                date,
                guests,
                notes,
                submittedAt: new Date().toISOString()
            };

            // Save to localStorage for CRM viewing
            try {
                const enquiries = JSON.parse(localStorage.getItem('hsi_event_enquiries')) || [];
                enquiries.unshift(enquiryData);
                localStorage.setItem('hsi_event_enquiries', JSON.stringify(enquiries));
            } catch (err) {}

            closeEnquiryModal();
            enquiryForm.reset();

            // WhatsApp link with structured event enquiry details
            const waMsg = encodeURIComponent(`*New Banquet & Event Enquiry - Hotel Simran International*
Guest Name: ${name}
Phone: ${phone}
Venue: ${venue}
Occasion: ${occasion}
Date: ${date || 'Flexible'}
Estimated Guests: ${guests || 'N/A'}
Special Requests: ${notes || 'None'}`);

            window.open('https://wa.me/919300029104?text=' + waMsg, '_blank');
        });
    }

    // 4. Celebrate With Us - Event Video Coverage Switcher
    const videoTabs = document.querySelectorAll('.event-video-tab-btn');
    const mainVideoFrame = document.getElementById('mainEventVideoFrame');
    const mainVideoTitle = document.getElementById('eventVideoTitleDisplay');

    videoTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            videoTabs.forEach(t => {
                t.classList.remove('active');
                t.style.background = '#f8fafc';
                t.style.color = '#475569';
                t.style.borderColor = '#cbd5e1';
            });
            tab.classList.add('active');
            tab.style.background = '#c9983b';
            tab.style.color = '#ffffff';
            tab.style.borderColor = '#c9983b';

            const videoSrc = tab.getAttribute('data-video-src');
            const videoTitle = tab.getAttribute('data-video-title');
            if (mainVideoFrame && videoSrc) mainVideoFrame.src = videoSrc;
            if (mainVideoTitle && videoTitle) mainVideoTitle.textContent = videoTitle;
        });
    });

    // 5. Connect Bento Restaurant View Details button directly to Dining Modal
    const bentoDiningBtn = document.querySelector('[data-action="open-dining-details"]');
    if (bentoDiningBtn) {
        bentoDiningBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const text = 'restaurant';
            const modal = document.getElementById('diningMenuModal');
            if (modal) {
                modal.classList.add('active');
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        });
    }

    // Keyboard ESC listener for new modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeBanquetModal();
            closeEnquiryModal();
        }
    });
});



/* ============================================================
   IN-ROOM DINING DIGITAL GUEST ORDERS & VIDEO TESTIMONIALS
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

    // --------------------------------------------------------
    // 1. IN-ROOM DINING MODAL & ORDER DISPATCH
    // --------------------------------------------------------
    const irdModal = document.getElementById('inRoomDiningGuestModal');
    const irdForm = document.getElementById('inRoomDiningGuestForm');
    const totalDisplay = document.getElementById('irdOrderTotalDisplay');

    function calculateIrdTotal() {
        let total = 0;
        document.querySelectorAll('.ird-menu-item').forEach(item => {
            const price = parseInt(item.getAttribute('data-price')) || 0;
            const qty = parseInt(item.querySelector('.ird-qty')?.value) || 0;
            total += price * qty;
        });
        if (totalDisplay) {
            totalDisplay.textContent = '₹' + total.toLocaleString('en-IN');
        }
        return total;
    }

    document.querySelectorAll('.ird-qty').forEach(input => {
        input.addEventListener('input', calculateIrdTotal);
        input.addEventListener('change', calculateIrdTotal);
    });

    document.querySelectorAll('[data-action="open-in-room-dining-modal"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (irdModal) {
                irdModal.style.setProperty('display', 'flex', 'important');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    function closeIrdModal() {
        if (irdModal) {
            irdModal.style.setProperty('display', 'none', 'important');
            document.body.style.overflow = '';
        }
    }

    document.querySelectorAll('[data-action="close-in-room-dining-modal"]').forEach(btn => {
        btn.addEventListener('click', closeIrdModal);
    });

    if (irdModal) {
        irdModal.addEventListener('click', (e) => {
            if (e.target === irdModal) closeIrdModal();
        });
    }

    if (irdForm) {
        irdForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const roomNum = document.getElementById('irdRoomNum')?.value.trim();
            const guestName = document.getElementById('irdGuestName')?.value.trim();
            const notes = document.getElementById('irdNotes')?.value.trim();
            const total = calculateIrdTotal();

            if (total === 0) {
                alert('Please select at least 1 item to order.');
                return;
            }

            const items = [];
            document.querySelectorAll('.ird-menu-item').forEach(item => {
                const qty = parseInt(item.querySelector('.ird-qty')?.value) || 0;
                if (qty > 0) {
                    const name = item.querySelector('strong')?.textContent.trim() || 'Item';
                    items.push(qty + 'x ' + name);
                }
            });

            const orderData = {
                id: 'ORD-' + Math.floor(100 + Math.random() * 900),
                room: roomNum,
                guest: guestName,
                items: items.join(', '),
                total: total,
                notes: notes,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: 'Preparing'
            };

            // Save to localStorage for CRM In-Room Dining live feed
            try {
                const orders = JSON.parse(localStorage.getItem('hsi_room_service_orders')) || [];
                orders.unshift(orderData);
                localStorage.setItem('hsi_room_service_orders', JSON.stringify(orders));
            } catch(err) {}

            closeIrdModal();
            irdForm.reset();
            if (totalDisplay) totalDisplay.textContent = '₹0';

            const waMsg = encodeURIComponent(`*In-Room Dining Order - Hotel Simran International*
Room Number: Room ${roomNum}
Guest Name: ${guestName}
Items Ordered:
${items.map(i => '• ' + i).join('\n')}
Total Amount: ₹${total.toLocaleString('en-IN')}
Special Instructions: ${notes || 'None'}`);

            window.open('https://wa.me/919300029104?text=' + waMsg, '_blank');
        });
    }


    // --------------------------------------------------------
    // 2. VIDEO TESTIMONIALS SLIDER & MODAL PLAYBACK
    // --------------------------------------------------------
    const videoModal = document.getElementById('videoModal');
    const videoModalIframe = document.getElementById('videoModalIframe');
    const videoCloseBtn = document.getElementById('videoModalClose');

    document.querySelectorAll('.video-testim-card').forEach(card => {
        card.addEventListener('click', () => {
            const videoUrl = card.getAttribute('data-video-url') || 'https://www.youtube.com/embed/dQw4w9WgXcQ';
            if (videoModal && videoModalIframe) {
                videoModalIframe.src = videoUrl + (videoUrl.includes('?') ? '&' : '?') + 'autoplay=1';
                videoModal.classList.add('active');
                videoModal.style.setProperty('display', 'flex', 'important');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    if (videoCloseBtn && videoModal) {
        videoCloseBtn.addEventListener('click', () => {
            if (videoModalIframe) videoModalIframe.src = '';
            videoModal.classList.remove('active');
            videoModal.style.setProperty('display', 'none', 'important');
            document.body.style.overflow = '';
        });
    }

    const prevTestimBtn = document.getElementById('prevVideoTestim');
    const nextTestimBtn = document.getElementById('nextVideoTestim');
    const testimContainer = document.getElementById('videoTestimonialsContainer');

    if (prevTestimBtn && testimContainer) {
        prevTestimBtn.addEventListener('click', () => {
            testimContainer.scrollBy({ left: -320, behavior: 'smooth' });
        });
    }
    if (nextTestimBtn && testimContainer) {
        nextTestimBtn.addEventListener('click', () => {
            testimContainer.scrollBy({ left: 320, behavior: 'smooth' });
        });
    }
});
