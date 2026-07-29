(function() {
    'use strict';

    const BOOKING_URL = "https://cal.com/leman-nova-0zwvun/rendez-vous-15-minutes";

    function isInvalidBookingUrl(url) {
        const lower = url.toLowerCase();
        return lower.includes('ton_lien') || lower.includes('colle_ton_lien') || lower.includes('example.com') || lower.includes('placeholder');
    }

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;

    // ============ PRELOADER ============
    function initPreloader() {
        const preloader = document.getElementById('preloader');
        if (!preloader) return;
        setTimeout(() => {
            preloader.classList.add('done');
        }, 1200);
    }

    // ============ SCROLL PROGRESS ============
    function initScrollProgress() {
        const bar = document.getElementById('scroll-progress');
        if (!bar) return;
        function update() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            bar.style.width = pct + '%';
        }
        window.addEventListener('scroll', update, { passive: true });
        update();
    }

    // ============ HEADER ============
    function initHeader() {
        const header = document.querySelector('.header');
        function onScroll() {
            const y = window.pageYOffset;
            header.classList.toggle('scrolled', y > 60);
            header.classList.toggle('condensed', y > 100);
        }
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    // ============ MOBILE MENU ============
    function initMobileMenu() {
        const toggle = document.querySelector('.nav-toggle');
        const nav = document.querySelector('.nav-mobile');
        const logo = document.querySelector('.logo');
        if (!toggle || !nav) return;
        toggle.addEventListener('click', () => {
            const open = nav.classList.toggle('open');
            toggle.classList.toggle('active', open);
            toggle.setAttribute('aria-expanded', open);
        });
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('open');
                toggle.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
            });
        });
        if (logo) {
            logo.addEventListener('click', () => {
                if (nav.classList.contains('open')) {
                    nav.classList.remove('open');
                    toggle.classList.remove('active');
                    toggle.setAttribute('aria-expanded', 'false');
                }
            });
        }
    }

    // ============ REVEAL ON SCROLL ============
    function initReveals() {
        if (prefersReduced) {
            document.querySelectorAll('.reveal, .section > .container > .section-tag, .section > .container > .section-title, .section > .container > .section-intro')
                .forEach(el => el.classList.add('visible'));
            return;
        }
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        document.querySelectorAll('.reveal, .section > .container > .section-tag, .section > .container > .section-title, .section > .container > .section-intro')
            .forEach(el => observer.observe(el));
    }

    // ============ HERO PARALLAX ============
    function initHeroParallax() {
        if (prefersReduced || isMobile) return;
        const img = document.querySelector('.hero-img');
        if (!img) return;
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            img.style.transform = `translateY(${scrolled * 0.15}px)`;
        }, { passive: true });
    }

    // ============ COUNTERS ============
    function initCounters() {
        const counters = document.querySelectorAll('[data-counter]');
        if (!counters.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseFloat(el.getAttribute('data-counter'));
                    const decimals = parseInt(el.getAttribute('data-decimals') || '0');
                    animateCounter(el, target, decimals);
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(c => observer.observe(c));
    }

    function animateCounter(el, target, decimals) {
        const duration = 1500;
        const start = performance.now();
        const from = 0;
        function step(now) {
            const progress = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            const val = from + (target - from) * ease;
            el.textContent = val.toFixed(decimals);
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    // ============ CARTE TABS ============
    function initCarteTabs() {
        const tabs = document.querySelectorAll('.carte-tab');
        const panels = document.querySelectorAll('.carte-panel');
        if (!tabs.length) return;

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetId = tab.getAttribute('aria-controls');
                const targetPanel = document.getElementById(targetId);

                tabs.forEach(t => {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                });
                panels.forEach(p => {
                    p.classList.remove('active');
                    p.hidden = true;
                });

                tab.classList.add('active');
                tab.setAttribute('aria-selected', 'true');
                targetPanel.classList.add('active');
                targetPanel.hidden = false;
            });
        });
    }

    // ============ CAROUSEL ============
    function initCarousel() {
        const track = document.querySelector('.carousel-track');
        const cards = document.querySelectorAll('.avis-card');
        const prevBtn = document.querySelector('.carousel-prev');
        const nextBtn = document.querySelector('.carousel-next');
        const dotsContainer = document.querySelector('.carousel-dots');
        if (!track || !cards.length) return;

        let current = 0;

        cards.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', 'Avis ' + (i + 1));
            dot.setAttribute('role', 'tab');
            dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
            dot.addEventListener('click', () => goTo(i));
            dotsContainer.appendChild(dot);
        });

        function updateButtons() {
            if (prevBtn) {
                prevBtn.disabled = current === 0;
                prevBtn.style.opacity = current === 0 ? '0.35' : '1';
            }
            if (nextBtn) {
                nextBtn.disabled = current === cards.length - 1;
                nextBtn.style.opacity = current === cards.length - 1 ? '0.35' : '1';
            }
        }

        function goTo(index) {
            if (index < 0 || index >= cards.length) return;
            cards[current].classList.remove('active');
            current = index;
            cards[current].classList.add('active');

            const dots = dotsContainer.querySelectorAll('.carousel-dot');
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === current);
                dot.setAttribute('aria-selected', i === current ? 'true' : 'false');
            });
            updateButtons();
        }

        if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
        if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));
        updateButtons();
    }

    // ============ BON CADEAU ============
    function initCadeau() {
        const form = document.getElementById('cadeau-form');
        if (!form) return;

        const modeBtns = form.querySelectorAll('.mode-btn');
        const modeMontant = document.getElementById('mode-montant');
        const modePrestation = document.getElementById('mode-prestation');
        const amountBtns = form.querySelectorAll('.amount-btn:not(.mode-btn)');
        const customAmountGroup = document.getElementById('amount-custom');
        const customInput = document.getElementById('montant-libre');
        const prestationSelect = document.getElementById('prestation-select');

        const previewAmount = document.getElementById('preview-amount');
        const previewBeneficiaire = document.getElementById('preview-beneficiaire');
        const previewOffreur = document.getElementById('preview-offreur');
        const previewMessage = document.getElementById('preview-message');
        const prestationName = document.getElementById('prestation-name');

        let currentMode = 'montant';
        let currentAmount = '50';
        let currentPrestation = { name: '', price: '' };

        function setMode(mode) {
            currentMode = mode;
            modeBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-mode') === mode));
            if (mode === 'montant') {
                modeMontant.classList.remove('hidden');
                modePrestation.classList.add('hidden');
            } else {
                modeMontant.classList.add('hidden');
                modePrestation.classList.remove('hidden');
            }
            updatePreview();
        }

        modeBtns.forEach(btn => {
            btn.addEventListener('click', () => setMode(btn.getAttribute('data-mode')));
        });

        amountBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                amountBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const val = btn.getAttribute('data-amount');
                if (val === 'libre') {
                    customAmountGroup.classList.remove('hidden');
                    currentAmount = customInput.value || '0';
                } else {
                    customAmountGroup.classList.add('hidden');
                    currentAmount = val;
                }
                updatePreview();
            });
        });

        customInput.addEventListener('input', () => {
            currentAmount = customInput.value || '0';
            updatePreview();
        });

        if (prestationSelect) {
            prestationSelect.addEventListener('change', () => {
                const option = prestationSelect.options[prestationSelect.selectedIndex];
                const name = option.value;
                const price = option.getAttribute('data-prix');
                currentPrestation = name ? { name, price } : { name: '', price: '' };
                updatePreview();
            });
        }

        function updatePreview() {
            const beneficiaire = document.getElementById('beneficiaire').value.trim();
            if (currentMode === 'montant') {
                previewAmount.textContent = currentAmount;
                prestationName.textContent = '';
                previewBeneficiaire.textContent = beneficiaire || '...';
            } else {
                previewAmount.textContent = currentPrestation.price || '0';
                if (!beneficiaire) {
                    previewBeneficiaire.textContent = '';
                    prestationName.textContent = currentPrestation.name ? ` : ${currentPrestation.name}` : '';
                } else {
                    previewBeneficiaire.textContent = beneficiaire;
                    prestationName.textContent = currentPrestation.name ? ` — ${currentPrestation.name}` : '';
                }
            }
        }

        ['beneficiaire', 'email-beneficiaire', 'offreur', 'message'].forEach(id => {
            const input = document.getElementById(id);
            if (!input) return;
            input.addEventListener('input', () => {
                const val = input.value.trim();
                if (id === 'beneficiaire') {
                    previewBeneficiaire.textContent = val || '...';
                    if (currentMode === 'prestation') updatePreview();
                }
                if (id === 'offreur') previewOffreur.textContent = val || '...';
                if (id === 'message') previewMessage.textContent = val ? `"${val}"` : '';
            });
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const beneficiaire = document.getElementById('beneficiaire').value.trim();
            const email = document.getElementById('email-beneficiaire').value.trim();
            const offreur = document.getElementById('offreur').value.trim();
            const message = document.getElementById('message').value.trim();

            let subject, body;
            if (currentMode === 'prestation' && currentPrestation.name) {
                subject = encodeURIComponent(`Bon cadeau ${currentPrestation.name} - ${beneficiaire || 'Bénéficiaire'}`);
                body = encodeURIComponent(
                    `Bon cadeau L'Instant de Beauté\n\n` +
                    `Prestation choisie : ${currentPrestation.name} — ${currentPrestation.price}€\n` +
                    `Bénéficiaire : ${beneficiaire || '-'}\n` +
                    `Email bénéficiaire : ${email || '-'}\n` +
                    `De la part de : ${offreur || '-'}\n\n` +
                    `Message :\n${message || '-'}`
                );
            } else {
                const montant = currentAmount;
                subject = encodeURIComponent(`Bon cadeau ${montant}€ - ${beneficiaire || 'Bénéficiaire'}`);
                body = encodeURIComponent(
                    `Bon cadeau L'Instant de Beauté\n\n` +
                    `Montant : ${montant}€\n` +
                    `Bénéficiaire : ${beneficiaire || '-'}\n` +
                    `Email bénéficiaire : ${email || '-'}\n` +
                    `De la part de : ${offreur || '-'}\n\n` +
                    `Message :\n${message || '-'}`
                );
            }
            window.location.href = `mailto:contact@institutlinstantdebeaute.com?subject=${subject}&body=${body}`;
        });
    }

    // ============ SMOOTH ANCHORS ============
    function initSmoothAnchors() {
        const header = document.querySelector('.header');
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                const target = document.querySelector(href);
                if (!target) return;
                e.preventDefault();
                const offset = header ? header.offsetHeight + 20 : 80;
                const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' });
            });
        });
    }

    // ============ BOOKING LINKS ============
    function initBookingLinks() {
        if (isInvalidBookingUrl(BOOKING_URL)) {
            console.error("[BOOKING] URL de réservation invalide :", BOOKING_URL);
            return;
        }
        document.querySelectorAll('.booking-link').forEach(link => {
            link.href = BOOKING_URL;
        });
    }

    // ============ BOOKING SELECTS ============
    function initBookingSelects() {
        document.querySelectorAll('.reserver-select').forEach(select => {
            const container = select.closest('.carte-reserver');
            const btn = container ? container.querySelector('.reserver-btn') : null;
            if (!btn) return;

            function update() {
                const option = select.options[select.selectedIndex];
                const name = option.value;
                const prix = option.getAttribute('data-prix');
                if (!name || !prix) {
                    btn.textContent = 'Réserver ce soin';
                    return;
                }
                btn.textContent = `Réserver — ${name} · ${prix} €`;
            }

            select.addEventListener('change', update);
            update();
        });
    }

    // ============ INIT ============
    document.addEventListener('DOMContentLoaded', () => {
        initPreloader();
        initScrollProgress();
        initHeader();
        initMobileMenu();
        initReveals();
        initHeroParallax();
        initCounters();
        initCarteTabs();
        initCarousel();
        initBookingLinks();
        initBookingSelects();
        initCadeau();
        initSmoothAnchors();
    });
})();
