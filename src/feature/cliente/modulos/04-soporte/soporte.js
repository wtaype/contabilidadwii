// src/feature/cliente/modulos/04-soporte/soporte.js
// Controlador Humano y Smart del Módulo 04: Consultas Tributarias · Estudio Cusihuaman
// wiSelect, autocompletado en 0ms desde wiSmile, WhatsApp tributario, wiSpin y Notificacion

import { wiSelect, wiSpin, Notificacion, getls } from '@widev';
import {
  obtenerTicketsLocal,
  crearTicket,
  sincronizarTicketsDesdeFirestore
} from './dataSoporte.js';

let inicializado = false;
let instSelectTipo = null;
let instSelectTipoComp = null;
let instSelectTipoNegocio = null;
let instSelectRegimen = null;

/**
 * Actualiza el enlace directo de WhatsApp con mensajes humanos y cálidos con atribución tributaria
 */
function actualizarEnlaceWhatsApp(tipo) {
  const btnWa = document.getElementById('spBtnWhatsApp');
  if (!btnWa) return;

  const neg = getls('minegocio') || {};
  const numWa = neg.contacto?.whatsappLimpio || neg.contacto?.whatsapp || '51987594558';
  const nombreNegocio = neg.identidad?.nombre || 'Estudio Contable CPC Lourdes Cusihuaman';

  const user = getls('wiSmile') || (typeof window !== 'undefined' ? (window.__CONTABILIDAD_USER__ || window.__GASWII_USER__) : null);
  const clienteNombre = user?.nombre ? ` de ${user.nombre}` : '';
  const rucInfo = user?.documento ? `\n📌 RUC: ${user.documento}` : '';

  let motivo = 'Tengo una consulta contable y tributaria general.';
  let tipoLabel = 'Consulta General';

  if (tipo === 'declaracion') {
    motivo = 'Requiero asistencia con mi Declaración Mensual (IGV-Renta / Formulario 621 / SIRE).';
    tipoLabel = 'Declaración Mensual';
  } else if (tipo === 'esquela') {
    motivo = 'URGENTE: He recibido una Esquela de Notificación / Inconsistencia de SUNAT y necesito asesoría.';
    tipoLabel = 'Esquela SUNAT (Urgente)';
  } else if (tipo === 'honorarios') {
    motivo = 'Deseo consultar sobre emisión de Recibos por Honorarios y Suspensión de 4ta Categoría (Form. 1609).';
    tipoLabel = '4ta Categoría / Honorarios';
  } else if (tipo === 'comprobante') {
    motivo = 'Necesito coordinar la emisión o copia de comprobante de pago por servicios contables.';
    tipoLabel = 'Comprobante de Pago';
  } else if (tipo === 'cotizacion') {
    motivo = 'Deseo solicitar una propuesta formal para la contabilidad mensual de mi negocio / empresa.';
    tipoLabel = 'Presupuesto Contable';
  }

  const mensaje = `¡Hola ${nombreNegocio}! 👋
He visto en su portal web y solicito atención de la CPC Lourdes Cusihuaman:

🏷️ Origen: [Portal Cliente - Consultas / ${tipoLabel}]${clienteNombre ? `\n👤 Contribuyente:${clienteNombre}` : ''}${rucInfo}
💬 Asunto: ${motivo}

¿Podrían orientarme por favor? ¡Muchas gracias!`;

  btnWa.href = `https://wa.me/${numWa}?text=${encodeURIComponent(mensaje)}`;
}

/**
 * Conmuta los campos contextuales de forma humana y fluida
 */
function alternarCamposContextuales(tipo) {
  const boxComp = document.getElementById('spCamposComprobante');
  const boxCotiz = document.getElementById('spCamposCotizacion');
  const txtDetalle = document.getElementById('spTextareaDetalle');

  if (boxComp) boxComp.style.display = tipo === 'comprobante' ? 'grid' : 'none';
  if (boxCotiz) boxCotiz.style.display = tipo === 'cotizacion' ? 'grid' : 'none';

  if (tipo === 'comprobante') {
    actualizarCamposComprobante();
    if (txtDetalle) txtDetalle.placeholder = 'Indícanos el mes o periodo del servicio contable y el correo donde remitir el comprobante...';
  } else if (tipo === 'declaracion') {
    if (txtDetalle) txtDetalle.placeholder = 'Indícanos el periodo tributario (ej: Periodo Octubre 2026), ventas aproximadas o si tienes compras por registrar en SIRE...';
  } else if (tipo === 'esquela') {
    if (txtDetalle) txtDetalle.placeholder = 'Indícanos el número de esquela, fecha de notificación en tu Buzón SOL y el plazo otorgado por SUNAT para responder...';
  } else if (tipo === 'honorarios') {
    if (txtDetalle) txtDetalle.placeholder = 'Cuéntanos si superas el tope mensual (S/ 3,755) para tramitar tu Formulario Virtual 1609 de suspensión...';
  } else if (tipo === 'cotizacion') {
    if (txtDetalle) txtDetalle.placeholder = 'Cuéntanos sobre tu empresa, régimen tributario estimado, volumen promedio de comprobantes y si tienes trabajadores en planilla...';
  } else {
    if (txtDetalle) txtDetalle.placeholder = 'Describe tu caso contable o tributario con total confianza...';
  }
}

/**
 * Autocompletado inteligente para comprobantes desde wiSmile
 */
function actualizarCamposComprobante() {
  const tipoComp = instSelectTipoComp ? instSelectTipoComp.getValue() : (document.getElementById('spSelectTipoComp')?.value || 'factura');
  const boxRazon = document.getElementById('spGrupoRazonSocial');
  const inpDoc = document.getElementById('spInputDocComp');
  const inpRazon = document.getElementById('spInputRazonComp');
  const user = getls('wiSmile') || (typeof window !== 'undefined' ? (window.__CONTABILIDAD_USER__ || window.__GASWII_USER__) : null);

  if (tipoComp === 'factura') {
    if (boxRazon) boxRazon.style.display = 'flex';
    if (inpDoc && !inpDoc.value && user?.documento) {
      inpDoc.value = user.documento;
    }
    if (inpRazon && !inpRazon.value && user?.razonSocial) {
      inpRazon.value = user.razonSocial;
    }
  } else {
    if (boxRazon) boxRazon.style.display = 'none';
    if (inpDoc && !inpDoc.value && user?.documento) {
      inpDoc.value = user.documento;
    }
  }
}

/**
 * Inicializa los selectores con el componente wiSelect de @widev
 */
function inicializarWiSelects() {
  // 1. Selector Principal: Motivo de consulta
  const elTipo = document.getElementById('spSelectTipo');
  if (elTipo && !elTipo.dataset.wiselect) {
    instSelectTipo = wiSelect(elTipo, {
      placeholder: 'Selecciona motivo de consulta...',
      searchPlaceholder: 'Buscar tema...',
      onChange: (val) => {
        alternarCamposContextuales(val);
        actualizarEnlaceWhatsApp(val);
      }
    });
  }

  // 2. Selector de Tipo de Comprobante
  const elTipoComp = document.getElementById('spSelectTipoComp');
  if (elTipoComp && !elTipoComp.dataset.wiselect) {
    instSelectTipoComp = wiSelect(elTipoComp, {
      placeholder: 'Tipo de comprobante...',
      searchPlaceholder: 'Buscar comprobante...',
      onChange: () => {
        actualizarCamposComprobante();
      }
    });
  }

  // 3. Selector de Rubro de Negocio para Cotizaciones
  const elNegocio = document.getElementById('spSelectTipoNegocio');
  if (elNegocio && !elNegocio.dataset.wiselect) {
    instSelectTipoNegocio = wiSelect(elNegocio, {
      placeholder: 'Rubro comercial...',
      searchPlaceholder: 'Buscar rubro...'
    });
  }

  // 4. Selector de Régimen Estimado para Cotizaciones
  const elRegimen = document.getElementById('spSelectBalonCotiz');
  if (elRegimen && !elRegimen.dataset.wiselect) {
    instSelectRegimen = wiSelect(elRegimen, {
      placeholder: 'Régimen tributario...',
      searchPlaceholder: 'Buscar régimen...'
    });
  }
}

/**
 * Renderiza la lista reactiva de solicitudes recientes desde wiSoporte
 */
export function renderizarTicketsUI() {
  const listaContenedor = document.getElementById('listaTicketsRecientes');
  const badgeCount = document.getElementById('spBadgeTicketsCount');
  if (!listaContenedor) return;

  const tickets = obtenerTicketsLocal();
  if (badgeCount) badgeCount.textContent = String(tickets.length);

  if (tickets.length === 0) {
    listaContenedor.innerHTML = `
      <div class="sp-empty-tickets" id="spEmptyTickets">
        <i class="fa-solid fa-folder-open"></i>
        <span>Aún no has enviado consultas. Cuando nos envíes un requerimiento o trámite, aparecerá aquí con su estado de atención.</span>
      </div>
    `;
    return;
  }

  const html = tickets.map(t => {
    const estadoClass = t.estado || 'pendiente';
    const estadoLabel = estadoClass === 'atendido' ? 'Atendido' : (estadoClass === 'en_proceso' ? 'En Proceso' : 'Pendiente');
    
    let tipoAmigable = 'CONSULTA TRIBUTARIA';
    if (t.tipo === 'declaracion') tipoAmigable = 'DECLARACIÓN MENSUAL';
    else if (t.tipo === 'esquela') tipoAmigable = 'ESQUELA SUNAT';
    else if (t.tipo === 'honorarios') tipoAmigable = '4TA CATEGORÍA / RECIBO';
    else if (t.tipo === 'comprobante') tipoAmigable = 'COMPROBANTE';
    else if (t.tipo === 'cotizacion') tipoAmigable = 'PRESUPUESTO MYPE';

    return `
      <div class="sp-ticket-item" data-ticket-id="${t.id}">
        <div class="sp-ticket-top">
          <span class="sp-ticket-id">
            <i class="fa-solid fa-file-invoice" style="color:var(--brand-primary, #9e7b4f); font-size:0.85rem; margin-right:4px;"></i>
            ${t.ticketId || t.id}
          </span>
          <span class="sp-ticket-badge ${estadoClass}">${estadoLabel}</span>
        </div>
        <div class="sp-ticket-detalle">
          <strong>[${tipoAmigable}]</strong> ${t.detalle || t.asunto}
        </div>
        <div class="sp-ticket-meta">
          <span><i class="fa-regular fa-clock" style="margin-right:4px;"></i>${t.fechaTexto || 'Reciente'}</span>
          <span>Estudio Cusihuaman</span>
        </div>
      </div>
    `;
  }).join('');

  listaContenedor.innerHTML = html;
}

/**
 * Configura los eventos del formulario
 */
function configurarFormularioSoporte() {
  const form = document.getElementById('formSoporteTicket');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btnEnviarTicket');
    wiSpin(btn, true, 'Enviando consulta...');

    try {
      const tipo = instSelectTipo ? instSelectTipo.getValue() : (document.getElementById('spSelectTipo')?.value || 'declaracion');
      const detalle = document.getElementById('spTextareaDetalle')?.value || '';

      if (!detalle.trim()) {
        Notificacion('Por favor cuéntanos el detalle de tu consulta.', 'warning');
        wiSpin(btn, false);
        return;
      }

      let datosFiscales = null;
      if (tipo === 'comprobante') {
        const tipoComp = instSelectTipoComp ? instSelectTipoComp.getValue() : (document.getElementById('spSelectTipoComp')?.value || 'factura');
        const doc = document.getElementById('spInputDocComp')?.value || '';
        const razon = document.getElementById('spInputRazonComp')?.value || '';
        datosFiscales = { tipoComp, documento: doc, razonSocial: razon };
      }

      const nuevo = await crearTicket({
        tipo,
        detalle,
        datosFiscales,
        asunto: `Consulta Contable: ${tipo.toUpperCase()}`
      });

      // Actualizar interfaz instantáneamente (0ms)
      renderizarTicketsUI();
      form.reset();

      // Restablecer formulario a estado inicial
      if (instSelectTipo) instSelectTipo.setValue('declaracion');
      if (instSelectTipoComp) instSelectTipoComp.setValue('factura');
      alternarCamposContextuales('declaracion');

      Notificacion(`¡Consulta #${nuevo.ticketId} registrada con éxito! La CPC Lourdes Cusihuaman la revisará a la brevedad.`, 'success', 5000);
    } catch (err) {
      console.error('[Soporte] Error al enviar consulta:', err);
      Notificacion(err.message || 'Error al enviar la consulta.', 'error');
    } finally {
      wiSpin(btn, false);
    }
  });

  // Escuchar sincronización de tickets
  document.addEventListener('ticketsActualizados', () => {
    renderizarTicketsUI();
  });
}

/**
 * Inicializador principal del Módulo 04: Soporte y Consultas SUNAT
 */
export function inicializarSoporte() {
  const contenedor = document.getElementById('moduloSoporte');
  if (!contenedor) return;

  // 1. Inicializar selects premium
  inicializarWiSelects();

  // 2. Establecer campos iniciales y autocompletar
  alternarCamposContextuales('declaracion');
  actualizarEnlaceWhatsApp('declaracion');

  // 3. Cargar tickets desde smart cache wiSoporte (0ms)
  renderizarTicketsUI();

  // 4. Configurar listener de envío
  if (!inicializado) {
    configurarFormularioSoporte();
    inicializado = true;
  }

  // 5. Sincronización remota pasiva
  sincronizarTicketsDesdeFirestore();
}
