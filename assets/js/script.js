/* ============================================
   L'Instant de Beauté — Script v3
   Preloader + Lenis smooth scroll + GSAP motion
   ============================================ */

(function() {
    'use strict';

    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var isMobile = window.innerWidth < 768;
    var lenis;

    // ============ NO-JS FALLBACK CLASS ============
    document.documentElement.classList.remove('no-js');

    // ============ PRELOADER ============
    function runPreloader(callback) {
        var preloader = document.getElementById('preloader');
        var text = preloader.querySelector('.preloader-text');
        var curtains = preloader.querySelectorAll('.preloader-curtain');
        var chars = text.textContent.split('');

        text.innerHTML = chars.map(function(ch) {
            return ch === ' ' ? '<span class="char">&nbsp;</span>' : '<span class="char">' + ch + '</span>';
        }).join('');

        var charEls = text.querySelectorAll('.char');

        var tl = gsap.timeline({
            onComplete: function() {
                preloader.classList.add('done');
                document.body.style.overflow = '';
                if (callback) callback();
            }
        });

        tl.to(charEls, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.04,
            ease: 'power2.out',
            delay: 0.2
        })
        .to(charEls, {
            opacity: 0,
            duration: 0.3,
            delay: 0.2
        })
        .to(curtains, {
            scaleX: 0,
            duration: 0.8,
            ease: 'power3.inOut',
            transformOrigin: function(i) { return i === 0 ? 'left' : 'right'; }
        }, '-=0.1');
    }

    // ============ LENIS SMOOTH SCROLL ============
    function initLenis() {
        if (prefersReduced || typeof Lenis === 'undefined') return;
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

    // ============ SCROLL PROGRESS BAR ============
    function initScrollProgress() {
        var bar = document.getElementById('scroll-progress');
        if (!bar) return;

        function update() {
            var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            var docHeight = document.documentElement.scrollHeight - window.innerHeight;
            var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            bar.style.width = pct + '%';
        }

        window.addEventListener('scroll', update, { passive: true });
        update();
    }

    // ============ MAGNETIC BUTTONS ============
    function initMagneticButtons() {
        if (isMobile || prefersReduced) return;
        var buttons = document.querySelectorAll('.btn, .btn-header, .carousel-btn');

        buttons.forEach(function(btn) {
            btn.addEventListener('mousemove', function(e) {
                var rect = btn.getBoundingClientRect();
                var x = e.clientX - rect.left - rect.width / 2;
                var y = e.clientY - rect.top - rect.height / 2;
                gsap.to(btn, {
                    x: x * 0.2,
                    y: y * 0.2,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });

            btn.addEventListener('mouseleave', function() {
                gsap.to(btn, {
                    x: 0,
                    y: 0,
                    duration: 0.4,
                    ease: 'elastic.out(1, 0.5)'
                });
            });
        });
    }

    // ============ CARTE TABS ============
    function initCarteTabs() {
        var tabs = document.querySelectorAll('.carte-tab');
        var panels = document.querySelectorAll('.carte-panel');

        tabs.forEach(function(tab) {
            tab.addEventListener('click', function() {
                var targetId = tab.getAttribute('aria-controls');
                var targetPanel = document.getElementById(targetId);

                tabs.forEach(function(t) {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                });
                panels.forEach(function(p) {
                    p.classList.remove('active');
                    p.hidden = true;
                });

                tab.classList.add('active');
                tab.setAttribute('aria-selected', 'true');
                targetPanel.classList.add('active');
                targetPanel.hidden = false;

                // Animate price lines cascade
                var lines = targetPanel.querySelectorAll('.price-list li');
                gsap.fromTo(lines,
                    { opacity: 0, x: -15 },
                    { opacity: 1, x: 0, duration: 0.35, stagger: 0.03, ease: 'power2.out' }
                );
            });
        });
    }

    // ============ CAROUSEL ============
    function initCarousel() {
        var track = document.querySelector('.carousel-track');
        var cards = document.querySelectorAll('.avis-card');
        var prevBtn = document.querySelector('.carousel-prev');
        var nextBtn = document.querySelector('.carousel-next');
        var dotsContainer = document.querySelector('.carousel-dots');
        var currentIndex = 0;

        if (!track || cards.length === 0) return;

        cards.forEach(function(_, i) {
            var dot = document.createElement('button');
            dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', 'Avis ' + (i + 1));
            dot.setAttribute('role', 'tab');
            dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
            dot.addEventListener('click', function() { goToSlide(i); });
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

    // ============ MOBILE MENU ============
    function initMobileMenu() {
        var navToggle = document.querySelector('.nav-toggle');
        var navMobile = document.querySelector('.nav-mobile');
        if (!navToggle || !navMobile) return;

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

    // ============ HEADER SCROLL & CONDENSE ============
    function initHeader() {
        var header = document.querySelector('.header');
        function handleScroll() {
            if (window.pageYOffset > 60) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
        window.addEventListener('scroll', handleScroll, { passive: true });

        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && !prefersReduced) {
            ScrollTrigger.create({
                start: 'top -100',
                onEnter: function() { header.classList.add('condensed'); },
                onLeaveBack: function() { header.classList.remove('condensed'); }
            });
        }
    }

    // ============ SMOOTH SCROLL ANCHORS ============
    function initSmoothAnchors() {
        var header = document.querySelector('.header');
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
                        window.scrollTo({ top: targetPos, behavior: 'smooth' });
                    }
                }
            });
        });
    }

    // ============ GSAP ANIMATIONS ============
    function initGSAP() {
        if (prefersReduced || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            fallbackVisibility();
            return;
        }

        gsap.registerPlugin(ScrollTrigger);

        // Hero split text reveal
        var heroTitle = document.querySelector('.hero-title[data-split]');
        if (heroTitle) {
            var words = heroTitle.textContent.trim().split(/\s+/);
            heroTitle.innerHTML = words.map(function(word) {
                return '<span class="word"><span class="word-inner">' + word + '</span></span>';
            }).join(' ');

            var wordInners = heroTitle.querySelectorAll('.word-inner');
            gsap.to(wordInners, {
                y: 0,
                duration: 1,
                stagger: 0.12,
                ease: 'power3.out',
                delay: 1.4
            });
        }

        // Hero subtitle + CTAs
        gsap.to('.hero-subtitle', { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 2.2 });
        gsap.to('.hero-ctas', { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 2.4 });

        // Hero image scale + parallax
        var heroImg = document.querySelector('.hero-img');
        if (heroImg) {
            gsap.to(heroImg, {
                scale: 1,
                duration: 1.6,
                ease: 'power2.out',
                delay: 1.2
            });

            if (!isMobile) {
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
        }

        // Section reveals
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
                y: 40,
                duration: 0.8,
                stagger: 0.12,
                ease: 'power2.out'
            });
        });



        // Carte panel reveal
        var activePanel = document.querySelector('.carte-panel.active');
        if (activePanel) {
            var lines = activePanel.querySelectorAll('.price-list li');
            gsap.fromTo(lines,
                { opacity: 0, x: -15 },
                {
                    scrollTrigger: { trigger: activePanel, start: 'top 80%' },
                    opacity: 1,
                    x: 0,
                    duration: 0.35,
                    stagger: 0.03,
                    ease: 'power2.out'
                }
            );
        }

        // Image reveal + parallax
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

        // Banner parallax
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

        // Laser features reveal
        var laserFeatures = document.querySelector('.laser-features');
        if (laserFeatures) {
            gsap.from(laserFeatures.querySelectorAll('.laser-feature'), {
                scrollTrigger: { trigger: laserFeatures, start: 'top 85%' },
                opacity: 0,
                y: 30,
                duration: 0.7,
                stagger: 0.12,
                ease: 'power2.out'
            });
        }

        // Text block reveals
        var textBlocks = document.querySelectorAll('.laser-content, .guinot-text, .equipe-text, .cadeau-text, .infos-details');
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

        // Counters only on viewport entry
        var counters = document.querySelectorAll('[data-counter]');
        counters.forEach(function(counter) {
            var target = parseFloat(counter.getAttribute('data-counter'));
            var decimals = parseInt(counter.getAttribute('data-decimals') || '0');
            var obj = { val: 0 };

            ScrollTrigger.create({
                trigger: counter,
                start: 'top 90%',
                once: true,
                onEnter: function() {
                    gsap.to(obj, {
                        val: target,
                        duration: 1.6,
                        ease: 'power2.out',
                        onUpdate: function() {
                            counter.textContent = obj.val.toFixed(decimals);
                        }
                    });
                }
            });
        });
    }

    function fallbackVisibility() {
        document.querySelectorAll('.hero-subtitle, .hero-ctas').forEach(function(el) {
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
        document.querySelectorAll('.hero-title').forEach(function(el) {
            el.style.opacity = '1';
        });
        document.querySelectorAll('[data-counter]').forEach(function(counter) {
            counter.textContent = counter.getAttribute('data-counter');
        });
        var preloader = document.getElementById('preloader');
        if (preloader) preloader.style.display = 'none';
    }

    // ============ INITIALIZATION ============
    document.body.style.overflow = 'hidden';

    // Safety timeout: force content visible if preloader stalls
    var safetyTimeout = setTimeout(function() {
        var preloader = document.getElementById('preloader');
        if (preloader && !preloader.classList.contains('done')) {
            preloader.classList.add('done');
            document.body.style.overflow = '';
        }
    }, 3500);

    function onReady() {
        clearTimeout(safetyTimeout);
        document.body.style.overflow = '';
        initLenis();
        initGSAP();
        initScrollProgress();
        initMagneticButtons();
        initCarteTabs();
        initCarousel();
        initMobileMenu();
        initHeader();
        initSmoothAnchors();
    }

    if (prefersReduced || typeof gsap === 'undefined') {
        fallbackVisibility();
        onReady();
    } else {
        runPreloader(onReady);
    }

})();
