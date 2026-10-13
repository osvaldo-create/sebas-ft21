/* ===== gallery.js: galería dinámica, filtros y lightbox ===== */

/* ---------- Datos ---------- */
// Datos de ejemplo: se usan solo si content/galeria.json está vacío o no existe
const FALLBACK = [
  { titulo: 'Fotografía 1', categoria: 'VS',               partido: 'Final · 2026',     tipo: 'foto', media: 'https://picsum.photos/seed/ft21a/900/1100', fecha: '2026-09-28' },
  { titulo: 'Fotografía 2', categoria: 'MOON',             partido: 'Clásico nocturno', tipo: 'foto', media: 'https://picsum.photos/seed/ft21b/900/700',  fecha: '2026-09-20' },
  { titulo: 'Fotografía 3', categoria: 'DOBLE EXPOSICIÓN', partido: 'Jornada 8',        tipo: 'foto', media: 'https://picsum.photos/seed/ft21c/900/1000', fecha: '2026-09-12' },
  { titulo: 'Fotografía 4', categoria: 'DARK',             partido: 'Jornada 7',        tipo: 'foto', media: 'https://picsum.photos/seed/ft21d/900/800',  fecha: '2026-09-05' },
  { titulo: 'Fotografía 5', categoria: 'VS',               partido: 'Semifinal',        tipo: 'foto', media: 'https://picsum.photos/seed/ft21e/900/1100', fecha: '2026-08-30' },
  { titulo: 'Fotografía 6', categoria: 'MOON',             partido: 'Jornada 6',        tipo: 'foto', media: 'https://picsum.photos/seed/ft21f/900/700',  fecha: '2026-08-22' }
];

let items = [];
let current = [];
let idx = 0;
let activeFilter = 'TODAS';
const $gallery = document.getElementById('gallery');

/* ---------- Helpers ---------- */
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const isVideo = i => i.tipo === 'video' || /\.(mp4|webm|mov)$/i.test(i.media || '');
const fmtDate = d => d
  ? new Date(d).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
  : '';

/* ---------- Carga ---------- */
async function loadGallery() {
  try {
    const res = await fetch('content/galeria.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('sin contenido');
    const data = await res.json();
    items = (data.items || []).filter(i => i && i.media);
    if (!items.length) items = FALLBACK;
  } catch (e) {
    items = FALLBACK;
  }
  items.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  buildFilters();
  render();
}

/* ---------- Filtros ---------- */
const FILTER_BASE = 'filter-btn font-mono text-xs uppercase tracking-widest px-4 py-2 border transition';
const FILTER_ON   = 'bg-pitch text-deep border-pitch';
const FILTER_OFF  = 'bg-transparent border-line text-gray-300 hover:border-pitch hover:text-pitch';

function buildFilters() {
  const cats = ['TODAS', ...new Set(items.map(i => (i.categoria || '').toUpperCase()).filter(Boolean))];
  document.getElementById('filters').innerHTML = cats.map(c =>
    `<button data-cat="${c}" class="${FILTER_BASE}">${c}</button>`).join('');
  document.querySelectorAll('.filter-btn').forEach(b => b.addEventListener('click', () => setFilter(b.dataset.cat)));
  paintFilters();
}

function paintFilters() {
  document.querySelectorAll('.filter-btn').forEach(b => {
    b.className = `${FILTER_BASE} ${b.dataset.cat === activeFilter ? FILTER_ON : FILTER_OFF}`;
  });
}

function setFilter(cat) {
  activeFilter = (cat || 'TODAS').toUpperCase();
  paintFilters();
  render();
}

/* ---------- Render ---------- */
function render() {
  current = items.filter(i => activeFilter === 'TODAS' || (i.categoria || '').toUpperCase() === activeFilter);
  document.getElementById('emptyMsg').classList.toggle('hidden', current.length > 0);

  $gallery.innerHTML = current.map((it, n) => `
<article class="gallery-card fade-in group relative overflow-hidden bg-panel cursor-pointer aspect-[4/5]" data-i="${n}" style="animation-delay:${n * 60}ms">
      ${isVideo(it)
        ? `<video src="${esc(it.media)}" class="card-img w-full h-full object-cover" muted playsinline preload="metadata"></video>`
        : `<img src="${esc(it.media)}" alt="${esc(it.titulo)}" loading="lazy" class="card-img w-full h-full object-cover" />`}
      <span class="absolute top-3 left-3 bg-pitch text-deep font-mono text-[11px] font-bold px-3 py-1 uppercase tracking-wider">${esc(it.partido || it.categoria)}</span>
      ${isVideo(it) ? '<span class="absolute top-3 right-3 bg-black/70 text-white w-9 h-9 rounded-full flex items-center justify-center"><i class="fa-solid fa-play"></i></span>' : ''}
      <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-end p-5">
        <p class="font-mono text-green-400 text-[11px] uppercase tracking-widest">${esc(it.categoria)}</p>
        <h3 class="font-display text-3xl leading-none text-white">${esc(it.titulo)}</h3>
        <p class="text-gray-300 text-xs mt-1">${fmtDate(it.fecha)}</p>
      </div>
      <div class="absolute inset-x-0 bottom-0 h-1 bg-pitch scale-x-0 group-hover:scale-x-100 origin-left transition duration-500"></div>
    </article>`).join('');
}

$gallery.addEventListener('click', e => {
  const card = e.target.closest('[data-i]');
  if (card) openLB(+card.dataset.i);
});

/* ---------- Lightbox ---------- */
const lb = document.getElementById('lightbox');

function openLB(n) {
  idx = (n + current.length) % current.length;
  const it = current[idx];
  document.getElementById('lbMedia').innerHTML = isVideo(it)
    ? `<video src="${esc(it.media)}" controls autoplay class="max-h-[75vh] max-w-full"></video>`
    : `<img src="${esc(it.media)}" alt="${esc(it.titulo)}" class="max-h-[75vh] max-w-full object-contain" />`;
  document.getElementById('lbTitle').textContent = it.titulo || '';
  document.getElementById('lbBadge').textContent = it.partido || it.categoria || '';
  document.getElementById('lbDate').textContent = fmtDate(it.fecha);
  lb.classList.remove('hidden');
  lb.classList.add('flex');
  document.body.style.overflow = 'hidden';
}

function closeLB() {
  lb.classList.add('hidden');
  lb.classList.remove('flex');
  document.body.style.overflow = '';
  document.getElementById('lbMedia').innerHTML = '';
}

document.getElementById('lbClose').addEventListener('click', closeLB);
document.getElementById('lbPrev').addEventListener('click', () => openLB(idx - 1));
document.getElementById('lbNext').addEventListener('click', () => openLB(idx + 1));
lb.addEventListener('click', e => { if (e.target === lb) closeLB(); });
document.addEventListener('keydown', e => {
  if (lb.classList.contains('hidden')) return;
  if (e.key === 'Escape') closeLB();
  if (e.key === 'ArrowLeft') openLB(idx - 1);
  if (e.key === 'ArrowRight') openLB(idx + 1);
});

loadGallery();