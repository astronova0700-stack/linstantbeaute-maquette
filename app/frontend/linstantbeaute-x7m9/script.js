/* ============================================
   L'instant de Beauté — Script v3
   Lenis smooth scroll + GSAP ScrollTrigger animations
   Carrousel plat, menu mobile, compteurs animés
   ============================================ */

(function() {
    'use strict';

    // ============ PREFERS REDUCED MOTION CHECK ============
    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ============ LENIS SMOOTH SCROLL ============
    var lenis;
    if (!prefersReduced && typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            duration: 1.2,
            easing: function(t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        // Connect Lenis to GSAP ScrollTrigger
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            lenis.on('scroll', ScrollTrigger.update);
            gsap.ticker.add(function(time) {
                lenis.raf(time * 1000);
            });
            gsap.ticker.lagSmoothing(0);
        }
    }

    // ============ GSAP + SCROLLTRIGGER SETUP ============
    if (!prefersReduced && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // --- Hero split text reveal ---
        var heroTitle = document.querySelector('.hero-title[data-split]');
        if (heroTitle) {
            var text = heroTitle.textContent.trim();
            var words = text.split(/\s+/);
            heroTitle.innerHTML = words.map(function(word) {
                return '<span class="word"><span class="word-inner">' + word + '</span></span>';
            }).join('');

            var wordInners = heroTitle.querySelectorAll('.word-inner');
            gsap.to(wordInners, {
                y: 0,
                duration: 1,
                stagger: 0.12,
                ease: 'power3.out',
                delay: 0.3
            });
        }

        // --- Hero subtitle + CTAs fade in ---
        gsap.to('.hero-subtitle', {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            delay: 1
        });

        gsap.to('.hero-ctas', {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            delay: 1.2
        });

        // --- Hero image Ken Burns (continuous zoom) ---
        var heroImg = document.querySelector('.hero-img');
        if (heroImg) {
            gsap.fromTo(heroImg, 
                { scale: 1 },
                { scale: 1.08, duration: 20, ease: 'none', repeat: -1, yoyo: true }
            );
        }

        // --- Header condense on scroll ---
        ScrollTrigger.create({
            start: 'top -100',
            onEnter: function() { document.querySelector('.header').classList.add('condensed'); },
            onLeaveBack: function() { document.querySelector('.header').classList.remove('condensed'); }
        });

        // --- Section reveals (fade + rise) ---
        var sections = document.querySelectorAll('.section');
        sections.forEach(function(section) {
            var tag = section.querySelector('.section-tag');
            var title = section.querySelector('.section-title');
            var intro = section.querySelector('.section-intro');
            var elements = [tag, title, intro].filter(Boolean);

            elements.forEach(function(el, i) {
                gsap.from(el, {
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 85%',
                        toggleActions: 'play none none none'
                    },
                    opacity: 0,
                    y: 30,
                    duration: 0.8,
                    delay: i * 0.15,
                    ease: 'power2.out'
                });
            });
        });

        // --- Soins cards staggered reveal ---
        var soinCards = document.querySelectorAll('.soin-card');
        soinCards.forEach(function(card, i) {
            gsap.to(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                },
                opacity: 1,
                y: 0,
                duration: 0.7,
                delay: i * 0.1,
                ease: 'power2.out',
                onComplete: function() { card.classList.add('revealed'); }
            });
        });

        // --- Image reveal (clip-path mask opening) ---
        var imgReveals = document.querySelectorAll('.img-reveal');
        var isMobile = window.innerWidth < 768;

        imgReveals.forEach(function(container) {
            var media = container.querySelector('img') || container.querySelector('iframe');
            if (!media) return;

            // Clip-path reveal
            gsap.fromTo(container,
                { clipPath: 'inset(10% 10% 10% 10%)' },
                {
                    clipPath: 'inset(0% 0% 0% 0%)',
                    duration: 1.2,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: container,
                        start: 'top 80%',
                        toggleActions: 'play none none none'
                    }
                }
            );

            // Parallax (desktop only)
            if (!isMobile && media.tagName === 'IMG') {
                gsap.fromTo(media,
                    { y: -30 },
                    {
                        y: 30,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: container,
                            start: 'top bottom',
                            end: 'bottom top',
                            scrub: 0.8
                        }
                    }
                );
            }
        });

        // --- Guinot/Equipe text reveals ---
        var textBlocks = document.querySelectorAll('.guinot-text, .equipe-text, .cadeau-text, .infos-details');
        textBlocks.forEach(function(block) {
            var children = block.querySelectorAll('p, blockquote, h2, h3, .section-tag, .btn, .info-block, .social-link');
            children.forEach(function(child, i) {
                gsap.from(child, {
                    scrollTrigger: {
                        trigger: child,
                        start: 'top 88%',
                        toggleActions: 'play none none none'
                    },
                    opacity: 0,
                    y: 25,
                    duration: 0.7,
                    delay: i * 0.08,
                    ease: 'power2.out'
                });
            });
        });

        // --- Counter animation ---
        var counters = document.querySelectorAll('[data-counter]');
        counters.forEach(function(counter) {
            var target = parseFloat(counter.getAttribute('data-counter'));
            var decimals = parseInt(counter.getAttribute('data-decimals') || '0');
            
            ScrollTrigger.create({
                trigger: counter,
                start: 'top 90%',
                once: true,
                onEnter: function() {
                    gsap.to({ val: 0 }, {
                        val: target,
                        duration: 1.5,
                        ease: 'power2.out',
                        onUpdate: function() {
                            counter.textContent = this.targets()[0].val.toFixed(decimals);
                        }
                    });
                }
            });
        });

    } else {
        // Fallback: show everything if GSAP not loaded or reduced motion
        document.querySelectorAll('.hero-subtitle, .hero-ctas').forEach(function(el) {
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
        document.querySelectorAll('.soin-card').forEach(function(card) {
            card.style.opacity = '1';
            card.style.transform = 'none';
        });
        var heroTitleFallback = document.querySelector('.hero-title[data-split]');
        if (heroTitleFallback) {
            // Don't split, just show
            heroTitleFallback.style.opacity = '1';
        }
        document.querySelectorAll('[data-counter]').forEach(function(counter) {
            counter.textContent = counter.getAttribute('data-counter');
        });
    }

    // ============ HEADER SCROLL CLASS ============
    var header = document.querySelector('.header');
    function handleScroll() {
        if (window.pageYOffset > 60) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
    window.addEventListener('scroll', handleScroll, { passive: true });

    // ============ MOBILE MENU ============
    var navToggle = document.querySelector('.nav-toggle');
    var navMobile = document.querySelector('.nav-mobile');

    if (navToggle && navMobile) {
        navToggle.addEventListener('click', function() {
            navToggle.classList.toggle('active');
            navMobile.classList.toggle('open');
        });

        navMobile.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function() {
                navToggle.classList.remove('active');
                navMobile.classList.remove('open');
            });
        });
    }

    // ============ CAROUSEL (FLAT, NO LOOP) ============
    var track = document.querySelector('.carousel-track');
    var cards = document.querySelectorAll('.avis-card');
    var prevBtn = document.querySelector('.carousel-prev');
    var nextBtn = document.querySelector('.carousel-next');
    var dotsContainer = document.querySelector('.carousel-dots');
    var currentIndex = 0;

    if (track && cards.length > 0) {
        cards.forEach(function(_, i) {
            var dot = document.createElement('button');
            dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', 'Avis ' + (i + 1));
            dot.addEventListener('click', function() {
                goToSlide(i);
            });
            dotsContainer.appendChild(dot);
        });

        function goToSlide(index) {
            if (index < 0 || index >= cards.length) return;
            
            cards[currentIndex].classList.remove('active');
            currentIndex = index;
            cards[currentIndex].classList.add('active');

            var dots = dotsContainer.querySelectorAll('.carousel-dot');
            dots.forEach(function(dot, i) {
                dot.classList.toggle('active', i === currentIndex);
            });

            if (prevBtn) prevBtn.style.opacity = currentIndex === 0 ? '0.4' : '1';
            if (nextBtn) nextBtn.style.opacity = currentIndex === cards.length - 1 ? '0.4' : '1';
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                if (currentIndex > 0) goToSlide(currentIndex - 1);
            });
            prevBtn.style.opacity = '0.4';
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                if (currentIndex < cards.length - 1) goToSlide(currentIndex + 1);
            });
        }
    }

    // ============ SMOOTH SCROLL (with Lenis or native) ============
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            var href = this.getAttribute('href');
            var target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                var headerHeight = header ? header.offsetHeight : 0;
                var targetPos = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                if (lenis) {
                    lenis.scrollTo(target, { offset: -headerHeight });
                } else {
                    window.scrollTo({
                        top: targetPos,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

})();