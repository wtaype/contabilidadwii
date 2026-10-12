// src/feature/personal/modulos/negocio/dataNegocio.js
// 🎯 Capa Canónica Local-First de Negocio: Firestore + Caché Local + Semilla src/semillas/negocio.json
// Colección: 'negocio' · Documento: 'principal'
// Integrado con @widev y Firebase SDK

import { savels, getls, formatearFechaParaInput } from '@widev';
import negocioSemilla from '../../../../semillas/negocio.json';

export const STORAGE_KEY = 'wi_negocio';
export const OLD_STORAGE_KEY = 'minegocio';
export const COLECCION_NEGOCIO = 'negocio';
export const DOC_NEGOCIO_ID = 'principal';

// 1. Lector canónico de semilla inicial de despegue (lee src/semillas/negocio.json)
export function obtenerSemillaLocal() {
  return negocioSemilla && typeof negocioSemilla === 'object' ? negocioSemilla : null;
}

// 2. Parser ultraligero de campos de la REST API de Firestore
export function parseFirestoreDoc(fields = {}) {
  const res = {};
  for (const [k, v] of Object.entries(fields)) {
    if (v.stringValue !== undefined) res[k] = v.stringValue;
    else if (v.integerValue !== undefined) res[k] = parseInt(v.integerValue, 10);
    else if (v.doubleValue !== undefined) res[k] = parseFloat(v.doubleValue);
    else if (v.booleanValue !== undefined) res[k] = v.booleanValue;
    else if (v.timestampValue !== undefined) res[k] = v.timestampValue;
    else if (v.mapValue) res[k] = parseFirestoreDoc(v.mapValue.fields || {});
    else if (v.arrayValue) res[k] = (v.arrayValue.values || []).map(item => item.mapValue ? parseFirestoreDoc(item.mapValue.fields || {}) : Object.values(item)[0]);
  }
  return res;
}

// 3. Normalizador neutro: SOLO UN FALLBACK (src/semillas/negocio.json). Cero textos quemados en código.
export function normalizarConfig(c = {}) {
  const cfg = c && typeof c === 'object' ? c : {};
  const base = negocioSemilla || {};

  const bioBase = base.identidad?.bio || {};
  const bioCfg = cfg.identidad?.bio;
  const bioEs = (typeof bioCfg === 'object' && bioCfg?.es) || (typeof bioCfg === 'string' && bioCfg) || bioBase.es || '';
  const bioEn = (typeof bioCfg === 'object' && bioCfg?.en) || cfg.identidad?.bioEn || bioBase.en || '';

  const wsBase = base.contacto?.whatsappMensaje;
  const wsCfg = cfg.contacto?.whatsappMensaje;
  const wsEs = (typeof wsCfg === 'object' && wsCfg?.es) || (typeof wsCfg === 'string' && wsCfg) || (typeof wsBase === 'object' ? wsBase?.es : wsBase) || '';
  const wsEn = (typeof wsCfg === 'object' && wsCfg?.en) || cfg.contacto?.whatsappMensajeEn || (typeof wsBase === 'object' ? wsBase?.en : '') || '';

  const horBase = base.contacto?.horario || {};
  const horCfg = cfg.contacto?.horario;
  const horEs = (typeof horCfg === 'object' && horCfg?.es) || (typeof horCfg === 'string' && horCfg) || horBase.es || '';
  const horEn = (typeof horCfg === 'object' && horCfg?.en) || cfg.contacto?.horarioEn || horBase.en || '';

  return {
    id: cfg.id || base.id || DOC_NEGOCIO_ID,
    moneda: cfg.moneda || base.moneda || 'PEN',
    idiomaPrincipal: cfg.idiomaPrincipal || cfg.idiomaDefecto || base.idiomaPrincipal || base.idiomaDefecto || 'es',
    idiomas: Array.isArray(cfg.idiomas) && cfg.idiomas.length > 0 ? cfg.idiomas : (Array.isArray(cfg.idiomasSoportados) ? cfg.idiomasSoportados : (base.idiomas || base.idiomasSoportados || ['es', 'en'])),
    titulo: cfg.titulo || base.titulo || '',
    subtitulo: cfg.subtitulo ?? base.subtitulo ?? '',
    hero: {
      titulo: cfg.hero?.titulo ?? base.hero?.titulo ?? '',
      subtitulo: cfg.hero?.subtitulo ?? base.hero?.subtitulo ?? '',
      imagen: cfg.hero?.imagen ?? base.hero?.imagen ?? '',
      alt: cfg.hero?.alt ?? base.hero?.alt ?? '',
      precioHero: cfg.hero?.precioHero ?? base.hero?.precioHero ?? '',
      servicio: cfg.hero?.servicio ?? base.hero?.servicio ?? '',
      descripcion: cfg.hero?.descripcion ?? base.hero?.descripcion ?? ''
    },
    identidad: {
      nombre: cfg.identidad?.nombre || base.identidad?.nombre || '',
      nombreCorto: cfg.identidad?.nombreCorto || base.identidad?.nombreCorto || '',
      subtitulo: cfg.identidad?.subtitulo || base.identidad?.subtitulo || '',
      especialista: cfg.identidad?.especialista || base.identidad?.especialista || '',
      colegiatura: cfg.identidad?.colegiatura || base.identidad?.colegiatura || '',
      cargo: cfg.identidad?.cargo || cfg.identidad?.titulo || base.identidad?.cargo || base.identidad?.titulo || '',
      titulo: cfg.identidad?.titulo || cfg.identidad?.cargo || base.identidad?.titulo || base.identidad?.cargo || '',
      grado: cfg.identidad?.grado || base.identidad?.grado || '',
      enfoques: cfg.identidad?.enfoques || base.identidad?.enfoques || '',
      nombreEn: cfg.identidad?.nombreEn || base.identidad?.nombreEn || base.identidad?.nombre || '',
      nombreCortoEn: cfg.identidad?.nombreCortoEn || base.identidad?.nombreCortoEn || base.identidad?.nombreCorto || '',
      enfoquesEn: cfg.identidad?.enfoquesEn || base.identidad?.enfoquesEn || base.identidad?.enfoques || '',
      bio: {
        es: bioEs,
        en: bioEn
      },
      lanzamientoFecha: cfg.identidad?.lanzamientoFecha || base.identidad?.lanzamientoFecha || '',
      logo: cfg.identidad?.logo || base.identidad?.logo || '',
      logoFull: cfg.identidad?.logoFull || base.identidad?.logoFull || '',
      imagenSede: cfg.identidad?.imagenSede || base.identidad?.imagenSede || ''
    },
    contacto: {
      pais: cfg.contacto?.pais || cfg.ubicacion?.pais || base.contacto?.pais || 'PE',
      paisCode: cfg.contacto?.paisCode || base.contacto?.paisCode || '51',
      telefono: cfg.contacto?.telefono || base.contacto?.telefono || '',
      telefonoFijo: cfg.contacto?.telefonoFijo || base.contacto?.telefonoFijo || '',
      telefonoSecundario: cfg.contacto?.telefonoSecundario ?? base.contacto?.telefonoSecundario ?? '',
      whatsapp: cfg.contacto?.whatsapp || base.contacto?.whatsapp || '',
      email: cfg.contacto?.email || base.contacto?.email || '',
      whatsappMensaje: {
        es: wsEs,
        en: wsEn
      },
      horario: {
        es: horEs,
        en: horEn
      }
    },
    horarios: {
      semana: {
        abre: cfg.horarios?.semana?.abre || base.horarios?.semana?.abre || '',
        cierra: cfg.horarios?.semana?.cierra || base.horarios?.semana?.cierra || ''
      },
      sabado: {
        abre: cfg.horarios?.sabado?.abre || base.horarios?.sabado?.abre || '',
        cierra: cfg.horarios?.sabado?.cierra || base.horarios?.sabado?.cierra || ''
      }
    },
    ubicacion: {
      direccion: cfg.ubicacion?.direccion || base.ubicacion?.direccion || '',
      referencia: cfg.ubicacion?.referencia || base.ubicacion?.referencia || '',
      distrito: cfg.ubicacion?.distrito || base.ubicacion?.distrito || '',
      ciudad: cfg.ubicacion?.ciudad || base.ubicacion?.ciudad || '',
      pais: cfg.ubicacion?.pais || base.ubicacion?.pais || '',
      codigoPostal: cfg.ubicacion?.codigoPostal || base.ubicacion?.codigoPostal || '',
      mapsUrl: cfg.ubicacion?.mapsUrl || base.ubicacion?.mapsUrl || '',
      coordenadas: {
        lat: Number(cfg.ubicacion?.coordenadas?.lat ?? base.ubicacion?.coordenadas?.lat ?? 0),
        lng: Number(cfg.ubicacion?.coordenadas?.lng ?? base.ubicacion?.coordenadas?.lng ?? 0)
      }
    },
    sedes: Array.isArray(cfg.sedes) && cfg.sedes.length > 0 ? cfg.sedes : (Array.isArray(base.sedes) ? base.sedes : []),
    metricas: {
      clientes: cfg.metricas?.clientes || cfg.metricas?.pacientes || base.metricas?.clientes || base.metricas?.pacientes || '+240',
      pacientes: cfg.metricas?.pacientes || cfg.metricas?.clientes || base.metricas?.pacientes || '+240',
      confidencialidad: cfg.metricas?.confidencialidad || base.metricas?.confidencialidad || '100%',
      satisfaccion: cfg.metricas?.satisfaccion || base.metricas?.satisfaccion || '99.4%',
      years: cfg.metricas?.years || base.metricas?.years || '12+'
    },
    redes: (() => {
      const bRedes = base.redes || {};
      const cRedes = cfg.redes;

      // Si no existe configuración de redes (inicio virgen), usar valores de semilla
      if (!cRedes || typeof cRedes !== 'object') {
        return {
          youtube: bRedes.youtube || '',
          youtubeUser: bRedes.youtubeUser || '',
          facebook: bRedes.facebook || '',
          facebookUser: bRedes.facebookUser || '',
          instagram: bRedes.instagram || '',
          instagramUser: bRedes.instagramUser || '',
          tiktok: bRedes.tiktok || '',
          tiktokUser: bRedes.tiktokUser || '',
          canalWhatsapp: bRedes.canalWhatsapp || bRedes.whatsapp || '',
          web: bRedes.web || bRedes.webOficial || '',
          linkedin: bRedes.linkedin || '',
          linkedinUser: bRedes.linkedinUser || '',
          twitter: bRedes.twitter || '',
          twitterUser: bRedes.twitterUser || ''
        };
      }

      // Si cRedes existe, se respeta estrictamente lo que guardó el usuario (incluso vacío "")
      const valorRed = (k, alt) => {
        if (cRedes[k] !== undefined && cRedes[k] !== null) return cRedes[k];
        if (alt && cRedes[alt] !== undefined && cRedes[alt] !== null) return cRedes[alt];
        return '';
      };

      return {
        youtube: valorRed('youtube'),
        youtubeUser: valorRed('youtubeUser'),
        facebook: valorRed('facebook'),
        facebookUser: valorRed('facebookUser'),
        instagram: valorRed('instagram'),
        instagramUser: valorRed('instagramUser'),
        tiktok: valorRed('tiktok'),
        tiktokUser: valorRed('tiktokUser'),
        canalWhatsapp: valorRed('canalWhatsapp', 'whatsapp'),
        web: valorRed('web', 'webOficial'),
        linkedin: valorRed('linkedin'),
        linkedinUser: valorRed('linkedinUser'),
        twitter: valorRed('twitter'),
        twitterUser: valorRed('twitterUser')
      };
    })(),
    redesOrden: Array.isArray(cfg.redesOrden) && cfg.redesOrden.length > 0
      ? cfg.redesOrden
      : (Array.isArray(base.redesOrden) && base.redesOrden.length > 0 ? base.redesOrden : ['linkedin', 'web', 'whatsapp', 'instagram', 'facebook', 'tiktok', 'youtube', 'twitter']),
    seo: {
      titulo: {
        es: cfg.seo?.titulo?.es || base.seo?.titulo?.es || '',
        en: cfg.seo?.titulo?.en || base.seo?.titulo?.en || ''
      },
      descripcion: {
        es: cfg.seo?.descripcion?.es || base.seo?.descripcion?.es || '',
        en: cfg.seo?.descripcion?.en || base.seo?.descripcion?.en || ''
      },
      keywords: {
        es: Array.isArray(cfg.seo?.keywords?.es) && cfg.seo.keywords.es.length > 0 ? cfg.seo.keywords.es : (Array.isArray(base.seo?.keywords?.es) ? base.seo.keywords.es : []),
        en: Array.isArray(cfg.seo?.keywords?.en) && cfg.seo.keywords.en.length > 0 ? cfg.seo.keywords.en : (Array.isArray(base.seo?.keywords?.en) ? base.seo.keywords.en : [])
      },
      imagen: cfg.seo?.imagen || base.seo?.imagen || null,
      schema: cfg.seo?.schema || base.seo?.schema || null,
      audiencia: cfg.seo?.audiencia || base.seo?.audiencia || null,
      intencion: cfg.seo?.intencion || base.seo?.intencion || null
    },
    userId: cfg.userId || '',
    actualizado: cfg.actualizado || null
  };
}

// 4. Lectura en tiempo de compilación (Astro SSG / Cloudflare Build) directamente desde la REST API de Firestore
let _datosBuildFirestore = null;
if (typeof window === 'undefined') {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const projectId = import.meta.env.PUBLIC_FIREBASE_PROJECT_ID || 'contabilidadwii';
    const res = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/negocio/principal`, {
      signal: controller.signal
    });
    clearTimeout(timer);
    if (res.ok) {
      const json = await res.json();
      _datosBuildFirestore = parseFirestoreDoc(json.fields || {});
    }
  } catch (err) {
    console.warn('[dataNegocio] Build-time Firestore fetch:', err?.message || err);
  }
}

let _memoriaNegocio = null;

export function getUsuarioActivo() {
  const u = getls('wiSmile') || {};
  return {
    userId: u.uid || u.id || '',
    email: u.email || '',
    autor: u.nombre || u.usuario || ''
  };
}

// Calcula los años de experiencia automáticamente a partir de una fecha YYYY-MM-DD o Timestamp
export function calcularAnosTrayectoria(fechaInput) {
  if (!fechaInput) return '1+';
  let dateObj = null;

  if (fechaInput?.seconds) {
    dateObj = new Date(fechaInput.seconds * 1000);
  } else if (typeof fechaInput === 'string') {
    dateObj = new Date(fechaInput.includes('T') ? fechaInput : `${fechaInput}T12:00:00`);
  } else if (fechaInput instanceof Date) {
    dateObj = fechaInput;
  }

  if (!dateObj || isNaN(dateObj.getTime())) return '1+';
  const dif = new Date().getFullYear() - dateObj.getFullYear();
  return dif > 0 ? `${dif}+` : '1+';
}

/**
 * Obtiene los datos oficiales del negocio:
 * 1. Memoria activa en sesión.
 * 2. Caché local persistente (localStorage 'minegocio').
 * 3. En SSG/Build: Datos vivos directo desde Firestore REST API.
 * 4. Fallback directo a src/infoNegocio.json.
 */
export function obtenerDatosNegocio() {
  if (_memoriaNegocio) {
    return _memoriaNegocio;
  }

  // 1. En el cliente: Revisar caché local primero
  try {
    const local = getls(STORAGE_KEY) || getls(OLD_STORAGE_KEY);
    if (local && typeof local === 'object' && local.identidad && local.identidad.nombre) {
      _memoriaNegocio = normalizarConfig(local);
      return _memoriaNegocio;
    }
  } catch (e) {}

  // 2. En Node (build time de Cloudflare/Astro): usar datos frescos de Firestore REST
  if (_datosBuildFirestore && _datosBuildFirestore.identidad?.nombre) {
    _memoriaNegocio = normalizarConfig(_datosBuildFirestore);
    return _memoriaNegocio;
  }

  // 3. Fallback limpio a src/semillas/negocio.json
  _memoriaNegocio = normalizarConfig(negocioSemilla || {});
  return _memoriaNegocio;
}

export const obtenerNegocioLocal = obtenerDatosNegocio;

/**
 * Guarda en caché local y notifica reactivamente a la UI
 */
export function guardarDatosNegocioLocal(config) {
  try {
    const normalizado = normalizarConfig(config);
    _memoriaNegocio = normalizado;
    savels(STORAGE_KEY, normalizado);
    savels(OLD_STORAGE_KEY, normalizado);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('contabilidad:negocio-actualizado', { detail: normalizado }));
    }
  } catch (e) {}
}

/**
 * Guarda en caché local y sincroniza directamente con Firestore
 */
export function guardarDatosNegocio(input = {}) {
  const actual = obtenerDatosNegocio();
  const usuario = getUsuarioActivo();

  // Parsear fecha de lanzamiento/fundación
  const fechaStr = input.identidad?.lanzamientoFecha || actual.identidad?.lanzamientoFecha || "";
  const yearsCalc = calcularAnosTrayectoria(fechaStr);

  const configActualizada = {
    ...actual,
    id: DOC_NEGOCIO_ID,
    moneda: input.moneda || actual.moneda || 'PEN',
    idiomaPrincipal: input.idiomaPrincipal || actual.idiomaPrincipal || 'es',
    idiomas: Array.isArray(input.idiomas) ? input.idiomas : (actual.idiomas || ['es', 'en']),
    titulo: input.titulo || actual.titulo || '',
    subtitulo: input.subtitulo ?? actual.subtitulo ?? '',
    hero: {
      ...actual.hero,
      ...(input.hero || {})
    },
    identidad: {
      ...actual.identidad,
      ...(input.identidad || {}),
      lanzamientoFecha: fechaStr
    },
    contacto: {
      ...actual.contacto,
      ...(input.contacto || {})
    },
    horarios: {
      ...actual.horarios,
      ...(input.horarios || {})
    },
    ubicacion: {
      ...actual.ubicacion,
      ...(input.ubicacion || {})
    },
    sedes: Array.isArray(input.sedes) ? input.sedes : (actual.sedes || []),
    metricas: {
      ...actual.metricas,
      ...(input.metricas || {}),
      years: yearsCalc
    },
    redes: {
      ...actual.redes,
      ...(input.redes || {})
    },
    redesOrden: Array.isArray(input.redesOrden) ? input.redesOrden : (actual.redesOrden || []),
    seo: {
      ...actual.seo,
      ...(input.seo || {})
    },
    userId: usuario.userId || actual.userId || ''
  };

  // Limpiar campos obsoletos o redundantes
  delete configActualizada.principal;
  delete configActualizada.email;
  delete configActualizada.autor;
  if (configActualizada.identidad) {
    delete configActualizada.identidad.lanzamiento;
    delete configActualizada.identidad.subtitulo;
  }
  if (configActualizada.metricas) {
    delete configActualizada.metricas.pacientes;
  }

  guardarDatosNegocioLocal(configActualizada);

  // Sincronización en segundo plano con Firestore
  sincronizarNegocioFirestore(configActualizada, fechaStr);

  return configActualizada;
}

// Persiste de forma limpia en Firestore
async function sincronizarNegocioFirestore(config, fechaStr) {
  try {
    const { db } = await import('@core/servicios/firebase.js');
    if (!db) return;
    const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');

    const identidadLimpia = { ...(config.identidad || {}) };
    delete identidadLimpia.lanzamiento;
    delete identidadLimpia.subtitulo;

    const metricasLimpias = {
      clientes: config.metricas?.clientes || config.metricas?.pacientes || '+240',
      confidencialidad: config.metricas?.confidencialidad || '100%',
      satisfaccion: config.metricas?.satisfaccion || '99.4%',
      years: config.metricas?.years || '12+'
    };

    const payload = {
      id: DOC_NEGOCIO_ID,
      moneda: config.moneda || 'PEN',
      idiomaPrincipal: config.idiomaPrincipal || 'es',
      idiomas: Array.isArray(config.idiomas) ? config.idiomas : ['es', 'en'],
      titulo: config.titulo || '',
      subtitulo: config.subtitulo || '',
      hero: config.hero || {},
      identidad: identidadLimpia,
      contacto: config.contacto || {},
      horarios: config.horarios || {},
      ubicacion: config.ubicacion || {},
      sedes: config.sedes || [],
      metricas: metricasLimpias,
      redes: config.redes || {},
      redesOrden: Array.isArray(config.redesOrden) ? config.redesOrden : [],
      seo: config.seo || {},
      userId: config.userId || '',
      actualizado: serverTimestamp()
    };

    // Reemplaza el documento completo en la colección 'negocio' -> 'principal'
    await setDoc(doc(db, COLECCION_NEGOCIO, DOC_NEGOCIO_ID), payload);
  } catch (err) {
    console.warn('[dataNegocio] Sincronización diferida Firestore:', err?.message || err);
  }
}

/**
 * Carga datos frescos desde Firestore en cliente y actualiza la caché local
 */
export async function sincronizarDesdeFirestore() {
  try {
    const { db } = await import('@core/servicios/firebase.js');
    if (!db) return normalizarConfig(obtenerSemillaLocal());
    const { doc, getDoc } = await import('firebase/firestore');

    const snap = await getDoc(doc(db, COLECCION_NEGOCIO, DOC_NEGOCIO_ID));
    if (snap.exists()) {
      const data = snap.data();
      let fechaLanz = "";
      if (data.identidad?.lanzamiento) {
        fechaLanz = formatearFechaParaInput(data.identidad.lanzamiento);
      } else if (data.identidad?.lanzamientoFecha) {
        fechaLanz = data.identidad.lanzamientoFecha;
      }
      const normalizado = normalizarConfig({
        ...data,
        identidad: {
          ...data.identidad,
          lanzamientoFecha: fechaLanz
        }
      });
      guardarDatosNegocioLocal(normalizado);
      return normalizado;
    } else {
      // Documento aún no creado en Firestore: Usar semilla de infoNegocio.json
      const semilla = normalizarConfig(obtenerSemillaLocal());
      return semilla;
    }
  } catch (err) {
    console.warn('[dataNegocio] Lectura Firestore:', err?.message || err);
  }
  return normalizarConfig(obtenerSemillaLocal());
}

export const consultarNegocioDesdeFirestore = sincronizarDesdeFirestore;
