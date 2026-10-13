// src/feature/personal/modulos/ajustes/dataAjustes.js
// Gestor Canónico de Configuración General del Sistema y Backup Universal
// 100% JS Nativo · Integrado con @widev y Semillas Oficiales

import { getls, savels } from '@widev';
import { datosNegocio } from '@/negocio.js';
import negocioSemilla from '../../../../semillas/negocio.json';
import serviciosSemilla from '../../../../semillas/servicios.json';

export const STORAGE_KEY = 'wi_ajustes_sistema';

const AJUSTES_DEFAULT = {
  tiendaAbierta: true,
  mensajeCerrado: 'Estamos fuera de horario de oficina. Revisa nuestros horarios de atención disponibles.',
  etaMinutos: '15–30',
  costoDelivery: 80.00,
  sonidoPedidos: true,
  notificacionesWebPush: true,
  temaPorDefecto: 'futuro',
  sidebarColapsado: false,
  telefonoContacto: datosNegocio.telefono || '',
  direccionSede: datosNegocio.direccionSede || ''
};

export function obtenerAjustes() {
  const guardados = getls(STORAGE_KEY) || getls('contabilidad_ajustes_sistema');
  if (guardados) {
    return { ...AJUSTES_DEFAULT, ...guardados };
  }
  savels(STORAGE_KEY, AJUSTES_DEFAULT);
  return AJUSTES_DEFAULT;
}

export function guardarAjustes(nuevosAjustes) {
  const actual = obtenerAjustes();
  const actualizado = { ...actual, ...nuevosAjustes };
  savels(STORAGE_KEY, actualizado);
  return actualizado;
}

export function generarBackupCompletoJson() {
  const backup = {
    fechaExportacion: new Date().toISOString(),
    version: '2.0.0',
    negocio: datosNegocio.nombre || 'Mi Negocio',
    sede: datosNegocio.direccionSede || '',
    ajustes: obtenerAjustes(),
    comprobantes: getls('wi_sunat_comprobantes') || getls('contabilidad_sunat_comprobantes') || [],
    clientes: getls('wi_crm_clientes') || getls('contabilidad_crm_clientes') || [],
    personal: getls('wi_equipo_personal') || getls('contabilidad_equipo_personal') || [],
    entradas: getls('wi_entradas_blog') || getls('contabilidad_entradas_blog') || [],
    galeria: getls('wi_galeria_media') || getls('contabilidad_galeria_media') || [],
    paginas: getls('wi_paginas_institucionales') || getls('contabilidad_paginas_institucionales') || []
  };

  return JSON.stringify(backup, null, 2);
}

/**
 * ⚡ Siembra / Restaura Firestore y LocalStorage desde las semillas locales
 * Ejecutable 100% desde el frontend para pruebas visuales inmediatas.
 */
export async function sembrarDesdeSemillasFrontend() {
  // 1. Sincronizar en caché local (0ms)
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('wi_negocio', JSON.stringify(negocioSemilla));
      localStorage.setItem('wi_servicios', JSON.stringify(serviciosSemilla));
    }
  } catch (e) {}

  // 2. Sincronizar en Firestore
  try {
    const { db } = await import('@core/servicios/firebase.js');
    if (db) {
      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');

      // Sembrar Negocio Principal
      await setDoc(doc(db, 'negocio', 'principal'), {
        ...negocioSemilla,
        actualizado: serverTimestamp()
      }, { merge: true });

      // Sembrar Servicios
      if (Array.isArray(serviciosSemilla)) {
        for (const srv of serviciosSemilla) {
          if (srv.id) {
            await setDoc(doc(db, 'servicios', srv.id), {
              ...srv,
              actualizado: serverTimestamp()
            }, { merge: true });
          }
        }
      }
    }
  } catch (err) {
    console.warn('[dataAjustes] Siembra Firestore parcial o sin red:', err);
  }

  // 3. Notificar reactivamente a la UI viva
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('contabilidad:negocio-actualizado', { detail: negocioSemilla }));
    window.dispatchEvent(new CustomEvent('wi:negocio-actualizado', { detail: negocioSemilla }));
  }

  return true;
}
