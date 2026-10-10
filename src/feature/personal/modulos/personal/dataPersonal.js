// src/feature/personal/modulos/personal/dataPersonal.js
// Gestor Canónico del Equipo Profesional del Estudio Contable (Lourdes Cusihuaman)
// Prioridad: 1° Firestore REST ('personal') · 2° Semilla src/semillas/personal.json · Caché Local
// 100% JS Nativo · Integrado con @widev

import { getls, savels } from '@widev';
import personalSemilla from '../../../../semillas/personal.json';

export const STORAGE_KEY = 'minegocio_equipo_personal';
export const COLECCION_PERSONAL = 'personal';

let _memoriaPersonal = null;

export function normalizarMiembro(p = {}) {
  const nombreCompleto = p.nombreCompleto || `${p.nombre || ''} ${p.apellidos || ''}`.trim();
  return {
    id: p.id || `per_${Date.now()}`,
    nombre: p.nombre || 'Especialista',
    apellidos: p.apellidos || '',
    nombreCompleto: nombreCompleto || 'Especialista Contable',
    usuario: p.usuario || (p.nombre ? p.nombre.toLowerCase().replace(/\s+/g, '') : 'personal'),
    celular: p.celular || '+51 987 594 558',
    email: p.email || 'contacto@contabilidadwii.com',
    cargo: p.cargo || 'Especialista Contable y Tributario',
    especialidad: p.especialidad || 'Rentas de 4ta, 5ta y MYPE · Sunat Virtual',
    colegiatura: p.colegiatura || 'Habilitado/a',
    experiencia: p.experiencia || '5+ años de trayectoria',
    modalidad: p.modalidad || 'Online & Presencial Surquillo',
    avatar: p.avatar || '/imgwii/hero.webp',
    rol: p.rol || 'personal',
    activo: Boolean(p.activo ?? true)
  };
}

export function obtenerPersonal() {
  if (_memoriaPersonal) return _memoriaPersonal;

  try {
    const local = getls(STORAGE_KEY);
    if (Array.isArray(local) && local.length > 0) {
      _memoriaPersonal = local.map(normalizarMiembro);
      return _memoriaPersonal;
    }
  } catch (e) {}

  const inicial = (Array.isArray(personalSemilla) ? personalSemilla : []).map(normalizarMiembro);
  _memoriaPersonal = inicial;
  savels(STORAGE_KEY, inicial);
  return _memoriaPersonal;
}

export async function guardarMiembroPersonal(data) {
  const lista = obtenerPersonal();
  const normalizado = normalizarMiembro(data);
  const idx = lista.findIndex(p => p.id === normalizado.id);

  if (idx >= 0) {
    lista[idx] = { ...lista[idx], ...normalizado };
  } else {
    lista.push(normalizado);
  }

  _memoriaPersonal = lista;
  savels(STORAGE_KEY, lista);

  try {
    const { db } = await import('@core/servicios/firebase.js');
    if (db) {
      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
      await setDoc(doc(db, COLECCION_PERSONAL, normalizado.id), {
        ...normalizado,
        actualizado: serverTimestamp()
      }, { merge: true });
    }
  } catch (err) {
    console.warn('[dataPersonal] Error al sincronizar con Firestore:', err?.message || err);
  }

  return normalizado;
}

export async function eliminarMiembroPersonal(id) {
  let lista = obtenerPersonal();
  lista = lista.filter(p => p.id !== id);
  _memoriaPersonal = lista;
  savels(STORAGE_KEY, lista);

  try {
    const { db } = await import('@core/servicios/firebase.js');
    if (db) {
      const { doc, deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, COLECCION_PERSONAL, id));
    }
  } catch (err) {
    console.warn('[dataPersonal] Error al eliminar de Firestore:', err?.message || err);
  }

  return lista;
}

export async function sincronizarPersonalDesdeFirestore() {
  try {
    const { db } = await import('@core/servicios/firebase.js');
    if (!db) return obtenerPersonal();

    const { collection, getDocs } = await import('firebase/firestore');
    const snap = await getDocs(collection(db, COLECCION_PERSONAL));

    if (!snap.empty) {
      const remotos = snap.docs.map(d => normalizarMiembro({ id: d.id, ...d.data() }));
      _memoriaPersonal = remotos;
      savels(STORAGE_KEY, remotos);
      return remotos;
    }
  } catch (err) {
    console.warn('[dataPersonal] Lectura remota Firestore:', err?.message || err);
  }
  return obtenerPersonal();
}
