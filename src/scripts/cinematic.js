'use strict';
const cinemaScenes = {
  rift: { file: 'assets/rift-gate.svg', alt: 'Original vector scene of a luminous crystalline portal', label: 'ATREIA / THE OTHER SIDE' },
  abyss: { file: 'assets/abyss-vault.svg', alt: 'Original vector scene of a silent blue portal vault', label: 'ATREIA / INTO THE ABYSS' },
  fire: { file: 'assets/ember-citadel.svg', alt: 'Original vector scene of an ember citadel', label: 'ATREIA / FIRE & FURY' }
};
document.querySelectorAll('[data-scene]').forEach(button => button.addEventListener('click', () => {
  const scene = cinemaScenes[button.dataset.scene];
  const image = el('hero-scene');
  image.src = new URL(scene.file, APP_ROOT).href;
  image.alt = scene.alt;
  document.querySelector('.scene-label>span').textContent = scene.label;
  document.querySelectorAll('[data-scene]').forEach(other => {
    const chosen = other === button;
    other.classList.toggle('selected', chosen);
    other.setAttribute('aria-pressed', String(chosen));
  });
}));
document.querySelectorAll('[data-service]').forEach(button => button.addEventListener('click', () => {
  setRegion(button.dataset.service);
  el('timer').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  updateCinematicClocks();
}));
function updateCinematicClocks() {
  const now = Date.now();
  const next = datesAfter(now, 1)[0];
  document.querySelectorAll('[data-region-time]').forEach(node => {
    const service = node.dataset.regionService || {'Europe/Berlin':'europe','America/New_York':'na-east','Asia/Seoul':'asia'}[node.dataset.regionTime];
    const regionRule = RiftSchedule.resolve(regions[service], 'rift', profile, group);
    const regionNext = RiftSchedule.openings(regionRule, now, 1)[0];
    node.textContent = regionNext ? clock(regionNext, node.dataset.regionTime) : '—';
  });
  el('mini-countdown').textContent = [el('hours').textContent, el('minutes').textContent, el('seconds').textContent].join(':');
  const reset = resetAfter(now);
  const remainingSeconds = reset ? Math.ceil((+reset - now) / 1000) : 0;
  el('reset-countdown').textContent = !reset ? '--:--:--' : [Math.floor(remainingSeconds / 3600), Math.floor(remainingSeconds / 60) % 60, remainingSeconds % 60].map(part => String(part).padStart(2, '0')).join(':');
  el('reset-reference').textContent = regions[region].name + ' · ' + (reset ? clock(reset) + ' / ' + confidenceName(selectedRule('daily-reset').confidence) : t('Not scheduled for this service'));
}
el('region').addEventListener('change', updateCinematicClocks);
updateCinematicClocks();
setInterval(updateCinematicClocks, 1000);
new IntersectionObserver(entries => {
  el('mini-timer').hidden = entries[0].isIntersecting;
}, { threshold: .05 }).observe(el('timer'));
