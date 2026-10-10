// src/feature/personal/modulos/entradas/entradas.js
// Controlador Frontend Autónomo del Módulo Entradas (Blog Tributario Estudio Cusihuaman)
// 100% JS Nativo · Integrado con @widev y Local-First

import { Notificacion, wiSpin, wiConfirmar } from '@widev';
import {
  obtenerEntradas,
  guardarEntrada,
  eliminarEntrada,
  sincronizarEntradasDesdeFirestore
} from './dataEntradas.js';

export function inicializarModuloEntradas() {
  const panel = document.getElementById('panel-entradas');
  if (!panel || panel.dataset.entradasInit === 'true') return;
  panel.dataset.entradasInit = 'true';

  let filtroActual = 'todos';
  let entradaSeleccionadaId = null;

  // ── Elementos de KPIs ──
  const kpiTotal = document.getElementById('enKpiTotal');
  const kpiPublicados = document.getElementById('enKpiPublicados');
  const kpiBorradores = document.getElementById('enKpiBorradores');

  // ── Elementos de Tabla y Filtros ──
  const tableBody = document.getElementById('enTableBody');
  const filtersWrap = document.getElementById('enFiltersWrap');
  const btnNuevaEntrada = document.getElementById('btnNuevaEntrada');

  // ── Elementos del Editor Dual ──
  const inId = document.getElementById('enInpId');
  const inTitulo = document.getElementById('enInpTitulo');
  const inSlug = document.getElementById('enInpSlug');
  const selectEstado = document.getElementById('enSelectEstado');
  const selectCategoria = document.getElementById('enSelectCategoria');
  const inPortada = document.getElementById('enInpPortada');
  const inContenido = document.getElementById('enInpContenido');
  const livePreview = document.getElementById('enLivePreview');
  const btnTabEditor = document.getElementById('enTabEditor');
  const btnTabPreview = document.getElementById('enTabPreview');
  const paneEditor = document.getElementById('enPaneEditor');
  const panePreview = document.getElementById('enPanePreview');
  const btnGuardar = document.getElementById('btnGuardarEntrada');

  // ════════════════════════════════════════════════════════════
  // 1. KPIS Y FILTRADO
  // ════════════════════════════════════════════════════════════
  function actualizarKpis() {
    const lista = obtenerEntradas();
    const pub = lista.filter(e => e.estado === 'publicado').length;
    const bor = lista.filter(e => e.estado === 'borrador').length;

    if (kpiTotal) kpiTotal.textContent = String(lista.length);
    if (kpiPublicados) kpiPublicados.textContent = String(pub);
    if (kpiBorradores) kpiBorradores.textContent = String(bor);
  }

  function renderMarkdown(md = '') {
    return md
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/`([^`]+)`/gim, '<code>$1</code>')
      .replace(/\n$/gim, '<br />')
      .replace(/\n/gim, '<br />');
  }

  function actualizarLivePreview() {
    if (!livePreview) return;
    const titulo = inTitulo?.value || 'Título del Artículo';
    const contenido = inContenido?.value || 'Escribe contenido en Markdown...';
    livePreview.innerHTML = `
      <h1>${titulo}</h1>
      <hr style="border:0; border-top: 1px dashed var(--line); margin: 12px 0 16px;">
      <div>${renderMarkdown(contenido)}</div>
    `;
  }

  inTitulo?.addEventListener('input', () => {
    if (inSlug && (!inId?.value || inId.value.startsWith('art_temp'))) {
      inSlug.value = inTitulo.value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
    actualizarLivePreview();
  });

  inContenido?.addEventListener('input', actualizarLivePreview);

  // ════════════════════════════════════════════════════════════
  // 2. CONMUTADOR DE TABS (EDITOR | LIVE PREVIEW)
  // ════════════════════════════════════════════════════════════
  btnTabEditor?.addEventListener('click', () => {
    btnTabEditor.classList.add('active');
    btnTabPreview?.classList.remove('active');
    paneEditor?.classList.add('active');
    panePreview?.classList.remove('active');
  });

  btnTabPreview?.addEventListener('click', () => {
    btnTabPreview.classList.add('active');
    btnTabEditor?.classList.remove('active');
    panePreview?.classList.add('active');
    paneEditor?.classList.remove('active');
    actualizarLivePreview();
  });

  // ════════════════════════════════════════════════════════════
  // 3. RENDERIZADO DE TABLA DE ENTRADAS
  // ════════════════════════════════════════════════════════════
  function renderizarTabla() {
    if (!tableBody) return;
    const todas = obtenerEntradas();
    const filtradas = filtroActual === 'todos'
      ? todas
      : todas.filter(e => e.estado === filtroActual);

    if (filtradas.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="4" class="sn-empty-history-cell" style="text-align:center; padding:32px 16px; color:var(--muted);">
            <i class="fa-solid fa-newspaper" style="font-size:24px; margin-bottom:8px; display:block;"></i>
            No se encontraron entradas tributarias en esta categoría.
          </td>
        </tr>
      `;
      return;
    }

    if (!entradaSeleccionadaId || !filtradas.some(e => e.id === entradaSeleccionadaId)) {
      entradaSeleccionadaId = filtradas[0].id;
    }

    tableBody.innerHTML = filtradas.map(e => {
      const isSelected = e.id === entradaSeleccionadaId;
      const estadoClase = e.estado || 'publicado';

      return `
        <tr class="en-row ${isSelected ? 'selected' : ''}" data-id="${e.id}">
          <td>
            <div class="en-post-cell">
              <img src="${e.portada || '/imgwii/hero.webp'}" alt="${e.titulo}" class="en-post-thumb" />
              <div class="en-post-info">
                <span class="en-post-title">${e.titulo}</span>
                <span class="en-post-slug">/${e.slug}</span>
              </div>
            </div>
          </td>
          <td style="font-size: 11.5px; color: var(--tx2);">${e.categoria || 'General'}</td>
          <td>
            <span class="en-status-badge ${estadoClase}">${estadoClase}</span>
          </td>
          <td class="sn-text-right">
            <button type="button" class="cl-action-btn en-btn-del" data-id="${e.id}" title="Eliminar artículo">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    const seleccionada = filtradas.find(e => e.id === entradaSeleccionadaId);
    if (seleccionada) cargarEnEditor(seleccionada);

    // Listeners
    tableBody.querySelectorAll('.en-row').forEach(row => {
      row.addEventListener('click', (ev) => {
        if (ev.target.closest('.en-btn-del')) return;
        const id = row.getAttribute('data-id');
        entradaSeleccionadaId = id;
        tableBody.querySelectorAll('.en-row').forEach(r => r.classList.remove('selected'));
        row.classList.add('selected');
        const entrada = todas.find(x => x.id === id);
        if (entrada) cargarEnEditor(entrada);
      });
    });

    tableBody.querySelectorAll('.en-btn-del').forEach(btn => {
      btn.addEventListener('click', async (ev) => {
        ev.stopPropagation();
        const id = btn.getAttribute('data-id');
        const entrada = todas.find(x => x.id === id);
        if (!entrada) return;

        const conf = await wiConfirmar(`¿Deseas eliminar el artículo "${entrada.titulo}"?`, {
          titulo: 'Eliminar Entrada',
          tipo: 'danger',
          siTexto: 'Sí, Eliminar'
        });

        if (conf) {
          await eliminarEntrada(id);
          actualizarKpis();
          renderizarTabla();
          Notificacion('Artículo eliminado.', 'info', 2000);
        }
      });
    });
  }

  function cargarEnEditor(e) {
    if (!e) return;
    if (inId) inId.value = e.id;
    if (inTitulo) inTitulo.value = e.titulo;
    if (inSlug) inSlug.value = e.slug;
    if (selectEstado) selectEstado.value = e.estado || 'publicado';
    if (selectCategoria) selectCategoria.value = e.categoria || 'Rentas Personales (4ta y 5ta)';
    if (inPortada) inPortada.value = e.portada || '/imgwii/hero.webp';
    if (inContenido) inContenido.value = e.contenido || '';
    actualizarLivePreview();
  }

  // ════════════════════════════════════════════════════════════
  // 4. NUEVO ARTÍCULO Y GUARDADO
  // ════════════════════════════════════════════════════════════
  btnNuevaEntrada?.addEventListener('click', () => {
    entradaSeleccionadaId = `art_temp_${Date.now()}`;
    tableBody?.querySelectorAll('.en-row').forEach(r => r.classList.remove('selected'));
    cargarEnEditor({
      id: entradaSeleccionadaId,
      titulo: '',
      slug: '',
      estado: 'borrador',
      categoria: 'Rentas Personales (4ta y 5ta)',
      portada: '/imgwii/hero.webp',
      contenido: '## Escribe aquí el contenido de la guía tributaria...'
    });
    btnTabEditor?.click();
    inTitulo?.focus();
    Notificacion('Formulario listo para nuevo artículo.', 'info', 2000);
  });

  btnGuardar?.addEventListener('click', async () => {
    const titulo = inTitulo?.value?.trim();
    if (!titulo) {
      Notificacion('Debes indicar un título para el artículo.', 'warning', 2500);
      inTitulo?.focus();
      return;
    }

    const spin = wiSpin ? wiSpin(btnGuardar) : null;
    if (btnGuardar) btnGuardar.disabled = true;

    try {
      const idActual = inId?.value?.startsWith('art_temp') ? undefined : inId?.value;
      const guardado = await guardarEntrada({
        id: idActual,
        titulo,
        slug: inSlug?.value?.trim(),
        estado: selectEstado?.value || 'publicado',
        categoria: selectCategoria?.value || 'Rentas Personales (4ta y 5ta)',
        portada: inPortada?.value?.trim() || '/imgwii/hero.webp',
        contenido: inContenido?.value || '',
        autor: 'CPC Lourdes Cusihuaman Gálvez'
      });

      entradaSeleccionadaId = guardado.id;
      actualizarKpis();
      renderizarTabla();
      Notificacion(`¡Artículo "${titulo}" guardado con éxito!`, 'success', 3000);
    } catch (err) {
      console.error(err);
      Notificacion('Error al guardar el artículo.', 'danger', 3000);
    } finally {
      if (spin) spin.stop();
      if (btnGuardar) btnGuardar.disabled = false;
    }
  });

  // Filtros
  filtersWrap?.querySelectorAll('.en-filter-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      filtersWrap.querySelectorAll('.en-filter-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filtroActual = btn.getAttribute('data-filter') || 'todos';
      renderizarTabla();
    });
  });

  // ════════════════════════════════════════════════════════════
  // 5. INICIALIZACIÓN
  // ════════════════════════════════════════════════════════════
  actualizarKpis();
  renderizarTabla();

  sincronizarEntradasDesdeFirestore().then(() => {
    actualizarKpis();
    renderizarTabla();
  });
}
