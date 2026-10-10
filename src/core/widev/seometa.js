// src/core/widev/seometa.js
// seometa v10.2: Gestor dinámico universal de metaetiquetas SEO y Schema.org JSON-LD en el cliente

const setTag = (id, val) => {
  if (typeof document === 'undefined' || val === undefined || val === null) return;
  const el = document.getElementById(id) || document.querySelector(`meta[name="${id}"], meta[property="${id}"]`);
  if (el) el.setAttribute('content', String(val));
};

const setHref = (id, val) => {
  if (typeof document === 'undefined' || !val) return;
  const el = document.getElementById(id) || document.querySelector(`link[rel="${id}"]`);
  if (el) el.setAttribute('href', String(val));
};

/**
 * Gestor dinámico universal de metaetiquetas SEO
 * @param {Object} [config]
 * @param {string} [config.title]
 * @param {string} [config.desc]
 * @param {string} [config.keywords]
 * @param {string} [config.img]
 * @param {string} [config.path]
 * @param {string} [config.url]
 * @param {string} [config.type]
 * @param {string} [config.author]
 * @param {any}    [config.datePublished]
 */
export const setMeta = ({
  title,
  desc,
  keywords,
  img,
  path = '/',
  url = '',
  type = 'WebSite',
  author = '',
  datePublished = null
} = {}) => {
  if (typeof document === 'undefined') return;

  const origin = typeof location !== 'undefined' ? location.origin : '';
  const currentUrl = url || (path ? `${origin}${path.startsWith('/') ? path : `/${path}`}` : (typeof location !== 'undefined' ? location.href : ''));

  const t = title ?? document.title ?? '';
  const d = desc ?? (document.querySelector('meta[name="description"]')?.getAttribute('content') || '');
  const k = keywords ?? (document.querySelector('meta[name="keywords"]')?.getAttribute('content') || '');
  const i = img ?? (document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '');
  const a = author ?? (document.querySelector('meta[name="author"]')?.getAttribute('content') || '');

  if (t) document.title = t;
  if (d) setTag('wi_desc', d);
  if (k) setTag('wi_keywords', k);
  if (currentUrl) setHref('wi_canonical', currentUrl);

  if (t) setTag('wi_og_title', t);
  if (d) setTag('wi_og_desc', d);
  if (currentUrl) setTag('wi_og_url', currentUrl);
  if (i) setTag('wi_og_img', i);

  if (t) setTag('wi_tw_title', t);
  if (d) setTag('wi_tw_desc', d);
  if (i) setTag('wi_tw_img', i);

  // Schema Dinámico
  const oldSchema = document.getElementById('wi_schema_art');
  if (oldSchema) oldSchema.remove();

  if (type === 'Article' && t) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'wi_schema_art';
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": t,
      "datePublished": datePublished ? new Date(datePublished).toISOString() : new Date().toISOString()
    };
    if (i) schemaData.image = i;
    if (a) schemaData.author = { "@type": "Person", "name": a };

    script.textContent = JSON.stringify(schemaData);
    document.head.appendChild(script);
  }
};
