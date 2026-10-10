import { imgwii } from '@widev';
import { ROL_PATH } from '@core/rutas.js';
import { obtenerSaludoHora } from './whatsapp.js';
import { iniciarSincronizacionNegocio, hidratarNegocioEnDOM } from '@core/servicios/hidratarNegocio.js';



/**
 * Switcher de idiomas dinámico preservando ruta y anclas
 */
function initLanguageSwitcher() {
  document.querySelectorAll('.header-pill-group a[data-lang]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const targetLang = btn.getAttribute('data-lang');
      if (!targetLang) return;
      e.preventDefault();
      const pathActual = window.location.pathname.replace(/\/$/, '') || '/';
      let limpia = pathActual;
      if (limpia === '/en') limpia = '/';
      else if (limpia.startsWith('/en/')) limpia = limpia.slice(3) || '/';
      const hash = window.location.hash || '';

      const dest = targetLang === 'es' 
        ? limpia 
        : (limpia === '/' ? `/${targetLang}` : `/${targetLang}${limpia}`);
      window.location.href = dest + hash;
    });
  });
}

/**
 * Hidrata elementos del Hero con datos reactivos de negocio
 */
function hidratarHeroDesdeNegocio(datos) {
  if (!datos || typeof datos !== 'object') return;

  const dir = datos.ubicacion?.direccion || '';
  const maps = datos.ubicacion?.mapsUrl || '';
  const tel = datos.contacto?.telefono || '';
  const telLimpio = datos.contacto?.telefonoLimpio || tel.replace(/\D/g, '');

  if (dir) {
    document.querySelectorAll('[data-negocio-direccion], [data-negocio-direccion-sede], [data-negocio-direccion-origen]').forEach(el => {
      el.textContent = dir;
    });
  }

  if (maps) {
    document.querySelectorAll('[data-negocio-maps]').forEach(a => {
      a.setAttribute('href', maps);
    });
  }

  if (tel) {
    document.querySelectorAll('[data-negocio-tel-text]').forEach(el => el.textContent = tel);
  }
  if (telLimpio) {
    document.querySelectorAll('[data-negocio-tel-link]').forEach(a => a.setAttribute('href', `tel:${telLimpio}`));
  }

  const horario = datos.contacto?.horario || '';
  if (horario) {
    document.querySelectorAll('[data-negocio-horario]').forEach(el => el.textContent = horario);
  }
}

/**
 * Selector interactivo de temas clínicos en Hero (Psicología América)
 */
function initSelectorTemas() {
  const grid = document.getElementById('temaSelector') || document.getElementById('districtSelector');
  const info = document.getElementById('temaActualInfo') || document.getElementById('distritoActualInfo');
  const btnWsp = document.getElementById('btnHeroWsp');
  if (!grid) return;

  const botones = grid.querySelectorAll('.hero-district-btn');
  botones.forEach((btn) => {
    btn.addEventListener('click', () => {
      botones.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const infoText = btn.getAttribute('data-info') || '';
      const labelText = btn.getAttribute('data-label') || btn.querySelector('.hero-district-name')?.textContent?.trim() || '';
      const tema = btn.getAttribute('data-tema') || '';

      if (info) {
        info.textContent = infoText;
      }

      if (btnWsp) {
        btnWsp.setAttribute('data-tema', tema);
      }

      try {
        localStorage.setItem('contabilidad_motivo_activo', tema);
      } catch (e) {}
    });
  });
}

/**
 * Reconciliación Local-First de servicios con localStorage
 */
function initReconciliacionServicios() {
  try {
    const local = localStorage.getItem('contabilidad_servicios');
    if (!local) return;
    const prods = JSON.parse(local);
    if (!Array.isArray(prods) || prods.length === 0) return;

    prods.forEach((p) => {
      const id = p.id || p.slug;
      if (!id) return;
      const card = document.querySelector(`[data-prod-id="${id}"], [data-taller-id="${id}"]`);
      if (!card) return;
      const precioEl = card.querySelector('[data-price-id]');
      if (precioEl && p.precioPEN !== undefined) {
        precioEl.textContent = Number(p.precioPEN).toFixed(2);
      }
    });
  } catch (e) {}
}

/**
 * Inicializador Maestro diferido por wiSmart()
 */
export function initInicioInteractivo() {
  // 1. Activar lazy loading inteligente de imágenes
  imgwii.ver();

  // 2. Sincronización e Hidratación Dinámica de Negocio y WhatsApp
  iniciarSincronizacionNegocio();

  // 3. Switcher de idiomas
  initLanguageSwitcher();

  // 4. Selector interactivo de temas tributarios en Hero
  initSelectorTemas();

  // 5. Sincronización Local-First de tarifas de servicios
  initReconciliacionServicios();

  // 6. Accesibilidad: Cerrar Drawer con tecla Escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.cerrarDrawer?.();
    }
  });
}
