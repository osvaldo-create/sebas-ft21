/* ===== main.js: interacciones generales de la página ===== */

// Año del footer
document.getElementById('year').textContent = new Date().getFullYear();

// Menú móvil
const mobileMenu = document.getElementById('mobileMenu');
document.getElementById('menuBtn').addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileMenu.classList.add('hidden')));

// Código de barras decorativo de la acreditación
document.getElementById('barcode').innerHTML = Array.from({ length: 42 }, () =>
 `<span style="width:3px;height:${40 + Math.random() * 60}%;background:#F3F4F6"></span>`
).join('');

// Netlify Identity: tras login o invitación, redirige al panel /admin
if (window.netlifyIdentity) {
  window.netlifyIdentity.on('init', user => {
    if (!user) window.netlifyIdentity.on('login', () => { document.location.href = '/admin/'; });
  });
}
if (window.location.hash.includes('invite_token') || window.location.hash.includes('recovery_token')) {
  window.location.href = '/admin/' + window.location.hash;
}
