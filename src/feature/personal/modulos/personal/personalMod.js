// src/feature/personal/modulos/personal/personalMod.js
// Controlador Frontend Autónomo del Módulo Personal (Equipo Profesional del Estudio)
// 100% JS Nativo · Integrado con @widev y Local-First

import { Notificacion, wiSpin, wiConfirmar } from '@widev';
import {
  obtenerPersonal,
  guardarMiembroPersonal,
  eliminarMiembroPersonal,
  sincronizarPersonalDesdeFirestore
} from './dataPersonal.js';

export function inicializarModuloPersonal() {
  const panel = document.getElementById('panel-personal');
  if (!panel || panel.dataset.personalInit === 'true') return;
  panel.dataset.personalInit = 'true';

  // ── Elementos de KPIs ──
  const kpiTotal = document.getElementById('peKpiTotal');
  const kpiColegiados = document.getElementById('peKpiColegiados');
  const kpiAsistentes = document.getElementById('peKpiAsistentes');
  const kpiTrayectoria = document.getElementById('peKpiTrayectoria');

  // ── Grid y Acciones ──
  const driversGrid = document.getElementById('peDriversGrid');
  const btnNuevoPersonal = document.getElementById('btnNuevoPersonal');

  // ── Modal ──
  const modalOverlay = document.getElementById('peModalOverlay');
  const btnModalClose = document.getElementById('btnPeModalClose');
  const formModal = document.getElementById('formPePersonal');
  const btnModalGuardar = document.getElementById('btnPeModalGuardar');

  // ════════════════════════════════════════════════════════════
  // 1. KPIS Y ESTADÍSTICAS DEL EQUIPO
  // ════════════════════════════════════════════════════════════
  function actualizarKpis() {
    const lista = obtenerPersonal();
    const colegiados = lista.filter(p => (p.cargo || '').toLowerCase().includes('colegiad') || (p.colegiatura || '').toLowerCase().includes('colegiad') || (p.cargo || '').toLowerCase().includes('cpc')).length;
    const asistentes = lista.filter(p => (p.cargo || '').toLowerCase().includes('asistente') || (p.cargo || '').toLowerCase().includes('ti')).length;

    if (kpiTotal) kpiTotal.textContent = String(lista.length);
    if (kpiColegiados) kpiColegiados.textContent = String(colegiados);
    if (kpiAsistentes) kpiAsistentes.textContent = String(asistentes);
    if (kpiTrayectoria) kpiTrayectoria.textContent = '17+ años';
  }

  // ════════════════════════════════════════════════════════════
  // 2. RENDERIZADO DEL GRID DE ESPECIALISTAS
  // ════════════════════════════════════════════════════════════
  function renderizarGrid() {
    if (!driversGrid) return;
    const lista = obtenerPersonal();

    if (lista.length === 0) {
      driversGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--tx2);">
          No hay especialistas registrados en el equipo.
        </div>
      `;
      return;
    }

    driversGrid.innerHTML = lista.map(p => {
      const nombre = p.nombreCompleto || `${p.nombre} ${p.apellidos || ''}`.trim();
      const avatar = p.avatar || '/imgwii/hero.webp';
      const cargo = p.cargo || 'Especialista Contable';
      const especialidad = p.especialidad || 'Asesoría Tributaria General';
      const colegiatura = p.colegiatura || 'Habilitado/a';
      const experiencia = p.experiencia || '5+ años';
      const modalidad = p.modalidad || 'Online & Presencial Surquillo';

      return `
        <div class="pe-driver-card" data-id="${p.id}">
          <div class="pe-driver-head">
            <img src="${avatar}" alt="${nombre}" class="pe-driver-avatar" />
            <div class="pe-driver-meta">
              <span class="pe-driver-name">${nombre}</span>
              <span class="pe-driver-cargo">${cargo}</span>
              <span class="pe-status-pill disponible">
                <i class="fa-solid fa-certificate" style="font-size: 9px;"></i>
                ${colegiatura}
              </span>
            </div>
          </div>

          <div class="pe-driver-details">
            <div class="pe-detail-row">
              <span class="pe-detail-lbl">Especialidad:</span>
              <span><strong>${especialidad}</strong></span>
            </div>
            <div class="pe-detail-row">
              <span class="pe-detail-lbl">Trayectoria:</span>
              <span>${experiencia}</span>
            </div>
            <div class="pe-detail-row">
              <span class="pe-detail-lbl">Modalidad:</span>
              <span>${modalidad}</span>
            </div>
            <div class="pe-detail-row">
              <span class="pe-detail-lbl">Contacto:</span>
              <span style="color: var(--brand-primary, var(--mco, #9e7b4f)); font-weight: 600;">${p.celular}</span>
            </div>
          </div>

          <div class="pe-driver-actions">
            <button type="button" class="pe-btn-driver ws pe-btn-ws" data-cel="${p.celular}" data-nombre="${nombre}">
              <i class="fa-brands fa-whatsapp"></i> Contactar
            </button>
            <a href="mailto:${p.email}" class="pe-btn-driver toggle" style="text-decoration:none; text-align:center;">
              <i class="fa-solid fa-envelope"></i> Correo
            </a>
            <button type="button" class="cl-action-btn pe-btn-del" data-id="${p.id}" title="Eliminar especialista">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Listeners
    driversGrid.querySelectorAll('.pe-btn-ws').forEach(btn => {
      btn.addEventListener('click', () => {
        const cel = btn.getAttribute('data-cel')?.replace(/\D/g, '') || '';
        const nom = btn.getAttribute('data-nombre') || 'Especialista';
        const url = `https://wa.me/51${cel}?text=${encodeURIComponent(`Hola ${nom}, te saludo desde el portal del Estudio Contable CPC Lourdes Cusihuaman Gálvez.`)}`;
        window.open(url, '_blank');
      });
    });

    driversGrid.querySelectorAll('.pe-btn-del').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const p = obtenerPersonal().find(x => x.id === id);
        if (!p) return;

        const conf = await wiConfirmar(`¿Deseas retirar a ${p.nombreCompleto || p.nombre} del equipo del estudio?`, {
          titulo: 'Eliminar Especialista',
          tipo: 'danger',
          siTexto: 'Sí, Retirar'
        });

        if (conf) {
          await eliminarMiembroPersonal(id);
          actualizarKpis();
          renderizarGrid();
          Notificacion('Especialista retirado del equipo.', 'info', 2000);
        }
      });
    });
  }

  // ════════════════════════════════════════════════════════════
  // 3. MODAL REGISTRO DE PERSONAL
  // ════════════════════════════════════════════════════════════
  btnNuevoPersonal?.addEventListener('click', () => {
    modalOverlay?.classList.add('active');
  });

  btnModalClose?.addEventListener('click', () => {
    modalOverlay?.classList.remove('active');
  });

  modalOverlay?.addEventListener('click', (e) => {
    if (e.target === modalOverlay) modalOverlay.classList.remove('active');
  });

  formModal?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = document.getElementById('peModalNombre')?.value?.trim();
    const cargo = document.getElementById('peModalCargo')?.value?.trim() || 'Especialista Contable';
    const colegiatura = document.getElementById('peModalColegiatura')?.value?.trim() || 'Habilitado/a';
    const especialidad = document.getElementById('peModalEspecialidad')?.value?.trim() || 'Asesoría Tributaria';
    const cel = document.getElementById('peModalCelular')?.value?.trim() || '+51 987 594 558';
    const email = document.getElementById('peModalEmail')?.value?.trim() || 'contacto@contabilidadwii.com';
    const modalidad = document.getElementById('peModalModalidad')?.value || 'Online & Presencial Surquillo';
    const experiencia = document.getElementById('peModalExperiencia')?.value?.trim() || '5+ años de trayectoria';

    if (!nombre) {
      Notificacion('Indica el nombre del especialista.', 'warning', 2500);
      return;
    }

    const spin = wiSpin ? wiSpin(btnModalGuardar) : null;
    if (btnModalGuardar) btnModalGuardar.disabled = true;

    try {
      await guardarMiembroPersonal({
        nombre,
        nombreCompleto: nombre,
        cargo,
        colegiatura,
        especialidad,
        celular: cel,
        email,
        modalidad,
        experiencia,
        avatar: '/imgwii/hero.webp',
        rol: 'personal',
        activo: true
      });

      modalOverlay?.classList.remove('active');
      formModal.reset();
      actualizarKpis();
      renderizarGrid();
      Notificacion(`¡${nombre} añadido al equipo del estudio!`, 'success', 3000);
    } catch (err) {
      console.error(err);
      Notificacion('Error al guardar especialista: ' + (err?.message || err), 'danger', 3000);
    } finally {
      if (spin) spin.stop();
      if (btnModalGuardar) btnModalGuardar.disabled = false;
    }
  });

  // ════════════════════════════════════════════════════════════
  // 4. INICIALIZACIÓN
  // ════════════════════════════════════════════════════════════
  actualizarKpis();
  renderizarGrid();

  sincronizarPersonalDesdeFirestore().then(() => {
    actualizarKpis();
    renderizarGrid();
  });
}
