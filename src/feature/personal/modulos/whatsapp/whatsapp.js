// src/feature/personal/modulos/whatsapp/whatsapp.js
// Controlador Frontend Autónomo del Módulo WhatsApp: Centro de Mensajería & Sandbox
// 100% JS Nativo · Integrado con @widev

import { Notificacion } from '@widev';
import { PLANTILLAS_WHATSAPP, formatearPlantilla } from './dataWhatsapp.js';

export function inicializarModuloWhatsapp() {
  const panel = document.getElementById('panel-whatsapp');
  if (!panel || panel.dataset.whatsappInit === 'true') return;
  panel.dataset.whatsappInit = 'true';

  let plantillaActualId = 'tpl_vencimiento_sunat';

  // ── Elementos del DOM ──
  const templatesGrid = document.getElementById('waTemplatesGrid');
  const inpCliente = document.getElementById('waInpCliente');
  const inpCelular = document.getElementById('waInpCelular');
  const inpRuc = document.getElementById('waInpRuc');
  const inpDigito = document.getElementById('waInpDigito');
  const inpPeriodo = document.getElementById('waInpPeriodo');
  const inpMonto = document.getElementById('waInpMonto');
  const inpNps = document.getElementById('waInpNps');
  const inpFechaVencimiento = document.getElementById('waInpFechaVencimiento');
  const textareaMensaje = document.getElementById('waTextareaMensaje');

  // ── Simulador Smartphone ──
  const chatBubbleText = document.getElementById('waChatBubbleText');
  const chatTime = document.getElementById('waChatTime');
  const btnOpenWs = document.getElementById('btnWaOpenWs');
  const btnCopy = document.getElementById('btnWaCopy');

  // ════════════════════════════════════════════════════════════
  // 1. RECOGER PARÁMETROS Y FORMATEAR MENSAJE EN VIVO
  // ════════════════════════════════════════════════════════════
  function obtenerValoresParametros() {
    return {
      cliente: inpCliente?.value?.trim() || 'Inversiones Gastronómicas S.A.C.',
      ruc: inpRuc?.value?.trim() || '20554897123',
      digito: inpDigito?.value?.trim() || '3',
      periodo: inpPeriodo?.value?.trim() || 'Agosto 2026',
      fechaVencimiento: inpFechaVencimiento?.value?.trim() || '18 de Septiembre de 2026',
      regimen: 'Régimen MYPE Tributario',
      monto: inpMonto?.value?.trim() || '185.00',
      nps: inpNps?.value?.trim() || '9827364510',
      modalidad: 'Presencial (Sede Surquillo) / Virtual Meet',
      fechaHora: 'Viernes 25 Sep · 4:00 p.m.',
      honorario: '80.00',
      lugarEnlace: 'Jr. Dante 260, Surquillo (previa cita) / Link: meet.google.com/abc-defg-hij',
      comprobanteTipo: 'Factura Electrónica',
      comprobanteNumero: 'F001-000104',
      fecha: '25 Sep 2026',
      servicio: 'Servicio Contable Mensual MYPE'
    };
  }

  function actualizarPreviewMensaje(sobrescribirConPlantilla = false) {
    const tpl = PLANTILLAS_WHATSAPP.find(t => t.id === plantillaActualId);
    if (!tpl) return;

    let textoFinal = '';
    if (sobrescribirConPlantilla || !textareaMensaje?.dataset.manualEdit) {
      const vals = obtenerValoresParametros();
      textoFinal = formatearPlantilla(tpl.mensaje, vals);
      if (textareaMensaje) {
        textareaMensaje.value = textoFinal;
        delete textareaMensaje.dataset.manualEdit;
      }
    } else {
      textoFinal = textareaMensaje?.value || '';
    }

    if (chatBubbleText) {
      chatBubbleText.textContent = textoFinal;
    }

    if (chatTime) {
      const now = new Date();
      const horas = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      chatTime.textContent = `${horas}:${mins}`;
    }
  }

  // ════════════════════════════════════════════════════════════
  // 2. RENDERIZADO DEL SELECTOR DE PLANTILLAS
  // ════════════════════════════════════════════════════════════
  function renderizarPlantillas() {
    if (!templatesGrid) return;
    templatesGrid.innerHTML = PLANTILLAS_WHATSAPP.map(tpl => {
      const isActive = tpl.id === plantillaActualId;
      return `
        <div class="wa-tpl-card ${isActive ? 'active' : ''}" data-id="${tpl.id}">
          <div class="wa-tpl-head">
            <i class="${tpl.icono}"></i>
            <span>${tpl.nombre}</span>
          </div>
          <div class="wa-tpl-desc">${tpl.descripcion}</div>
        </div>
      `;
    }).join('');

    templatesGrid.querySelectorAll('.wa-tpl-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        if (id) {
          plantillaActualId = id;
          templatesGrid.querySelectorAll('.wa-tpl-card').forEach(c => c.classList.remove('active'));
          card.classList.add('active');
          actualizarPreviewMensaje(true);
        }
      });
    });
  }

  // Listeners para actualización reactiva en vivo
  [inpCliente, inpCelular, inpRuc, inpDigito, inpPeriodo, inpMonto, inpNps, inpFechaVencimiento].forEach(inp => {
    inp?.addEventListener('input', () => actualizarPreviewMensaje(false));
  });

  textareaMensaje?.addEventListener('input', () => {
    textareaMensaje.dataset.manualEdit = 'true';
    if (chatBubbleText) {
      chatBubbleText.textContent = textareaMensaje.value;
    }
  });

  // ════════════════════════════════════════════════════════════
  // 3. ACCIONES DE DISPARO DIRECTO
  // ════════════════════════════════════════════════════════════
  btnOpenWs?.addEventListener('click', () => {
    const rawCel = inpCelular?.value?.trim().replace(/\D/g, '') || '';
    const texto = textareaMensaje?.value || '';

    let url = '';
    if (rawCel.length >= 9) {
      const celPeru = rawCel.startsWith('51') ? rawCel : `51${rawCel}`;
      url = `https://wa.me/${celPeru}?text=${encodeURIComponent(texto)}`;
    } else {
      url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    }

    window.open(url, '_blank');
  });

  btnCopy?.addEventListener('click', async () => {
    const texto = textareaMensaje?.value || '';
    if (!texto) return;

    try {
      await navigator.clipboard.writeText(texto);
      Notificacion('Mensaje copiado al portapapeles.', 'success', 2000);
    } catch (e) {
      Notificacion('No se pudo copiar automáticamente.', 'warning', 2000);
    }
  });

  // Reloj de smartphone en vivo
  function updateClock() {
    const clock = document.getElementById('waPhoneClock');
    if (clock) {
      const d = new Date();
      clock.textContent = `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
    }
  }

  setInterval(updateClock, 30000);
  updateClock();

  // ════════════════════════════════════════════════════════════
  // 4. INICIALIZACIÓN
  // ════════════════════════════════════════════════════════════
  renderizarPlantillas();
  actualizarPreviewMensaje(true);
}
