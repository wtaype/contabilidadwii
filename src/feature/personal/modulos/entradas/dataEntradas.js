// src/feature/personal/modulos/entradas/dataEntradas.js
// Gestor Canónico de Artículos y Blog Tributario SEO (Estudio Cusihuaman)
// Prioridad: 1° Firestore REST ('entradas') · 2° Semilla src/semillas/entradas.json · Caché Local
// 100% JS Nativo · Integrado con @widev

import { getls, savels } from '@widev';
import entradasSemilla from '../../../../semillas/entradas.json';

export const STORAGE_KEY = 'minegocio_entradas_blog';
export const COLECCION_ENTRADAS = 'entradas';

let _memoriaEntradas = null;

export function normalizarEntrada(e = {}) {
  const slugGenerado = e.slug || (e.titulo || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return {
    id: e.id || `art_${Date.now()}`,
    titulo: e.titulo || 'Artículo Tributario',
    slug: slugGenerado,
    categoria: e.categoria || 'Rentas Personales (4ta y 5ta)',
    estado: e.estado || 'publicado',
    fecha: e.fecha || 'Hoy',
    autor: e.autor || 'CPC Lourdes Cusihuaman Gálvez',
    portada: e.portada || '/imgwii/hero.webp',
    metaTitle: e.metaTitle || `${e.titulo || 'Artículo'} | Estudio Cusihuaman`,
    metaDesc: e.metaDesc || e.resumen || 'Guía tributaria especializada por CPC Lourdes Cusihuaman Gálvez.',
    tags: e.tags || 'sunat, tributario, contabilidad, surquillo',
    contenido: e.contenido || ''
  };
}

export function obtenerEntradas() {
  if (_memoriaEntradas) return _memoriaEntradas;

  try {
    const guardadas = getls(STORAGE_KEY);
    if (guardadas && Array.isArray(guardadas) && guardadas.length > 0) {
      _memoriaEntradas = guardadas.map(normalizarEntrada);
      return _memoriaEntradas;
    }
  } catch (e) {}

  const inicial = (Array.isArray(entradasSemilla) ? entradasSemilla : []).map(normalizarEntrada);
  _memoriaEntradas = inicial;
  savels(STORAGE_KEY, inicial);
  return _memoriaEntradas;
}

export async function guardarEntrada(entradaData) {
  const entradas = obtenerEntradas();
  const registro = normalizarEntrada(entradaData);
  const idx = entradas.findIndex(e => e.id === registro.id || e.slug === registro.slug);

  if (idx >= 0) {
    entradas[idx] = { ...entradas[idx], ...registro };
  } else {
    entradas.unshift(registro);
  }

  _memoriaEntradas = entradas;
  savels(STORAGE_KEY, entradas);

  try {
    const { db } = await import('@core/servicios/firebase.js');
    if (db) {
      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
      await setDoc(doc(db, COLECCION_ENTRADAS, registro.id), {
        ...registro,
        actualizado: serverTimestamp()
      }, { merge: true });
    }
  } catch (err) {
    console.warn('[dataEntradas] Error al sincronizar con Firestore:', err?.message || err);
  }

  return registro;
}

export async function eliminarEntrada(id) {
  let entradas = obtenerEntradas();
  entradas = entradas.filter(e => e.id !== id);
  _memoriaEntradas = entradas;
  savels(STORAGE_KEY, entradas);

  try {
    const { db } = await import('@core/servicios/firebase.js');
    if (db) {
      const { doc, deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, COLECCION_ENTRADAS, id));
    }
  } catch (err) {
    console.warn('[dataEntradas] Error al eliminar de Firestore:', err?.message || err);
  }

  return entradas;
}

export async function sincronizarEntradasDesdeFirestore() {
  try {
    const { db } = await import('@core/servicios/firebase.js');
    if (!db) return obtenerEntradas();

    const { collection, getDocs, query, limit } = await import('firebase/firestore');
    const q = query(collection(db, COLECCION_ENTRADAS), limit(50));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const remotos = snap.docs.map(d => normalizarEntrada({ id: d.id, ...d.data() }));
      _memoriaEntradas = remotos;
      savels(STORAGE_KEY, remotos);
      return remotos;
    }
  } catch (err) {
    console.warn('[dataEntradas] Lectura remota Firestore:', err?.message || err);
  }
  return obtenerEntradas();
}
