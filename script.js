// ===== Preloader =====
(function initPreloader() {
  const preloader = document.getElementById('preloader');
  let hidden = false;

  function hidePreloader() {
    if (hidden) return;
    hidden = true;
    preloader.classList.add('hidden');
    setTimeout(() => preloader.remove(), 700);
  }

  const maxTimer = setTimeout(hidePreloader, 2500);

  if (document.readyState === 'complete') {
    clearTimeout(maxTimer);
    setTimeout(hidePreloader, 300);
  } else {
    window.addEventListener('load', () => {
      clearTimeout(maxTimer);
      setTimeout(hidePreloader, 300);
    });
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(hidePreloader, 1200);
    });
  }
})();

// ===== Theme Toggle =====
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

// ===== Header Scroll =====
const header = document.getElementById('header');
const scrollProgress = document.getElementById('scrollProgress');
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  header.classList.toggle('scrolled', scrolled > 50);
  backToTop.classList.toggle('show', scrolled > 500);
  
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  scrollProgress.style.width = (scrolled / docHeight) * 100 + '%';
});

// ===== Mobile Menu =====
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navMenu.classList.toggle('open');
});
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('open');
  });
});

// ===== Active Nav Link on Scroll =====
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 150) current = sec.id;
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === '#' + current);
  });
});

// ===== Reveal on Scroll =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ===== Counter Animation =====
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = +el.dataset.count;
      const duration = 2000;
      const start = performance.now();
      
      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target).toLocaleString('fa-IR');
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

// ===== Back to Top =====
backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== Portfolio Logic (Manual HTML) =====
let currentFilter = 'all';

// تابع فیلتر کردن آیتم‌هایی که مستقیماً توی HTML نوشته شدند
function filterPortfolio(filter) {
  const items = document.querySelectorAll('#portfolioGrid .portfolio-item');
  let visibleCount = 0;

  items.forEach(item => {
    if (filter === 'all' || item.dataset.category === filter) {
      item.style.display = 'block';
      // انیمیشن ظاهر شدن مجدد
      item.style.animation = 'none';
      item.offsetHeight; // trigger reflow
      item.style.animation = 'fadeInScale 0.5s forwards';
      visibleCount++;
    } else {
      item.style.display = 'none';
    }
  });

  // اگر در این دسته هیچ عکسی نبود، پیام خالی را نشان بده
  const existingEmpty = document.querySelector('.portfolio-empty');
  if (existingEmpty) existingEmpty.remove();

  if (visibleCount === 0) {
    const grid = document.getElementById('portfolioGrid');
    grid.innerHTML += `
      <div class="portfolio-empty">
        <span>🎬</span>
        <p>در این دسته هنوز کاری ثبت نشده</p>
      </div>
    `;
  }
}

// ===== مدیریت دکمه‌های فیلتر =====
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    filterPortfolio(currentFilter);
  });
});

// ===== مدیریت مودال و هاور روی فیلم‌ها =====
function setupPortfolioEvents() {
  const grid = document.getElementById('portfolioGrid');
  
  // افکت پخش ویدیو هنگام هاور
  grid.querySelectorAll('.portfolio-item[data-type="video"]').forEach(item => {
    const video = item.querySelector('video');
    item.addEventListener('mouseenter', () => video.play().catch(() => {}));
    item.addEventListener('mouseleave', () => {
      video.pause();
      video.currentTime = 0;
    });
  });

  // باز شدن مودال با کلیک
  grid.querySelectorAll('.portfolio-item').forEach(item => {
    item.addEventListener('click', () => {
      const src = item.dataset.src;
      const type = item.dataset.type;
      const title = item.querySelector('h4').textContent;
      openModal(src, type, title);
    });
  });
}

function openModal(src, type, title) {
  const modal = document.getElementById('modal');
  const modalImg = document.getElementById('modalImg');
  const modalCaption = document.getElementById('modalCaption');

  const oldVideo = modal.querySelector('video.modal-video');
  if (oldVideo) oldVideo.remove();

  if (type === 'video') {
    modalImg.style.display = 'none';
    const video = document.createElement('video');
    video.src = src;
    video.controls = true;
    video.autoplay = true;
    video.className = 'modal-video';
    modal.appendChild(video);
  } else {
    modalImg.style.display = 'block';
    modalImg.src = src;
  }

  modalCaption.textContent = title;
  modal.classList.add('show');
}

function closeModal() {
  const modal = document.getElementById('modal');
  const oldVideo = modal.querySelector('video.modal-video');
  if (oldVideo) {
    oldVideo.pause();
    oldVideo.remove();
  }
  modal.classList.remove('show');
}

// ===== بستن مودال =====
const modal = document.getElementById('modal');
document.getElementById('modalClose').addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// ===== راه‌اندازی اولیه =====
document.addEventListener('DOMContentLoaded', () => {
  setupPortfolioEvents();
  filterPortfolio('all'); // اطمینان از نمایش اولیه
});

// ===== Contact Form =====
document.getElementById('contactForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const msg = document.getElementById('formMessage');
  msg.textContent = '✅ پیام شما با موفقیت ارسال شد! به زودی با شما تماس می‌گیریم.';
  msg.style.color = '#22c55e';
  e.target.reset();
  setTimeout(() => { msg.textContent = ''; }, 5000);
});

// ===== Contact Form =====
document.getElementById('contactForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const msg = document.getElementById('formMessage');
  msg.textContent = '✅ پیام شما با موفقیت ارسال شد! به زودی با شما تماس می‌گیریم.';
  msg.style.color = '#22c55e';
  e.target.reset();
  setTimeout(() => { msg.textContent = ''; }, 5000);
});