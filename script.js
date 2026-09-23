const cards = [...document.querySelectorAll('.internship-card')];
const stage = document.querySelector('.carousel-stage');
const progress = document.querySelector('.carousel-progress');
const currentCard = document.querySelector('#current-card');
const progressFill = document.querySelector('#progress-fill');
let activeIndex = 0;
let suppressClick = false;

function syncCardAccess(card, active) {
  const flipped = card.classList.contains('is-flipped');
  const front = card.querySelector('.card-front');
  const back = card.querySelector('.card-back');
  front.setAttribute('aria-hidden', String(!active || flipped));
  back.setAttribute('aria-hidden', String(!active || !flipped));
  front.querySelectorAll('button, a').forEach(el => { el.tabIndex = active && !flipped ? 0 : -1; });
  back.querySelectorAll('button, a').forEach(el => { el.tabIndex = active && flipped ? 0 : -1; });
}

function renderCarousel() {
  cards.forEach((card, index) => {
    const offset = (index - activeIndex + cards.length) % cards.length;
    card.classList.toggle('is-active', offset === 0);
    card.classList.toggle('is-next', offset === 1);
    card.classList.toggle('is-prev', offset === cards.length - 1);
    card.setAttribute('aria-current', offset === 0 ? 'true' : 'false');
    if (offset !== 0) card.classList.remove('is-flipped');
    syncCardAccess(card, offset === 0);
  });
  currentCard.textContent = String(activeIndex + 1).padStart(2, '0');
  progress.setAttribute('aria-label', `Internship ${activeIndex + 1} of ${cards.length}`);
  progressFill.style.transform = `translateX(${activeIndex * 100}%)`;
}

function selectCard(index) {
  activeIndex = (index + cards.length) % cards.length;
  renderCarousel();
}

function flipCard(card, showBack) {
  if (!card.classList.contains('is-active')) return;
  card.classList.toggle('is-flipped', showBack);
  syncCardAccess(card, true);
  (showBack ? card.querySelector('.card-close') : card.querySelector('.card-open')).focus();
}

document.querySelector('#prev-card').addEventListener('click', () => selectCard(activeIndex - 1));
document.querySelector('#next-card').addEventListener('click', () => selectCard(activeIndex + 1));

cards.forEach((card, index) => {
  card.querySelector('.card-open').addEventListener('click', event => {
    event.stopPropagation();
    if (index !== activeIndex) selectCard(index);
    flipCard(card, true);
  });
  card.querySelector('.card-close').addEventListener('click', event => {
    event.stopPropagation();
    flipCard(card, false);
  });
  card.addEventListener('click', event => {
    if (suppressClick || event.target.closest('button, a')) return;
    if (index !== activeIndex) selectCard(index);
    else if (!card.classList.contains('is-flipped')) flipCard(card, true);
  });
});

stage.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight') { event.preventDefault(); selectCard(activeIndex + 1); stage.focus({ preventScroll: true }); }
  if (event.key === 'ArrowLeft') { event.preventDefault(); selectCard(activeIndex - 1); stage.focus({ preventScroll: true }); }
  if (event.key === 'Escape') {
    const active = cards[activeIndex];
    if (active.classList.contains('is-flipped')) { event.preventDefault(); flipCard(active, false); }
  }
});

let pointerStart = null;
stage.addEventListener('pointerdown', event => {
  pointerStart = { x: event.clientX, y: event.clientY };
});
stage.addEventListener('pointerup', event => {
  if (!pointerStart) return;
  const dx = event.clientX - pointerStart.x;
  const dy = event.clientY - pointerStart.y;
  pointerStart = null;
  if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) {
    selectCard(activeIndex + (dx < 0 ? 1 : -1));
    suppressClick = true;
    window.setTimeout(() => { suppressClick = false; }, 80);
  }
});
stage.addEventListener('pointercancel', () => { pointerStart = null; });

const services = ['a portrait.', 'a custom painting.', 'a custom design.', 'a custom logo.'];
const serviceText = document.querySelector('#rotating-service');
let serviceIndex = 0;
window.setInterval(() => {
  serviceText.classList.add('changing');
  window.setTimeout(() => {
    serviceIndex = (serviceIndex + 1) % services.length;
    serviceText.textContent = services[serviceIndex];
    serviceText.classList.remove('changing');
  }, 230);
}, 3000);

document.querySelector('#year').textContent = new Date().getFullYear();
renderCarousel();
