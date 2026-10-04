/* ============================================================
   PORTFOLIO JS – Pablo Nazareno Coronati
   Scroll reveal, navbar, timeline, smooth scroll, and translation
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  let translations = null;

  /* ---------- Navbar scroll effect ---------- */
  const topbar = document.querySelector('.topbar');
  const onScroll = () => {
    topbar.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Active nav link on scroll ---------- */
  const sections = document.querySelectorAll('.section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

  const activateNav = () => {
    const scrollY = window.scrollY + 120;
    sections.forEach(sec => {
      const top = sec.offsetTop;
      const h = sec.offsetHeight;
      if (scrollY >= top && scrollY < top + h) {
        navLinks.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav-links a[href="#${sec.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  };
  window.addEventListener('scroll', activateNav, { passive: true });

  /* ---------- Smooth scroll for nav links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Close mobile menu
        document.querySelector('.nav-links')?.classList.remove('open');
      }
    });
  });

  /* ---------- Hamburger toggle ---------- */
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.querySelector('.nav-links');
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const isOpen = navMenu.classList.contains('open');
      hamburger.setAttribute('aria-expanded', isOpen);
      hamburger.innerHTML = isOpen ? '&#x2715;' : '&#9776;';
    });
  }

  /* ---------- Intersection Observer – reveal on scroll ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });
    reveals.forEach(el => observer.observe(el));
  } else {
    // Fallback: show all
    reveals.forEach(el => el.classList.add('visible'));
  }

  /* ---------- Timeline accordion ---------- */
  document.querySelectorAll('.timeline-header').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.timeline-card');
      const wasOpen = card.classList.contains('open');
      // Close all
      document.querySelectorAll('.timeline-card.open').forEach(c => c.classList.remove('open'));
      // Toggle current
      if (!wasOpen) card.classList.add('open');
    });
  });

  /* ---------- Counter animation for stats ---------- */
  const counters = document.querySelectorAll('[data-count]');
  const animateCounter = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const duration = 1200;
    const start = performance.now();

    const update = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(ease * target);
      el.textContent = prefix + current + suffix;
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  };

  if ('IntersectionObserver' in window) {
    const counterObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(el => counterObs.observe(el));
  }

  /* ---------- Translation & Multi-language Support ---------- */
  const getTranslationValue = (obj, keyPath) => {
    return keyPath.split('.').reduce((acc, part) => acc && acc[part], obj);
  };

  const applyTranslations = (lang) => {
    if (!translations) return;

    document.documentElement.lang = lang;

    // Translate standard elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = getTranslationValue(translations[lang], key);
      if (translation !== undefined) {
        el.innerHTML = translation;
      }
    });

    // Translate placeholder attributes
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const translation = getTranslationValue(translations[lang], key);
      if (translation !== undefined) {
        el.setAttribute('placeholder', translation);
      }
    });

    // Translate list items (arrays)
    document.querySelectorAll('[data-i18n-list]').forEach(el => {
      const key = el.getAttribute('data-i18n-list');
      const list = getTranslationValue(translations[lang], key);
      if (list && Array.isArray(list)) {
        const children = el.children;
        const tag = children.length > 0 ? children[0].tagName.toLowerCase() : 'li';
        const className = children.length > 0 ? children[0].className : '';
        if (children.length === list.length) {
          for (let i = 0; i < list.length; i++) {
            children[i].innerHTML = list[i];
          }
        } else {
          el.innerHTML = list.map(item => `<${tag}${className ? ` class="${className}"` : ''}>${item}</${tag}>`).join('');
        }
      }
    });

    // Update lang toggle display
    const langToggle = document.getElementById('lang-toggle');
    if (langToggle) {
      const langTextSpan = langToggle.querySelector('span');
      if (langTextSpan) {
        langTextSpan.textContent = lang.toUpperCase();
      }
    }
  };

  const loadTranslations = () => {
    translations = window.portfolioTranslations;
    if (translations) {
      const savedLang = localStorage.getItem('selectedLang') || 'en';
      applyTranslations(savedLang);
    } else {
      console.error('Translations object not found on window.');
    }
  };

  // Lang Toggle Button Event Listener
  const langToggle = document.getElementById('lang-toggle');
  if (langToggle) {
    langToggle.addEventListener('click', () => {
      const currentLang = document.documentElement.lang || 'en';
      const newLang = currentLang === 'en' ? 'es' : 'en';
      localStorage.setItem('selectedLang', newLang);
      applyTranslations(newLang);
    });
  }

  // Load translations on startup
  loadTranslations();

  /* ---------- Contact form Submission ---------- */
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const btnTextSpan = btn.querySelector('span') || btn;
      const originalText = btnTextSpan.textContent;

      const name = document.getElementById('form-name').value;
      const email = document.getElementById('form-email').value;
      const message = document.getElementById('form-message').value;

      const currentLang = document.documentElement.lang || 'en';
      const sendingText = currentLang === 'es' ? 'Enviando...' : 'Sending...';
      const successText = currentLang === 'es' ? '✓ Mensaje enviado' : '✓ Message sent';
      const errorText = currentLang === 'es' ? '✗ Error al enviar' : '✗ Sending failed';

      btnTextSpan.textContent = sendingText;
      const originalBg = btn.style.background;

      try {
        const response = await fetch("https://formsubmit.co/ajax/pablocoronati@hotmail.com", {
          method: "POST",
          headers: { 
            'Accept': 'application/json'
          },
          body: new FormData(form)
        });

        if (response.ok) {
          btnTextSpan.textContent = successText;
          btn.style.background = 'linear-gradient(135deg, #34d399, #7cf6d3)';
          form.reset();
        } else {
          throw new Error('Server error');
        }
      } catch (err) {
        console.error('Error submitting form:', err);
        btnTextSpan.textContent = errorText;
        btn.style.background = 'linear-gradient(135deg, #ef4444, #f87171)';
      }

      setTimeout(() => {
        btnTextSpan.textContent = originalText;
        btn.style.background = originalBg;
      }, 3500);
    });
  }

});
