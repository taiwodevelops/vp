(function() {
    'use strict';

    // ============================================================
    // 1. UTILITY FUNCTIONS
    // ============================================================

    const debounce = (fn, delay = 100) => {
        let timer;
        return function(...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    };

    const throttle = (fn, limit = 100) => {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                fn.apply(this, args);
                inThrottle = true;
                setTimeout(() => (inThrottle = false), limit);
            }
        };
    };

    const ready = (fn) => {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    };

    // ============================================================
    // 2. LOADER — FIXED: Guaranteed hide, error-tolerant
    // ============================================================
    const initLoader = () => {
        const loader = document.getElementById('loader');
        if (!loader) return;

        let hidden = false;

        const hideLoader = () => {
            if (hidden) return;
            hidden = true;
            loader.classList.add('hidden');
            document.body.classList.add('loaded');
            console.log('[VP Campaign] Loader hidden');
            if (typeof AOS !== 'undefined') {
                setTimeout(() => AOS.refresh(), 100);
            }
        };

        // 1. Hide immediately after DOM is ready (safe fallback)
        if (document.readyState === 'complete') {
            setTimeout(hideLoader, 200);
        } else {
            // 2. Listen to load event
            window.addEventListener('load', () => {
                setTimeout(hideLoader, 200);
            });
            // 3. Listen to DOMContentLoaded (if load is too slow)
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(hideLoader, 300);
            });
        }

        // 4. FORCED TIMEOUT — hide after 1.5 seconds MAX
        setTimeout(hideLoader, 1500);

        // 5. Emergency hide after 3 seconds (last resort)
        setTimeout(() => {
            if (!hidden) hideLoader();
        }, 3000);
    };

    // ============================================================
    // 3. WRAPPER FOR INIT FUNCTIONS (catch errors)
    // ============================================================
    const safeInit = (fn, name) => {
        try {
            fn();
        } catch (err) {
            console.warn(`[VP Campaign] ${name} failed:`, err);
        }
    };

    // ============================================================
    // 4. ALL OTHER INIT FUNCTIONS (identical to yours, but safe)
    // ============================================================

    const initCursor = () => {
        const dot = document.querySelector('.cursor-dot');
        const ring = document.querySelector('.cursor-ring');
        if (!dot || !ring) return;
        if (window.innerWidth <= 768) {
            dot.style.display = 'none';
            ring.style.display = 'none';
            return;
        }
        let mouseX = 0,
            mouseY = 0;
        let ringX = 0,
            ringY = 0;
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            dot.style.left = mouseX + 'px';
            dot.style.top = mouseY + 'px';
        });
        const animateRing = () => {
            ringX += (mouseX - ringX) * 0.12;
            ringY += (mouseY - ringY) * 0.12;
            ring.style.left = ringX + 'px';
            ring.style.top = ringY + 'px';
            requestAnimationFrame(animateRing);
        };
        animateRing();
        const interactive = 'a, button, .btn, .gallery-item, .faq-question, .navbar-toggle, .nav-cta';
        document.addEventListener('mouseover', (e) => {
            if (e.target.matches(interactive) || e.target.closest(interactive)) {
                dot.classList.add('hover');
                ring.classList.add('hover');
            }
        });
        document.addEventListener('mouseout', (e) => {
            if (e.target.matches(interactive) || e.target.closest(interactive)) {
                dot.classList.remove('hover');
                ring.classList.remove('hover');
            }
        });
        document.addEventListener('mouseleave', () => {
            dot.style.opacity = '0';
            ring.style.opacity = '0';
        });
        document.addEventListener('mouseenter', () => {
            dot.style.opacity = '1';
            ring.style.opacity = '1';
        });
    };

    const initThemeToggle = () => {
        const navbar = document.querySelector('.navbar-inner');
        if (!navbar) return;
        let toggle = document.querySelector('.theme-toggle');
        if (!toggle) {
            toggle = document.createElement('button');
            toggle.className = 'theme-toggle';
            toggle.setAttribute('aria-label', 'Toggle theme');
            toggle.innerHTML = '<i class="fas fa-moon"></i>';
            toggle.style.cssText = `
                background: var(--bg-surface);
                border: 1px solid var(--border-color);
                border-radius: 50%;
                width: 38px;
                height: 38px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--text-secondary);
                transition: all var(--transition-base);
                cursor: pointer;
                font-size: 1rem;
                margin-left: var(--space-3);
                flex-shrink: 0;
            `;
            const navToggle = document.querySelector('.navbar-toggle');
            if (navToggle) {
                navbar.insertBefore(toggle, navToggle);
            } else {
                navbar.appendChild(toggle);
            }
        }
        const savedTheme = localStorage.getItem('vp-theme') || 'dark';
        if (savedTheme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
            toggle.innerHTML = '<i class="fas fa-sun"></i>';
            applyLightTheme();
        }
        toggle.addEventListener('click', () => {
            const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
            if (isDark) {
                document.documentElement.setAttribute('data-theme', 'light');
                toggle.innerHTML = '<i class="fas fa-sun"></i>';
                localStorage.setItem('vp-theme', 'light');
                applyLightTheme();
            } else {
                document.documentElement.removeAttribute('data-theme');
                toggle.innerHTML = '<i class="fas fa-moon"></i>';
                localStorage.setItem('vp-theme', 'dark');
                applyDarkTheme();
            }
        });

        function applyLightTheme() {
            const root = document.documentElement.style;
            root.setProperty('--bg-primary', '#f8f7fc');
            root.setProperty('--bg-secondary', '#f0eef6');
            root.setProperty('--bg-tertiary', '#e8e5f0');
            root.setProperty('--text-primary', '#0a0a0f');
            root.setProperty('--text-secondary', 'rgba(10, 10, 15, 0.8)');
            root.setProperty('--text-muted', 'rgba(10, 10, 15, 0.5)');
            root.setProperty('--border-color', 'rgba(10, 10, 15, 0.08)');
            root.setProperty('--border-color-hover', 'rgba(10, 10, 15, 0.16)');
            root.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.6)');
            root.setProperty('--glass-border', 'rgba(10, 10, 15, 0.06)');
            root.setProperty('--glass-shadow', '0 8px 32px rgba(0, 0, 0, 0.08)');
            root.setProperty('--bg-surface', 'rgba(0, 0, 0, 0.03)');
            root.setProperty('--bg-surface-hover', 'rgba(0, 0, 0, 0.06)');
        }

        function applyDarkTheme() {
            const root = document.documentElement.style;
            root.setProperty('--bg-primary', '#0a0a0f');
            root.setProperty('--bg-secondary', '#12121a');
            root.setProperty('--bg-tertiary', '#1a1a2e');
            root.setProperty('--text-primary', '#ffffff');
            root.setProperty('--text-secondary', 'rgba(255, 255, 255, 0.8)');
            root.setProperty('--text-muted', 'rgba(255, 255, 255, 0.5)');
            root.setProperty('--border-color', 'rgba(255, 255, 255, 0.08)');
            root.setProperty('--border-color-hover', 'rgba(255, 255, 255, 0.16)');
            root.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.05)');
            root.setProperty('--glass-border', 'rgba(255, 255, 255, 0.08)');
            root.setProperty('--glass-shadow', '0 8px 32px rgba(0, 0, 0, 0.4)');
            root.setProperty('--bg-surface', 'rgba(255, 255, 255, 0.04)');
            root.setProperty('--bg-surface-hover', 'rgba(255, 255, 255, 0.08)');
        }
    };

    const initNavbar = () => {
        const navbar = document.querySelector('.navbar');
        const progressBar = document.querySelector('.scroll-progress-bar');
        if (!navbar) return;
        const handleScroll = throttle(() => {
            const scrollY = window.scrollY;
            const threshold = 80;
            if (scrollY > threshold) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
            if (progressBar) {
                const winHeight = document.documentElement.scrollHeight - window.innerHeight;
                const progress = winHeight > 0 ? (scrollY / winHeight) * 100 : 0;
                progressBar.style.width = Math.min(progress, 100) + '%';
                progressBar.parentElement.setAttribute('aria-valuenow', Math.round(progress));
            }
        }, 10);
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', debounce(handleScroll, 200), { passive: true });
        handleScroll();
    };

    const initBackToTop = () => {
        const btn = document.querySelector('.back-to-top');
        if (!btn) return;
        const toggleVisibility = throttle(() => {
            if (window.scrollY > 400) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        }, 100);
        window.addEventListener('scroll', toggleVisibility, { passive: true });
        toggleVisibility();
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    };

    const initSmoothScroll = () => {
        document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 0;
                    const offsetTop = target.getBoundingClientRect().top + window.scrollY - navbarHeight - 20;
                    window.scrollTo({ top: offsetTop, behavior: 'smooth' });
                    const navLinks = document.querySelector('.navbar-links');
                    const toggle = document.querySelector('.navbar-toggle');
                    if (navLinks && navLinks.classList.contains('open')) {
                        navLinks.classList.remove('open');
                        toggle?.classList.remove('active');
                        toggle?.setAttribute('aria-expanded', 'false');
                    }
                    history.pushState(null, null, targetId);
                }
            });
        });
    };

    const initMobileNav = () => {
        const toggle = document.querySelector('.navbar-toggle');
        const navLinks = document.querySelector('.navbar-links');
        if (!toggle || !navLinks) return;
        toggle.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('open');
            toggle.classList.toggle('active');
            toggle.setAttribute('aria-expanded', isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('open')) {
                const isClickInside = navLinks.contains(e.target) || toggle.contains(e.target);
                if (!isClickInside) {
                    navLinks.classList.remove('open');
                    toggle.classList.remove('active');
                    toggle.setAttribute('aria-expanded', 'false');
                    document.body.style.overflow = '';
                }
            }
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('open')) {
                navLinks.classList.remove('open');
                toggle.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });
    };

    const initTyped = () => {
        const el = document.getElementById('typed-text');
        if (!el || typeof Typed === 'undefined') return;
        new Typed(el, {
            strings: [
                'Eminent',
                'Your Future VP',
                'A Student Leader',
                'A Voice for Change',
                'Committed to You'
            ],
            typeSpeed: 60,
            backSpeed: 40,
            backDelay: 2000,
            startDelay: 1000,
            loop: true,
            cursorChar: '|',
            autoInsertCss: true,
        });
    };

    const initAOS = () => {
        if (typeof AOS === 'undefined') return;
        AOS.init({
            duration: 800,
            once: true,
            offset: 80,
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
            disable: window.innerWidth < 576 ? true : false,
        });
    };

    const initGSAP = () => {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
        gsap.registerPlugin(ScrollTrigger);
        gsap.to('.hero-profile-wrapper', {
            y: 40,
            ease: 'none',
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: 1.5,
            },
        });
        gsap.to('.floating-card-1', {
            y: 60,
            x: -20,
            ease: 'none',
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: 1.2,
            },
        });
        gsap.to('.floating-card-2', {
            y: -40,
            x: 30,
            ease: 'none',
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: 1.2,
            },
        });
        gsap.to('.floating-card-3', {
            y: 50,
            x: -20,
            ease: 'none',
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: 1.2,
            },
        });
        document.querySelectorAll('.timeline-item').forEach((item, i) => {
            gsap.from(item, {
                opacity: 0,
                x: -30,
                duration: 0.8,
                delay: i * 0.12,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: item,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse',
                },
            });
        });
        gsap.from('.vision-card', {
            opacity: 0,
            y: 50,
            duration: 0.7,
            stagger: 0.12,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: '.vision-grid',
                start: 'top 80%',
                toggleActions: 'play none none reverse',
            },
        });
        gsap.from('.achievement-card', {
            opacity: 0,
            scale: 0.85,
            duration: 0.6,
            stagger: 0.1,
            ease: 'back.out(1.2)',
            scrollTrigger: {
                trigger: '.achievements-grid',
                start: 'top 80%',
                toggleActions: 'play none none reverse',
            },
        });
        gsap.from('.manifesto-item', {
            opacity: 0,
            x: -20,
            duration: 0.5,
            stagger: 0.06,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: '.manifesto-grid',
                start: 'top 80%',
                toggleActions: 'play none none reverse',
            },
        });
        gsap.to('.aurora-blob-1', {
            x: 80,
            y: 60,
            ease: 'none',
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom bottom',
                scrub: 2,
            },
        });
        gsap.to('.aurora-blob-2', {
            x: -60,
            y: -80,
            ease: 'none',
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom bottom',
                scrub: 2,
            },
        });
        setTimeout(() => ScrollTrigger.refresh(), 300);
    };

    const initSwiper = () => {
        const container = document.querySelector('.testimonials-slider');
        if (!container || typeof Swiper === 'undefined') return;
        new Swiper(container, {
            slidesPerView: 1,
            spaceBetween: 24,
            centeredSlides: true,
            loop: true,
            autoplay: {
                delay: 5000,
                disableOnInteraction: true,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            breakpoints: {
                768: {
                    slidesPerView: 2,
                    spaceBetween: 24,
                },
                1024: {
                    slidesPerView: 2.5,
                    spaceBetween: 32,
                },
            },
            effect: 'slide',
            speed: 600,
        });
    };

    const initParticles = () => {
        const container = document.getElementById('particles-js');
        if (!container || typeof particlesJS === 'undefined') return;
        try {
            particlesJS('particles-js', {
                particles: {
                    number: {
                        value: 60,
                        density: { enable: true, value_area: 800 },
                    },
                    color: { value: '#7c3aed' },
                    shape: { type: 'circle' },
                    opacity: {
                        value: 0.25,
                        random: true,
                        anim: { enable: true, speed: 1, opacity_min: 0.05, sync: false },
                    },
                    size: {
                        value: 3,
                        random: true,
                        anim: { enable: true, speed: 2, size_min: 0.5, sync: false },
                    },
                    line_linked: {
                        enable: true,
                        distance: 150,
                        color: '#7c3aed',
                        opacity: 0.08,
                        width: 1,
                    },
                    move: {
                        enable: true,
                        speed: 0.6,
                        direction: 'none',
                        random: true,
                        straight: false,
                        out_mode: 'out',
                        bounce: false,
                        attract: { enable: true, rotateX: 600, rotateY: 1200 },
                    },
                },
                interactivity: {
                    detect_on: 'canvas',
                    events: {
                        onhover: { enable: true, mode: 'grab' },
                        onclick: { enable: true, mode: 'push' },
                        resize: true,
                    },
                    modes: {
                        grab: { distance: 140, line_linked: { opacity: 0.15 } },
                        push: { particles_nb: 3 },
                    },
                },
                retina_detect: true,
            });
        } catch (e) {
            console.warn('[VP Campaign] Particles.js failed:', e);
        }
    };

    const initCounters = () => {
        const counters = document.querySelectorAll('.hero-stat-number[data-count], .about-stat-number[data-count], .achievement-number[data-count]');
        if (!counters.length) return;
        const animateCounter = (el) => {
            const target = parseInt(el.getAttribute('data-count'), 10);
            if (isNaN(target)) return;
            const duration = 1800;
            const startTime = performance.now();
            const update = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.round(eased * target);
                el.textContent = current;
                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    el.textContent = target;
                    el.classList.add('counter-animate');
                }
            };
            requestAnimationFrame(update);
        };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    if (!el.dataset.animated) {
                        el.dataset.animated = 'true';
                        animateCounter(el);
                    }
                }
            });
        }, { threshold: 0.4, rootMargin: '0px 0px -40px 0px' });
        counters.forEach((counter) => observer.observe(counter));
    };

    const initSkills = () => {
        const fills = document.querySelectorAll('.skill-bar-fill');
        if (!fills.length) return;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const fill = entry.target;
                    const width = fill.getAttribute('data-width');
                    if (width) {
                        fill.style.setProperty('--fill-width', width + '%');
                        fill.classList.add('animate');
                    }
                    observer.unobserve(fill);
                }
            });
        }, { threshold: 0.5 });
        fills.forEach((fill) => observer.observe(fill));
    };

    const initGallery = () => {
        const items = document.querySelectorAll('.gallery-item');
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightboxImage');
        const lightboxCaption = document.getElementById('lightboxCaption');
        const closeBtn = lightbox?.querySelector('.lightbox-close');
        const prevBtn = lightbox?.querySelector('.lightbox-prev');
        const nextBtn = lightbox?.querySelector('.lightbox-next');
        if (!lightbox || !lightboxImg || !items.length) return;
        let currentIndex = 0;
        const galleryItems = [];
        items.forEach((item, index) => {
            const src = item.getAttribute('data-src');
            const title = item.getAttribute('data-title') || 'Image';
            if (src) {
                galleryItems.push({ src, title });
            }
            item.addEventListener('click', () => {
                currentIndex = index;
                openLightbox(currentIndex);
            });
            item.setAttribute('tabindex', '0');
            item.setAttribute('role', 'button');
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    currentIndex = index;
                    openLightbox(currentIndex);
                }
            });
        });
        const openLightbox = (index) => {
            const data = galleryItems[index];
            if (!data) return;
            lightboxImg.src = data.src;
            lightboxImg.alt = data.title;
            lightboxCaption.textContent = data.title;
            lightbox.classList.add('open');
            document.body.style.overflow = 'hidden';
            document.addEventListener('keydown', handleKeydown);
        };
        const closeLightbox = () => {
            lightbox.classList.remove('open');
            document.body.style.overflow = '';
            document.removeEventListener('keydown', handleKeydown);
        };
        const navigate = (direction) => {
            if (!galleryItems.length) return;
            currentIndex = (currentIndex + direction + galleryItems.length) % galleryItems.length;
            const data = galleryItems[currentIndex];
            if (data) {
                lightboxImg.src = data.src;
                lightboxImg.alt = data.title;
                lightboxCaption.textContent = data.title;
            }
        };
        const handleKeydown = (e) => {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') navigate(1);
            if (e.key === 'ArrowLeft') navigate(-1);
        };
        closeBtn?.addEventListener('click', closeLightbox);
        prevBtn?.addEventListener('click', () => navigate(-1));
        nextBtn?.addEventListener('click', () => navigate(1));
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    };

    const initFAQ = () => {
        const questions = document.querySelectorAll('.faq-question');
        if (!questions.length) return;
        questions.forEach((question) => {
            question.addEventListener('click', () => {
                const isExpanded = question.getAttribute('aria-expanded') === 'true';
                questions.forEach((q) => {
                    if (q !== question) {
                        q.setAttribute('aria-expanded', 'false');
                    }
                });
                question.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
            });
            question.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    question.click();
                }
            });
        });
    };

    const initRipples = () => {
        document.querySelectorAll('.btn-ripple').forEach((btn) => {
            btn.addEventListener('click', function(e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const size = Math.max(rect.width, rect.height) * 0.6;
                const ripple = document.createElement('span');
                ripple.className = 'ripple-effect';
                ripple.style.cssText = `
                    left: ${x - size/2}px;
                    top: ${y - size/2}px;
                    width: ${size}px;
                    height: ${size}px;
                `;
                this.appendChild(ripple);
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });
    };

    const initMagnetic = () => {
        const buttons = document.querySelectorAll('.btn-primary, .btn-ghost, .nav-cta');
        if (!buttons.length) return;
        buttons.forEach((btn) => {
            btn.addEventListener('mousemove', function(e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                const strength = 0.3;
                this.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
            });
            btn.addEventListener('mouseleave', function() {
                this.style.transform = 'translate(0, 0)';
                this.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
            });
            btn.addEventListener('mouseenter', function() {
                this.style.transition = 'transform 0.1s ease-out';
            });
        });
    };

    const initMouseGlow = () => {
        const glow = document.createElement('div');
        glow.className = 'mouse-glow';
        document.body.appendChild(glow);
        document.addEventListener('mousemove', (e) => {
            glow.style.left = e.clientX + 'px';
            glow.style.top = e.clientY + 'px';
        });
        if (window.innerWidth <= 768) {
            glow.style.display = 'none';
        }
    };

    const launchConfetti = () => {
        const container = document.createElement('div');
        container.className = 'confetti-container';
        document.body.appendChild(container);
        const colors = ['#7c3aed', '#4f46e5', '#ec4899', '#f472b6', '#a78bfa', '#34d399', '#fbbf24', '#f87171'];
        const pieces = 80;
        for (let i = 0; i < pieces; i++) {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            const size = 6 + Math.random() * 8;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const left = Math.random() * 100;
            const duration = 1.5 + Math.random() * 2.5;
            const delay = Math.random() * 1.2;
            const rotate = Math.random() * 720;
            const shape = Math.random() > 0.5 ? '50%' : '2px';
            piece.style.cssText = `
                left: ${left}%;
                width: ${size}px;
                height: ${size * (0.4 + Math.random() * 0.6)}px;
                background: ${color};
                border-radius: ${shape};
                animation-duration: ${duration}s;
                animation-delay: ${delay}s;
                transform: rotate(${rotate}deg);
            `;
            container.appendChild(piece);
        }
        setTimeout(() => {
            container.remove();
        }, 5000);
    };

    const initConfetti = () => {
        const buttons = document.querySelectorAll('.nav-cta, .hero-actions .btn-primary, .hero-actions .btn-ghost');
        buttons.forEach((btn) => {
            btn.addEventListener('click', function(e) {
                if (this.closest('.contact-form')) return;
                launchConfetti();
            });
        });
    };

    const initContactForm = () => {
        const form = document.getElementById('contactForm');
        if (!form) return;
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            let isValid = true;
            const fields = this.querySelectorAll('input, textarea');
            fields.forEach((field) => {
                const group = field.closest('.form-group');
                if (!group) return;
                group.classList.remove('error');
                if (field.hasAttribute('required') && !field.value.trim()) {
                    group.classList.add('error');
                    isValid = false;
                }
                if (field.type === 'email' && field.value.trim()) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(field.value.trim())) {
                        group.classList.add('error');
                        isValid = false;
                    }
                }
            });
            if (!isValid) {
                const firstError = form.querySelector('.form-group.error');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return;
            }
            const successEl = form.querySelector('.form-success');
            if (successEl) {
                successEl.style.display = 'flex';
                successEl.querySelector('span').textContent = 'Your message has been sent. I\'ll be in touch soon!';
            }
            form.reset();
            launchConfetti();
            setTimeout(() => {
                if (successEl) {
                    successEl.style.display = 'none';
                }
            }, 5000);
            console.log('[VP Campaign] Form submitted successfully!');
        });
    };

    const initParallaxElements = () => {
        document.querySelectorAll('.parallax-element').forEach((el) => {
            const speed = parseFloat(el.getAttribute('data-speed')) || 0.15;
            const direction = el.getAttribute('data-direction') || 'up';
            window.addEventListener('scroll', throttle(() => {
                const rect = el.getBoundingClientRect();
                const viewportHeight = window.innerHeight;
                const offset = 1 - (rect.top + rect.height / 2) / viewportHeight;
                const translate = direction === 'up' ? offset * speed * 100 : -offset * speed * 100;
                el.style.transform = `translateY(${translate}px)`;
            }, 20), { passive: true });
        });
    };

    const initLazyLoading = () => {
        if ('loading' in HTMLImageElement.prototype) {
            document.querySelectorAll('img[loading="lazy"]').forEach((img) => {
                img.src = img.src;
            });
        } else {
            document.querySelectorAll('img').forEach((img) => {
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                }
            });
        }
    };

    


 const initAudio = () => {
    const audio = document.getElementById('bgAudio');
    const toggle = document.getElementById('audioToggle');

    if (!audio) {
        console.warn('[Audio] #bgAudio not found');
        return;
    }
    if (!toggle) {
        console.warn('[Audio] #audioToggle not found');
        
    }

    let isPlaying = false;
    let isMuted = false;

    
    const saved = localStorage.getItem('vp-audio-muted');
    if (saved === 'true') {
        isMuted = true;
        audio.muted = true;
        if (toggle) {
            toggle.classList.add('muted');
            toggle.dataset.tooltip = 'Unmute music';
        }
    } else if (toggle) {
        toggle.dataset.tooltip = 'Mute music';
    }

    const updateUI = () => {
        if (!toggle) return;
        if (isMuted) {
            toggle.classList.add('muted');
            toggle.classList.remove('playing');
            toggle.dataset.tooltip = 'Unmute music';
        } else if (isPlaying) {
            toggle.classList.remove('muted');
            toggle.classList.add('playing');
            toggle.dataset.tooltip = 'Mute music';
        } else {
            toggle.classList.remove('muted', 'playing');
            toggle.dataset.tooltip = 'Mute music';
        }
    };

    const playAudio = () => {
        if (isMuted) {
            console.log('[Audio] Muted – not playing');
            return Promise.resolve();
        }
        console.log('[Audio] Attempting to play...');
        return audio.play()
            .then(() => {
                isPlaying = true;
                updateUI();
                console.log('[Audio] Playing successfully');
            })
            .catch((err) => {
                isPlaying = false;
                updateUI();
                console.warn('[Audio] Play failed:', err.message);
                return Promise.reject(err);
            });
    };

    
    setTimeout(() => {
        playAudio().catch(() => {
            console.log('[Audio] Autoplay blocked. Waiting for user interaction.');
            const resume = () => {
                if (!isPlaying && !isMuted) {
                    playAudio().catch(() => {});
                }
                document.removeEventListener('click', resume);
                document.removeEventListener('touchstart', resume);
                document.removeEventListener('keydown', resume);
            };
            document.addEventListener('click', resume);
            document.addEventListener('touchstart', resume);
            document.addEventListener('keydown', resume);
        });
    }, 300);

    
    if (toggle) {
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            isMuted = !isMuted;
            audio.muted = isMuted;
            localStorage.setItem('vp-audio-muted', String(isMuted));
            if (isMuted) {
                if (isPlaying) {
                    audio.pause();
                    isPlaying = false;
                }
                updateUI();
                console.log('[Audio] Muted');
            } else {
                if (!isPlaying) {
                    playAudio().catch(() => {});
                } else {
                    updateUI();
                }
                console.log('[Audio] Unmuted');
            }
        });
    }

    
    audio.addEventListener('play', () => {
        isPlaying = true;
        updateUI();
    });
    audio.addEventListener('pause', () => {
        isPlaying = false;
        updateUI();
    });
    audio.addEventListener('error', (e) => {
        console.error('[Audio] Error:', e);
        console.log('[Audio] Current src:', audio.currentSrc);
    });

    
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && isPlaying && !isMuted) {
            audio.pause();
            console.log('[Audio] Paused because tab hidden');
        } else if (!document.hidden && !isMuted && !isPlaying) {
            playAudio().catch(() => {});
        }
    });

    
    document.addEventListener('keydown', (e) => {
        if ((e.key === 'm' || e.key === 'M') && !e.target.matches('input, textarea, select')) {
            e.preventDefault();
            if (toggle) toggle.click();
        }
    });

    console.log('[Audio] Initialized. Muted:', isMuted);
 };

    
    
    ready(() => {
        console.log('[VP Campaign] Initializing...');

        
        safeInit(initLoader, 'Loader');

        
        safeInit(initCursor, 'Cursor');
        safeInit(initThemeToggle, 'ThemeToggle');
        safeInit(initNavbar, 'Navbar');
        safeInit(initBackToTop, 'BackToTop');
        safeInit(initSmoothScroll, 'SmoothScroll');
        safeInit(initMobileNav, 'MobileNav');

        safeInit(initTyped, 'Typed');
        safeInit(initAOS, 'AOS');
        safeInit(initGSAP, 'GSAP');
        safeInit(initSwiper, 'Swiper');
        safeInit(initParticles, 'Particles');

        safeInit(initCounters, 'Counters');
        safeInit(initSkills, 'Skills');
        safeInit(initGallery, 'Gallery');
        safeInit(initFAQ, 'FAQ');
        safeInit(initRipples, 'Ripples');
        safeInit(initMagnetic, 'Magnetic');
        safeInit(initMouseGlow, 'MouseGlow');
        safeInit(initConfetti, 'Confetti');
        safeInit(initContactForm, 'ContactForm');
        safeInit(initParallaxElements, 'Parallax');
        safeInit(initLazyLoading, 'LazyLoading');
        safeInit(initAudio, 'Audio');

        
        setTimeout(() => {
            if (typeof AOS !== 'undefined') AOS.refresh();
            if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
        }, 400);

        console.log('[VP Campaign] 🚀 Ready!');
    });

})();