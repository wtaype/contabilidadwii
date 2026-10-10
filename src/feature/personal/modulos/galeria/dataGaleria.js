// src/feature/personal/modulos/galeria/dataGaleria.js
// Gestor de Medios y Fotos para el Módulo Galería (Estudio Cusihuaman)
// Conectado al Bucket Cloudflare R2 ('contabilidad-media') + Local-First Fallback
// 100% JS Nativo · Integrado con @widev

import { getls, savels } from '@widev';
import { subirImagenR2 } from '@/core/servicios/r2Storage.js';

const STORAGE_KEY = 'minegocio_galeria_media';

const IMAGENES_SEMILLA = [
  {
    id: 'img_hero_lourdes',
    nombre: 'hero.webp',
    titulo: 'CPC Lourdes Cusihuaman Gálvez',
    alt: 'Fotografía oficial de la CPC Lourdes Cusihuaman Gálvez, especialista contable y ex-orientadora SUNAT',
    url: '/imgwii/hero.webp',
    categoria: 'especialista',
    pesoKb: 142,
    dimensiones: '1200x800',
    fechaSubida: 'Ene 2026'
  },
  {
    id: 'img_lourdes_asesoria',
    nombre: 'lourdes01.webp',
    titulo: 'Asesoría Tributaria Personalizada',
    alt: 'Sesión de asesoría contable y planificación fiscal para profesionales y microempresas',
    url: '/imgwii/lourdes/lourdes01.webp',
    categoria: 'especialista',
    pesoKb: 185,
    dimensiones: '1000x750',
    fechaSubida: 'Feb 2026'
  },
  {
    id: 'img_lourdes_capacitacion',
    nombre: 'lourdes02.webp',
    titulo: 'Orientación en Rentas de 4ta y 5ta',
    alt: 'Capacitación en deducción de gastos y emisión de recibos por honorarios electrónicos',
    url: '/imgwii/lourdes/lourdes02.webp',
    categoria: 'especialista',
    pesoKb: 198,
    dimensiones: '1000x750',
    fechaSubida: 'Feb 2026'
  },
  {
    id: 'img_logo_oficial',
    nombre: 'logo.webp',
    titulo: 'Logotipo Oficial Estudio Cusihuaman',
    alt: 'Isotipo y logotipo oficial del Estudio Contable CPC Lourdes Cusihuaman Gálvez',
    url: '/imgwii/logo.webp',
    categoria: 'institucional',
    pesoKb: 84,
    dimensiones: '512x512',
    fechaSubida: 'Ene 2026'
  },
  {
    id: 'img_sede_surquillo',
    nombre: 'sede-surquillo-dante.webp',
    titulo: 'Sede Jr. Dante 260, Surquillo',
    alt: 'Oficina de atención presencial en Jr. Dante 260, Surquillo, Lima',
    url: '/imgwii/hero.webp',
    categoria: 'sede',
    pesoKb: 165,
    dimensiones: '1200x800',
    fechaSubida: 'Ene 2026'
  },
  {
    id: 'img_constancia_sunat',
    nombre: 'constancia-habilitacion-cpc.webp',
    titulo: 'Colegiatura y Habilitación Profesional',
    alt: 'Colegiatura y acreditación oficial de Contadora Pública Colegiada',
    url: '/imgwii/lourdes/lourdes01.webp',
    categoria: 'certificaciones',
    pesoKb: 120,
    dimensiones: '800x1100',
    fechaSubida: 'Ene 2026'
  }
];

export function obtenerImagenesGaleria() {
  const guardadas = getls(STORAGE_KEY);
  if (guardadas && Array.isArray(guardadas) && guardadas.length > 0) {
    return guardadas;
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
