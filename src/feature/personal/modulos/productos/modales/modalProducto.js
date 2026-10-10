// src/feature/personal/modulos/productos/modales/modalProducto.js
// Controlador Frontend del Modal de Servicio / Asesoría (Estudio Cusihuaman)
// Integrado con wiModal de @widev/modales.js, Firestore y solicitarActualizacionWeb

import { wiModal, Notificacion, wiSpin } from '@widev';
import {
  guardarProductoFirestore,
  generarSlug,
  obtenerProductosLocal
} from '../dataProductos.js';
import { solicitarActualizacionWeb } from '../../../../../actualizar.js';

export const MODAL_ID = 'prModalBackdrop';

export function inicializarModalProducto() {
  const modalEl = document.getElementById(MODAL_ID);
  if (!modalEl || modalEl.dataset.modalInit === 'true') return;
  modalEl.dataset.modalInit = 'true';

  const form = document.getElementById('prFormProducto');
  const inputImagen = document.getElementById('prFormImagen');
  const previewImg = document.getElementById('prModalPreviewImg');
  const previewEmpty = document.getElementById('prModalPreviewEmpty');
  const btnGuardar = document.getElementById('prBtnGuardarModal');
  const btnCerrar = document.getElementById('prBtnCerrarModal');
  const btnCancelar = document.getElementById('prBtnCancelarModal');

  // Botones de Cierre (X, Cancelar y clic en fondo)
  if (btnCerrar) {
    btnCerrar.addEventListener('click', (e) => {
      e.preventDefault();
      cerrarModalProducto();
    });
  }

  if (btnCancelar) {
    btnCancelar.addEventListener('click', (e) => {
      e.preventDefault();
      cerrarModalProducto();
    });
  }

  modalEl.addEventListener('click', (e) => {
    if (e.target === modalEl) {
      cerrarModalProducto();
    }
  });

  // 1. Actualización en tiempo real de la imagen preview
  function actualizarPreview() {
    const url = (inputImagen?.value || '').trim();
    if (url && previewImg) {
      previewImg.src = url;
      previewImg.style.display = 'block';
      if (previewEmpty) previewEmpty.style.display = 'none';
      previewImg.onerror = () => {
        previewImg.style.display = 'none';
        if (previewEmpty) previewEmpty.style.display = 'flex';
      };
    } else {
      if (previewImg) previewImg.style.display = 'none';
      if (previewEmpty) previewEmpty.style.display = 'flex';
    }
  }

  if (inputImagen) {
    inputImagen.addEventListener('input', actualizarPreview);
    inputImagen.addEventListener('change', actualizarPreview);
  }

  // 2. Conmutador de Pestañas Bilingües (ES / EN)
  document.querySelectorAll('.pr-modal-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pr-modal-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.pr-lang-pane').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const targetId = btn.getAttribute('data-target');
      const pane = document.getElementById(targetId);
      if (pane) pane.classList.add('active');
    });
  });

  // 3. Envío del Formulario
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const prFormId = document.getElementById('prFormId');
      const prFormCategoria = document.getElementById('prFormCategoria');
      const prFormPrecio = document.getElementById('prFormPrecio');
      const prFormOrden = document.getElementById('prFormOrden');
      const prFormEstado = document.getElementById('prFormEstado');
      const prFormEnfoque = document.getElementById('prFormEnfoque');
      const prFormBadgeEs = document.getElementById('prFormBadgeEs');
      const prFormTagClase = document.getElementById('prFormTagClase');

      // ES
      const prFormNombreEs = document.getElementById('prFormNombreEs');
      const prFormDescEs = document.getElementById('prFormDescEs');
      const prFormDuracionEs = document.getElementById('prFormDuracionEs');
      const prFormModalidadEs = document.getElementById('prFormModalidadEs');
      const prFormPublicoEs = document.getElementById('prFormPublicoEs');
      const prFormGarantiasEs = document.getElementById('prFormGarantiasEs');

      // EN
      const prFormNombreEn = document.getElementById('prFormNombreEn');
      const prFormDescEn = document.getElementById('prFormDescEn');
      const prFormDuracionEn = document.getElementById('prFormDuracionEn');
      const prFormModalidadEn = document.getElementById('prFormModalidadEn');
      const prFormPublicoEn = document.getElementById('prFormPublicoEn');
      const prFormGarantiasEn = document.getElementById('prFormGarantiasEn');

      const nombreEs = prFormNombreEs?.value.trim() || '';
      if (!nombreEs) {
        Notificacion('El nombre en español es requerido.', 'warning', 3000);
        return;
      }

      const idExistente = prFormId?.value.trim() || '';
      const idFinal = idExistente || generarSlug(nombreEs);
      const tipo = prFormCategoria?.value || 'servicio';

      const garantiasEs = (prFormGarantiasEs?.value || '')
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);
      const garantiasEn = (prFormGarantiasEn?.value || '')
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);

      const payload = {
        id: idFinal,
        slug: idFinal,
        tipo,
        precioPEN: Number(prFormPrecio?.value || (tipo === 'servicio' ? 150 : 80)),
        precio: Number(prFormPrecio?.value || (tipo === 'servicio' ? 150 : 80)),
        orden: Number(prFormOrden?.value || 1),
        estado: prFormEstado?.value || 'activo',
        activo: prFormEstado?.value !== 'pausado',
        enfoque: prFormEnfoque?.value.trim() || (tipo === 'servicio' ? 'Contabilidad MYPE y Régimen Especial' : 'Asesoría y Diagnóstico Tributario'),
        imagen: (inputImagen?.value || '').trim() || (tipo === 'servicio' ? '/imgwii/servicios/servicio01.webp' : '/imgwii/servicios/servicio04.webp'),
        badgeIcon: 'fa-solid fa-star',
        tagClase: prFormTagClase?.value || 'badge-serenidad',

        nombre: {
          es: nombreEs,
          en: prFormNombreEn?.value.trim() || ''
        },
        descripcion: {
          es: prFormDescEs?.value.trim() || '',
          en: prFormDescEn?.value.trim() || ''
        },
        duracion: {
          es: prFormDuracionEs?.value.trim() || (tipo === 'servicio' ? 'Mensual' : '1 Hora'),
          en: prFormDuracionEn?.value.trim() || (tipo === 'servicio' ? 'Monthly' : '1 Hour')
        },
        modalidad: {
          es: prFormModalidadEs?.value.trim() || '100% Online y Presencial en Surquillo previa cita',
          en: prFormModalidadEn?.value.trim() || '100% Online & In-Person in Surquillo'
        },
        publico: {
          es: prFormPublicoEs?.value.trim() || 'Pequeños Negocios y Profesionales',
          en: prFormPublicoEn?.value.trim() || 'Small Businesses & Professionals'
        },
        badge: {
          es: prFormBadgeEs?.value.trim() || '',
          en: prFormBadgeEs?.value.trim() ? (prFormBadgeEs.value.trim() === 'Más Solicitado' ? 'Most Popular' : 'Recommended') : ''
        },
        garantias: {
          es: garantiasEs.length > 0 ? garantiasEs : ['Asesoría directa con especialista SUNAT', 'Tranquilidad tributaria garantizada'],
          en: garantiasEn
        }
      };

      if (btnGuardar) {
        btnGuardar.disabled = true;
        wiSpin(btnGuardar, true);
      }

      try {
        await guardarProductoFirestore(payload);
        cerrarModalProducto();
        const msgExito = idExistente
          ? `Servicio "${nombreEs}" actualizado con éxito.`
          : `Servicio "${nombreEs}" registrado con éxito.`;
        Notificacion(msgExito, 'success', 3500);

        // Disparar re-deploy con debounce
        solicitarActualizacionWeb({ motivo: idExistente ? 'servicio-actualizado' : 'servicio-creado' });

        // Notificar al componente padre para re-renderizar la grilla
        window.dispatchEvent(new CustomEvent('producto-guardado', { detail: payload }));
      } catch (err) {
        Notificacion('Error al guardar en Firestore.', 'error', 4000);
      } finally {
        if (btnGuardar) {
          wiSpin(btnGuardar, false);
          btnGuardar.disabled = false;
        }
      }
    });
  }
}

/**
 * Abre el modal de producto (nuevo o editar)
 */
export function abrirModalProducto(producto = null) {
  const modalEl = document.getElementById(MODAL_ID);
  if (!modalEl) return;

  // Reset de pestañas a Español
  document.querySelectorAll('.pr-modal-tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.pr-lang-pane').forEach(p => p.classList.remove('active'));
  const btnTabEs = document.querySelector('.pr-modal-tab-btn[data-target="pane-es"]');
  const paneEs = document.getElementById('pane-es');
  if (btnTabEs) btnTabEs.classList.add('active');
  if (paneEs) paneEs.classList.add('active');

  const tituloEl = document.getElementById('prModalTitle');
  const form = document.getElementById('prFormProducto');
  const inputImagen = document.getElementById('prFormImagen');
  const previewImg = document.getElementById('prModalPreviewImg');
  const previewEmpty = document.getElementById('prModalPreviewEmpty');

  const prFormId = document.getElementById('prFormId');
  const prFormCategoria = document.getElementById('prFormCategoria');
  const prFormPrecio = document.getElementById('prFormPrecio');
  const prFormOrden = document.getElementById('prFormOrden');
  const prFormEstado = document.getElementById('prFormEstado');
  const prFormEnfoque = document.getElementById('prFormEnfoque');
  const prFormBadgeEs = document.getElementById('prFormBadgeEs');
  const prFormTagClase = document.getElementById('prFormTagClase');

  // ES
  const prFormNombreEs = document.getElementById('prFormNombreEs');
  const prFormDescEs = document.getElementById('prFormDescEs');
  const prFormDuracionEs = document.getElementById('prFormDuracionEs');
  const prFormModalidadEs = document.getElementById('prFormModalidadEs');
  const prFormPublicoEs = document.getElementById('prFormPublicoEs');
  const prFormGarantiasEs = document.getElementById('prFormGarantiasEs');

  // EN
  const prFormNombreEn = document.getElementById('prFormNombreEn');
  const prFormDescEn = document.getElementById('prFormDescEn');
  const prFormDuracionEn = document.getElementById('prFormDuracionEn');
  const prFormModalidadEn = document.getElementById('prFormModalidadEn');
  const prFormPublicoEn = document.getElementById('prFormPublicoEn');
  const prFormGarantiasEn = document.getElementById('prFormGarantiasEn');

  if (producto) {
    // MODO EDICIÓN
    const nombre = typeof producto.nombre === 'object' ? (producto.nombre?.es || '') : (producto.nombre || '');
    if (tituloEl) tituloEl.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Editar: ${nombre || producto.id}`;
    if (prFormId) prFormId.value = producto.id;
    if (prFormCategoria) prFormCategoria.value = producto.tipo === 'asesoria' ? 'asesoria' : 'servicio';
    if (prFormPrecio) prFormPrecio.value = producto.precioPEN ?? producto.precio ?? 150;
    if (prFormOrden) prFormOrden.value = producto.orden ?? 1;
    if (prFormEstado) prFormEstado.value = (producto.estado === 'pausado' || producto.activo === false) ? 'pausado' : 'activo';
    if (prFormEnfoque) prFormEnfoque.value = producto.enfoque || '';
    if (prFormBadgeEs) prFormBadgeEs.value = typeof producto.badge === 'object' ? (producto.badge?.es || '') : (producto.badge || '');
    if (prFormTagClase) prFormTagClase.value = producto.tagClase || 'badge-serenidad';
    if (inputImagen) inputImagen.value = producto.imagen || '/imgwii/servicios/servicio01.webp';

    // Español
    if (prFormNombreEs) prFormNombreEs.value = nombre;
    if (prFormDescEs) prFormDescEs.value = typeof producto.descripcion === 'object' ? (producto.descripcion?.es || '') : (producto.descripcion || '');
    if (prFormDuracionEs) prFormDuracionEs.value = typeof producto.duracion === 'object' ? (producto.duracion?.es || '') : (producto.duracion || '');
    if (prFormModalidadEs) prFormModalidadEs.value = typeof producto.modalidad === 'object' ? (producto.modalidad?.es || '') : (producto.modalidad || '');
    if (prFormPublicoEs) prFormPublicoEs.value = typeof producto.publico === 'object' ? (producto.publico?.es || '') : (producto.publico || '');
    
    const garEs = Array.isArray(producto.garantias?.es) ? producto.garantias.es : (Array.isArray(producto.garantias) ? producto.garantias : []);
    if (prFormGarantiasEs) prFormGarantiasEs.value = garEs.join('\n');

    // Inglés
    if (prFormNombreEn) prFormNombreEn.value = typeof producto.nombre === 'object' ? (producto.nombre?.en || '') : (producto.nombreEn || '');
    if (prFormDescEn) prFormDescEn.value = typeof producto.descripcion === 'object' ? (producto.descripcion?.en || '') : (producto.descripcionEn || '');
    if (prFormDuracionEn) prFormDuracionEn.value = typeof producto.duracion === 'object' ? (producto.duracion?.en || '') : (producto.duracionEn || '');
    if (prFormModalidadEn) prFormModalidadEn.value = typeof producto.modalidad === 'object' ? (producto.modalidad?.en || '') : (producto.modalidadEn || '');
    if (prFormPublicoEn) prFormPublicoEn.value = typeof producto.publico === 'object' ? (producto.publico?.en || '') : (producto.publicoEn || '');
    
    const garEn = Array.isArray(producto.garantias?.en) ? producto.garantias.en : (Array.isArray(producto.garantiasEn) ? producto.garantiasEn : []);
    if (prFormGarantiasEn) prFormGarantiasEn.value = garEn.join('\n');
  } else {
    // MODO NUEVO
    if (tituloEl) tituloEl.innerHTML = `<i class="fa-solid fa-plus"></i> Registrar Nuevo Servicio / Asesoría`;
    if (form) form.reset();
    if (prFormId) prFormId.value = '';
    if (prFormCategoria) prFormCategoria.value = 'servicio';
    if (prFormPrecio) prFormPrecio.value = '150';
    if (prFormOrden) prFormOrden.value = String(obtenerProductosLocal().length + 1);
    if (prFormEstado) prFormEstado.value = 'activo';
    if (prFormEnfoque) prFormEnfoque.value = 'Contabilidad MYPE y Régimen Especial';
    if (prFormBadgeEs) prFormBadgeEs.value = 'Recomendado';
    if (prFormTagClase) prFormTagClase.value = 'badge-serenidad';
    if (inputImagen) inputImagen.value = '/imgwii/servicios/servicio01.webp';

    // Valores por defecto
    if (prFormDuracionEs) prFormDuracionEs.value = 'Mensual';
    if (prFormModalidadEs) prFormModalidadEs.value = '100% Online y Presencial en Surquillo previa cita';
    if (prFormPublicoEs) prFormPublicoEs.value = 'Pequeños Negocios y Emprendedores';
    if (prFormGarantiasEs) {
      prFormGarantiasEs.value = [
        'Liquidación puntual de IGV y Renta mensual',
        'Registro de compras y ventas en el sistema SIRE de SUNAT',
        'Tranquilidad total para que te dediques a vender'
      ].join('\n');
    }
  }

  // Actualizar imagen preview
  const imgUrl = (inputImagen?.value || '').trim();
  if (imgUrl && previewImg) {
    previewImg.src = imgUrl;
    previewImg.style.display = 'block';
    if (previewEmpty) previewEmpty.style.display = 'none';
  } else {
    if (previewImg) previewImg.style.display = 'none';
    if (previewEmpty) previewEmpty.style.display = 'flex';
  }

  wiModal.open(MODAL_ID);
}

/**
 * Cierra el modal
 */
export function cerrarModalProducto() {
  const modalEl = document.getElementById(MODAL_ID);
  if (modalEl) {
    modalEl.classList.remove('open', 'active');
  }
  wiModal.close(MODAL_ID);
}

export default {
  inicializarModalProducto,
  abrirModalProducto,
  cerrarModalProducto
};
