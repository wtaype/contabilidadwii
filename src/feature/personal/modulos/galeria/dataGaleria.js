// src/feature/personal/modulos/galeria/dataGaleria.js
// Gestor de Medios y Fotos para el Módulo Galería (Estudio Cusihuaman)
// Conectado al Bucket Cloudflare R2 ('contabilidad-media') + Local-First Fallback
// 100% JS Nativo · Integrado con @widev

import { getls, savels } from '@widev';
import { subirImagenR2 } from '@/core/servicios/r2Storage.js';
import semillasGaleria from '@/semillas/galeria.json';

const STORAGE_KEY = 'minegocio_galeria_media';

const IMAGENES_SEMILLA = Array.isArray(semillasGaleria) ? semillasGaleria : [];

export function obtenerImagenesGaleria() {
  const guardadas = getls(STORAGE_KEY);
  if (guardadas && Array.isArray(guardadas) && guardadas.length > 0) {
    // Si contiene URLs antiguas rotas (/imgwii/lourdes/) o blobs de sesión anterior, autorreparar
    const tieneRotas = guardadas.some(img => img.url && (img.url.includes('/imgwii/lourdes/') || img.url.startsWith('blob:')));
    if (!tieneRotas && guardadas.length >= IMAGENES_SEMILLA.length) {
      return guardadas;
    }
  }
  savels(STORAGE_KEY, IMAGENES_SEMILLA);
  return IMAGENES_SEMILLA;
}

export async function procesarSubidaImagen(file, categoria = 'especialista', titulo = '', alt = '') {
  let urlPublica = '';
  let nombreArchivo = file.name || `media_${Date.now()}.webp`;

  try {
    const res = await subirImagenR2(file, titulo || 'estudio-cusihuaman');
    if (res && res.url) {
      urlPublica = res.url;
    }
  } catch (err) {
    console.warn('[dataGaleria] Fallback local-first:', err?.message || err);
    urlPublica = URL.createObjectURL(file);
  }

  const nuevaImagen = {
    id: `img_${Date.now()}`,
    nombre: nombreArchivo,
    titulo: titulo || file.name.replace(/\.[^/.]+$/, ''),
    alt: alt || `Fotografía de ${titulo || 'Estudio Cusihuaman'}`,
    url: urlPublica,
    categoria: categoria || 'especialista',
    pesoKb: Math.round(file.size / 1024) || 120,
    dimensiones: 'Optimizado WebP',
    fechaSubida: 'Hoy'
  };

  const lista = obtenerImagenesGaleria();
  lista.unshift(nuevaImagen);
  savels(STORAGE_KEY, lista);
  return nuevaImagen;
}

export function actualizarAltImagen(id, nuevoAlt) {
  const lista = obtenerImagenesGaleria();
  const idx = lista.findIndex(img => img.id === id);
  if (idx >= 0) {
    lista[idx].alt = nuevoAlt;
    savels(STORAGE_KEY, lista);
    return lista[idx];
  }
  return null;
}

export function eliminarImagenGaleria(id) {
  let lista = obtenerImagenesGaleria();
  lista = lista.filter(img => img.id !== id);
  savels(STORAGE_KEY, lista);
  return lista;
}
