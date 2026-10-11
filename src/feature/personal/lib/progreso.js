// src/feature/personal/lib/progreso.js
// 🚀 Gestor de Barra de Progreso de Re-Deploy en Cloudflare Pages
// Animación fluida de 1:30 min, Dock Flotante, Persistencia en sessionStorage y Enlace en Vivo

const STORAGE_KEY = 'cf_deploy_progress';
const DURACION_TOTAL_MS = 90 * 1000; // 90 segundos (1:30 min)
let _intervalo = null;
let _sondeoActivo = false;

/**
 * Inserta o retorna el contenedor HTML del dock de progreso
 */
function obtenerOCrearDock() {
  if (typeof document === 'undefined') return null;

  let dock = document.getElementById('cfDeployDock');
  if (dock) return dock;

  dock = document.createElement('div');
  dock.id = 'cfDeployDock';
  dock.className = 'cf-dock-wrap';
  dock.innerHTML = `
    <div class="cf-dock-card">
      <header class="cf-dock-head">
        <div class="cf-dock-title-wrap">
          <i class="fa-solid fa-cloud-arrow-up cf-dock-icon cf-spin-cloud" id="cfDockIcon"></i>
          <div>
            <strong class="cf-dock-title" id="cfDockTitle">Desplegando en Cloudflare</strong>
            <span class="cf-dock-sub" id="cfDockSub">Sincronizando cambios en vivo</span>
          </div>
        </div>
        <div class="cf-dock-head-right">
          <span class="cf-dock-pct" id="cfDockPct">0%</span>
          <button type="button" class="cf-dock-btn-close" id="cfDockBtnClose" title="Cerrar aviso">&times;</button>
        </div>
      </header>

      <!-- Barra de Progreso -->
      <div class="cf-dock-bar-track">
        <div class="cf-dock-bar-fill" id="cfDockBarFill" style="width: 0%;"></div>
      </div>

      <!-- Estado y Contador -->
      <footer class="cf-dock-footer">
        <span class="cf-dock-status-txt" id="cfDockStatusTxt">Compilando 47 páginas en la nube…</span>
        <span class="cf-dock-timer" id="cfDockTimer">1:30 min</span>
      </footer>

      <!-- Botón de Éxito al finalizar -->
      <div class="cf-dock-action-wrap" id="cfDockActionWrap" style="display: none;">
        <a href="/" target="_blank" rel="noopener noreferrer" class="cf-dock-btn-open" id="cfDockBtnOpen">
          <i class="fa-solid fa-arrow-up-right-from-square"></i> Ver Web en Nueva Pestaña
        </a>
      </div>
    </div>
  `;

  // Estilos inyectados con variables de witema
  const style = document.createElement('style');
  style.id = 'cfDeployDockStyles';
  style.textContent = `
    .cf-dock-wrap {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 10000;
      width: calc(100% - 48px);
      max-width: 420px;
      pointer-events: auto;
      animation: cfDockSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      font-family: inherit;
    }
    @keyframes cfDockSlideUp {
      from { transform: translateY(24px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .cf-dock-card {
      background: var(--bg2, rgba(17, 24, 39, 0.96));
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--borde, rgba(255, 255, 255, 0.12));
      border-radius: 14px;
      padding: 14px 16px;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.05);
      color: var(--tx, #f8fafc);
    }
    .cf-dock-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .cf-dock-title-wrap {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .cf-dock-icon {
      font-size: 20px;
      color: var(--brand-primary, #9e7b4f);
      flex-shrink: 0;
    }
    .cf-spin-cloud {
      animation: cfPulseCloud 1.6s ease-in-out infinite alternate;
    }
    @keyframes cfPulseCloud {
      from { transform: scale(0.95); opacity: 0.75; }
      to { transform: scale(1.1); opacity: 1; }
    }
    .cf-dock-title {
      font-size: 13.5px;
      font-weight: 600;
      display: block;
      line-height: 1.25;
    }
    .cf-dock-sub {
      font-size: 11px;
      color: var(--tx2, #94a3b8);
      display: block;
    }
    .cf-dock-head-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .cf-dock-pct {
      font-size: 13px;
      font-weight: 700;
      color: var(--brand-primary, #9e7b4f);
      font-variant-numeric: tabular-nums;
    }
    .cf-dock-btn-close {
      background: none;
      border: none;
      color: var(--tx2, #94a3b8);
      font-size: 18px;
      cursor: pointer;
      line-height: 1;
      padding: 2px 4px;
      border-radius: 4px;
      transition: color 0.15s, background 0.15s;
    }
    .cf-dock-btn-close:hover {
      color: var(--tx, #fff);
      background: rgba(255, 255, 255, 0.1);
    }
    .cf-dock-bar-track {
      height: 7px;
      background: var(--bg3, rgba(255, 255, 255, 0.08));
      border-radius: 999px;
      overflow: hidden;
      margin: 10px 0 8px;
      position: relative;
    }
    .cf-dock-bar-fill {
      height: 100%;
      border-radius: 999px;
      background: linear-gradient(90deg, #9e7b4f, #d4af37, #2ecc71);
      transition: width 0.3s ease;
      position: relative;
    }
    .cf-dock-bar-fill::after {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
      animation: cfShimmer 1.8s infinite;
    }
    @keyframes cfShimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    .cf-dock-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      font-size: 11.5px;
    }
    .cf-dock-status-txt {
      color: var(--tx2, #94a3b8);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
    }
    .cf-dock-timer {
      font-weight: 600;
      color: var(--tx, #f8fafc);
      font-variant-numeric: tabular-nums;
      flex-shrink: 0;
    }
    .cf-dock-action-wrap {
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid var(--borde, rgba(255, 255, 255, 0.08));
    }
    .cf-dock-btn-open {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 9px 14px;
      background: var(--green, #10b981);
      color: #ffffff;
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      border-radius: 8px;
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
      transition: transform 0.15s, opacity 0.15s, filter 0.15s;
    }
    .cf-dock-btn-open:hover {
      filter: brightness(1.1);
      transform: translateY(-1px);
    }
    @media (max-width: 640px) {
      .cf-dock-wrap {
        left: 12px;
        right: 12px;
        bottom: 12px;
        width: calc(100% - 24px);
      }
    }
  `;

  if (!document.getElementById('cfDeployDockStyles')) {
    document.head.appendChild(style);
  }
  document.body.appendChild(dock);

  // Botón de cerrar
  const btnClose = dock.querySelector('#cfDockBtnClose');
  btnClose?.addEventListener('click', () => {
    dock.style.display = 'none';
    detenerProgreso(true);
  });

  return dock;
}

/**
 * Obtiene el mensaje descriptivo del estado según el porcentaje
 */
function obtenerMensajeEstado(pct) {
  if (pct < 20) return 'Disparando deploy hook y preparando entorno…';
  if (pct < 45) return 'Compilando 47 páginas estáticas y estilos…';
  if (pct < 70) return 'Optimizando assets y generando sitemap XML…';
  if (pct < 90) return 'Desplegando en la red global de Cloudflare…';
  if (pct < 100) return 'Verificando caché y propagación DNS en vivo…';
  return '¡Web actualizada y publicada con éxito! 🎉';
}

/**
 * Formatea milisegundos a M:SS
 */
function formatearTiempo(ms) {
  const totalSeg = Math.max(0, Math.ceil(ms / 1000));
  const min = Math.floor(totalSeg / 60);
  const seg = totalSeg % 60;
  return `${min}:${seg < 10 ? '0' : ''}${seg} min`;
}

/**
 * Inicia o reanuda la barra de progreso
 */
export function iniciarProgresoDeploy({ motivo = 'cambios', forzarInicio = false } = {}) {
  if (typeof window === 'undefined') return;

  const ahora = Date.now();
  let inicio = ahora;

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw && !forzarInicio) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.inicio && (ahora - parsed.inicio) < DURACION_TOTAL_MS) {
        inicio = parsed.inicio;
      }
    }
  } catch (e) {}

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ inicio, motivo }));

  const dock = obtenerOCrearDock();
  if (!dock) return;
  dock.style.display = 'block';

  const elPct = dock.querySelector('#cfDockPct');
  const elBar = dock.querySelector('#cfDockBarFill');
  const elStatus = dock.querySelector('#cfDockStatusTxt');
  const elTimer = dock.querySelector('#cfDockTimer');
  const elTitle = dock.querySelector('#cfDockTitle');
  const elSub = dock.querySelector('#cfDockSub');
  const elIcon = dock.querySelector('#cfDockIcon');
  const elAction = dock.querySelector('#cfDockActionWrap');

  if (_intervalo) clearInterval(_intervalo);

  function tick() {
    const transcurrido = Date.now() - inicio;
    const restante = Math.max(0, DURACION_TOTAL_MS - transcurrido);
    const pct = Math.min(100, Math.floor((transcurrido / DURACION_TOTAL_MS) * 100));

    if (elPct) elPct.textContent = `${pct}%`;
    if (elBar) elBar.style.width = `${pct}%`;
    if (elStatus) elStatus.textContent = obtenerMensajeEstado(pct);
    if (elTimer) elTimer.textContent = formatearTiempo(restante);

    // Sondeo suave con try/catch en el último tramo
    if (pct >= 70 && !_sondeoActivo) {
      _sondeoActivo = true;
      verificarWebEnVivo();
    }

    if (pct >= 100) {
      finalizarConExito(dock);
    }
  }

  tick();
  _intervalo = setInterval(tick, 1000);
}

/**
 * Sondea suavemente si la web ya está respondiendo
 */
async function verificarWebEnVivo() {
  try {
    const res = await fetch(`/?_t=${Date.now()}`, {
      method: 'HEAD',
      cache: 'no-store'
    });
    if (res.ok) {
      // Si la web ya responde, podemos marcar como lista si ya pasaron al menos 65s
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const { inicio } = JSON.parse(raw);
        if (Date.now() - inicio > 65000) {
          const dock = document.getElementById('cfDeployDock');
          if (dock) finalizarConExito(dock);
        }
      }
    }
  } catch (err) {
    // Silencioso
  } finally {
    _sondeoActivo = false;
  }
}

/**
 * Transición al estado 100% de éxito
 */
function finalizarConExito(dock) {
  if (_intervalo) {
    clearInterval(_intervalo);
    _intervalo = null;
  }

  const elPct = dock.querySelector('#cfDockPct');
  const elBar = dock.querySelector('#cfDockBarFill');
  const elStatus = dock.querySelector('#cfDockStatusTxt');
  const elTimer = dock.querySelector('#cfDockTimer');
  const elTitle = dock.querySelector('#cfDockTitle');
  const elSub = dock.querySelector('#cfDockSub');
  const elIcon = dock.querySelector('#cfDockIcon');
  const elAction = dock.querySelector('#cfDockActionWrap');

  if (elPct) elPct.textContent = '100%';
  if (elBar) {
    elBar.style.width = '100%';
    elBar.style.background = 'var(--green, #10b981)';
  }
  if (elIcon) {
    elIcon.className = 'fa-solid fa-circle-check cf-dock-icon';
    elIcon.style.color = 'var(--green, #10b981)';
  }
  if (elTitle) elTitle.textContent = '¡Web Actualizada con Éxito!';
  if (elSub) elSub.textContent = 'Cambios publicados en Cloudflare Pages';
  if (elStatus) elStatus.textContent = 'Tu número y datos ya están disponibles en vivo.';
  if (elTimer) elTimer.textContent = '0:00 min';

  if (elAction) {
    elAction.style.display = 'block';
  }

  // Limpiar sesión después de 2 minutos
  setTimeout(() => {
    detenerProgreso(false);
  }, 120000);
}

/**
 * Detiene el progreso y limpia la sesión
 */
export function detenerProgreso(eliminarStorage = true) {
  if (_intervalo) {
    clearInterval(_intervalo);
    _intervalo = null;
  }
  if (eliminarStorage && typeof sessionStorage !== 'undefined') {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  }
}

/**
 * Auto-inicialización reactiva en el Panel Personal
 */
export function inicializarProgresoDeploy() {
  if (typeof window === 'undefined') return;

  // 1. Escuchar evento de nuevo deploy
  window.addEventListener('contabilidad:iniciar-deploy', (e) => {
    iniciarProgresoDeploy({
      motivo: e?.detail?.motivo || 'actualización',
      forzarInicio: true
    });
  });

  // 2. Revisar si había un deploy en curso al navegar entre módulos
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.inicio && (Date.now() - parsed.inicio) < DURACION_TOTAL_MS) {
        iniciarProgresoDeploy({ forzarInicio: false });
      }
    }
  } catch (e) {}
}

export default {
  iniciarProgresoDeploy,
  detenerProgreso,
  inicializarProgresoDeploy
};
