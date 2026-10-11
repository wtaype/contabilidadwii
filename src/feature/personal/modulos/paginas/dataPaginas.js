// src/feature/personal/modulos/paginas/dataPaginas.js
// Gestor Canónico de Contenido Institucional y Metadata SEO de Páginas (Estudio Cusihuaman)
// Prioridad: 1° Firestore ('paginas') · 2° Semilla src/semillas/paginas.json · Caché Local
// 100% JS Nativo · Integrado con @widev

import { getls, savels } from '@widev';
import paginasSemilla from '../../../../semillas/paginas.json';

import { datosNegocio } from '../../../../negocio.js';

export const STORAGE_KEY = 'wi_paginas_institucionales';
export const OLD_STORAGE_KEY = 'contabilidad_paginas_institucionales';
export const COLECCION_PAGINAS = 'paginas';

let _memoriaPaginas = null;

export function normalizarPagina(p = {}) {
  return {
    id: p.id || `pg-${Date.now()}`,
    ruta: p.ruta || '/',
    nombre: p.nombre || 'Página',
    icono: p.icono || 'fa-solid fa-file-lines',
    h1: p.h1 || datosNegocio.titulo || '',
    subtitulo: p.subtitulo || datosNegocio.subtitulo || '',
    metaTitle: p.metaTitle || datosNegocio.titulo || '',
    metaDesc: p.metaDesc || '',
    telefono: p.telefono || datosNegocio.telefono || '',
    horario: p.horario || datosNegocio.horario || '',
    ultimaModificacion: p.ultimaModificacion || new Date().toISOString().slice(0, 10)
  };
}

export function obtenerPaginas() {
  if (_memoriaPaginas) return _memoriaPaginas;

  try {
    const guardadas = getls(STORAGE_KEY) || getls(OLD_STORAGE_KEY);
    if (guardadas && Array.isArray(guardadas) && guardadas.length > 0) {
      const tieneObsoleto = guardadas.some(g => (g.h1 && g.h1.toLowerCase().includes('gas')) || (g.nombre && g.nombre.toLowerCase().includes('gas')));
      if (!tieneObsoleto) {
        _memoriaPaginas = guardadas.map(normalizarPagina);
        return _memoriaPaginas;
      }
    }
  } catch (e) {}

  const inicial = (Array.isArray(paginasSemilla) ? paginasSemilla : []).map(normalizarPagina);
  _memoriaPaginas = inicial;
  savels(STORAGE_KEY, inicial);
  return _memoriaPaginas;
}

export async function guardarPagina(paginaData) {
  const paginas = obtenerPaginas();
  const registro = normalizarPagina(paginaData);
  registro.ultimaModificacion = new Date().toISOString().slice(0, 10);

  const idx = paginas.findIndex(p => p.id === registro.id || p.ruta === registro.ruta);

  if (idx >= 0) {
    paginas[idx] = { ...paginas[idx], ...registro };
  } else {
    paginas.push(registro);
  }

  _memoriaPaginas = [...paginas];
  savels(STORAGE_KEY, _memoriaPaginas);

  // Sincronización en segundo plano con Firestore
  try {
    const { db } = await import('@core/servicios/firebase.js');
    if (db) {
      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
      await setDoc(doc(db, COLECCION_PAGINAS, registro.id), {
        ...registro,
        actualizado: serverTimestamp()
      }, { merge: true });
    }
  } catch (err) {
    console.warn('[dataPaginas] Error al sincronizar con Firestore:', err?.message || err);
  }

  return paginas[idx >= 0 ? idx : paginas.length - 1];
}

export async function sincronizarPaginasDesdeFirestore() {
  try {
    const { db } = await import('@core/servicios/firebase.js');
    if (!db) return obtenerPaginas();

    const { collection, getDocs, query, limit } = await import('firebase/firestore');
    const q = query(collection(db, COLECCION_PAGINAS), limit(20));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const remotas = snap.docs.map(d => normalizarPagina({ id: d.id, ...d.data() }));
      _memoriaPaginas = remotas;
      savels(STORAGE_KEY, remotas);
      return remotas;
    }
  } catch (err) {
    console.warn('[dataPaginas] Lectura remota Firestore:', err?.message || err);
  }
  return obtenerPaginas();
}
