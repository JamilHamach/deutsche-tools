/* ═══════════════════════════════════════════════════════════════════════════
   Deutsche Tools - Main JavaScript
   ═══════════════════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function () {
    // ─────────────────────────────────────────────────────────────────────────
    // Navbar Scroll Effect
    // ─────────────────────────────────────────────────────────────────────────
    const navbar = document.getElementById('navbar');

    if (navbar) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // Mobile Menu logic is handled by components.js

    // ─────────────────────────────────────────────────────────────────────────
    // Smooth Scroll for Anchor Links
    // ─────────────────────────────────────────────────────────────────────────
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const navbarHeight = navbar ? navbar.offsetHeight : 0;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ─────────────────────────────────────────────────────────────────────────
    // Number Formatting Helper
    // ─────────────────────────────────────────────────────────────────────────
    window.formatCurrency = function (amount, showCents = true) {
        const options = {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: showCents ? 2 : 0,
            maximumFractionDigits: showCents ? 2 : 0
        };
        return new Intl.NumberFormat('de-DE', options).format(amount);
    };

    window.formatNumber = function (num, decimals = 2) {
        return new Intl.NumberFormat('de-DE', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(num);
    };

    window.formatPercent = function (num, decimals = 1) {
        return new Intl.NumberFormat('de-DE', {
            style: 'percent',
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(num / 100);
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Animation on Scroll (Simple Implementation)
    // ─────────────────────────────────────────────────────────────────────────
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.card, .feature-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);

    // ─────────────────────────────────────────────────────────────────────────
    // Dynamic Year Updates
    // ─────────────────────────────────────────────────────────────────────────
    function updateDynamicYears() {
        const currentYear = new Date().getFullYear();
        const nextYear = currentYear + 1;

        // Update titles and meta descriptions
        const yearRegex = /202[56]/g;
        const yearRangeRegex = /202[56]\/202[56]/g;

        if (document.title.match(yearRegex)) {
            document.title = document.title.replace(yearRegex, currentYear);
        }

        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && metaDesc.getAttribute('content')) {
            metaDesc.setAttribute('content', metaDesc.getAttribute('content').replace(yearRegex, currentYear));
        }

        // Update elements with .current-year or .next-year class
        document.querySelectorAll('.current-year').forEach(el => {
            el.textContent = currentYear;
        });

        document.querySelectorAll('.next-year').forEach(el => {
            el.textContent = nextYear;
        });

        // Update text nodes containing 2025/2026 (excluding scripts/styles)
        const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while (node = walk.nextNode()) {
            const parent = node.parentElement;
            if (parent && parent.tagName !== 'SCRIPT' && parent.tagName !== 'STYLE') {
                if (node.textContent.includes('2026') || node.textContent.includes('2025')) {
                    // Replace ranges like 2025/2026 with a single year first
                    node.textContent = node.textContent.replace(yearRangeRegex, currentYear);
                    // Then replace individual years
                    node.textContent = node.textContent.replace(/2026/g, currentYear).replace(/2025/g, currentYear);
                }
            }
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Cookie Consent Logic
    // ─────────────────────────────────────────────────────────────────────────
    function initCookieBanner() {
        const banner = document.getElementById('cookieBanner');
        const acceptBtn = document.getElementById('cookieAcceptAllBtn');
        const settingsBtn = document.getElementById('cookieSettingsBtn');

        if (!banner || !acceptBtn || !settingsBtn) return;

        // Check if consent was already given
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) {
            banner.style.display = 'block';
        }

        acceptBtn.addEventListener('click', function () {
            localStorage.setItem('cookieConsent', 'accepted');
            banner.style.opacity = '0';
            banner.style.transform = 'translateY(100%)';
            setTimeout(() => {
                banner.style.display = 'none';
            }, 500);
        });

        settingsBtn.addEventListener('click', function () {
            // For now, redirect to Datenschutz or open a small info
            window.location.href = document.querySelector('.cookie-banner-text a').href;
        });
    }

    updateDynamicYears();
    initCookieBanner();
});
