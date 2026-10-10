// src/feature/personal/modulos/personal/dataPersonal.js
// Gestor Canónico del Equipo Profesional del Estudio Contable (Lourdes Cusihuaman)
// Fuente Canónica: Colección 'smiles' · Semilla src/semillas/smiles.json · Local-First
// 100% JS Nativo · Integrado con @widev y Firebase

import { getls, savels } from '@widev';
import smilesSemilla from '../../../../semillas/smiles.json';

export const STORAGE_KEY = 'minegocio_equipo_personal';
export const COLECCION_SMILES = 'smiles';

let _memoriaPersonal = null;

export function normalizarMiembro(p = {}) {
  const nombreCompleto = p.nombreCompleto || `${p.nombre || ''} ${p.apellidos || ''}`.trim();
  const uid = p.uid || p.id || `per_${Date.now()}`;
  return {
    id: uid,
    uid: uid,
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

  // Semilla de preview: filtrar exclusivamente los miembros de rol personal de smiles.json
  const miembrosSemilla = (Array.isArray(smilesSemilla) ? smilesSemilla : [])
    .filter(s => s.rol === 'personal' || s.rol === 'gestor' || s.rol === 'admin');

  const inicial = miembrosSemilla.map(normalizarMiembro);
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

  // Persistir en Firestore en la colección canónica 'smiles'
  try {
    const { db } = await import('@core/servicios/firebase.js');
    if (db) {
      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
      await setDoc(doc(db, COLECCION_SMILES, normalizado.id), {
        ...normalizado,
        actualizado: serverTimestamp()
      }, { merge: true });
    }
  } catch (err) {
    console.debug('[dataPersonal] Sincronización en segundo plano con smiles:', err?.message || err);
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
      await deleteDoc(doc(db, COLECCION_SMILES, id));
    }
  } catch (err) {
    console.debug('[dataPersonal] Eliminación en Firestore:', err?.message || err);
  }

  return lista;
}

export async function sincronizarPersonalDesdeFirestore() {
  try {
    const { db, auth } = await import('@core/servicios/firebase.js');
    if (!db) return obtenerPersonal();

    // Solo consultar Firestore si hay usuario autenticado para evitar 'insufficient permissions'
    const usuarioAuth = auth?.currentUser;
    const usuarioLocal = getls('wiSmile');
    if (!usuarioAuth && (!usuarioLocal || !['personal', 'gestor', 'admin'].includes(usuarioLocal.rol))) {
      return obtenerPersonal();
    }

    const { collection, getDocs, query, where } = await import('firebase/firestore');
    const q = query(
      collection(db, COLECCION_SMILES),
      where('rol', 'in', ['personal', 'gestor', 'admin'])
    );
    const snap = await getDocs(q);

    if (!snap.empty) {
      const remotos = snap.docs.map(d => normalizarMiembro({ id: d.id, ...d.data() }));
      _memoriaPersonal = remotos;
      savels(STORAGE_KEY, remotos);
      return remotos;
    }
  } catch (err) {
    console.debug('[dataPersonal] Lectura remota Firestore de smiles no disponible (usando local/preview):', err?.message || err);
  }
  return obtenerPersonal();
}
