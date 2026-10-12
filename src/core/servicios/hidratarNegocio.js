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

  const titulo = datos.titulo || '';
  if (titulo) {
    document.querySelectorAll('[data-negocio-titulo]').forEach(el => {
      el.textContent = titulo;
    });
  }

  // 6. HIDRATAR REDES SOCIALES (Bio-Link / Redes Cards)
  const redes = datos.redes || {};
  if (redes && typeof redes === 'object') {
    const normalizarUrl = (val, tipo) => {
      if (!val || typeof val !== 'string') return '';
      const v = val.trim();
      if (!v) return '';
      if (v.startsWith('http://') || v.startsWith('https://')) return v;
      const h = v.replace(/^[@/]+/, '');
      switch (tipo) {
        case 'youtube': return `https://youtube.com/@${h}`;
        case 'facebook': return `https://facebook.com/${h}`;
        case 'instagram': return `https://instagram.com/${h}`;
        case 'tiktok': return `https://tiktok.com/@${h}`;
        case 'linkedin': return `https://linkedin.com/in/${h}`;
        case 'twitter': return `https://x.com/${h}`;
        case 'web': return `https://${h}`;
        default: return v;
      }
    };

    const mapeoRedes = [
      { id: 'facebook', val: normalizarUrl(redes.facebook || redes.facebookUser, 'facebook') },
      { id: 'instagram', val: normalizarUrl(redes.instagram || redes.instagramUser, 'instagram') },
      { id: 'tiktok', val: normalizarUrl(redes.tiktok || redes.tiktokUser, 'tiktok') },
      { id: 'youtube', val: normalizarUrl(redes.youtube || redes.youtubeUser, 'youtube') },
      { id: 'linkedin', val: normalizarUrl(redes.linkedin || redes.linkedinUser, 'linkedin') },
      { id: 'twitter', val: normalizarUrl(redes.twitter || redes.twitterUser, 'twitter') },
      { id: 'web', val: normalizarUrl(redes.web || redes.webOficial, 'web') },
      { id: 'whatsapp', val: redes.canalWhatsapp || (wsLimpio ? `https://wa.me/${wsLimpio}` : '') }
    ];

    mapeoRedes.forEach(({ id, val }) => {
      document.querySelectorAll(`a[data-red-id="${id}"]`).forEach(a => {
        if (val) {
          a.setAttribute('href', val);
          a.style.display = '';
        } else {
          a.style.display = 'none';
        }
      });
    });

    // Reordenar botones de redes en el DOM: WhatsApp siempre primero que todo (#1), luego el orden del usuario
    const ordenBase = (Array.isArray(datos.redesOrden) && datos.redesOrden.length > 0)
      ? datos.redesOrden.filter(id => id !== 'whatsapp')
      : ['linkedin', 'web', 'instagram', 'facebook', 'tiktok', 'youtube', 'twitter'];

    const ordenFinal = ['whatsapp', ...ordenBase];

    document.querySelectorAll('.redes-lista').forEach(contenedor => {
      const enlaces = Array.from(contenedor.querySelectorAll('a[data-red-id]'));
      const mapa = new Map();
      enlaces.forEach(el => {
        const redId = el.getAttribute('data-red-id');
        if (redId) mapa.set(redId, el);
      });
      ordenFinal.forEach(id => {
        const el = mapa.get(id);
        if (el) {
          contenedor.appendChild(el);
          mapa.delete(id);
        }
      });
      mapa.forEach(el => contenedor.appendChild(el));
    });

    // Hidratar Hero Redes (Handle, Bio y Avatar)
    const handle = redes.instagramUser 
      ? `@${redes.instagramUser.replace(/^@/, '')}`
      : (redes.tiktokUser 
          ? `@${redes.tiktokUser.replace(/^@/, '')}`
          : (redes.youtubeUser 
              ? `@${redes.youtubeUser.replace(/^@/, '')}`
              : (identidad.nombreCorto ? `@${identidad.nombreCorto.toLowerCase().replace(/\s+/g, '')}` : '')));

    document.querySelectorAll('[data-negocio-handle]').forEach(el => {
      if (handle) {
        el.textContent = handle;
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    });

    const bio = datos.subtitulo || identidad.subtitulo || (typeof identidad.bio === 'object' ? identidad.bio?.es : identidad.bio) || datos.bio || '';
    document.querySelectorAll('[data-negocio-bio]').forEach(el => {
      if (bio) {
        el.textContent = bio;
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    });

    // Avatar de Redes: Prioridad 1: Foto Especialista guardada en Negocio (identidad.imagenSede)
    const avatar = identidad.imagenSede || datos.fotoEspecialista || datos.hero?.imagen || identidad.logo || '';
    if (avatar) {
      document.querySelectorAll('[data-negocio-avatar]').forEach(img => {
        img.setAttribute('src', avatar);
      });
    }
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
    const rawLocal = localStorage.getItem('wi_negocio') || localStorage.getItem('minegocio');
    if (rawLocal) {
      const parsed = JSON.parse(rawLocal);
      if (parsed && (parsed.contacto || parsed.identidad || parsed.redes)) {
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
    if ((e.key === 'wi_negocio' || e.key === 'minegocio') && e.newValue) {
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
