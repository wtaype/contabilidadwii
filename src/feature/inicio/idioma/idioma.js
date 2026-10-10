// src/feature/inicio/idioma/idioma.js
// 🌐 Motor Orquestador de Internacionalización Federada para Feature Inicio
// Resuelve N idiomas de forma dinámica para cualquier sección hija con fallback inteligente al español.

export const IDIOMA_DEFAULT = 'es';

/**
 * Resuelve y fusiona el diccionario del idioma solicitado para cualquier sección hija.
 * Si el idioma solicitado no existe o le falta alguna clave, aplica fallback automático al español.
 * 
 * @param {Record<string, Record<string, any>>} locales - Mapa de diccionarios locales: { es, en, pt, ... }
 * @param {string} [lang='es'] - Código del idioma solicitado
 * @returns {Record<string, any>} Diccionario final resuelto para la sección
 */
export function resolverIdioma(locales = {}, lang = IDIOMA_DEFAULT) {
  const codigo = locales[lang] ? lang : IDIOMA_DEFAULT;
  const dataBase = locales[IDIOMA_DEFAULT] || {};

  // Si es el idioma por defecto, retorna directamente a 0ms sin clonación
  if (codigo === IDIOMA_DEFAULT) {
    return dataBase;
  }

  const dataLang = locales[codigo] || {};

  // Fusión con fallback: si una clave falta en el idioma objetivo, toma la del español
  return {
    ...dataBase,
    ...dataLang
  };
}

/**
 * Genera la ruta canónica para cualquier idioma y vista.
 * Soporta N idiomas sin condicionales binarios.
 * @param {string} [ruta='/'] - Ruta base relativa (ej: '/', '/personal', '/cliente')
 * @param {string} [lang='es'] - Idioma actual
 * @returns {string} Ruta con prefijo correspondiente
 */
/**
 * Extrae el valor localizado de un campo de negocio, servicio o entidad para N idiomas.
 * Si el campo es objeto { es: '...', en: '...', pt: '...' }, extrae campo[idioma] con fallback al español.
 * Si es string plano o primitivo, lo retorna directamente.
 * 
 * @param {any} campo - Objeto i18n o string plano
 * @param {string} [idioma='es'] - Código de idioma
 * @param {string} [fallback=''] - Valor por defecto
 * @returns {string}
 */
export function resolverIdiomas(campo, idioma = IDIOMA_DEFAULT, fallback = '') {
  if (campo === null || campo === undefined) return fallback;
  if (typeof campo === 'object' && !Array.isArray(campo)) {
    return campo[idioma] || campo[IDIOMA_DEFAULT] || Object.values(campo)[0] || fallback;
  }
  return String(campo);
}

export default resolverIdioma;
