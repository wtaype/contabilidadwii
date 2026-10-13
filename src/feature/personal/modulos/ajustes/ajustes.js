// src/feature/personal/modulos/ajustes/ajustes.js
// Controlador Frontend Autónomo del Módulo Ajustes
// 100% JS Nativo · Integrado con @widev

import { Notificacion, wiSpin, wiConfirmar } from '@widev';
import { obtenerAjustes, guardarAjustes, generarBackupCompletoJson, sembrarDesdeSemillasFrontend } from './dataAjustes.js';

export function inicializarModuloAjustes() {
  const panel = document.getElementById('panel-ajustes');
  if (!panel || panel.dataset.ajustesInit === 'true') return;
  panel.dataset.ajustesInit = 'true';

  // ── Elementos del DOM ──
  const switchTienda = document.getElementById('ajSwitchTienda');
  const labelTienda = document.getElementById('ajLabelTienda');
  const inEta = document.getElementById('ajInpEta');
  const inCostoDelivery = document.getElementById('ajInpCostoDelivery');
  const inTelefono = document.getElementById('ajInpTelefono');
  const inDireccion = document.getElementById('ajInpDireccion');
  const switchSonido = document.getElementById('ajSwitchSonido');
  const switchPush = document.getElementById('ajSwitchPush');
  const btnGuardar = document.getElementById('btnAjGuardar');
  const btnBackupJson = document.getElementById('btnAjBackupJson');
  const btnSembrarFirestore = document.getElementById('btnAjSembrarFirestore');

  // ════════════════════════════════════════════════════════════
  // 1. CARGA INICIAL DE AJUSTES
  // ════════════════════════════════════════════════════════════
  function cargarAjustes() {
    const data = obtenerAjustes();

    if (switchTienda) {
      switchTienda.checked = data.tiendaAbierta;
      actualizarLabelTienda(data.tiendaAbierta);
    }

    if (inEta) inEta.value = data.etaMinutos || '15–30 min';
    if (inCostoDelivery) inCostoDelivery.value = (parseFloat(data.costoDelivery) || 80.00).toFixed(2);
    if (inTelefono) inTelefono.value = data.telefonoContacto || '';
    if (inDireccion) inDireccion.value = data.direccionSede || '';
    if (switchSonido) switchSonido.checked = data.sonidoPedidos;
    if (switchPush) switchPush.checked = data.notificacionesWebPush;
  }

  function actualizarLabelTienda(abierta) {
    if (!labelTienda) return;
    labelTienda.textContent = abierta 
      ? '🟢 Sede Abierta (Recibiendo consultas y citas)' 
      : '🔴 Sede Cerrada (Aviso de fuera de horario visible)';
  }

  switchTienda?.addEventListener('change', () => {
    actualizarLabelTienda(switchTienda.checked);
    guardarAjustes({ tiendaAbierta: switchTienda.checked });
    Notificacion(
      switchTienda.checked ? 'Sede marcada como ABIERTA.' : 'Sede marcada como CERRADA.',
      switchTienda.checked ? 'success' : 'warning',
      2000
    );
  });

  // ════════════════════════════════════════════════════════════
  // 2. GUARDAR PARÁMETROS OPERATIVOS
  // ════════════════════════════════════════════════════════════
  btnGuardar?.addEventListener('click', () => {
    wiSpin(btnGuardar, true, 'Guardando...');

    setTimeout(() => {
      guardarAjustes({
        etaMinutos: inEta?.value?.trim() || '15–30 min',
        costoDelivery: parseFloat(inCostoDelivery?.value) || 80.00,
        telefonoContacto: inTelefono?.value?.trim() || '',
        direccionSede: inDireccion?.value?.trim() || '',
        sonidoPedidos: switchSonido?.checked ?? true,
        notificacionesWebPush: switchPush?.checked ?? true
      });

      wiSpin(btnGuardar, false);
      Notificacion('¡Configuración guardada exitosamente!', 'success');
    }, 400);
  });

  // ════════════════════════════════════════════════════════════
  // 3. DESCARGA DE BACKUP COMPLETO JSON
  // ════════════════════════════════════════════════════════════
  btnBackupJson?.addEventListener('click', () => {
    const jsonStr = generarBackupCompletoJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_${(window.Wii?.negocio?.nombreCorto || 'sistema').toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    Notificacion('¡Copia de seguridad JSON descargada con éxito!', 'success', 2500);
  });

  // ════════════════════════════════════════════════════════════
  // 4. RESTAURAR / SEMBRAR DESDE SEMILLAS (PRUEBAS / RESET)
  // ════════════════════════════════════════════════════════════
  btnSembrarFirestore?.addEventListener('click', async () => {
    const seguro = await wiConfirmar(
      '¿Deseas restaurar la base de datos Firestore y LocalStorage con las semillas oficiales? Esta acción sincronizará los datos iniciales para pruebas en vivo.',
      { titulo: 'Restaurar / Sembrar Semillas', tipo: 'warning', siTexto: 'Sí, Sembrar' }
    );
    if (!seguro) return;

    wiSpin(btnSembrarFirestore, true, 'Sembrando...');
    try {
      await sembrarDesdeSemillasFrontend();
      Notificacion('¡Base de datos y caché sincronizadas exitosamente desde semillas!', 'success', 3000);
      cargarAjustes();
    } catch (e) {
      Notificacion('Error al sincronizar con Firestore: ' + (e?.message || e), 'error');
    } finally {
      wiSpin(btnSembrarFirestore, false);
    }
  });

  // ════════════════════════════════════════════════════════════
  // 5. INICIALIZACIÓN
  // ════════════════════════════════════════════════════════════
  cargarAjustes();
}
