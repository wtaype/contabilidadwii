// src/feature/personal/modulos/negocio/dataNegocio.js
// 🎯 Capa Canónica Local-First de Negocio: Firestore + Caché Local + Semilla src/semillas/negocio.json
// Colección: 'negocio' · Documento: 'principal'
// Integrado con @widev y Firebase SDK

import { savels, getls, formatearFechaParaInput } from '@widev';
import negocioSemilla from '../../../../semillas/negocio.json';

export const STORAGE_KEY = 'wi_negocio';
export const OLD_STORAGE_KEY = 'minegocio';
export const COLECCION_NEGOCIO = 'negocio';
export const DOC_NEGOCIO_ID = 'principal';

// 1. Lector canónico de semilla inicial de despegue (lee src/semillas/negocio.json)
export function obtenerSemillaLocal() {
  return negocioSemilla && typeof negocioSemilla === 'object' ? negocioSemilla : null;
}

// 2. Importación y re-exportación canónica desde la fachada oficial @/negocio.js
import {
  parseFirestoreDoc,
  normalizarConfig,
  obtenerDatosNegocio,
  obtenerNegocioLocal
} from '@/negocio.js';

export {
  parseFirestoreDoc,
  normalizarConfig,
  obtenerDatosNegocio,
  obtenerNegocioLocal
};

let _memoriaNegocio = null;

export function getUsuarioActivo() {
  const u = getls('wiSmile') || {};
  return {
    userId: u.uid || u.id || '',
    email: u.email || '',
    autor: u.nombre || u.usuario || ''
  };
}

// Calcula los años de experiencia automáticamente a partir de una fecha YYYY-MM-DD o Timestamp
export function calcularAnosTrayectoria(fechaInput) {
  if (!fechaInput) return '1+';
  let dateObj = null;

  if (fechaInput?.seconds) {
    dateObj = new Date(fechaInput.seconds * 1000);
  } else if (typeof fechaInput === 'string') {
    dateObj = new Date(fechaInput.includes('T') ? fechaInput : `${fechaInput}T12:00:00`);
  } else if (fechaInput instanceof Date) {
    dateObj = fechaInput;
  }

  if (!dateObj || isNaN(dateObj.getTime())) return '1+';
  const dif = new Date().getFullYear() - dateObj.getFullYear();
  return dif > 0 ? `${dif}+` : '1+';
}


/**
 * Guarda en caché local y notifica reactivamente a la UI
 */
export function guardarDatosNegocioLocal(config) {
  try {
    const normalizado = normalizarConfig(config);
    _memoriaNegocio = normalizado;
    savels(STORAGE_KEY, normalizado);
    savels(OLD_STORAGE_KEY, normalizado);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('contabilidad:negocio-actualizado', { detail: normalizado }));
    }
  } catch (e) {}
}

/**
 * Guarda en caché local y sincroniza directamente con Firestore
 */
export function guardarDatosNegocio(input = {}) {
  const actual = obtenerDatosNegocio();
  const usuario = getUsuarioActivo();

  // Parsear fecha de lanzamiento/fundación
  const fechaStr = input.identidad?.lanzamientoFecha || actual.identidad?.lanzamientoFecha || "";
  const yearsCalc = calcularAnosTrayectoria(fechaStr);

  const configActualizada = {
    ...actual,
    id: DOC_NEGOCIO_ID,
    moneda: input.moneda || actual.moneda || 'PEN',
    idiomaPrincipal: input.idiomaPrincipal || actual.idiomaPrincipal || 'es',
    idiomas: Array.isArray(input.idiomas) ? input.idiomas : (actual.idiomas || ['es', 'en']),
    titulo: input.titulo || actual.titulo || '',
    subtitulo: input.subtitulo ?? actual.subtitulo ?? '',
    hero: {
      ...actual.hero,
      ...(input.hero || {})
    },
    identidad: {
      ...actual.identidad,
      ...(input.identidad || {}),
      lanzamientoFecha: fechaStr
    },
    contacto: {
      ...actual.contacto,
      ...(input.contacto || {})
    },
    horarios: {
      ...actual.horarios,
      ...(input.horarios || {})
    },
    ubicacion: {
      ...actual.ubicacion,
      ...(input.ubicacion || {})
    },
    sedes: Array.isArray(input.sedes) ? input.sedes : (actual.sedes || []),
    metricas: {
      ...actual.metricas,
      ...(input.metricas || {}),
      years: yearsCalc
    },
    redes: {
      ...actual.redes,
      ...(input.redes || {})
    },
    redesOrden: Array.isArray(input.redesOrden) ? input.redesOrden : (actual.redesOrden || []),
    seo: {
      ...actual.seo,
      ...(input.seo || {})
    },
    userId: usuario.userId || actual.userId || ''
  };

  // Limpiar campos obsoletos o redundantes
  delete configActualizada.principal;
  delete configActualizada.email;
  delete configActualizada.autor;
  if (configActualizada.identidad) {
    delete configActualizada.identidad.lanzamiento;
    delete configActualizada.identidad.subtitulo;
  }
  if (configActualizada.metricas) {
    delete configActualizada.metricas.pacientes;
  }

  guardarDatosNegocioLocal(configActualizada);

  // Sincronización en segundo plano con Firestore
  sincronizarNegocioFirestore(configActualizada, fechaStr);

  return configActualizada;
}

// Persiste de forma limpia en Firestore
async function sincronizarNegocioFirestore(config, fechaStr) {
  try {
    const { db } = await import('@core/servicios/firebase.js');
    if (!db) return;
    const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');

    const identidadLimpia = { ...(config.identidad || {}) };
    delete identidadLimpia.lanzamiento;
    delete identidadLimpia.subtitulo;

    const metricasLimpias = {
      clientes: config.metricas?.clientes || config.metricas?.pacientes || '+240',
      confidencialidad: config.metricas?.confidencialidad || '100%',
      satisfaccion: config.metricas?.satisfaccion || '99.4%',
      years: config.metricas?.years || '12+'
    };

    const payload = {
      id: DOC_NEGOCIO_ID,
      moneda: config.moneda || 'PEN',
      idiomaPrincipal: config.idiomaPrincipal || 'es',
      idiomas: Array.isArray(config.idiomas) ? config.idiomas : ['es', 'en'],
      titulo: config.titulo || '',
      subtitulo: config.subtitulo || '',
      hero: config.hero || {},
      identidad: identidadLimpia,
      contacto: config.contacto || {},
      horarios: config.horarios || {},
      ubicacion: config.ubicacion || {},
      sedes: config.sedes || [],
      metricas: metricasLimpias,
      redes: config.redes || {},
      redesOrden: Array.isArray(config.redesOrden) ? config.redesOrden : [],
      seo: config.seo || {},
      userId: config.userId || '',
      actualizado: serverTimestamp()
    };

    // Reemplaza el documento completo en la colección 'negocio' -> 'principal'
    await setDoc(doc(db, COLECCION_NEGOCIO, DOC_NEGOCIO_ID), payload);
  } catch (err) {
    console.warn('[dataNegocio] Sincronización diferida Firestore:', err?.message || err);
  }
}

/**
 * Carga datos frescos desde Firestore en cliente y actualiza la caché local
 */
export async function sincronizarDesdeFirestore() {
  try {
    const { db } = await import('@core/servicios/firebase.js');
    if (!db) return normalizarConfig(obtenerSemillaLocal());
    const { doc, getDoc } = await import('firebase/firestore');

    const snap = await getDoc(doc(db, COLECCION_NEGOCIO, DOC_NEGOCIO_ID));
    if (snap.exists()) {
      const data = snap.data();
      let fechaLanz = "";
      if (data.identidad?.lanzamiento) {
        fechaLanz = formatearFechaParaInput(data.identidad.lanzamiento);
      } else if (data.identidad?.lanzamientoFecha) {
        fechaLanz = data.identidad.lanzamientoFecha;
      }
      const normalizado = normalizarConfig({
        ...data,
        identidad: {
          ...data.identidad,
          lanzamientoFecha: fechaLanz
        }
      });
      guardarDatosNegocioLocal(normalizado);
      return normalizado;
    } else {
      // Documento aún no creado en Firestore: Usar semilla de infoNegocio.json
      const semilla = normalizarConfig(obtenerSemillaLocal());
      return semilla;
    }
  } catch (err) {
    console.warn('[dataNegocio] Lectura Firestore:', err?.message || err);
  }
  return normalizarConfig(obtenerSemillaLocal());
}

export const consultarNegocioDesdeFirestore = sincronizarDesdeFirestore;
