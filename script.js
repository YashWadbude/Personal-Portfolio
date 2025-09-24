/* =========================
   DOM Elements
========================= */
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('section');
const heroImg = document.querySelector('.home__img');
const skillsRows = document.querySelectorAll('.skills__row');

/* =========================
   Smooth Scroll Navigation
========================= */
navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const targetId = link.getAttribute('href').replace('/', '');
    const targetSection = document.querySelector(targetId);
    if (targetSection) {
      window.scrollTo({
        top: targetSection.offsetTop - 50,
        behavior: 'smooth'
      });
    }
  });
});

/* =========================
   Highlight Active Section
========================= */
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 60;
    if (pageYOffset >= sectionTop) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href').includes(current)) {
      link.classList.add('active');
    }
  });
});



/* =========================
   Dynamic Project Cards
========================= */
const projectsContainer = document.querySelector('.projects-container');

const projects = [
   {
    title: 'Personal Portfolio',
    img: 'portfolio.jpg',
    link: 'https://yashwadbude.github.io/Personal-Portfolio/#'
  },
  {
    title: 'Real Time Hand Gesture to Text Translation',
    img: 'hand_gesture.png',
    link: '#'
  },
  
  {
    title: 'Movie',
    img: 'movie.jpeg',
    link: '#'
  }
];

function renderProjects() {
  if (!projectsContainer) return;
  projectsContainer.innerHTML = '';
  projects.forEach(project => {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.innerHTML = `
      <div class="project-image">
        <img src="${project.img}" alt="${project.title}">
      </div>
      <div>
        <h3>${project.title}</h3>
        <a href="${project.link}">View Project</a>
      </div>
    `;
    projectsContainer.appendChild(card);
  });
}

renderProjects();

/* =========================
   Scroll Reveal Animations
========================= */
ScrollReveal().reveal('.hero-text, .hero__img', {
  origin: 'top',
  distance: '50px',
  duration: 1000,
  easing: 'ease-in-out',
  reset: true
});

ScrollReveal().reveal('.project-card', {
  origin: 'bottom',
  distance: '30px',
  duration: 800,
  interval: 200
});

ScrollReveal().reveal('.skills__box, .education__box', {
  origin: 'left',
  distance: '50px',
  duration: 1000,
  interval: 200
});

ScrollReveal().reveal('.certificates__box, .resume__container', {
  origin: 'bottom',
  distance: '50px',
  duration: 1000,
  interval: 200
});

/* =========================
   Back to Top Button
========================= */
const backToTop = document.createElement('button');
backToTop.textContent = '↑';
backToTop.id = 'back-to-top';
document.body.appendChild(backToTop);

backToTop.style.cssText = `
  position: fixed;
  bottom: 40px;
  right: 40px;
  padding: 12px 18px;
  font-size: 24px;
  background-color: #333;
  color: #fff;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: none;
  z-index: 1000;
  transition: background-color 0.3s;
`;

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

window.addEventListener('scroll', () => {
  if (window.pageYOffset > 300) {
    backToTop.style.display = 'block';
  } else {
    backToTop.style.display = 'none';
  }
});

/* =========================
   Animated Skill Bars
========================= */
skillsRows.forEach(row => {
  const logos = row.querySelectorAll('img');
  logos.forEach((logo, index) => {
    logo.style.opacity = 0;
    logo.style.transform = 'translateY(20px)';
  });
});

function animateSkills() {
  const triggerPoint = window.innerHeight * 0.8;
  skillsRows.forEach(row => {
    const rowTop = row.getBoundingClientRect().top;
    if (rowTop < triggerPoint) {
      const logos = row.querySelectorAll('img');
      logos.forEach((logo, index) => {
        setTimeout(() => {
          logo.style.transition = 'all 0.5s ease-out';
          logo.style.opacity = 1;
          logo.style.transform = 'translateY(0)';
        }, index * 150);
      });
    }
  });
}

window.addEventListener('scroll', animateSkills);
window.addEventListener('load', animateSkills);

