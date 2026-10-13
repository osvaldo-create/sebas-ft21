/* ===== gallery.js: galería dinámica, filtros y lightbox (pensado para celular) ===== */

/* ---------- Categorías (filtros fijos) ---------- */
const CATEGORIAS = ['PARTIDOS', 'NATURALEZA', 'TRABAJO'];

/* ---------- Datos ---------- */
// Datos de ejemplo: se usan solo si content/galeria.json está vacío o no existe
const FALLBACK = [
  { titulo: 'Fotografía 1', categoria: 'PARTIDOS',   partido: 'Final · 2026', tipo: 'foto', media: 'https://picsum.photos/seed/ft21a/900/1100', fecha: '2026-09-28' },
  { titulo: 'Fotografía 2', categoria: 'NATURALEZA', partido: '',             tipo: 'foto', media: 'https://picsum.photos/seed/ft21b/900/1100', fecha: '2026-09-20' },
  { titulo: 'Fotografía 3', categoria: 'TRABAJO',    partido: '',             tipo: 'foto', media: 'https://picsum.photos/seed/ft21c/900/1100', fecha: '2026-09-12' },
  { titulo: 'Fotografía 4', categoria: 'PARTIDOS',   partido: 'Jornada 7',    tipo: 'foto', media: 'https://picsum.photos/seed/ft21d/900/1100', fecha: '2026-09-05' },
  { titulo: 'Fotografía 5', categoria: 'NATURALEZA', partido: '',             tipo: 'foto', media: 'https://picsum.photos/seed/ft21e/900/1100', fecha: '2026-08-30' },
  { titulo: 'Fotografía 6', categoria: 'PARTIDOS',   partido: 'Semifinal',    tipo: 'foto', media: 'https://picsum.photos/seed/ft21f/900/1100', fecha: '2026-08-22' }
];

let items = [];
let current = [];
let idx = 0;
let activeFilter = 'TODAS';
const $gallery = document.getElementById('gallery');

/* ---------- Helpers ---------- */
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const isVideo = i => i.tipo === 'video' || /\.(mp4|webm|mov)$/i.test(i.media || '');
const fmtDate = d => {
  const t = Date.parse(d);
  return t ? new Date(t).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }) : '';
};

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
  // Más recientes primero (los que no tienen fecha van al final)
  items.sort((a, b) => (Date.parse(b.fecha) || 0) - (Date.parse(a.fecha) || 0));
  buildFilters();
  render();
}

/* ---------- Filtros ---------- */
const FILTER_BASE = 'filter-btn font-mono text-[11px] sm:text-xs uppercase tracking-widest px-3 sm:px-4 py-2 border transition';
const FILTER_ON   = 'bg-pitch text-deep border-pitch';
const FILTER_OFF  = 'bg-transparent border-line text-gray-300 hover:border-pitch hover:text-pitch';

function buildFilters() {
  const cats = ['TODAS', ...CATEGORIAS];
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
        : `<img src="${esc(it.media)}" alt="${esc(it.titulo || it.categoria)}" loading="lazy" class="card-img w-full h-full object-cover" />`}
      <span class="absolute top-2 left-2 sm:top-3 sm:left-3 max-w-[75%] truncate bg-pitch text-deep font-mono text-[10px] sm:text-[11px] font-bold px-2 sm:px-3 py-1 uppercase tracking-wider">${esc(it.partido || it.categoria)}</span>
      ${isVideo(it) ? '<span class="absolute top-2 right-2 sm:top-3 sm:right-3 bg-black/70 text-white w-8 h-8 rounded-full flex items-center justify-center text-xs"><i class="fa-solid fa-play"></i></span>' : ''}
      <!-- En celular el texto se ve siempre; en computadora aparece al pasar el mouse -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 md:via-black/40 transition duration-300 flex flex-col justify-end p-3 sm:p-5">
        <p class="font-mono text-green-400 text-[10px] sm:text-[11px] uppercase tracking-widest">${esc(it.categoria)}</p>
        ${it.titulo ? `<h3 class="font-display text-xl sm:text-3xl leading-none text-white">${esc(it.titulo)}</h3>` : ''}
        ${it.fecha ? `<p class="text-gray-300 text-[11px] sm:text-xs mt-1">${fmtDate(it.fecha)}</p>` : ''}
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
    ? `<video src="${esc(it.media)}" controls autoplay playsinline class="max-h-[70vh] max-w-full"></video>`
    : `<img src="${esc(it.media)}" alt="${esc(it.titulo || it.categoria)}" class="max-h-[70vh] max-w-full object-contain" />`;
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

// Deslizar el dedo para cambiar de foto en el celular
let touchX = null;
lb.addEventListener('touchstart', e => { touchX = e.changedTouches[0].clientX; }, { passive: true });
lb.addEventListener('touchend', e => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 50) openLB(idx + (dx < 0 ? 1 : -1));
  touchX = null;
});

loadGallery();