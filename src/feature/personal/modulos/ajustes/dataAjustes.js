// src/feature/personal/modulos/ajustes/dataAjustes.js
// Gestor de Configuración General del Sistema y Backup (Estudio Cusihuaman)
// 100% JS Nativo · Integrado con @widev

import { getls, savels } from '@widev';

const STORAGE_KEY = 'contabilidad_ajustes_sistema';
const OLD_STORAGE_KEY = 'gaswii_ajustes_sistema';

const AJUSTES_DEFAULT = {
  tiendaAbierta: true,
  mensajeCerrado: 'Estamos fuera de horario de oficina. Nuestro horario de atención es de Lunes a Viernes de 8:30 AM a 7:00 PM y Sábados de 9:00 AM a 1:00 PM.',
  etaMinutos: '15–30',
  costoDelivery: 80.00,
  sonidoPedidos: true,
  notificacionesWebPush: true,
  temaPorDefecto: 'futuro',
  sidebarColapsado: false,
  telefonoContacto: '987 594 558',
  direccionSede: 'Jr. Dante 260, Surquillo, Lima 15047'
};

export function obtenerAjustes() {
  const guardados = getls(STORAGE_KEY) || getls(OLD_STORAGE_KEY);
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
    version: '1.0.0',
    estudio: 'Estudio Cusihuaman - Asesoría Contable & SUNAT',
    sede: 'Sede Surquillo (Jr. Dante 260)',
    ajustes: obtenerAjustes(),
    comprobantes: getls('contabilidad_sunat_comprobantes') || getls('gaswii_sunat_comprobantes') || [],
    clientes: getls('contabilidad_crm_clientes') || getls('gaswii_crm_clientes') || [],
    personal: getls('contabilidad_equipo_personal') || getls('gaswii_equipo_personal') || [],
    entradas: getls('contabilidad_entradas_blog') || getls('gaswii_entradas_blog') || [],
    galeria: getls('contabilidad_galeria_media') || getls('gaswii_galeria_media') || [],
    paginas: getls('contabilidad_paginas_institucionales') || getls('gaswii_paginas_institucionales') || []
  };

  return JSON.stringify(backup, null, 2);
}
