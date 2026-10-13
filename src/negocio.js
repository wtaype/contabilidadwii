// src/negocio.js
// 🎯 Fachada Canónica, Reactiva y Universal de Negocio y Servicios (Ecosistema Wii)
// Fuente Primaria: Firestore ('negocio/principal' y 'servicios')
// Respaldo Local-First: LocalStorage ('wi_negocio', 'wi_servicios')
// Respaldo Semilla Offline: src/semillas/negocio.json, servicios.json, configurar.js
// 100% Cero Inversión de Dependencias: No depende de ningún feature interno.

import negocioSemilla from './semillas/negocio.json';
import serviciosSemilla from './semillas/servicios.json';
import {
  configurarSistema,
  configurarPersonal,
  configurarCliente,
  configurarRedes,
  resolverIcono,
  tieneCapacidad,
  getModulosPersonal,
  getModulosCliente,
  getCanalesRedes
} from './semillas/configurar.js';

export const configSemilla = configurarSistema;
export {
  configurarSistema,
  configurarPersonal,
  configurarCliente,
  configurarRedes,
  resolverIcono,
  tieneCapacidad,
  getModulosPersonal,
  getModulosCliente,
  getCanalesRedes
};

export const STORAGE_KEY_NEGOCIO = 'wi_negocio';
export const OLD_STORAGE_KEY_NEGOCIO = 'minegocio';
export const STORAGE_KEY_SERVICIOS = 'wi_servicios';
export const OLD_STORAGE_KEY_SERVICIOS = 'contabilidad_servicios';
export const COLECCION_NEGOCIO = 'negocio';
export const DOC_NEGOCIO_ID = 'principal';

// =============================================================================
// 1. PARSER CANÓNICO Y ULTRALIGERO DE CAMPOS FIRESTORE REST API (0 dependencias)
// =============================================================================
export function parseFirestoreDoc(fields = {}) {
  const res = {};
  for (const [k, v] of Object.entries(fields)) {
    if (v.stringValue !== undefined) res[k] = v.stringValue;
    else if (v.integerValue !== undefined) res[k] = parseInt(v.integerValue, 10);
    else if (v.doubleValue !== undefined) res[k] = parseFloat(v.doubleValue);
    else if (v.booleanValue !== undefined) res[k] = v.booleanValue;
    else if (v.timestampValue !== undefined) res[k] = v.timestampValue;
    else if (v.mapValue) res[k] = parseFirestoreDoc(v.mapValue.fields || {});
    else if (v.arrayValue) {
      res[k] = (v.arrayValue.values || []).map(item =>
        item.mapValue ? parseFirestoreDoc(item.mapValue.fields || {}) : Object.values(item)[0]
      );
    }
  }
  return res;
}

// =============================================================================
// 2. NORMALIZADOR COMPACTO DE NEGOCIO (Cascada: Entrada -> Semilla -> Vacío "")
// =============================================================================
export function normalizarConfig(c = {}) {
  const cfg = c && typeof c === 'object' ? c : {};
  const base = negocioSemilla || {};

  const getTxt = (val, fb = '') => {
    if (typeof val === 'string') return val;
    if (typeof val === 'object' && val !== null) return val.es || val.nombre || fb;
    return fb;
  };

  const getTxtEn = (val, fb = '') => {
    if (typeof val === 'object' && val !== null) return val.en || fb;
    return fb;
  };

  return {
    id: cfg.id || base.id || DOC_NEGOCIO_ID,
    moneda: cfg.moneda || base.moneda || configurarSistema.parametros.moneda || 'PEN',
    idiomaPrincipal: cfg.idiomaPrincipal || base.idiomaPrincipal || 'es',
    idiomas: Array.isArray(cfg.idiomas) && cfg.idiomas.length > 0 ? cfg.idiomas : (base.idiomas || ['es', 'en']),
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
      cargo: cfg.identidad?.cargo || cfg.identidad?.titulo || base.identidad?.cargo || '',
      titulo: cfg.identidad?.titulo || cfg.identidad?.cargo || base.identidad?.titulo || '',
      grado: cfg.identidad?.grado || base.identidad?.grado || '',
      enfoques: cfg.identidad?.enfoques || base.identidad?.enfoques || '',
      nombreEn: cfg.identidad?.nombreEn || base.identidad?.nombreEn || base.identidad?.nombre || '',
      nombreCortoEn: cfg.identidad?.nombreCortoEn || base.identidad?.nombreCortoEn || base.identidad?.nombreCorto || '',
      enfoquesEn: cfg.identidad?.enfoquesEn || base.identidad?.enfoquesEn || base.identidad?.enfoques || '',
      bio: {
        es: getTxt(cfg.identidad?.bio, getTxt(base.identidad?.bio, '')),
        en: getTxtEn(cfg.identidad?.bio, getTxtEn(base.identidad?.bio, ''))
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
        es: getTxt(cfg.contacto?.whatsappMensaje, getTxt(base.contacto?.whatsappMensaje, '')),
        en: getTxtEn(cfg.contacto?.whatsappMensaje, getTxtEn(base.contacto?.whatsappMensaje, ''))
      },
      horario: {
        es: getTxt(cfg.contacto?.horario, getTxt(base.contacto?.horario, '')),
        en: getTxtEn(cfg.contacto?.horario, getTxtEn(base.contacto?.horario, ''))
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
      clientes: cfg.metricas?.clientes || base.metricas?.clientes || '',
      satisfaccion: cfg.metricas?.satisfaccion || base.metricas?.satisfaccion || '',
      years: cfg.metricas?.years || base.metricas?.years || ''
    },
    redes: { ...(base.redes || {}), ...(cfg.redes || {}) },
    redesOrden: Array.isArray(cfg.redesOrden) && cfg.redesOrden.length > 0 ? cfg.redesOrden : (base.redesOrden || []),
    seo: { ...(base.seo || {}), ...(cfg.seo || {}) },
    userId: cfg.userId || '',
    actualizado: cfg.actualizado || null
  };
}

// =============================================================================
// 3. CAPA CANÓNICA LOCAL-FIRST DE DATOS DE NEGOCIO
// =============================================================================
let _datosBuildFirestore = null;
if (typeof window === 'undefined') {
  try {
    const projectId = import.meta.env.PUBLIC_FIREBASE_PROJECT_ID || '';
    if (projectId) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/negocio/principal`, {
        signal: controller.signal
      });
      clearTimeout(timer);
      if (res.ok) {
        const json = await res.json();
        _datosBuildFirestore = parseFirestoreDoc(json.fields || {});
      }
    }
  } catch (err) {
    // Si la red no responde en build-time, el fallback a semilla garantiza 0 errores
  }
}

let _memoriaNegocio = null;

export function obtenerDatosNegocio() {
  if (_memoriaNegocio) return _memoriaNegocio;

  // 1. Cliente: LocalStorage primero
  if (typeof window !== 'undefined') {
    try {
      const local = localStorage.getItem(STORAGE_KEY_NEGOCIO) || localStorage.getItem(OLD_STORAGE_KEY_NEGOCIO);
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed && typeof parsed === 'object') {
          _memoriaNegocio = normalizarConfig(parsed);
          return _memoriaNegocio;
        }
      }
    } catch (e) {}
  }

  // 2. SSG Node: Firestore REST fresco
  if (_datosBuildFirestore && _datosBuildFirestore.identidad?.nombre) {
    _memoriaNegocio = normalizarConfig(_datosBuildFirestore);
    return _memoriaNegocio;
  }

  // 3. Semilla offline
  _memoriaNegocio = normalizarConfig(negocioSemilla || {});
  return _memoriaNegocio;
}

export const obtenerNegocioLocal = obtenerDatosNegocio;

/**
 * Sincroniza datos frescos desde Firestore en cliente
 */
export async function sincronizarNegocioDesdeFirestore() {
  if (typeof window === 'undefined') return obtenerDatosNegocio();
  try {
    const { db } = await import('./core/servicios/firebase.js');
    if (!db) return obtenerDatosNegocio();
    const { doc, getDoc } = await import('firebase/firestore');

    const snap = await getDoc(doc(db, COLECCION_NEGOCIO, DOC_NEGOCIO_ID));
    if (snap.exists()) {
      const data = snap.data();
      const normalizado = normalizarConfig(data);
      _memoriaNegocio = normalizado;
      try {
        localStorage.setItem(STORAGE_KEY_NEGOCIO, JSON.stringify(normalizado));
      } catch (e) {}
      return normalizado;
    }
  } catch (err) {
    // Fallback a Local-First sin romper la interfaz
  }
  return obtenerDatosNegocio();
}

// =============================================================================
// 4. NORMALIZADOR Y CONSULTA CANÓNICA DE PRODUCTOS / SERVICIOS
// =============================================================================
export function normalizarProductoFirestore(docRaw = {}) {
  const item = parseFirestoreDoc(docRaw.fields || {});
  const id = item.id || (docRaw.name ? docRaw.name.split('/').pop() : '');
  const precio = Number(item.precioPEN ?? item.precio ?? item.price ?? 0);

  const getTxt = (v) => (typeof v === 'object' && v !== null ? (v.es || '') : (v || ''));
  const getTxtEn = (v, alt) => (typeof v === 'object' && v !== null ? (v.en || '') : (alt || ''));

  return {
    id,
    tipo: item.tipo || 'servicio',
    nombre: getTxt(item.nombre),
    nombreEn: getTxtEn(item.nombre, item.nombreEn),
    descripcion: getTxt(item.descripcion),
    descripcionEn: getTxtEn(item.descripcion, item.descripcionEn),
    precioPEN: precio,
    duracion: getTxt(item.duracion),
    duracionEn: getTxtEn(item.duracion, item.duracionEn),
    enfoque: item.enfoque || '',
    publico: getTxt(item.publico),
    publicoEn: getTxtEn(item.publico, item.publicoEn),
    modalidad: getTxt(item.modalidad),
    modalidadEn: getTxtEn(item.modalidad, item.modalidadEn),
    garantias: Array.isArray(item.garantias?.es) ? item.garantias.es : (Array.isArray(item.garantias) ? item.garantias : []),
    garantiasEn: Array.isArray(item.garantias?.en) ? item.garantias.en : (Array.isArray(item.garantiasEn) ? item.garantiasEn : []),
    imagen: item.imagen || '',
    badge: getTxt(item.badge),
    badgeEn: getTxtEn(item.badge, item.badgeEn),
    tagClase: item.tagClase || 'badge-serenidad',
    orden: Number(item.orden ?? 1),
    activo: Boolean(item.activo ?? true)
  };
}

let _serviciosBuildFirestore = Array.isArray(serviciosSemilla) ? serviciosSemilla : [];

export async function consultarProductosFirestoreFresco() {
  if (typeof window !== 'undefined') {
    try {
      const local = localStorage.getItem(STORAGE_KEY_SERVICIOS) || localStorage.getItem(OLD_STORAGE_KEY_SERVICIOS);
      if (local) {
        const parsed = JSON.parse(local);
        const lista = Array.isArray(parsed) ? parsed : (parsed?.value || null);
        if (Array.isArray(lista) && lista.length > 0) return lista;
      }
    } catch (e) {}
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const projectId = import.meta.env.PUBLIC_FIREBASE_PROJECT_ID || 'contabilidadwii';
    const res = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/servicios`, {
      signal: controller.signal
    });
    clearTimeout(timer);
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.documents) && json.documents.length > 0) {
        const prods = json.documents
          .map(d => normalizarProductoFirestore(d))
          .sort((a, b) => (a.orden || 999) - (b.orden || 999));
        _serviciosBuildFirestore = prods;
        return prods;
      }
    }
  } catch (err) {}

  return _serviciosBuildFirestore;
}

if (typeof window === 'undefined') {
  await consultarProductosFirestoreFresco();
}

// =============================================================================
// 5. FACHADA OFICIAL DATOSNEGOCIO (Consumida por Toda la Aplicación)
// =============================================================================
export const datosNegocio = {
  get raw() { return obtenerDatosNegocio(); },
  get id() { return this.raw.id || DOC_NEGOCIO_ID; },
  get titulo() { return this.raw.titulo || this.raw.identidad?.titulo || ''; },
  get subtitulo() { return this.raw.subtitulo || this.raw.identidad?.subtitulo || ''; },
  get idiomaPrincipal() { return this.raw.idiomaPrincipal || 'es'; },
  get idiomas() { return this.raw.idiomas || ['es', 'en']; },
  get nombre() { return this.raw.identidad?.nombre || ''; },
  get nombreCorto() { return this.raw.identidad?.nombreCorto || this.nombre; },
  get hero() { return this.raw.hero || {}; },
  get razonSocial() { return this.nombre; },
  get especialista() { return this.raw.identidad?.especialista || ''; },
  get colegiatura() { return this.raw.identidad?.colegiatura || ''; },
  get cargo() { return this.raw.identidad?.cargo || this.raw.identidad?.titulo || ''; },
  get registroColegio() { return this.colegiatura ? `${this.colegiatura} · Colegiada y Habilitada` : ''; },
  get grado() { return this.raw.identidad?.grado || ''; },
  get enfoques() { return this.raw.identidad?.enfoques || ''; },
  get bio() { return this.raw.identidad?.bio?.es || ''; },
  get logo() { return this.raw.identidad?.logo || ''; },
  get logoCircle() { return this.logo; },
  get logoFull() { return this.raw.identidad?.logoFull || this.logo; },
  get fotoEspecialista() { return this.raw.identidad?.imagenSede || ''; },
  get imagenSede() { return this.fotoEspecialista; },
  get experienciaAnos() { return this.raw.metricas?.years || ''; },
  get moneda() { return this.raw.moneda || configurarSistema.parametros.moneda || 'PEN'; },
  get telefono() { return this.raw.contacto?.telefono || ''; },
  get telefonoMostrado() { return this.telefono; },
  get telefonoLimpio() { return (this.telefono || '').replace(/\D/g, ''); },
  get whatsapp() { return this.raw.contacto?.whatsapp || this.telefonoLimpio; },
  get whatsappLimpio() { return (this.whatsapp || '').replace(/\D/g, ''); },
  get colegiaturaNumero() { return (this.colegiatura || '').replace(/\D/g, ''); },
  get whatsappMensaje() { return this.raw.contacto?.whatsappMensaje?.es || ''; },
  get whatsappMensajeEn() { return this.raw.contacto?.whatsappMensaje?.en || this.whatsappMensaje; },
  getWhatsappMensaje(idioma = 'es') {
    return idioma === 'en' ? this.whatsappMensajeEn : this.whatsappMensaje;
  },
  get email() { return this.raw.contacto?.email || ''; },
  get redes() { return this.raw.redes || {}; },
  get redesOrden() { return this.raw.redesOrden || []; },
  get paisCode() { return this.raw.contacto?.paisCode || '51'; },
  get direccionSede() { return this.raw.ubicacion?.direccion || ''; },
  get distritoSede() { return this.raw.ubicacion?.distrito || ''; },
  get ciudad() { return this.raw.ubicacion?.ciudad || ''; },
  get pais() { return this.raw.contacto?.pais || this.raw.ubicacion?.pais || 'PE'; },
  get codigoPostal() { return this.raw.ubicacion?.codigoPostal || ''; },
  get mapsUrl() { return this.raw.ubicacion?.mapsUrl || ''; },
  get coordenadas() { return this.raw.ubicacion?.coordenadas || { lat: 0, lng: 0 }; },
  get horario() { return this.raw.contacto?.horario?.es || ''; },
  get horarioEn() { return this.raw.contacto?.horario?.en || this.horario; },
  getHorario(idioma = 'es') {
    return idioma === 'en' ? this.horarioEn : this.horario;
  },
  get horarios() { return this.raw.horarios || {}; },
  get sedes() { return this.raw.sedes || []; },
  get distritos() {
    return this.sedes.map(s => ({
      id: s.id || s.nombre?.toLowerCase().replace(/\s+/g, '-'),
      nombre: s.nombre,
      tiempo: s.modalidad || s.atencion || '',
      tag: s.modalidad || s.tag || '',
      tagEn: s.modalidad === 'Virtual' ? 'Online' : 'In-Person'
    }));
  },
  get config() { return configurarSistema; },
  get metricas() { return this.raw.metricas || {}; },
  get productos() {
    return _serviciosBuildFirestore && _serviciosBuildFirestore.length > 0 ? _serviciosBuildFirestore : serviciosSemilla;
  },
  get servicios() {
    return this.productos.filter(p => p.tipo === 'servicio' && p.activo !== false);
  },
  get asesorias() {
    return this.productos.filter(p => (p.tipo === 'asesoria' || p.tipo === 'taller') && p.activo !== false);
  },
  get talleres() { return this.asesorias; },
  get todosServicios() { return this.productos; },
  get seo() { return this.raw.seo || null; },
  get mediosPago() {
    return [
      { id: 'efectivo', nombre: 'Efectivo', icon: 'fa-money-bill-wave', desc: 'Pago en oficina' },
      { id: 'yape', nombre: 'Yape', icon: 'fa-mobile-screen-button', desc: 'Billetera digital' },
      { id: 'plin', nombre: 'Plin', icon: 'fa-mobile-screen-button', desc: 'Billetera digital' },
      { id: 'transferencia', nombre: 'Transferencia Bancaria', icon: 'fa-building-columns', desc: 'BCP y otros bancos' }
    ];
  }
};

export const MEDIOS_PAGO_BASE = datosNegocio.mediosPago;

export default datosNegocio;