// src/feature/personal/modulos/sunat/dataSunat.js
// 🎯 Capa de Datos Local-First de Comprobantes SUNAT (Estudio Contable Cusihuaman)
// Emisión ágil de Boletas (B001) y Facturas (F001) para servicios contables y asesorías
// 100% JS Nativo · Integrado con @widev y Firebase SDK

import { savels, getls } from '@widev';
import { db } from '@core/servicios/firebase.js';
import { collection, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { obtenerDatosNegocio } from '../negocio/dataNegocio.js';
import comprobantesSemilla from '../../../../semillas/comprobantes.json';
import clientesSemilla from '../../../../semillas/clientes.json';

export const STORAGE_KEY_COMPROBANTES = 'contabilidad_sunat_comprobantes';
export const STORAGE_KEY_CLIENTES_CACHE = 'contabilidad_crm_clientes';
export const COLECCION_COMPROBANTES = 'comprobantes';

// Catálogo de Servicios Contables Predeterminados para 1 Clic
export const SERVICIOS_SUNAT_RAPIDOS = [
  {
    id: 'contabilidad-mensual-mype',
    descripcion: 'Servicio Contable Mensual MYPE & Declaración SIRE',
    precioUnitario: 150.00,
    categoria: 'servicio'
  },
  {
    id: 'asesoria-orientacion-tributaria',
    descripcion: 'Asesoría y Orientación Tributaria Personalizada (1 Hora)',
    precioUnitario: 80.00,
    categoria: 'asesoria'
  },
  {
    id: 'planillas-quinta-categoria',
    descripcion: 'Cálculo de Planillas de Trabajadores y Plame (5ta Cat)',
    precioUnitario: 180.00,
    categoria: 'servicio'
  },
  {
    id: 'regularizacion-multas-sunat',
    descripcion: 'Regularización de Infracción y Subsanación Voluntaria SUNAT',
    precioUnitario: 120.00,
    categoria: 'asesoria'
  },
  {
    id: 'recibos-por-honorarios-cuarta',
    descripcion: 'Declaración y Trámite Formulario 1609 (4ta Cat RHE)',
    precioUnitario: 60.00,
    categoria: 'asesoria'
  }
];

let _memoriaComprobantes = null;

/**
 * Obtiene los comprobantes almacenados en local (o semilla inicial)
 */
export function obtenerComprobantesLocal() {
  if (_memoriaComprobantes && Array.isArray(_memoriaComprobantes) && _memoriaComprobantes.length > 0) {
    return _memoriaComprobantes;
  }

  try {
    const local = getls(STORAGE_KEY_COMPROBANTES);
    if (Array.isArray(local) && local.length > 0) {
      _memoriaComprobantes = local;
      return _memoriaComprobantes;
    }
  } catch (e) {}

  const iniciales = Array.isArray(comprobantesSemilla) && comprobantesSemilla.length > 0
    ? comprobantesSemilla
    : [];
  
  _memoriaComprobantes = iniciales;
  try {
    savels(STORAGE_KEY_COMPROBANTES, iniciales);
  } catch (e) {}

  return _memoriaComprobantes;
}

/**
 * Guarda la lista completa en local
 */
export function guardarComprobantesLocal(lista) {
  _memoriaComprobantes = lista;
  savels(STORAGE_KEY_COMPROBANTES, lista);
  return lista;
}

/**
 * Genera el siguiente correlativo para B001 o F001
 */
export function generarSiguienteCorrelativo(tipo = 'boleta') {
  const comprobantes = obtenerComprobantesLocal();
  const serie = tipo === 'factura' ? 'F001' : 'B001';
  const filtrados = comprobantes.filter(c => c.serie === serie);

  if (filtrados.length === 0) {
    return {
      serie,
      numero: '000101',
      serieNumero: `${serie}-000101`
    };
  }

  const numeros = filtrados.map(c => parseInt(c.numero || '0', 10)).filter(n => !isNaN(n));
  const max = Math.max(...numeros, 0);
  const nuevoNum = String(max + 1).padStart(6, '0');

  return {
    serie,
    numero: nuevoNum,
    serieNumero: `${serie}-${nuevoNum}`
  };
}

/**
 * Guarda un comprobante en local y Firestore
 */
export async function emitirYGuardarComprobante(comprobanteData) {
  const lista = obtenerComprobantesLocal();
  const correlativo = generarSiguienteCorrelativo(comprobanteData.tipo);

  const total = Number(comprobanteData.total || 0);
  const opGravada = Number((total / 1.18).toFixed(2));
  const igv = Number((total - opGravada).toFixed(2));

  const fechaActual = new Date();
  const opcionesFecha = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
  const fechaStr = fechaActual.toLocaleDateString('es-PE', opcionesFecha);

  const nuevo = {
    id: `comp_${Date.now()}`,
    tipo: comprobanteData.tipo || 'boleta',
    serie: correlativo.serie,
    numero: correlativo.numero,
    serieNumero: correlativo.serieNumero,
    fechaEmision: fechaStr,
    fechaISO: fechaActual.toISOString(),
    cliente: {
      nombre: comprobanteData.cliente?.nombre || 'Cliente General',
      documentoTipo: comprobanteData.cliente?.documentoTipo || (comprobanteData.tipo === 'factura' ? 'RUC' : 'DNI'),
      documento: comprobanteData.cliente?.documento || '',
      celular: comprobanteData.cliente?.celular || '',
      direccion: comprobanteData.cliente?.direccion || 'Surquillo / Lima',
      email: comprobanteData.cliente?.email || ''
    },
    items: Array.isArray(comprobanteData.items) && comprobanteData.items.length > 0 ? comprobanteData.items : [
      {
        id: 'contabilidad-mensual-mype',
        descripcion: 'Servicio Contable Mensual MYPE',
        cantidad: 1,
        precioUnitario: total,
        subtotal: total
      }
    ],
    moneda: 'PEN',
    opGravada,
    igv,
    total,
    metodoPago: comprobanteData.metodoPago || 'Transferencia BCP',
    estado: 'pagado',
    observacion: comprobanteData.observacion || 'Servicio contable y tributario prestado conforme a Ley.'
  };

  // 1. Guardar de inmediato en local (Local-First)
  lista.unshift(nuevo);
  guardarComprobantesLocal(lista);

  // 2. Persistir en Firestore en segundo plano
  try {
    if (db) {
      await setDoc(doc(db, COLECCION_COMPROBANTES, nuevo.id), {
        ...nuevo,
        actualizado: serverTimestamp()
      }, { merge: true });
    }
  } catch (err) {
    console.warn('[dataSunat] Error al guardar comprobante en Firestore:', err?.message || err);
  }

  return nuevo;
}

/**
 * Obtiene lista de clientes para autocompletado inteligente
 */
export function obtenerClientesSugerencias() {
  try {
    const guardados = getls(STORAGE_KEY_CLIENTES_CACHE);
    if (Array.isArray(guardados) && guardados.length > 0) return guardados;
  } catch (e) {}

  return Array.isArray(clientesSemilla) ? clientesSemilla : [];
}

/**
 * Sincroniza comprobantes desde Firestore
 */
export async function sincronizarComprobantesFirestore() {
  try {
    if (!db) {
      return { ok: true, origen: 'local', datos: obtenerComprobantesLocal() };
    }

    const colRef = collection(db, COLECCION_COMPROBANTES);
    const snap = await getDocs(colRef);

    if (snap.empty) {
      const locales = obtenerComprobantesLocal();
      if (locales.length > 0) {
        for (const item of locales) {
          try {
            await setDoc(doc(db, COLECCION_COMPROBANTES, item.id), {
              ...item,
              actualizado: serverTimestamp()
            }, { merge: true });
          } catch (e) {}
        }
      }
      return { ok: true, origen: 'semilla_sembrada', datos: locales };
    }

    const remotos = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    remotos.sort((a, b) => new Date(b.fechaISO || 0).getTime() - new Date(a.fechaISO || 0).getTime());
    guardarComprobantesLocal(remotos);
    return { ok: true, origen: 'firestore', datos: remotos };
  } catch (err) {
    console.warn('[dataSunat] Error al sincronizar comprobantes:', err?.message || err);
    return { ok: false, error: err?.message, datos: obtenerComprobantesLocal() };
  }
}

/**
 * Obtiene los datos del emisor
 */
export function obtenerDatosEmisor() {
  const negocio = obtenerDatosNegocio() || {};
  return {
    razonSocial: negocio.identidad?.nombre || 'Lourdes Cusihuaman Gálvez',
    nombreComercial: negocio.identidad?.nombreCorto || 'Estudio Cusihuaman',
    ruc: '10478912345',
    direccion: 'Jr. Dante 260, Surquillo, Lima 15047',
    atencion: 'Atención 100% Online y Presencial previa cita',
    telefono: negocio.contacto?.telefono || '+51 987 594 558',
    email: negocio.contacto?.email || 'contacto@contabilidadwii.com'
  };
}

export default {
  STORAGE_KEY_COMPROBANTES,
  COLECCION_COMPROBANTES,
  SERVICIOS_SUNAT_RAPIDOS,
  obtenerComprobantesLocal,
  guardarComprobantesLocal,
  emitirYGuardarComprobante,
  generarSiguienteCorrelativo,
  obtenerClientesSugerencias,
  sincronizarComprobantesFirestore,
  obtenerDatosEmisor
};
