// src/feature/personal/modulos/galeria/galeria.js
// Controlador Frontend Autónomo del Módulo Galería (Estudio Cusihuaman)
// 100% JS Nativo · Integrado con @widev

import { Notificacion, wiSpin, wiConfirmar } from '@widev';
import {
  obtenerImagenesGaleria,
  procesarSubidaImagen,
  actualizarAltImagen,
  eliminarImagenGaleria
} from './dataGaleria.js';

export function inicializarModuloGaleria() {
  const panel = document.getElementById('panel-galeria');
  if (!panel || panel.dataset.galeriaInit === 'true') return;
  panel.dataset.galeriaInit = 'true';

  let categoriaActual = 'todas';

  // ── Elementos del DOM ──
  const gridContainer = document.getElementById('glGridContainer');
  const filtersWrap = document.getElementById('glFiltersWrap');
  const statsBadge = document.getElementById('glStatsBadge');
  const btnSubirTrigger = document.getElementById('btnGlSubirTrigger');

  // ── Modal de Subida ──
  const modalSubida = document.getElementById('glModalSubida');
  const btnModalClose = document.getElementById('btnGlModalClose');
  const dropzone = document.getElementById('glDropzone');
  const fileInput = document.getElementById('glFileInput');
  const selectCategoria = document.getElementById('glSelectCategoria');
  const inTitulo = document.getElementById('glInpTitulo');
  const inAlt = document.getElementById('glInpAlt');
  const formSubida = document.getElementById('formGlSubida');
  const btnSubmitSubida = document.getElementById('btnGlSubmitSubida');

  // ── Lightbox ──
  const lightbox = document.getElementById('glLightbox');
  const lightboxImg = document.getElementById('glLightboxImg');
  const lightboxMeta = document.getElementById('glLightboxMeta');
  const btnLightboxClose = document.getElementById('btnGlLightboxClose');

  // ════════════════════════════════════════════════════════════
  // 1. RENDERIZADO DEL GRID DE IMÁGENES
  // ════════════════════════════════════════════════════════════
  function renderizarGrid() {
    if (!gridContainer) return;
    const todas = obtenerImagenesGaleria();
    const filtradas = categoriaActual === 'todas'
      ? todas
      : todas.filter(img => img.categoria === categoriaActual);

    if (statsBadge) {
      statsBadge.textContent = `${filtradas.length} archivos · Estudio Cusihuaman`;
    }

    if (filtradas.length === 0) {
      gridContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--tx2);">
          <i class="fa-regular fa-image" style="font-size: 32px; opacity: 0.4; margin-bottom: 8px; display: block;"></i>
          No hay fotografías en esta categoría.
        </div>
      `;
      return;
    }

    gridContainer.innerHTML = filtradas.map(img => `
      <div class="gl-card" data-id="${img.id}">
        <div class="gl-thumb-wrap" data-img-id="${img.id}">
          <img src="${img.url}" alt="${img.alt}" class="gl-thumb" loading="lazy" />
          <span class="gl-category-tag">${img.categoria}</span>
          <span class="gl-size-tag">${img.pesoKb} KB</span>
        </div>
        <div class="gl-body">
          <h4 class="gl-title" title="${img.titulo}">${img.titulo}</h4>
          <input 
            type="text" 
            class="gl-alt-input" 
            value="${img.alt}" 
            placeholder="Atributo alt para SEO..." 
            data-id="${img.id}" 
            title="Editar texto ALT para Google Imágenes" 
          />
          <div class="gl-footer">
            <button type="button" class="gl-btn-copy-url" data-url="${img.url}">
              <i class="fa-solid fa-copy"></i> Copiar URL
            </button>
            <button type="button" class="gl-btn-delete" data-id="${img.id}" title="Eliminar imagen">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('');

    // Listeners en thumbnails para abrir Lightbox
    gridContainer.querySelectorAll('.gl-thumb-wrap').forEach(wrap => {
      wrap.addEventListener('click', () => {
        const id = wrap.getAttribute('data-img-id');
        const img = todas.find(x => x.id === id);
        if (img) abrirLightbox(img);
      });
    });

    // Listeners para copiar URL
    gridContainer.querySelectorAll('.gl-btn-copy-url').forEach(btn => {
      btn.addEventListener('click', async () => {
        const url = btn.getAttribute('data-url');
        try {
          await navigator.clipboard.writeText(url);
          Notificacion('¡URL de imagen copiada al portapapeles!', 'success', 2000);
        } catch (e) {
          Notificacion('No se pudo copiar automáticamente.', 'info', 2000);
        }
      });
    });

    // Listeners para editar ALT
    gridContainer.querySelectorAll('.gl-alt-input').forEach(inp => {
      inp.addEventListener('change', () => {
        const id = inp.getAttribute('data-id');
        actualizarAltImagen(id, inp.value.trim());
        Notificacion('Atributo ALT actualizado para Google SEO.', 'info', 1500);
      });
    });

    // Listeners para eliminar
    gridContainer.querySelectorAll('.gl-btn-delete').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const img = todas.find(x => x.id === id);
        if (!img) return;

        const conf = await wiConfirmar(`¿Eliminar la imagen "${img.titulo}" de la galería?`, {
          titulo: 'Eliminar Imagen',
          tipo: 'danger',
          siTexto: 'Sí, Eliminar'
        });

        if (conf) {
          eliminarImagenGaleria(id);
          renderizarGrid();
          Notificacion('Imagen retirada de la galería.', 'info', 2000);
        }
      });
    });
  }

  // ════════════════════════════════════════════════════════════
  // 2. FILTROS POR CATEGORÍA
  // ════════════════════════════════════════════════════════════
  filtersWrap?.querySelectorAll('.gl-filter-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      filtersWrap.querySelectorAll('.gl-filter-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      categoriaActual = btn.getAttribute('data-cat') || 'todas';
      renderizarGrid();
    });
  });

  // ════════════════════════════════════════════════════════════
  // 3. LIGHTBOX VIEWER
  // ════════════════════════════════════════════════════════════
  function abrirLightbox(img) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = img.url;
    if (lightboxMeta) {
      lightboxMeta.innerHTML = `<strong>${img.titulo}</strong> · ${img.dimensiones} (${img.pesoKb} KB)<br><small>${img.alt}</small>`;
    }
    lightbox.classList.add('open');
  }

  btnLightboxClose?.addEventListener('click', () => {
    lightbox?.classList.remove('open');
  });

  lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox) lightbox.classList.remove('open');
  });

  // ════════════════════════════════════════════════════════════
  // 4. SUBIDA DE ARCHIVOS CON DROPZONE
  // ════════════════════════════════════════════════════════════
  btnSubirTrigger?.addEventListener('click', () => {
    modalSubida?.classList.add('open');
  });

  btnModalClose?.addEventListener('click', () => {
    modalSubida?.classList.remove('open');
  });

  dropzone?.addEventListener('click', () => fileInput?.click());

  dropzone?.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });

  dropzone?.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });

  dropzone?.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer?.files?.length > 0) {
      if (fileInput) fileInput.files = e.dataTransfer.files;
      const file = e.dataTransfer.files[0];
      if (inTitulo && !inTitulo.value) inTitulo.value = file.name.replace(/\.[^/.]+$/, '');
      Notificacion(`Archivo ${file.name} seleccionado.`, 'info', 2000);
    }
  });

  fileInput?.addEventListener('change', () => {
    if (fileInput.files?.length > 0) {
      const file = fileInput.files[0];
      if (inTitulo && !inTitulo.value) inTitulo.value = file.name.replace(/\.[^/.]+$/, '');
    }
  });

  formSubida?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!fileInput?.files || fileInput.files.length === 0) {
      Notificacion('Selecciona al menos una imagen para subir.', 'warning', 2500);
      return;
    }

    const file = fileInput.files[0];
    const cat = selectCategoria?.value || 'especialista';
    const titulo = inTitulo?.value?.trim() || file.name;
    const alt = inAlt?.value?.trim() || titulo;

    const spin = wiSpin ? wiSpin(btnSubmitSubida) : null;
    if (btnSubmitSubida) btnSubmitSubida.disabled = true;

    try {
      await procesarSubidaImagen(file, cat, titulo, alt);
      Notificacion('¡Fotografía añadida a la galería con éxito!', 'success', 3000);
      formSubida.reset();
      modalSubida?.classList.remove('open');
      renderizarGrid();
    } catch (err) {
      console.error(err);
      Notificacion('Error al procesar la subida de imagen.', 'danger', 3000);
    } finally {
      if (spin) spin.stop();
      if (btnSubmitSubida) btnSubmitSubida.disabled = false;
    }
  });

  // ════════════════════════════════════════════════════════════
  // 5. INICIALIZACIÓN
  // ════════════════════════════════════════════════════════════
  renderizarGrid();
}
