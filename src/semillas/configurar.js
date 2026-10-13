// src/semillas/configurar.js
// 🎛️ Tablero de Control Maestro de la Aplicación (Ecosistema Wii)
// Configuración centralizada de capacidades, módulos, canales y parámetros globales.
// 100% JS Nativo · 0ms de latencia · Soporta orden posicional natural y comentarios.

// =============================================================================
// 1. SISTEMA & CONTROL DE ACTUALIZACIONES (Estándar Enterprise 6 Dígitos)
// =============================================================================
export const configurarSistema = {
  id: 'contabilidadwii',
  modeloNegocio: 'servicios_y_asesorias',

  // 🚀 Control de Versión y Despliegues (MMNNPP: 02.00.00 -> 200000)
  version: '2.0.0',
  versionCode: 200000,
  versionNota: 'Golden Boilerplate: Hub unificado, orden posicional y semillas limpias.',
  actualizado: '2026-10-12',

  // 🛡️ Banderas de Estado del Sistema
  modoDemo: false,              // true = modo presentación (protege datos reales)
  modoMantenimiento: false,     // true = aviso temporal de mantenimiento
  temaDefecto: 'futuro',        // 'futuro' (oscuro) | 'luz' (claro)

  // 💰 Parámetros Comerciales y Fiscales
  parametros: {
    moneda: 'PEN',
    simboloMoneda: 'S/',
    pais: 'PE',
    igvTasa: 0.18,
    modalidades: [
      'Online (Videollamada)',
      'Presencial previa cita'
    ],
    regimenesTributarios: [
      'Régimen MYPE Tributario (RMT)',
      'Régimen Especial de Renta (RER)',
      '4ta Categoría (Recibos por Honorarios)',
      'Nuevo RUS (NRUS)',
      'Régimen General (RG)'
    ]
  },

  // 🏷️ Terminología Adaptable al Giro
  terminologia: {
    catalogoTitulo: 'Servicios & Asesorías',
    itemSingular: 'Servicio / Asesoría',
    grupo1Titulo: 'Servicios Mensuales',
    grupo2Titulo: 'Asesorías Puntuales',
    campoEspecialCliente: 'Régimen Tributario',
    comprobanteConceptoDefault: 'Servicios Profesionales y Asesoría Tributaria',
    rolClienteNombre: 'Cliente',
    rolPersonalNombre: 'Especialista',
    buscadorPlaceholder: 'Buscar servicios, asesorías, trámites...'
  }
};

// =============================================================================
// 2. MÓDULOS DE PERSONAL (Backoffice)
// El orden en pantalla es exactamente la posición en el array (Alt + ↑ / ↓)
// Iconos: nombre directo ('store') o 'fab:marca' para redes ('fab:whatsapp')
// =============================================================================
export const configurarPersonal = {
  moduloDefecto: 'dashboard',
  modulos: [
    { id: 'dashboard', nombre: 'Dashboard',   icono: 'chart-pie',           activo: true },
    { id: 'negocio',   nombre: 'Mi negocio',  icono: 'store',               activo: true },
    { id: 'productos', nombre: 'Servicios',   icono: 'box-archive',         activo: true },
    { id: 'galeria',   nombre: 'Galería',     icono: 'images',              activo: true },
    { id: 'correo',    nombre: 'Correo',      icono: 'envelope',            activo: true },
    { id: 'clientes',  nombre: 'Clientes',    icono: 'address-book',        activo: true, badge: '3' },
    { id: 'sunat',     nombre: 'SUNAT',       icono: 'file-invoice-dollar', activo: true },
    { id: 'entradas',  nombre: 'Blog',        icono: 'newspaper',           activo: true },
    { id: 'paginas',   nombre: 'Páginas',     icono: 'file-lines',          activo: true },
    { id: 'whatsapp',  nombre: 'WhatsApp',    icono: 'fab:whatsapp',        activo: true },
    { id: 'personal',  nombre: 'Equipo',      icono: 'users',               activo: true },
    { id: 'notepad',   nombre: 'Notepad',     icono: 'note-sticky',         activo: true },
    { id: 'perfil',    nombre: 'Mi perfil',   icono: 'user-gear',           activo: true },
    { id: 'ajustes',   nombre: 'Ajustes',     icono: 'gear',                activo: true },

    { id: 'ayuda',     nombre: 'Ayuda',       icono: 'headset',             activo: true },
    { id: 'aprender',  nombre: 'Aprender',    icono: 'graduation-cap',      activo: true }
  ]
};

// =============================================================================
// 3. MÓDULOS DE CLIENTE (Portal del Cliente)
// =============================================================================
export const configurarCliente = {
  moduloDefecto: 'pedidos',
  modulos: [
    { id: 'pedidos',   nombre: 'Servicios', icono: 'briefcase', activo: true },
    { id: 'cuenta',    nombre: 'Mi Cuenta', icono: 'id-card',   activo: true },
    { id: 'direccion', nombre: 'Domicilio ', icono: 'building',  activo: true },
    { id: 'soporte',   nombre: 'Soporte',    icono: 'headset',   activo: true }
  ]
};

// =============================================================================
// 4. CANALES DE REDES (Bio-Link Oficial & Enlaces Directos)
// =============================================================================
export const configurarRedes = {
  canales: [
    { id: 'whatsapp',  nombre: 'WhatsApp',    icono: 'fab:whatsapp',    badge: 'Directo',     activo: true },
    { id: 'linkedin',  nombre: 'LinkedIn',    icono: 'fab:linkedin-in', badge: 'Profesional', activo: true },
    { id: 'web',       nombre: 'Web Oficial',  icono: 'globe',           badge: 'Portal Web',  activo: true },
    { id: 'facebook',  nombre: 'Facebook',    icono: 'fab:facebook-f',  badge: 'Página',      activo: true },
    { id: 'instagram', nombre: 'Instagram',   icono: 'fab:instagram',   badge: 'Social',      activo: true },
    { id: 'tiktok',    nombre: 'TikTok',      icono: 'fab:tiktok',      badge: 'Videos',      activo: true },
    { id: 'youtube',   nombre: 'YouTube',     icono: 'fab:youtube',     badge: 'Canal',       activo: true },
    { id: 'twitter',   nombre: 'X / Twitter', icono: 'fab:x-twitter',   badge: 'Noticias',    activo: true }
  ]
};

// =============================================================================
// 5. HELPERS INTELIGENTES DE ALTO RENDIMIENTO (0ms)
// =============================================================================

/**
 * Resuelve la clase FontAwesome normalizando 'chart-pie' a 'fa-solid fa-chart-pie'
 * o 'fab:whatsapp' a 'fa-brands fa-whatsapp'
 * @param {string} ico
 * @returns {string}
 */
export const resolverIcono = (ico = '') => {
  if (!ico) return '';
  if (ico.includes('fa-')) return ico;
  if (ico.startsWith('fab:')) return `fa-brands fa-${ico.slice(4)}`;
  return `fa-solid fa-${ico}`;
};

/**
 * Consulta si un módulo de Personal está activo en el sistema
 * @param {string} id - Identificador del módulo ('sunat', 'correo', etc.)
 * @returns {boolean}
 */
export const tieneCapacidad = (id) =>
  configurarPersonal.modulos.some(m => m.id === id && m.activo);

/**
 * Obtiene los módulos activos de Personal en su orden posicional natural.
 * Inyecta icono e iconoClase resueltos para 100% retrocompatibilidad.
 * @returns {Array}
 */
export const getModulosPersonal = () =>
  configurarPersonal.modulos
    .filter(m => m.activo)
    .map(m => {
      const clase = resolverIcono(m.icono);
      return { ...m, icono: clase, iconoClase: clase };
    });

/**
 * Obtiene los módulos activos del Portal Cliente en su orden posicional natural.
 * Inyecta icono e iconoClase resueltos para 100% retrocompatibilidad.
 * @returns {Array}
 */
export const getModulosCliente = () =>
  configurarCliente.modulos
    .filter(m => m.activo)
    .map(m => {
      const clase = resolverIcono(m.icono);
      return { ...m, icono: clase, iconoClase: clase };
    });

/**
 * Obtiene los canales de redes activos en su orden posicional natural.
 * Inyecta icono e iconoClase resueltos para 100% retrocompatibilidad.
 * @returns {Array}
 */
export const getCanalesRedes = () =>
  configurarRedes.canales
    .filter(c => c.activo)
    .map(c => {
      const clase = resolverIcono(c.icono);
      return { ...c, icono: clase, iconoClase: clase };
    });

// Exportación por defecto consolidada para máxima interoperabilidad
export default {
  sistema: configurarSistema,
  personal: configurarPersonal,
  cliente: configurarCliente,
  redes: configurarRedes,
  resolverIcono,
  tieneCapacidad,
  getModulosPersonal,
  getModulosCliente,
  getCanalesRedes
};
