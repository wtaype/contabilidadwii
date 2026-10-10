// src/feature/personal/modulos/productos/dataProductos.js
// 🎯 Capa Canónica Local-First de Servicios & Asesorías: Firestore + Caché Local + Semilla
// Colección: 'servicios' · Semilla: src/semillas/servicios.json
// Integrado con @widev, Firebase SDK y solicitarActualizacionWeb

import { savels, getls } from '@widev';
import { db } from '@core/servicios/firebase.js';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import serviciosSemilla from '../../../../semillas/servicios.json';
import { solicitarActualizacionWeb } from '../../../../actualizar.js';

export const STORAGE_KEY = 'contabilidad_servicios';
export const OLD_STORAGE_KEY = 'gaswii_productos';
export const COLECCION_SERVICIOS = 'servicios';

// Parser ultraligero de campos de la REST API de Firestore (para build-time SSG)
export function parseFirestoreDoc(fields = {}) {
  const res = {};
  for (const [k, v] of Object.entries(fields)) {
    if (v.stringValue !== undefined) res[k] = v.stringValue;
    else if (v.integerValue !== undefined) res[k] = parseInt(v.integerValue, 10);
    else if (v.doubleValue !== undefined) res[k] = parseFloat(v.doubleValue);
    else if (v.booleanValue !== undefined) res[k] = v.booleanValue;
    else if (v.timestampValue !== undefined) res[k] = v.timestampValue;
    else if (v.mapValue) res[k] = parseFirestoreDoc(v.mapValue.fields || {});
    else if (v.arrayValue) {
      res[k] = (v.arrayValue.values || []).map(item => {
        if (item.mapValue) return parseFirestoreDoc(item.mapValue.fields || {});
        if (item.stringValue !== undefined) return item.stringValue;
        return Object.values(item)[0];
      });
    }
  }
  return res;
}

// Generador de ID y Slug amigable
export function generarSlug(texto = '') {
  return String(texto)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

// Normalizador neutro de estructura de Servicio / Asesoría
export function normalizarProducto(p = {}) {
  const prod = p && typeof p === 'object' ? p : {};
  const nombreEs = prod.nombre?.es || (typeof prod.nombre === 'string' ? prod.nombre : '');
  const idDefault = prod.id || (nombreEs ? generarSlug(nombreEs) : `srv-${Date.now()}`);

  const tipo = (prod.tipo === 'asesoria' || prod.tipo === 'taller') ? 'asesoria' : 'servicio';

  // Garantías bilingües
  const garantiasEs = Array.isArray(prod.garantias?.es)
    ? prod.garantias.es
    : (Array.isArray(prod.garantias) ? prod.garantias : []);
  const garantiasEn = Array.isArray(prod.garantias?.en)
    ? prod.garantias.en
    : (Array.isArray(prod.garantiasEn) ? prod.garantiasEn : []);

  // Duración bilingüe
  const duracionEs = typeof prod.duracion === 'object' && prod.duracion !== null
    ? (prod.duracion.es || '')
    : (prod.duracion || (tipo === 'servicio' ? 'Mensual' : '1 Hora'));
  const duracionEn = typeof prod.duracion === 'object' && prod.duracion !== null
    ? (prod.duracion.en || '')
    : (prod.duracionEn || (tipo === 'servicio' ? 'Monthly' : '1 Hour'));

  // Modalidad bilingüe
  const modalidadEs = typeof prod.modalidad === 'object' && prod.modalidad !== null
    ? (prod.modalidad.es || '')
    : (prod.modalidad || '100% Online y Presencial en Surquillo');
  const modalidadEn = typeof prod.modalidad === 'object' && prod.modalidad !== null
    ? (prod.modalidad.en || '')
    : (prod.modalidadEn || '100% Online & In-Person in Surquillo');

  // Público bilingüe
  const publicoEs = typeof prod.publico === 'object' && prod.publico !== null
    ? (prod.publico.es || '')
    : (prod.publico || 'MYPES, Emprendedores y Profesionales');
  const publicoEn = typeof prod.publico === 'object' && prod.publico !== null
    ? (prod.publico.en || '')
    : (prod.publicoEn || 'Small Businesses & Professionals');

  // Badge bilingüe
  const badgeEs = typeof prod.badge === 'object' && prod.badge !== null
    ? (prod.badge.es || '')
    : (prod.badge || (prod.pin ? 'Recomendado' : ''));
  const badgeEn = typeof prod.badge === 'object' && prod.badge !== null
    ? (prod.badge.en || '')
    : (prod.badgeEn || (prod.pin ? 'Recommended' : ''));

  const precio = Number(prod.precioPEN ?? prod.precio ?? prod.price ?? (tipo === 'servicio' ? 150 : 80));

  return {
    id: String(idDefault),
    slug: String(prod.slug || idDefault),
    tipo,
    estado: (prod.estado === 'pausado' || prod.activo === false) ? 'pausado' : 'activo',
    activo: prod.estado === 'pausado' || prod.activo === false ? false : true,
    pin: Boolean(prod.pin),
    orden: Number(prod.orden ?? 1),
    precioPEN: precio,
    precio: precio,
    enfoque: String(prod.enfoque || (tipo === 'servicio' ? 'Contabilidad MYPE y Declaración SIRE' : 'Asesoría y Diagnóstico Tributario')),
    imagen: String(prod.imagen || (tipo === 'servicio' ? '/imgwii/servicios/servicio01.webp' : '/imgwii/servicios/servicio04.webp')),
    badgeIcon: String(prod.badgeIcon || 'fa-solid fa-star'),
    tagClase: String(prod.tagClase || 'badge-serenidad'),
    userId: String(prod.userId || 'sistema'),
    email: String(prod.email || 'contacto@contabilidadwii.com'),
    creado: prod.creado || null,
    actualizado: prod.actualizado || null,

    // Mapas Bilingües Oficiales
    nombre: {
      es: String(nombreEs),
      en: String(prod.nombre?.en || prod.nombreEn || '')
    },
    descripcion: {
      es: String(prod.descripcion?.es || (typeof prod.descripcion === 'string' ? prod.descripcion : '')),
      en: String(prod.descripcion?.en || prod.descripcionEn || '')
    },
    duracion: {
      es: duracionEs,
      en: duracionEn
    },
    modalidad: {
      es: modalidadEs,
      en: modalidadEn
    },
    publico: {
      es: publicoEs,
      en: publicoEn
    },
    badge: {
      es: badgeEs,
      en: badgeEn
    },
    garantias: {
      es: garantiasEs,
      en: garantiasEn
    }
  };
}

/**
 * Aplana un servicio bilingüe a un solo idioma para consumo directo en vistas
 */
export function aplanarProducto(prod, idioma = 'es') {
  if (!prod) return null;
  const p = normalizarProducto(prod);
  const lang = idioma === 'en' ? 'en' : 'es';

  return {
    ...p,
    nombre: p.nombre[lang] || p.nombre.es || '',
    descripcion: p.descripcion[lang] || p.descripcion.es || '',
    duracion: p.duracion[lang] || p.duracion.es || '',
    modalidad: p.modalidad[lang] || p.modalidad.es || '',
    publico: p.publico[lang] || p.publico.es || '',
    badge: p.badge[lang] || p.badge.es || '',
    garantias: (p.garantias[lang] && p.garantias[lang].length > 0) ? p.garantias[lang] : p.garantias.es
  };
}

let _memoriaProductos = null;

export function getUsuarioActivo() {
  const u = getls('wiSmile') || {};
  return {
    userId: u.uid || u.id || 'admin',
    email: u.email || 'contacto@contabilidadwii.com',
    autor: u.nombre || u.usuario || 'Lourdes Cusihuaman'
  };
}

/**
 * Obtiene los servicios almacenados en memoria, localStorage o semilla (Prioridad 1° Local / Firestore, 2° Semilla)
 */
export function obtenerProductosLocal() {
  if (_memoriaProductos && Array.isArray(_memoriaProductos) && _memoriaProductos.length > 0) {
    return _memoriaProductos;
  }

  // 1. Revisar localStorage
  try {
    const local = getls(STORAGE_KEY);
    if (Array.isArray(local) && local.length > 0) {
      _memoriaProductos = local.map(normalizarProducto).sort((a, b) => (a.orden || 999) - (b.orden || 999));
      return _memoriaProductos;
    }
  } catch (e) {}

  // 2. Fallback a Semilla oficial
  const semillas = (Array.isArray(serviciosSemilla) ? serviciosSemilla : []).map(normalizarProducto);
  _memoriaProductos = semillas;
  try {
    savels(STORAGE_KEY, semillas);
  } catch (e) {}

  return _memoriaProductos;
}

/**
 * Guarda el array de productos en caché local
 */
export function guardarProductosLocal(lista = []) {
  const normalizados = lista.map(normalizarProducto).sort((a, b) => (a.orden || 999) - (b.orden || 999));
  _memoriaProductos = normalizados;
  savels(STORAGE_KEY, normalizados);
  return normalizados;
}

/**
 * Sincroniza desde Firestore hacia Local-First
 */
export async function sincronizarProductosFirestore() {
  try {
    if (!db) {
      return { ok: true, origen: 'local', datos: obtenerProductosLocal() };
    }

    const colRef = collection(db, COLECCION_SERVICIOS);
    const snap = await getDocs(colRef);

    if (snap.empty) {
      // Si la colección está vacía en Firestore, usamos la semilla local y la sembramos en Firestore
      const locales = obtenerProductosLocal();
      if (locales.length > 0) {
        for (const item of locales) {
          try {
            await setDoc(doc(db, COLECCION_SERVICIOS, item.id), {
              ...item,
              actualizado: serverTimestamp()
            }, { merge: true });
          } catch (err) {}
        }
      }
      return { ok: true, origen: 'semilla_sembrada', datos: locales };
    }

    const remotos = snap.docs.map(d => normalizarProducto({ id: d.id, ...d.data() }));
    guardarProductosLocal(remotos);
    return { ok: true, origen: 'firestore', datos: remotos };
  } catch (err) {
    console.warn('[dataProductos] Sincronización Firestore:', err?.message || err);
    return { ok: false, error: err?.message, datos: obtenerProductosLocal() };
  }
}

/**
 * Guarda o actualiza un servicio en Firestore y en local
 */
export async function guardarProductoFirestore(productoRaw = {}) {
  const normalizado = normalizarProducto(productoRaw);
  const usuario = getUsuarioActivo();

  const prodFinal = {
    ...normalizado,
    userId: normalizado.userId || usuario.userId,
    email: normalizado.email || usuario.email,
    actualizado: new Date().toISOString()
  };

  // 1. Guardar de inmediato en Local (Local-First instantáneo)
  const actuales = obtenerProductosLocal();
  const idx = actuales.findIndex(p => p.id === prodFinal.id);
  if (idx >= 0) {
    actuales[idx] = prodFinal;
  } else {
    actuales.push(prodFinal);
  }
  guardarProductosLocal(actuales);

  // 2. Disparar re-deploy con debounce
  solicitarActualizacionWeb({ motivo: `servicio-${prodFinal.id}` });

  // 3. Persistir en Firestore en segundo plano
  try {
    if (db) {
      const docRef = doc(db, COLECCION_SERVICIOS, prodFinal.id);
      await setDoc(docRef, {
        ...prodFinal,
        actualizado: serverTimestamp()
      }, { merge: true });
    }
  } catch (err) {
    console.warn('[dataProductos] Error al guardar en Firestore:', err?.message || err);
  }

  return prodFinal;
}

/**
 * Cambia el estado de un producto (activo / pausado)
 */
export async function cambiarEstadoProducto(id, nuevoEstado) {
  const lista = obtenerProductosLocal();
  const item = lista.find(p => p.id === id);
  if (!item) return null;

  item.estado = nuevoEstado;
  item.activo = nuevoEstado === 'activo';
  return guardarProductoFirestore(item);
}

/**
 * Elimina un producto de local y Firestore
 */
export async function eliminarProductoFirestore(id) {
  const lista = obtenerProductosLocal().filter(p => p.id !== id);
  guardarProductosLocal(lista);

  solicitarActualizacionWeb({ motivo: `servicio-eliminado-${id}` });

  try {
    if (db) {
      await deleteDoc(doc(db, COLECCION_SERVICIOS, id));
    }
  } catch (err) {
    console.warn('[dataProductos] Error al eliminar de Firestore:', err?.message || err);
  }

  return true;
}

export default {
  STORAGE_KEY,
  COLECCION_SERVICIOS,
  obtenerProductosLocal,
  guardarProductosLocal,
  sincronizarProductosFirestore,
  guardarProductoFirestore,
  cambiarEstadoProducto,
  eliminarProductoFirestore,
  normalizarProducto,
  aplanarProducto
};
