// src/core/servicios/hidratarNegocio.js
// 🌐 Motor de Sincronización e Hidratación Dinámica de Datos de Negocio
// Conecta Firebase Firestore + Local-First con la Web Pública e Inicio en Tiempo Real.
// Cero datos fijos o sueltos: cualquier cambio en Personal se refleja inmediatamente en Inicio.

import { sincronizarDesdeFirestore, obtenerDatosNegocio } from '../../feature/personal/modulos/negocio/dataNegocio.js';

/**
 * Hidrata todos los elementos interactivos del DOM con la ficha oficial de negocio
 * @param {Object} datos - Objeto de configuración normalizado de negocio
 */
export function hidratarNegocioEnDOM(datos) {
  if (!datos || typeof datos !== 'object' || typeof document === 'undefined') return;

  // Cachear en memoria global de ventana para consumo de modales dinámicos
  if (typeof window !== 'undefined') {
    window.__negocioActual = datos;
  }

  const contacto = datos.contacto || {};
  const ubicacion = datos.ubicacion || {};
  const identidad = datos.identidad || {};

  const rawWs = contacto.whatsapp || contacto.whatsappLimpio || '';
  const wsLimpio = String(rawWs).replace(/\D/g, '');

  const telFormateado = contacto.telefono || '';
  const telLimpio = String(contacto.telefonoLimpio || telFormateado).replace(/\D/g, '');

  const direccion = ubicacion.direccion || '';
  const mapsUrl = ubicacion.mapsUrl || '';
  const horario = typeof contacto.horario === 'object' && contacto.horario !== null
    ? (contacto.horario.es || '')
    : (contacto.horario || '');

  const nombre = identidad.nombre || '';
  const especialista = identidad.especialista || '';

  // 1. HIDRATAR TODOS LOS ENLACES DE WHATSAPP (Hero, StickyBar, Catálogo, Asesorías, FAQ, etc.)
  if (wsLimpio) {
    // Reemplaza el número en todos los enlaces wa.me sin tocar el mensaje ?text=...
    document.querySelectorAll('a[href*="wa.me/"]').forEach(a => {
      try {
        const urlActual = a.getAttribute('href') || '';
        const regexWa = /wa\.me\/\d+/;
        if (regexWa.test(urlActual)) {
          a.setAttribute('href', urlActual.replace(regexWa, `wa.me/${wsLimpio}`));
        }
      } catch (e) {}
    });

    // Elementos con data-ws-num (ej. Calculadora, Cotizador)
    document.querySelectorAll('[data-ws-num]').forEach(el => {
      el.setAttribute('data-ws-num', wsLimpio);
    });

    // Textos visibles de WhatsApp
    document.querySelectorAll('[data-negocio-ws-text]').forEach(el => {
      el.textContent = `+${wsLimpio}`;
    });
  }

  // 2. HIDRATAR TELÉFONOS (Enlaces tel: y números mostrados)
  if (telLimpio) {
    document.querySelectorAll('a[href^="tel:"], [data-negocio-tel-link]').forEach(a => {
      a.setAttribute('href', `tel:${telLimpio}`);
    });
  }

  if (telFormateado) {
    document.querySelectorAll('[data-negocio-tel-text], .sos-sub-phone').forEach(el => {
      el.textContent = telFormateado;
    });
  }

  // 3. HIDRATAR DIRECCIÓN Y MAPAS
  if (direccion) {
    document.querySelectorAll('[data-negocio-direccion], [data-negocio-direccion-sede], [data-negocio-direccion-origen]').forEach(el => {
      el.textContent = direccion;
    });
  }

  if (mapsUrl) {
    document.querySelectorAll('[data-negocio-maps], .mapa-btn-action').forEach(a => {
      a.setAttribute('href', mapsUrl);
    });
  }

  // 4. HIDRATAR HORARIOS
  if (horario) {
    document.querySelectorAll('[data-negocio-horario]').forEach(el => {
      el.textContent = horario;
    });
  }

  // 5. HIDRATAR IDENTIDAD Y MARCA
  if (nombre) {
    document.querySelectorAll('[data-negocio-nombre]').forEach(el => {
      el.textContent = nombre;
    });
  }

  if (especialista) {
    document.querySelectorAll('[data-negocio-especialista]').forEach(el => {
      el.textContent = especialista;
    });
  }
}

/**
 * Inicializador global de sincronización:
 * 1. Hidratación instantánea Local-First desde localStorage (0ms).
 * 2. Escucha eventos reactivos ('contabilidad:negocio-actualizado' y 'storage').
 * 3. Consulta en background a Firestore para garantizar datos frescos.
 */
let _sincronizacionIniciada = false;

export function iniciarSincronizacionNegocio() {
  if (typeof window === 'undefined') return;

  // Paso 1: Hidratación inmediata desde localStorage o datos ya cargados
  try {
    const local = localStorage.getItem('minegocio');
    if (local) {
      const parsed = JSON.parse(local);
      if (parsed && (parsed.contacto || parsed.identidad)) {
        hidratarNegocioEnDOM(parsed);
      }
    } else {
      const enMemoria = obtenerDatosNegocio();
      if (enMemoria) {
        hidratarNegocioEnDOM(enMemoria);
      }
    }
  } catch (e) {}

  if (_sincronizacionIniciada) return;
  _sincronizacionIniciada = true;

  // Paso 2: Escuchar evento de actualización disparado desde Personal
  window.addEventListener('contabilidad:negocio-actualizado', (e) => {
    if (e.detail) {
      hidratarNegocioEnDOM(e.detail);
    }
  });

  // Paso 3: Escuchar cambios en otras pestañas / ventanas del navegador
  window.addEventListener('storage', (e) => {
    if (e.key === 'minegocio' && e.newValue) {
      try {
        const actualizado = JSON.parse(e.newValue);
        hidratarNegocioEnDOM(actualizado);
      } catch (err) {}
    }
  });

  // Paso 4: Sincronización en segundo plano con Firebase Firestore
  // Si Firestore tiene datos más recientes, actualiza y re-hidrata
  setTimeout(async () => {
    try {
      const fresco = await sincronizarDesdeFirestore();
      if (fresco) {
        hidratarNegocioEnDOM(fresco);
      }
    } catch (err) {
      // Si la red no está disponible, el Local-First ya cumplió
    }
  }, 100);
}

export default {
  hidratarNegocioEnDOM,
  iniciarSincronizacionNegocio
};
