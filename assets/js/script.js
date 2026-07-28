/* ============================================
   L'Instant de Beauté — Script final
   Lenis smooth scroll + GSAP ScrollTrigger + parallaxe
   Carrousel plat, menu mobile, compteurs animés
   ============================================ */

(function() {
    'use strict';

    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var isMobile = window.innerWidth < 768;
    var lenis;

    // ============ LENIS SMOOTH SCROLL ============
    if (!prefersReduced && typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            duration: 1.2,
            easing: function(t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 0.9,
            touchMultiplier: 1.5
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            lenis.on('scroll', ScrollTrigger.update);
            gsap.ticker.add(function(time) {
                lenis.raf(time * 1000);
            });
            gsap.ticker.lagSmoothing(0);
        }
    }

    // ============ GSAP + SCROLLTRIGGER ============
    if (!prefersReduced && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // --- Hero split text reveal ---
        var heroTitle = document.querySelector('.hero-title[data-split]');
        if (heroTitle) {
            var text = heroTitle.textContent.trim();
            var words = text.split(/\s+/);
            heroTitle.innerHTML = words.map(function(word) {
                return '<span class="word"><span class="word-inner">' + word + '</span></span>';
            }).join(' ');

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

        // --- Hero parallax : background descend lentement ---
        var heroImg = document.querySelector('.hero-img');
        if (heroImg) {
            gsap.fromTo(heroImg,
                { y: '-10%' },
                {
                    y: '10%',
                    ease: 'none',
                    scrollTrigger: {
                        trigger: '.hero',
                        start: 'top top',
                        end: 'bottom top',
                        scrub: 0.6
                    }
                }
            );
        }

        // --- Header condense on scroll ---
        ScrollTrigger.create({
            start: 'top -100',
            onEnter: function() { document.querySelector('.header').classList.add('condensed'); },
            onLeaveBack: function() { document.querySelector('.header').classList.remove('condensed'); }
        });

        // --- Section header reveals ---
        var sections = document.querySelectorAll('.section');
        sections.forEach(function(section) {
            var header = section.querySelector('.section-tag, .section-title, .section-intro');
            if (!header) return;
            var elements = section.querySelectorAll('.section-tag, .section-title, .section-intro');
            gsap.from(elements, {
                scrollTrigger: {
                    trigger: header,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                },
                opacity: 0,
                y: 30,
                duration: 0.8,
                stagger: 0.12,
                ease: 'power2.out'
            });
        });

        // --- Soins cards staggered reveal ---
        var soinCards = document.querySelectorAll('.soin-card');
        soinCards.forEach(function(card, i) {
            gsap.to(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 86%',
                    toggleActions: 'play none none none'
                },
                opacity: 1,
                y: 0,
                duration: 0.7,
                delay: (i % 3) * 0.1,
                ease: 'power2.out',
                onComplete: function() { card.classList.add('revealed'); }
            });
        });

        // --- Image reveal (clip-path mask) + parallax ---
        var imgReveals = document.querySelectorAll('.img-reveal');

        imgReveals.forEach(function(container) {
            var media = container.querySelector('img') || container.querySelector('iframe');
            if (!media) return;

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

            // Parallax image inside container (desktop only, small amplitude)
            if (!isMobile && media.tagName === 'IMG') {
                gsap.fromTo(media,
                    { y: '-8%' },
                    {
                        y: '8%',
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

        // --- Banner parallax ---
        var banners = document.querySelectorAll('.banner-bg');
        banners.forEach(function(bg) {
            var img = bg.querySelector('img');
            if (!img) return;
            gsap.fromTo(img,
                { y: '-12%' },
                {
                    y: '12%',
                    ease: 'none',
                    scrollTrigger: {
                        trigger: bg.parentElement,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: 0.8
                    }
                }
            );
        });

        // --- Text block reveals ---
        var textBlocks = document.querySelectorAll('.guinot-text, .equipe-text, .cadeau-text, .infos-details');
        textBlocks.forEach(function(block) {
            var children = block.querySelectorAll('p, h2, h3, .section-tag, .btn, .info-block, .social-link, .horaires');
            gsap.from(children, {
                scrollTrigger: {
                    trigger: block,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                },
                opacity: 0,
                y: 25,
                duration: 0.7,
                stagger: 0.08,
                ease: 'power2.out'
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
                        duration: 1.6,
                        ease: 'power2.out',
                        onUpdate: function() {
                            counter.textContent = this.targets()[0].val.toFixed(decimals);
                        }
                    });
                }
            });
        });

    } else {
        // Fallback
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
            heroTitleFallback.innerHTML = heroTitleFallback.textContent;
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
            var isOpen = navMobile.classList.toggle('open');
            navToggle.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        navMobile.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function() {
                navToggle.classList.remove('active');
                navMobile.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // ============ CAROUSEL (FLAT, NO LOOP, REWIND) ============
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
            dot.setAttribute('role', 'tab');
            dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
            dot.addEventListener('click', function() {
                goToSlide(i);
            });
            dotsContainer.appendChild(dot);
        });

        function updateButtons() {
            if (prevBtn) {
                prevBtn.disabled = currentIndex === 0;
                prevBtn.style.opacity = currentIndex === 0 ? '0.35' : '1';
            }
            if (nextBtn) {
                nextBtn.disabled = currentIndex === cards.length - 1;
                nextBtn.style.opacity = currentIndex === cards.length - 1 ? '0.35' : '1';
            }
        }

        function goToSlide(index) {
            if (index < 0 || index >= cards.length) return;
            
            cards[currentIndex].classList.remove('active');
            currentIndex = index;
            cards[currentIndex].classList.add('active');

            var dots = dotsContainer.querySelectorAll('.carousel-dot');
            dots.forEach(function(dot, i) {
                var active = i === currentIndex;
                dot.classList.toggle('active', active);
                dot.setAttribute('aria-selected', active ? 'true' : 'false');
            });

            updateButtons();
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                if (currentIndex > 0) goToSlide(currentIndex - 1);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                if (currentIndex < cards.length - 1) goToSlide(currentIndex + 1);
            });
        }

        updateButtons();
    }

    // ============ SMOOTH SCROLL ============
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            var href = this.getAttribute('href');
            var target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                var headerHeight = header ? header.offsetHeight : 0;
                
                if (lenis) {
                    lenis.scrollTo(target, { offset: -headerHeight - 10 });
                } else {
                    var targetPos = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 10;
                    window.scrollTo({
                        top: targetPos,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

})();
