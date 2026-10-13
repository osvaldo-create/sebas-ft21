/* Configuración de Tailwind (se carga justo después del CDN) */
tailwind.config = {
  theme: {
    extend: {
      colors: {
        base: '#2B2E33',         // gris oscuro principal (fondo)
        panel: '#353A40',        // gris medio (tarjetas y cajas)
        deep: '#1F2226',         // gris muy oscuro (header, footer, secciones)
        line: '#4B5159',         // gris de bordes
        pitch: '#22C55E',        // verde deportivo
        'pitch-dark': '#16A34A'  // verde más oscuro (hover)
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'Impact', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace']
      }
    }
  }
};