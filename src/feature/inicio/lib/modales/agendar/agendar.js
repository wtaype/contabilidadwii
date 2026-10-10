// src/feature/inicio/lib/modales/agendar/agendar.js
// 🎯 Hijo 1: Modal Interactivo de Agendamiento por WhatsApp - Consultorio Psicológico América
// Con wiSelect, selector interactivo de horas con slots, validación wiTip y soporte i18n federado.

import { datosNegocio } from '../../../../../negocio.js';
import { wiSelect } from '../../../../../core/widev/wiselect.js';
import { wiTip } from '../../../../../core/widev/witip.js';
import { resolverTextos } from '../idioma/idioma.js';
import agendarCss from './agendar.css?inline';
import es from './idioma/es.json';
import en from './idioma/en.json';

let modalEl = null;
let wiSelectMotivoInst = null;
let wiSelectModalidadInst = null;

function obtenerTextos() {
  return resolverTextos({ es, en });
}

function obtenerUsuarioActivo() {
  try {
    const raw = localStorage.getItem('wiSmile');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

function formatearFechaEspanol(fechaStr) {
  if (!fechaStr) return 'Por coordinar';
  try {
    const [year, month, day] = fechaStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${dias[date.getDay()]} ${day} de ${meses[month - 1]} de ${year}`;
  } catch (e) {
    return fechaStr;
  }
}

function obtenerFechaPorDefecto() {
  const hoy = new Date();
  hoy.setDate(hoy.getDate() + 1);
  const yyyy = hoy.getFullYear();
  const mm = String(hoy.getMonth() + 1).padStart(2, '0');
  const dd = String(hoy.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function obtenerFechaMinima() {
  const hoy = new Date();
  const yyyy = hoy.getFullYear();
  const mm = String(hoy.getMonth() + 1).padStart(2, '0');
  const dd = String(hoy.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function asegurarEstilosEnDOM() {
  if (document.getElementById('wi_modal_agendar_styles')) return;
  const style = document.createElement('style');
  style.id = 'wi_modal_agendar_styles';
  style.innerHTML = agendarCss;
  document.head.appendChild(style);
}

function asegurarModalEnDOM() {
  asegurarEstilosEnDOM();

  if (document.getElementById('wi_modal_agendar')) {
    return document.getElementById('wi_modal_agendar');
  }

  const t = obtenerTextos();
  const user = obtenerUsuarioActivo() || {};
  const fechaDefault = obtenerFechaPorDefecto();
  const fechaMin = obtenerFechaMinima();

  const html = `
    <div id="wi_modal_agendar" class="wiModal" role="dialog" aria-modal="true" aria-labelledby="modalAgendarTitle" style="display: none;">
      <div class="modal-agendar-dialog">
        
        <!-- Header -->
        <div class="modal-agendar-header">
          <div>
            <span class="modal-agendar-badge">
              <i class="fa-brands fa-whatsapp"></i> ${t.badge}
            </span>
            <h3 id="modalAgendarTitle" class="modal-agendar-title">
              ${t.titulo}
            </h3>
            <p class="modal-agendar-subtitle">
              ${t.subtitulo}
            </p>
          </div>
          <button id="btnCerrarModalAgendar" class="modal-agendar-close" type="button" aria-label="${t.cerrar}">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form id="formModalAgendar" onsubmit="event.preventDefault(); window.__enviarAgendamientoModal();">
          
          <!-- Contenido Limpio de 3 Campos -->
          <div class="modal-agendar-fields">
            
            <!-- 1. Tu Nombre -->
            <div class="modal-agendar-field">
              <label for="agendarInputNombre" class="modal-agendar-label">
                <i class="fa-regular fa-user"></i> ${t.lblNombre}
              </label>
              <input 
                type="text" 
                id="agendarInputNombre" 
                class="modal-agendar-input"
                placeholder="${t.placeholderNombre}" 
                value="${user.nombre || user.usuario || ''}"
                autocomplete="name"
              />
            </div>

            <!-- 2. Tema / Consulta (con wiSelect) -->
            <div class="modal-agendar-field">
              <label for="agendarSelectMotivo" class="modal-agendar-label">
                <i class="fa-solid fa-file-invoice"></i> ${t.lblTema}
              </label>
              <select id="agendarSelectMotivo" class="modal-agendar-input">
                ${t.temas.map(s => {
                  return `<option value="${s.id}" data-nombre="${s.nombre}">${s.nombre}</option>`;
                }).join('')}
              </select>
            </div>

            <!-- 3. Breve Descripción o Caso (Opcional) -->
            <div class="modal-agendar-field">
              <label for="agendarInputDescripcion" class="modal-agendar-label">
                <i class="fa-solid fa-pen-to-square"></i> ${t.lblDescripcion}
              </label>
              <textarea 
                id="agendarInputDescripcion" 
                class="modal-agendar-input modal-agendar-textarea"
                placeholder="${t.placeholderDescripcion}"
                rows="3"
              ></textarea>
            </div>

          </div>

          <!-- Footer: Confidencialidad y Botón de Envío -->
          <div class="modal-agendar-footer">
            <div class="modal-agendar-summary">
              <div class="modal-agendar-info-text">
                <i class="fa-solid fa-shield-halved"></i>
                <span>${t.infoDirecta}</span>
              </div>
              <span class="modal-agendar-badge-confidencial">
                <i class="fa-solid fa-circle-check"></i> ${t.confidencial}
              </span>
            </div>

            <button type="submit" id="agendarBtnSubmitWa" class="modal-agendar-submit">
              <i class="fa-brands fa-whatsapp" style="font-size: 1.35rem;"></i> 
              <span>${t.btnSubmit}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', html);
  modalEl = document.getElementById('wi_modal_agendar');

  // Inicializar wiSelect en el selector de consultas
  try {
    wiSelectMotivoInst = wiSelect('#agendarSelectMotivo', {
      placeholder: t.placeholderTema,
      searchPlaceholder: t.buscarTema
    });
  } catch (err) {
    console.warn('wiSelect notice:', err);
  }

  // Listeners de Cierre
  document.getElementById('btnCerrarModalAgendar')?.addEventListener('click', cerrarModalAgendar);
  modalEl?.addEventListener('click', (e) => {
    if (e.target === modalEl) cerrarModalAgendar();
  });

  const selMotivo = document.getElementById('agendarSelectMotivo');

  // Envío ágil a WhatsApp con mensaje directo y natural
  window.__enviarAgendamientoModal = function() {
    const inputNombre = document.getElementById('agendarInputNombre');
    const inputDescripcion = document.getElementById('agendarInputDescripcion');

    const nombre = inputNombre?.value?.trim();
    if (!nombre) {
      wiTip(inputNombre, t.valNombre, 'error', 2800);
      inputNombre?.focus();
      return;
    }

    const valMotivo = selMotivo?.value;
    const serv = t.temas.find(s => s.id === valMotivo) || t.temas[0];
    const nomServicio = serv ? serv.nombre : 'Asesoría y Declaraciones ante SUNAT';

    const descripcion = inputDescripcion?.value?.trim() || '';

    // Saludo inteligente según la hora del día en Perú
    const horaActual = new Date().getHours();
    let saludo = 'Buenos días';
    if (horaActual >= 12 && horaActual < 19) {
      saludo = 'Buenas tardes';
    } else if (horaActual >= 19 || horaActual < 6) {
      saludo = 'Buenas noches';
    }

    // Mensaje natural y amigable solicitado por el usuario
    let mensaje = `${saludo} Lourdes, vengo de su página web.\n\n` +
      `Mi nombre es *${nombre}* y mi consulta es por: *${nomServicio}*.\n`;

    if (descripcion) {
      mensaje += `\n${descripcion}\n\n`;
    } else {
      mensaje += `\nActualmente me gustaría consultar detalles y cotización para saber más por favor.\n\n`;
    }

    mensaje += `Quedo atento a su respuesta, ¡muchas gracias!`;

    const numWhatsapp = datosNegocio.whatsappLimpio || '51987594558';
    const url = `https://wa.me/${numWhatsapp}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    cerrarModalAgendar();
  };

  return modalEl;
}

/**
 * Abre el modal interactivo de agendamiento
 * @param {string|null} motivoOId - ID de servicio o motivo del hero
 */
export function abrirModalAgendar(motivoOId = null) {
  const modal = asegurarModalEnDOM();
  if (!modal) return;

  const motivoGuardado = motivoOId || (typeof localStorage !== 'undefined' ? localStorage.getItem('contabilidad_motivo_activo') : '');
  const selMotivo = document.getElementById('agendarSelectMotivo');

  if (selMotivo && motivoGuardado) {
    const term = motivoGuardado.toLowerCase();
    let targetId = null;

    if (term.includes('cuarta') || term.includes('honorario')) {
      targetId = 'asesoria-recibos-honorarios';
    } else if (term.includes('quinta') || term.includes('sueldo') || term.includes('planilla')) {
      targetId = 'planillas-quinta-categoria';
    } else if (term.includes('buzon') || term.includes('carta') || term.includes('notificac')) {
      targetId = 'asesoria-cartas-sunat';
    } else if (term.includes('mype') || term.includes('empresa') || term.includes('mensual')) {
      targetId = 'contabilidad-mensual-mype';
    } else if (term.includes('saldo') || term.includes('devoluc')) {
      targetId = 'asesoria-devolucion-saldo';
    } else if (term.includes('atrasad') || term.includes('regulariz')) {
      targetId = 'regularizacion-atrasada';
    } else {
      targetId = motivoGuardado;
    }

    if (targetId) {
      if (wiSelectMotivoInst && typeof wiSelectMotivoInst.setValue === 'function') {
        wiSelectMotivoInst.setValue(targetId);
      } else {
        selMotivo.value = targetId;
        selMotivo.dispatchEvent(new Event('change'));
      }
    }
  }

  modal.style.display = 'flex';
  modal.classList.add('active', 'open');
  document.body.classList.add('modal-open');
}

/**
 * Cierra el modal de agendamiento y restablece el scroll
 */
export function cerrarModalAgendar() {
  const modal = document.getElementById('wi_modal_agendar');
  if (modal) {
    modal.style.display = 'none';
    modal.classList.remove('active', 'open');
  }
  document.body.classList.remove('modal-open');
}

/**
 * Pre-llena datos provenientes del Test Empático y abre el modal
 * @param {Object} datos
 */
export function prellenarYAgendar(datos = {}) {
  abrirModalAgendar(datos.motivoId || null);
  if (datos.nombre) {
    const inputNombre = document.getElementById('agendarInputNombre');
    if (inputNombre) inputNombre.value = datos.nombre;
  }
}

// Registro global
if (typeof window !== 'undefined') {
  window.abrirModalAgendar = abrirModalAgendar;
  window.cerrarModalAgendar = cerrarModalAgendar;
  window.abrirModalPedido = abrirModalAgendar;
  window.cerrarModalPedido = cerrarModalAgendar;
}

export default {
  abrirModalAgendar,
  cerrarModalAgendar,
  prellenarYAgendar
};
