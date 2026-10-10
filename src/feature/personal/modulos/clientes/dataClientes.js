// src/feature/personal/modulos/clientes/dataClientes.js
// 🎯 Gestor Canónico Local-First para Directorio CRM Tributario (Estudio Cusihuaman)
// Fuente Canónica: Colección 'smiles' · Semilla src/semillas/smiles.json · Local-First
// 100% JS Nativo · Integrado con @widev y Firebase

import { getls, savels } from '@widev';
import smilesSemilla from '../../../../semillas/smiles.json';

export const STORAGE_KEY = 'minegocio_crm_clientes';
export const COLECCION_SMILES = 'smiles';

// Memoria volátil
let _memoriaClientes = null;

/**
 * Normaliza los datos de un cliente contribuyente desde el esquema smiles
 */
export function normalizarCliente(c = {}) {
  const ruc = String(c.documento || '').trim();
  const ultimoDigito = ruc.length >= 1 ? parseInt(ruc.slice(-1), 10) : (c.ultimoDigitoRuc ?? 0);
  const uid = c.uid || c.id || `cli_${Date.now()}`;
  const nombreContacto = c.contacto || `${c.nombre || ''} ${c.apellidos || ''}`.trim() || c.razonSocial || 'Contribuyente';

  return {
    id: uid,
    uid: uid,
    nombre: c.razonSocial || c.nombre || 'Cliente Contable',
    contacto: nombreContacto,
    apellidos: c.apellidos || '',
    usuario: c.usuario || (c.email ? c.email.split('@')[0] : 'cliente'),
    documentoTipo: c.documentoTipo || (ruc.length === 11 ? 'RUC' : 'DNI'),
    documento: ruc,
    celular: c.celular || '',
    email: c.email || '',
    direccion: c.direccion || (Array.isArray(c.direcciones) && c.direcciones[0] ? `${c.direcciones[0].calle}, ${c.direcciones[0].distrito}` : 'Surquillo, Lima'),
    regimenTributario: c.regimenTributario || 'Régimen MYPE Tributario (RMT)',
    servicioContratado: c.servicioContratado || 'Contabilidad Mensual MYPE & SIRE',
    honorarioPEN: parseFloat(c.honorarioPEN) || 150.00,
    ultimoDigitoRuc: isNaN(ultimoDigito) ? 0 : ultimoDigito,
    estadoTributario: c.estadoTributario || 'al_dia', // 'al_dia' | 'pendiente' | 'por_vencer'
    fechaInicio: c.fechaInicio || 'Ene 2026',
    observaciones: c.observaciones || 'Declaraciones mensuales y libros electrónicos al día.',
    avatar: c.avatar || 'https://imgwii.web.app/smile.avif',
    rol: 'cliente',
    activo: Boolean(c.activo ?? true)
  };
}

/**
 * Obtiene la lista de clientes (Caché local primero, luego semilla smiles.json con rol 'cliente')
 */
export function obtenerClientes() {
  if (_memoriaClientes) return _memoriaClientes;

  try {
    const local = getls(STORAGE_KEY);
    if (Array.isArray(local) && local.length > 0) {
      _memoriaClientes = local.map(normalizarCliente);
      return _memoriaClientes;
    }
  } catch (e) {}

  // Semilla de preview: filtrar exclusivamente los usuarios con rol 'cliente' en smiles.json
  const clientesSemilla = (Array.isArray(smilesSemilla) ? smilesSemilla : [])
    .filter(s => s.rol === 'cliente');

  const inicial = clientesSemilla.map(normalizarCliente);
  _memoriaClientes = inicial;
  savels(STORAGE_KEY, inicial);
  return _memoriaClientes;
}

/**
 * Guarda o actualiza un cliente en caché local y sincroniza en Firestore 'smiles'
 */
export async function guardarCliente(clienteData) {
  const clientes = obtenerClientes();
  const normalizado = normalizarCliente(clienteData);
  const index = clientes.findIndex(c => c.id === normalizado.id || (c.documento && c.documento === normalizado.documento));

  if (index >= 0) {
    clientes[index] = { ...clientes[index], ...normalizado };
  } else {
    clientes.unshift(normalizado);
  }

  _memoriaClientes = clientes;
  savels(STORAGE_KEY, clientes);

  // Sincronizar en la colección canónica 'smiles'
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
    console.debug('[dataClientes] Sincronización en segundo plano con smiles:', err?.message || err);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('contabilidad:cliente-guardado', { detail: normalizado }));
  }

  return normalizado;
}

/**
 * Elimina un cliente
 */
export async function eliminarCliente(id) {
  let clientes = obtenerClientes();
  clientes = clientes.filter(c => c.id !== id);
  _memoriaClientes = clientes;
  savels(STORAGE_KEY, clientes);

  try {
    const { db } = await import('@core/servicios/firebase.js');
    if (db) {
      const { doc, deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, COLECCION_SMILES, id));
    }
  } catch (err) {
    console.debug('[dataClientes] Eliminación en Firestore:', err?.message || err);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('contabilidad:cliente-eliminado', { detail: { id } }));
  }

  return clientes;
}

/**
 * Calcula métricas contables de la cartera
 */
export function calcularMetricasClientes(clientes = []) {
  const total = clientes.length;
  const mype = clientes.filter(c => (c.regimenTributario || '').toLowerCase().includes('mype') || (c.regimenTributario || '').toLowerCase().includes('general')).length;
  const independientes = clientes.filter(c => (c.regimenTributario || '').toLowerCase().includes('4ta') || (c.regimenTributario || '').toLowerCase().includes('honorarios')).length;
  const facturacionMensual = clientes.reduce((acc, c) => acc + (parseFloat(c.honorarioPEN) || 0), 0);

  return {
    total,
    mype,
    independientes,
    facturacionMensual: facturacionMensual.toFixed(2)
  };
}

/**
 * Sincroniza desde Firestore al iniciar sesión
 */
export async function sincronizarClientesDesdeFirestore() {
  try {
    const { db, auth } = await import('@core/servicios/firebase.js');
    if (!db) return obtenerClientes();

    // Solo consultar Firestore si hay usuario autenticado para evitar 'insufficient permissions'
    const usuarioAuth = auth?.currentUser;
    const usuarioLocal = getls('wiSmile');
    if (!usuarioAuth && (!usuarioLocal || !['personal', 'gestor', 'admin'].includes(usuarioLocal.rol))) {
      return obtenerClientes();
    }

    const { collection, getDocs, query, where, limit } = await import('firebase/firestore');
    const q = query(
      collection(db, COLECCION_SMILES),
      where('rol', '==', 'cliente'),
      limit(100)
    );
    const snap = await getDocs(q);

    if (!snap.empty) {
      const remotos = snap.docs.map(d => normalizarCliente({ id: d.id, ...d.data() }));
      _memoriaClientes = remotos;
      savels(STORAGE_KEY, remotos);
      return remotos;
    }
  } catch (err) {
    console.debug('[dataClientes] Lectura remota Firestore de smiles no disponible (usando local/preview):', err?.message || err);
  }
  return obtenerClientes();
}
