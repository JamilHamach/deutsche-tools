/* ═══════════════════════════════════════════════════════════════════════════
   Components Loader - Deutsche Tools
   Creates header and footer dynamically (no external fetch needed)
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    // Determine base path for links
    const path = window.location.pathname;
    const isSubdir = path.includes('/tools/') || path.includes('/pages/');
    const base = isSubdir ? '..' : '.';

    // Dynamic Year
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;

    // Header HTML
    const headerHTML = `
    <nav class="navbar" id="navbar">
        <div class="container">
            <a href="${base}/index.html" class="logo">
                <div class="logo-icon">🛠️</div>
                <span>Deutsche Tools</span>
            </a>
            
            <ul class="nav-links" id="navLinks">
                <li><a href="${base}/index.html">Startseite</a></li>
                
                <!-- Tools Dropdown -->
                <li class="nav-dropdown">
                    <a href="#" class="dropdown-trigger">Rechner & Tools <span class="chevron">▾</span></a>
                    <div class="dropdown-menu">
                        <div class="dropdown-category">
                            <span class="category-label">Finanzen & Steuern</span>
                            <a href="${base}/tools/brutto-netto-rechner.html">💶 Brutto-Netto Rechner</a>
                            <a href="${base}/tools/kfz-steuer-rechner.html">🚗 KFZ-Steuer Rechner</a>
                            <a href="${base}/tools/einkommens-rechner.html">💰 Gesamt-Einkommen</a>
                        </div>
                        <div class="dropdown-category">
                            <span class="category-label">Auto & Verkehr</span>
                            <a href="${base}/tools/bussgeld-rechner.html">⚡ Bußgeldrechner (Blitzer)</a>
                        </div>
                        <div class="dropdown-category">
                            <span class="category-label">Recht & Dokumente</span>
                            <a href="${base}/tools/kuendigung-generator.html">📝 Vertrag Kündigen</a>
                        </div>
                        <div class="dropdown-category">
                            <span class="category-label">Arbeit & Recht</span>
                            <a href="${base}/tools/kuendigung-generator.html">📝 Vertrag Kündigen</a>
                            <a href="${base}/tools/kuendigungsfrist-rechner.html">📅 Kündigungsfrist Rechner</a>
                        </div>
                        <div class="dropdown-category">
                            <span class="category-label">Familie & Wohnen</span>
                            <a href="${base}/tools/kinderzuschlag-rechner.html">👶 Kinderzuschlag Rechner</a>
                            <a href="${base}/tools/elterngeld-rechner.html">🍼 Elterngeld Rechner</a>
                            <a href="${base}/tools/wohngeld-rechner.html">🏠 Wohngeld Rechner</a>
                        </div>
                    </div>
                </li>

                <li><a href="${base}/pages/ueber-uns.html">Über uns</a></li>
                <li><a href="${base}/tools/brutto-netto-rechner.html" class="btn btn-primary nav-cta">Rechner starten</a></li>
            </ul>
            
            <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Menü öffnen">
                <span></span>
                <span></span>
                <span></span>
            </button>
        </div>
    </nav>
    `;

    // Footer HTML
    const footerHTML = `
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-brand">
                    <a href="${base}/index.html" class="logo">
                        <div class="logo-icon">🛠️</div>
                        <span>Deutsche Tools</span>
                    </a>
                    <p>
                        Kostenlose Online-Tools für finanzielle Berechnungen nach deutschem Recht. 
                        Präزise, aktuell und datenschutzkonform.
                    </p>
                </div>
                
                <div class="footer-col">
                    <h4>Rechner</h4>
                    <ul class="footer-links">
                        <li><a href="${base}/tools/brutto-netto-rechner.html">Brutto-Netto Rechner</a></li>
                        <li><a href="${base}/tools/kfz-steuer-rechner.html">KFZ-Steuer Rechner</a></li>
                        <li><a href="${base}/tools/einkommens-rechner.html">Gesamt-Einkommen</a></li>
                        <li><a href="${base}/tools/kuendigung-generator.html">📝 Vertrag Kündigen</a></li>
                        <li><a href="${base}/tools/wohngeld-rechner.html">🏠 Wohngeld Rechner</a></li>
                        <li><a href="${base}/tools/elterngeld-rechner.html">🍼 Elterngeld Rechner</a></li>
                        <li><a href="${base}/tools/kinderzuschlag-rechner.html">👶 Kinderzuschlag Rechner</a></li>
                        <li><a href="${base}/tools/kuendigungsfrist-rechner.html">📅 Kündigungsfrist Rechner</a></li>
                    </ul>
                </div>
                
                <div class="footer-column">
                    <h4>Informationen</h4>
                    <ul class="footer-links">
                        <li><a href="${base}/pages/ueber-uns.html">Über uns</a></li>
                    </ul>
                </div>
                
                <div class="footer-column">
                    <h4>Rechtliches</h4>
                    <ul class="footer-links">
                        <li><a href="${base}/pages/impressum.html">Impressum</a></li>
                        <li><a href="${base}/pages/datenschutz.html">Datenschutz</a></li>
                        <li><a href="${base}/pages/nutzungsbedingungen.html">Nutzungsbedingungen</a></li>
                    </ul>
                </div>
            </div>
            
            <div class="footer-bottom">
                <p>&copy; ${currentYear} Deutsche Tools. Alle Rechte vorbehalten.</p>
                <p>Alle Angaben ohne Gewähr.</p>
            </div>
        </div>
    </footer>
    `;

    // Cookie Banner HTML
    const cookieBannerHTML = `
    <div class="cookie-banner-overlay" id="cookieBanner">
        <div class="cookie-banner-content">
            <div class="cookie-banner-text">
                <h3>🍪 Privatsphäre & Cookies</h3>
                <p>Wir nutzen Cookies, um unsere Dienste anzubieten und die Nutzung der Website zu analysieren (z.B. Google AdSense). Mit Klick auf "Alle akzeptieren" stimmen Sie der Verwendung zu. Details finden Sie in unserer <a href="${base}/pages/datenschutz.html">Datenschutzerklärung</a>.</p>
            </div>
            <div class="cookie-banner-actions">
                <button class="btn btn-outline" id="cookieSettingsBtn">Einstellungen</button>
                <button class="btn btn-primary" id="cookieAcceptAllBtn">Alle akzeptieren</button>
            </div>
        </div>
    </div>
    `;

    // Insert components when DOM is ready
    document.addEventListener('DOMContentLoaded', function () {
        // Insert header
        const headerEl = document.getElementById('header');
        if (headerEl) {
            headerEl.innerHTML = headerHTML;
        }

        // Insert footer
        const footerEl = document.getElementById('footer');
        if (footerEl) {
            footerEl.innerHTML = footerHTML;
        }

        // Insert Cookie Banner (inject into body if not already there)
        if (!document.getElementById('cookieBanner')) {
            document.body.insertAdjacentHTML('beforeend', cookieBannerHTML);
        }

        // Initialize mobile menu
        initMobileMenu();
        initNavbarScroll();
    });

    // Mobile menu toggle
    function initMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const navLinks = document.getElementById('navLinks');

        if (mobileMenuBtn && navLinks) {
            mobileMenuBtn.addEventListener('click', function () {
                navLinks.classList.toggle('active');
                mobileMenuBtn.classList.toggle('active');

                // Animate hamburger icon
                const spans = mobileMenuBtn.querySelectorAll('span');
                if (mobileMenuBtn.classList.contains('active')) {
                    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                    spans[1].style.opacity = '0';
                    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
                } else {
                    spans[0].style.transform = 'none';
                    spans[1].style.opacity = '1';
                    spans[2].style.transform = 'none';
                }
            });

            // Close menu when clicking a link
            navLinks.querySelectorAll('a').forEach(function (link) {
                link.addEventListener('click', function (e) {
                    // Mobile Dropdown Toggle
                    if (window.innerWidth <= 768 && link.classList.contains('dropdown-trigger')) {
                        e.preventDefault();
                        const parent = link.closest('.nav-dropdown');
                        parent.classList.toggle('active');
                        return;
                    }

                    navLinks.classList.remove('active');
                    mobileMenuBtn.classList.remove('active');
                });
            });
        }
    }

    // Navbar scroll effect
    function initNavbarScroll() {
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
    }
})();
