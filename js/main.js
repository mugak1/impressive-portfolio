import { A11yModal } from './components/modal.js';

// ====== DOM ======
const navToggle = document.getElementById('navToggle');
const menu = document.getElementById('primaryMenu');
const themeToggle = document.getElementById('themeToggle');
const year = document.getElementById('year');
const projectGrid = document.getElementById('projectGrid');
const projectSearch = document.getElementById('projectSearch');
const chips = document.querySelectorAll('.chip');
const modal = new A11yModal(document.getElementById('projectModal'));
const copyEmailBtn = document.getElementById('copyEmail');
const heroCanvas = document.getElementById('heroCanvas');
const installLink = document.getElementById('installPWA');

// ====== Utilities ======
const qs = (sel, el=document) => el.querySelector(sel);
const qsa = (sel, el=document) => Array.from(el.querySelectorAll(sel));
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ====== Navigation ======
navToggle?.addEventListener('click', () => {
  const collapsed = menu.getAttribute('data-collapsed') === 'true';
  menu.setAttribute('data-collapsed', String(!collapsed));
  navToggle.setAttribute('aria-expanded', String(collapsed));
});

// ====== Theme ======
const THEME_KEY = 'theme';
function setMetaTheme(color) {
  document.querySelectorAll('meta[name="theme-color"]')
    .forEach(m => m.setAttribute('content', color));
}
function setTheme(next) {
  document.documentElement.dataset.theme = next;
  themeToggle?.setAttribute('aria-pressed', String(next === 'dark'));
  localStorage.setItem(THEME_KEY, next);
  setMetaTheme(next === 'dark' ? '#0b0b10' : '#ffffff');
}
themeToggle?.addEventListener('click', () => {
  const current = document.documentElement.dataset.theme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark':'light');
  setTheme(current === 'dark' ? 'light' : 'dark');
});
const savedTheme = localStorage.getItem(THEME_KEY);
if (savedTheme) setTheme(savedTheme);

// ====== Footer year ======
year.textContent = new Date().getFullYear();

// ====== Projects ======
let allProjects = [];
let activeTag = 'all';

async function loadProjects() {
  const res = await fetch('data/projects.json');
  allProjects = await res.json();
  renderProjects();
}
function renderProjects() {
  const needle = projectSearch.value.toLowerCase().trim();
  const projects = allProjects.filter(p => {
    const tagMatch = activeTag === 'all' || p.tags.includes(activeTag);
    const text = `${p.title} ${p.description} ${p.tags.join(' ')}`.toLowerCase();
    const searchMatch = !needle || text.includes(needle);
    return tagMatch && searchMatch;
  });
  projectGrid.innerHTML = '';
  for (const p of projects) {
    const el = document.createElement('project-card');
    el.setAttribute('data-title', p.title);
    el.setAttribute('data-desc', p.description);
    el.setAttribute('data-tags', p.tags.join(','));
    el.setAttribute('data-demo', p.demo);
    el.setAttribute('data-github', p.github);
    el.addEventListener('card-click', () => openProject(p));
    projectGrid.appendChild(el);
  }
}
function openProject(p) {
  const content = document.createElement('div');
  content.innerHTML = `
    <header style="display:flex;justify-content:space-between;align-items:center;gap:16px;">
      <h3 style="margin:0;font-size:24px;">${p.title}</h3>
      <div style="display:flex;gap:8px;">
        <a class="btn" href="${p.demo}" target="_blank" rel="noopener">Live demo</a>
        <a class="btn" href="${p.github}" target="_blank" rel="noopener">Code</a>
      </div>
    </header>
    <p style="color:var(--muted);margin-top:10px;">${p.longDescription || p.description}</p>
    <ul style="display:flex;gap:8px;flex-wrap:wrap;list-style:none;padding:0;margin:12px 0;">
      ${p.tags.map(t => `<li style="border:1px solid var(--border);border-radius:999px;padding:4px 10px;">${t}</li>`).join('')}
    </ul>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin-top:8px;">
      <div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:12px;"><strong>Lighthouse:</strong><br/>${p.lighthouse || 'Perf 100 / A11y 100 / PWA Yes'}</div>
      <div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:12px;"><strong>Highlights:</strong><br/>${p.highlights?.join('<br/>') || ''}</div>
    </div>
  `;
  modal.open(content);
}
projectSearch?.addEventListener('input', renderProjects);
chips.forEach(chip => {
  chip.addEventListener('click', () => {
    chips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    activeTag = chip.dataset.tag;
    renderProjects();
  });
});

loadProjects();

// ====== Copy email ======
copyEmailBtn?.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(copyEmailBtn.dataset.email);
    copyEmailBtn.textContent = 'Copied ✔';
    setTimeout(() => (copyEmailBtn.textContent = 'Copy email'), 1800);
  } catch (e) { alert('Copy failed, please use the Email button.'); }
});

// ====== Simple Canvas animation (reduced motion aware) ======
(function drawHero() {
  if (!heroCanvas) return;
  const ctx = heroCanvas.getContext('2d');
  const w = heroCanvas.width, h = heroCanvas.height;
  let t = 0;
  function loop() {
    ctx.clearRect(0,0,w,h);
    const cx = w/2, cy = h/2;
    for (let i=0;i<90;i++) {
      const angle = (i/90) * Math.PI * 2 + t*0.01;
      const r = 80 + 40*Math.sin(t*0.02 + i);
      const x = cx + Math.cos(angle) * (r + i*2);
      const y = cy + Math.sin(angle) * (r + i*2);
      ctx.beginPath();
      ctx.arc(x,y, Math.max(1, (i%7)+1), 0, Math.PI*2);
      ctx.fillStyle = `hsl(${(i*4 + t)%360} 80% 60% / 0.6)`;
      ctx.fill();
    }
    t += 1;
    if (!prefersReducedMotion) requestAnimationFrame(loop);
  }
  if (!prefersReducedMotion) loop();
})();

// ====== PWA install prompt ======
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installLink.hidden = false;
});
installLink?.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if (outcome === 'accepted') installLink.textContent = 'Installed ✔';
  deferredPrompt = null;
});

// ====== Service Worker ======
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

// ====== Skill Radar (Canvas) ======
(function drawSkills() {
  const el = document.getElementById('skillsChart');
  if (!el) return;
  const ctx = el.getContext('2d');
  const center = { x: el.width/2, y: el.height/2 };
  const labels = ['CSS','JS','A11y','Perf','Tooling'];
  const values = [95, 90, 100, 92, 85];
  const R = 140;

  ctx.font = '14px system-ui';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // grid
  ctx.strokeStyle = 'rgba(127,127,153,.3)';
  for (let r=30; r<=R; r+=30) {
    ctx.beginPath();
    for (let i=0;i<labels.length;i++) {
      const a = (i/labels.length) * Math.PI*2 - Math.PI/2;
      const x = center.x + Math.cos(a)*r;
      const y = center.y + Math.sin(a)*r;
      if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.closePath(); ctx.stroke();
  }

  // axes + labels
  ctx.fillStyle = 'var(--text)';
  for (let i=0;i<labels.length;i++) {
    const a = (i/labels.length) * Math.PI*2 - Math.PI/2;
    ctx.beginPath(); ctx.moveTo(center.x, center.y);
    ctx.lineTo(center.x + Math.cos(a)*R, center.y + Math.sin(a)*R);
    ctx.stroke();
    const lx = center.x + Math.cos(a)*(R+18);
    const ly = center.y + Math.sin(a)*(R+18);
    ctx.fillText(labels[i], lx, ly);
  }

  // poly
  ctx.beginPath();
  for (let i=0;i<labels.length;i++) {
    const a = (i/labels.length) * Math.PI*2 - Math.PI/2;
    const r = (values[i]/100)*R;
    const x = center.x + Math.cos(a)*r;
    const y = center.y + Math.sin(a)*r;
    if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(91,124,250,.25)';
  ctx.strokeStyle = 'rgba(91,124,250,.8)';
  ctx.lineWidth = 2;
  ctx.fill(); ctx.stroke();
})();
