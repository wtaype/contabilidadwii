// src/feature/personal/modulos/clientes/dataClientes.js
// 🎯 Gestor Canónico Local-First para Directorio CRM Tributario (Estudio Cusihuaman)
// Prioridad: 1° Firestore REST ('clientes') · 2° Semilla src/semillas/clientes.json · Caché Local
// 100% JS Nativo · Integrado con @widev y Firebase

import { getls, savels } from '@widev';
import clientesSemilla from '../../../../semillas/clientes.json';

export const STORAGE_KEY = 'minegocio_crm_clientes';
export const COLECCION_CLIENTES = 'clientes';

// Memoria volátil
let _memoriaClientes = null;

/**
 * Normaliza los datos de un cliente contable
 */
export function normalizarCliente(c = {}) {
  const ruc = String(c.documento || '').trim();
  const ultimoDigito = ruc.length >= 1 ? parseInt(ruc.slice(-1), 10) : (c.ultimoDigitoRuc ?? 0);

  return {
    id: c.id || `cli_${Date.now()}`,
    nombre: c.nombre || 'Cliente Contable',
    contacto: c.contacto || c.nombre || '',
    documentoTipo: c.documentoTipo || (ruc.length === 11 ? 'RUC' : 'DNI'),
    documento: ruc,
    celular: c.celular || '',
    email: c.email || '',
    direccion: c.direccion || 'Surquillo, Lima',
    regimenTributario: c.regimenTributario || 'Régimen MYPE Tributario (RMT)',
    servicioContratado: c.servicioContratado || 'Contabilidad Mensual MYPE & SIRE',
    honorarioPEN: parseFloat(c.honorarioPEN) || 150.00,
    ultimoDigitoRuc: isNaN(ultimoDigito) ? 0 : ultimoDigito,
    estadoTributario: c.estadoTributario || 'al_dia', // 'al_dia' | 'pendiente' | 'por_vencer'
    fechaInicio: c.fechaInicio || 'Ene 2026',
    observaciones: c.observaciones || 'Declaraciones mensuales y libros electrónicos al día.',
    avatar: c.avatar || 'https://imgwii.web.app/smile.avif'
  };
}

/**
 * Obtiene la lista de clientes (Caché local primero, luego semilla)
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

  const inicial = (Array.isArray(clientesSemilla) ? clientesSemilla : []).map(normalizarCliente);
  _memoriaClientes = inicial;
  savels(STORAGE_KEY, inicial);
  return _memoriaClientes;
}

/**
 * Guarda o actualiza un cliente en caché local y sincroniza en Firestore
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

  // Sincronizar asíncronamente con Firestore
  try {
    const { db } = await import('@core/servicios/firebase.js');
    if (db) {
      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
      await setDoc(doc(db, COLECCION_CLIENTES, normalizado.id), {
        ...normalizado,
        actualizado: serverTimestamp()
      }, { merge: true });
    }
  } catch (err) {
    console.warn('[dataClientes] Error al sincronizar con Firestore:', err?.message || err);
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
      await deleteDoc(doc(db, COLECCION_CLIENTES, id));
    }
  } catch (err) {
    console.warn('[dataClientes] Error al eliminar de Firestore:', err?.message || err);
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
    const { db } = await import('@core/servicios/firebase.js');
    if (!db) return obtenerClientes();

    const { collection, getDocs, query, limit } = await import('firebase/firestore');
    const q = query(collection(db, COLECCION_CLIENTES), limit(100));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const remotos = snap.docs.map(d => normalizarCliente({ id: d.id, ...d.data() }));
      _memoriaClientes = remotos;
      savels(STORAGE_KEY, remotos);
      return remotos;
    }
  } catch (err) {
    console.warn('[dataClientes] Lectura remota Firestore:', err?.message || err);
  }
  return obtenerClientes();
}
