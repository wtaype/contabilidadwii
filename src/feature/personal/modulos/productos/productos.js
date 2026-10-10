// src/feature/personal/modulos/productos/productos.js
// Controlador Frontend Autónomo del Módulo de Servicios & Asesorías (Estudio Cusihuaman)
// 100% JS Nativo · Local-First · Integración con Firestore, @widev y modales.js

import { Notificacion, wiSpin, wiConfirmar } from '@widev';
import {
  obtenerProductosLocal,
  sincronizarProductosFirestore,
  cambiarEstadoProducto,
  guardarProductoFirestore,
  eliminarProductoFirestore
} from './dataProductos.js';
import {
  inicializarModalProducto,
  abrirModalProducto
} from './modales.js';
import { solicitarActualizacionWeb } from '../../../../actualizar.js';

export function inicializarProductos() {
  const panel = document.getElementById('panel-productos');
  if (!panel || panel.dataset.productosInit === 'true') return;
  panel.dataset.productosInit = 'true';

  // Inicializar controlador del modal
  inicializarModalProducto();

  // Elementos de la UI
  const prGrid = document.getElementById('prGridProductos');
  const prEmpty = document.getElementById('prEmptyState');
  const prStatTotal = document.getElementById('prStatTotal');
  const prStatServicios = document.getElementById('prStatServicios');
  const prStatAsesorias = document.getElementById('prStatAsesorias');
  const prFiltrosGroup = document.getElementById('prFiltrosGroup');
  const prInputBuscar = document.getElementById('prInputBuscar');
  const prBtnNuevo = document.getElementById('prBtnNuevo');
  const prBtnCrearPrimero = document.getElementById('prBtnCrearPrimero');
  const prBtnSincronizar = document.getElementById('prBtnSincronizar');

  let categoriaFiltro = 'todos';
  let busquedaTexto = '';

  // 1. RENDERIZADOR DE SERVICIOS Y ASESORÍAS
  function renderizar(productos = obtenerProductosLocal()) {
    const total = productos.length;
    const totalServicios = productos.filter(p => p.tipo === 'servicio').length;
    const totalAsesorias = productos.filter(p => p.tipo === 'asesoria' || p.tipo === 'taller').length;

    if (prStatTotal) prStatTotal.textContent = total;
    if (prStatServicios) prStatServicios.textContent = totalServicios;
    if (prStatAsesorias) prStatAsesorias.textContent = totalAsesorias;

    if (total === 0) {
      if (prGrid) prGrid.innerHTML = '';
      if (prEmpty) prEmpty.style.display = 'flex';
      return;
    }

    if (prEmpty) prEmpty.style.display = 'none';

    // Filtrar por categoría y texto
    const filtrados = productos.filter(p => {
      const tipoReal = (p.tipo === 'asesoria' || p.tipo === 'taller') ? 'asesoria' : 'servicio';
      const matchCat = categoriaFiltro === 'todos' || tipoReal === categoriaFiltro;
      const texto = busquedaTexto.toLowerCase().trim();
      const nombreEs = (typeof p.nombre === 'object' ? p.nombre?.es : p.nombre) || '';
      const nombreEn = (typeof p.nombre === 'object' ? p.nombre?.en : p.nombreEn) || '';
      const enfoque = p.enfoque || '';
      const matchText = !texto ||
        nombreEs.toLowerCase().includes(texto) ||
        nombreEn.toLowerCase().includes(texto) ||
        enfoque.toLowerCase().includes(texto) ||
        (p.id || '').toLowerCase().includes(texto);
      return matchCat && matchText;
    });

    if (filtrados.length === 0) {
      if (prGrid) {
        prGrid.innerHTML = `
          <div style="grid-column: 1 / -1; padding: 40px 20px; text-align: center; color: var(--tx2, #64748b);">
            <i class="fa-solid fa-magnifying-glass" style="font-size: 28px; opacity: 0.5; margin-bottom: 10px; display: block;"></i>
            No se encontraron servicios ni asesorías que coincidan con la búsqueda.
          </div>
        `;
      }
      return;
    }

    if (!prGrid) return;
    prGrid.innerHTML = filtrados.map(p => {
      const esActivo = p.estado === 'activo' && p.activo !== false;
      const esServicio = p.tipo === 'servicio';
      const nombre = typeof p.nombre === 'object' ? (p.nombre?.es || '') : (p.nombre || '');
      const nombreEn = typeof p.nombre === 'object' ? (p.nombre?.en || '') : (p.nombreEn || '');
      const precio = Number(p.precioPEN ?? p.precio ?? 0);
      const duracion = typeof p.duracion === 'object' ? (p.duracion?.es || '') : (p.duracion || (esServicio ? 'Mensual' : '1 Hora'));
      const modalidad = typeof p.modalidad === 'object' ? (p.modalidad?.es || '') : (p.modalidad || 'Online & Presencial');

      return `
        <article class="pr-card ${esActivo ? '' : 'pausado'}" data-id="${p.id}">
          <header class="pr-card-header">
            <span class="pr-badge-tag ${p.tagClase || 'badge-serenidad'}">
              <i class="${esServicio ? 'fa-solid fa-briefcase' : 'fa-solid fa-comments'}"></i>
              ${esServicio ? 'Servicio Mensual' : 'Asesoría Puntual'}
            </span>

            <label class="pr-switch-wrap" title="Activar o pausar visibilidad">
              <span class="pr-switch-label ${esActivo ? 'activo' : ''}">${esActivo ? 'Activo' : 'Pausado'}</span>
              <span class="pr-switch">
                <input type="checkbox" class="pr-input-switch" data-id="${p.id}" ${esActivo ? 'checked' : ''} />
                <span class="pr-slider"></span>
              </span>
            </label>
          </header>

          <div class="pr-card-media">
            <img src="${p.imagen || '/imgwii/servicios/servicio01.webp'}" alt="${nombre}" class="pr-card-img" loading="lazy" />
          </div>

          <div class="pr-card-body">
            <h3 class="pr-card-title">${nombre || 'Sin título'}</h3>
            ${nombreEn ? `<div class="pr-card-sub-en">${nombreEn}</div>` : ''}

            <div class="pr-card-specs">
              <span class="pr-spec-chip"><i class="fa-solid fa-clock"></i> ${duracion}</span>
              <span class="pr-spec-chip"><i class="fa-solid fa-location-dot"></i> ${modalidad}</span>
            </div>

            <!-- Edición rápida de Honorario -->
            <div class="pr-quick-edit-row">
              <div class="pr-quick-field" style="width: 100%;">
                <span class="pr-quick-label">Honorario / Precio</span>
                <div class="pr-quick-input-wrap">
                  <span class="pr-quick-prefix">S/</span>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    class="pr-quick-input pr-quick-precio"
                    data-id="${p.id}"
                    value="${precio}"
                    title="Modificar honorario directamente"
                  />
                </div>
              </div>
            </div>

            <footer class="pr-card-footer">
              <button type="button" class="pr-btn-edit" data-id="${p.id}">
                <i class="fa-solid fa-pen-to-square"></i> Editar Ficha
              </button>
              <button type="button" class="pr-btn-del" data-id="${p.id}" title="Eliminar servicio">
                <i class="fa-solid fa-trash"></i>
              </button>
            </footer>
          </div>
        </article>
      `;
    }).join('');
  }

  // 2. LISTENERS DE BOTONES Y FILTROS
  if (prBtnNuevo) prBtnNuevo.addEventListener('click', () => abrirModalProducto(null));
  if (prBtnCrearPrimero) prBtnCrearPrimero.addEventListener('click', () => abrirModalProducto(null));

  // Filtros de Categoría
  if (prFiltrosGroup) {
    prFiltrosGroup.addEventListener('click', (e) => {
      const btn = e.target.closest('.pr-filter-pill');
      if (!btn) return;
      document.querySelectorAll('.pr-filter-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      categoriaFiltro = btn.getAttribute('data-categoria') || 'todos';
      renderizar();
    });
  }

  // Buscador en Vivo
  if (prInputBuscar) {
    prInputBuscar.addEventListener('input', (e) => {
      busquedaTexto = e.target.value;
      renderizar();
    });
  }

  // Sincronizar con Firestore
  if (prBtnSincronizar) {
    prBtnSincronizar.addEventListener('click', async () => {
      prBtnSincronizar.disabled = true;
      wiSpin(prBtnSincronizar, true);
      try {
        const res = await sincronizarProductosFirestore();
        renderizar(res.datos || obtenerProductosLocal());
        Notificacion('Catálogo sincronizado con Firestore exitosamente.', 'success', 3000);
      } catch (err) {
        Notificacion('Error al sincronizar con Firestore.', 'error', 3500);
      } finally {
        wiSpin(prBtnSincronizar, false);
        prBtnSincronizar.disabled = false;
      }
    });
  }

  // 3. LISTENERS DENTRO DE LA GRILLA (DELEGACIÓN DE EVENTOS)
  if (prGrid) {
    // Switch Activo / Pausado
    prGrid.addEventListener('change', async (e) => {
      if (e.target.classList.contains('pr-input-switch')) {
        const id = e.target.getAttribute('data-id');
        const nuevoEstado = e.target.checked ? 'activo' : 'pausado';
        const card = e.target.closest('.pr-card');
        const label = card?.querySelector('.pr-switch-label');

        if (label) {
          label.textContent = e.target.checked ? 'Activo' : 'Pausado';
          label.classList.toggle('activo', e.target.checked);
        }
        if (card) {
          card.classList.toggle('pausado', !e.target.checked);
        }

        await cambiarEstadoProducto(id, nuevoEstado);
        Notificacion(`Estado actualizado a ${nuevoEstado}.`, 'info', 2000);
      }
    });

    // Edición rápida de precio (onChange)
    prGrid.addEventListener('change', async (e) => {
      if (e.target.classList.contains('pr-quick-precio')) {
        const id = e.target.getAttribute('data-id');
        const nuevoPrecio = Number(e.target.value || 0);
        const lista = obtenerProductosLocal();
        const item = lista.find(p => p.id === id);
        if (item) {
          item.precioPEN = nuevoPrecio;
          item.precio = nuevoPrecio;
          await guardarProductoFirestore(item);
          Notificacion(`Honorario actualizado a S/ ${nuevoPrecio}.`, 'success', 2500);
          solicitarActualizacionWeb({ motivo: `precio-${id}` });
        }
      }
    });

    // Botón Editar Ficha Completa
    prGrid.addEventListener('click', (e) => {
      const btnEdit = e.target.closest('.pr-btn-edit');
      if (btnEdit) {
        const id = btnEdit.getAttribute('data-id');
        const item = obtenerProductosLocal().find(p => p.id === id);
        if (item) abrirModalProducto(item);
        return;
      }

      // Botón Eliminar
      const btnDel = e.target.closest('.pr-btn-del');
      if (btnDel) {
        const id = btnDel.getAttribute('data-id');
        const item = obtenerProductosLocal().find(p => p.id === id);
        const nombre = typeof item?.nombre === 'object' ? item.nombre.es : (item?.nombre || id);

        wiConfirmar({
          titulo: '¿Eliminar servicio?',
          mensaje: `¿Estás seguro de que deseas eliminar permanentemente "${nombre}" del catálogo?`,
          textoConfirmar: 'Sí, eliminar',
          tipo: 'danger'
        }).then(async (confirmado) => {
          if (confirmado) {
            await eliminarProductoFirestore(id);
            renderizar();
            Notificacion(`Servicio "${nombre}" eliminado.`, 'info', 3000);
          }
        });
      }
    });
  }

  // Escuchar evento personalizado tras guardar desde el modal
  window.addEventListener('producto-guardado', () => {
    renderizar();
  });

  // Render inicial
  renderizar();
}

// Auto-inicialización si el panel ya existe en el DOM
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarProductos);
  } else {
    inicializarProductos();
  }
}

export default { inicializarProductos };
