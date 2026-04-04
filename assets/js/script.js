/**
 * Resume Page - Main JavaScript
 * Handles TOC generation, dark mode toggle, and scroll spy
 */

(function () {
  'use strict';

  // ============================================
  // Theme Toggle
  // ============================================
  function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcon(theme);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const newTheme = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
  }

  function updateThemeIcon(theme) {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;

    if (theme === 'dark') {
      // Sun icon for dark mode (to switch to light)
      btn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 0 0 0-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/></svg>';
    } else {
      // Moon icon for light mode (to switch to dark)
      btn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/></svg>';
    }
  }

  // ============================================
  // TOC Generation
  // ============================================
  function generateTOC() {
    const tocContainer = document.getElementById('toc-list');
    if (!tocContainer) return;

    const resume = document.querySelector('.resume');
    if (!resume) return;

    // Get all h2 and h3 elements
    const headings = resume.querySelectorAll('h2, h3');
    if (headings.length === 0) return;

    let tocHTML = '';

    headings.forEach(function (heading, index) {
      // Generate ID if not present
      if (!heading.id) {
        heading.id = 'section-' + index;
      }

      const isH3 = heading.tagName === 'H3';
      const linkClass = 'toc-link' + (isH3 ? ' h3' : '');
      const text = heading.textContent;

      tocHTML += '<li><a href="#' + heading.id + '" class="' + linkClass + '" data-target="' + heading.id + '">' + text + '</a></li>';
    });

    tocContainer.innerHTML = tocHTML;

    // Add click handlers for smooth scrolling
    tocContainer.querySelectorAll('.toc-link').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Close TOC on mobile after click
          if (window.innerWidth <= 900) {
            toggleTOC();
          }
        }
      });
    });
  }

  // ============================================
  // Scroll Spy (Active TOC Highlight)
  // ============================================
  function initScrollSpy() {
    const tocLinks = document.querySelectorAll('.toc-link');
    if (tocLinks.length === 0) return;

    const headings = [];
    tocLinks.forEach(function (link) {
      const targetId = link.getAttribute('data-target');
      const heading = document.getElementById(targetId);
      if (heading) {
        headings.push({ element: heading, link: link });
      }
    });

    function onScroll() {
      let currentHeading = null;
      const scrollPos = window.scrollY + 100;

      for (let i = headings.length - 1; i >= 0; i--) {
        if (headings[i].element.offsetTop <= scrollPos) {
          currentHeading = headings[i];
          break;
        }
      }

      // Update active state
      tocLinks.forEach(function (link) {
        link.classList.remove('active');
      });

      if (currentHeading) {
        currentHeading.link.classList.add('active');
      }
    }

    // Throttle scroll events
    let ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          onScroll();
          ticking = false;
        });
        ticking = true;
      }
    });

    // Initial call
    onScroll();
  }

  // ============================================
  // TOC Toggle (Mobile)
  // ============================================
  function toggleTOC() {
    const tocSidebar = document.querySelector('.toc-sidebar');
    if (!tocSidebar) return;

    tocSidebar.classList.toggle('visible');
  }

  // ============================================
  // Initialize
  // ============================================
  document.addEventListener('DOMContentLoaded', function () {
    // Init theme
    initTheme();

    // Theme toggle button
    var themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', toggleTheme);
    }

    // TOC toggle button
    var tocToggle = document.getElementById('toc-toggle');
    if (tocToggle) {
      tocToggle.addEventListener('click', toggleTOC);
    }

    // Generate TOC
    generateTOC();

    // Init scroll spy
    initScrollSpy();

    // Close TOC when clicking outside (mobile)
    document.addEventListener('click', function (e) {
      const tocSidebar = document.querySelector('.toc-sidebar');
      const tocToggle = document.getElementById('toc-toggle');
      if (window.innerWidth <= 900 && tocSidebar && tocSidebar.classList.contains('visible')) {
        if (!tocSidebar.contains(e.target) && !tocToggle.contains(e.target)) {
          tocSidebar.classList.remove('visible');
        }
      }
    });
  });
})();