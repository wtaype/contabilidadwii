// src/feature/personal/modulos/dashboard/dashboard.js
// Controlador Frontend Autónomo del Dashboard: Universal & Reutilizable
// 100% JS Nativo · Integrado con @widev, datosNegocio y LocalStorage

import { getls } from '@widev';

export function inicializarDashboard() {
  const panel = document.getElementById('panel-dashboard');
  if (!panel) return;

  // 1. Saludo Horario Dinámico e Icono Día/Noche (100% Reutilizable y Universal)
  function hidratarSaludoHorario() {
    const greetingEl = document.getElementById('dbGreetingText');
    const iconEl = document.getElementById('dbHeroTimeIcon');

    const hora = new Date().getHours();
    let saludo = 'Buenas noches';
    let iconoClase = 'fa-solid fa-moon';
    let iconoColor = '#facc15';

    if (hora >= 5 && hora < 12) {
      saludo = 'Buenos días';
      iconoClase = 'fa-solid fa-sun';
      iconoColor = '#f59e0b';
    } else if (hora >= 12 && hora < 19) {
      saludo = 'Buenas tardes';
      iconoClase = 'fa-solid fa-cloud-sun';
      iconoColor = '#f97316';
    }

    if (greetingEl) greetingEl.textContent = saludo;
    if (iconEl) {
      iconEl.className = iconoClase;
      iconEl.style.color = iconoColor;
    }
  }

  // 2. Hidratación Dinámica de Métricas Vivas del Top 3 (Negocio, Productos, Galería)
  function hidratarMetricasVivas() {
    // A. Servicios y Precios
    try {
      const prodsGuardados = getls('contabilidad_productos_custom') || getls('wi_servicios');
      if (Array.isArray(prodsGuardados) && prodsGuardados.length > 0) {
        const countEl = document.getElementById('dbLiveServiciosCount');
        const minEl = document.getElementById('dbLiveMinPrecio');
        const maxEl = document.getElementById('dbLiveMaxPrecio');

        if (countEl) countEl.textContent = `${prodsGuardados.length} servicios`;
        
        const precios = prodsGuardados
          .map(p => Number(p.precioPEN || p.precio || 0))
          .filter(p => p > 0);

        if (precios.length > 0) {
          const min = Math.min(...precios).toFixed(2);
          const max = Math.max(...precios).toFixed(2);
          if (minEl) minEl.textContent = min;
          if (maxEl) maxEl.textContent = max;
        }
      }
    } catch (e) {}

    // B. Galería de Imágenes Oficiales
    try {
      const fotosGuardadas = getls('wi_galeria_imagenes');
      if (Array.isArray(fotosGuardadas) && fotosGuardadas.length > 0) {
        const fotosActivas = fotosGuardadas.filter(f => f.estado !== 'eliminado');
        const fotosEl = document.getElementById('dbLiveFotosCount');
        if (fotosEl) fotosEl.textContent = `${fotosActivas.length} fotos`;
      }
    } catch (e) {}
  }

  // 3. Accesibilidad por teclado para las tarjetas con data-jump-to
  panel.querySelectorAll('.db-tool-card[data-jump-to]').forEach(card => {
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });

  // Ejecución inicial
  hidratarSaludoHorario();
  hidratarMetricasVivas();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializarDashboard);
} else {
  inicializarDashboard();
}
