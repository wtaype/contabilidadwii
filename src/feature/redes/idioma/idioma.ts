// src/feature/redes/idioma/idioma.ts
// 🌐 Motor de Internacionalización para Feature Redes (Bio-Link)
import es from './es.json';
import en from './en.json';
import { buildRuta as coreBuildRuta, DEFAULT_LANG } from '../../../core/idioma/idioma';

export const IDIOMA_DEFAULT = DEFAULT_LANG || 'es';

const locales: Record<string, typeof es> = {
  es,
  en
};

export function resolverIdiomaRedes(lang: string = IDIOMA_DEFAULT): typeof es {
  return locales[lang] || locales[IDIOMA_DEFAULT] || es;
}

export function buildRuta(ruta: string = '/', lang: string = IDIOMA_DEFAULT): string {
  return coreBuildRuta(ruta, lang);
}

export { es, en };
export default resolverIdiomaRedes;
