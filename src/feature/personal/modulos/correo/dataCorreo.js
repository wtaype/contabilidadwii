// src/feature/personal/modulos/correo/dataCorreo.js
// 🎯 Capa de Datos Local-First de Envíos de Correo con Sincronización Firestore y Resend API
// Colección: 'correos' · Documento: 'correo_{timestamp}' · 100% JS Nativo · Integrado con @widev

import { savels, getls } from '@widev';
import { db } from '@core/servicios/firebase.js';
import { collection, doc, setDoc, getDocs, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { getUsuarioActivo } from '../negocio/dataNegocio.js';

export const STORAGE_KEY = 'minegocio_correos_historial';
export const STORAGE_KEY_AJUSTES = 'minegocio_correo_ajustes';
export const STORAGE_KEY_RECIBIDOS = 'minegocio_correos_recibidos';
export const STORAGE_KEY_BORRADORES = 'minegocio_correos_borradores';
export const COLECCION_CORREOS = 'correos';

// Memoria volátil en sesión
let _memoriaCorreos = null;

/**
 * Obtiene los ajustes predeterminados de correo
 */
export function obtenerAjustesCorreo() {
  const guardado = getls(STORAGE_KEY_AJUSTES);
  return {
    remitenteNombre: guardado?.remitenteNombre || 'Estudio Cusihuaman',
    remitenteEmail: guardado?.remitenteEmail || 'contacto@contabilidadwii.com',
    responderA: guardado?.responderA || 'contacto@contabilidadwii.com',
    dominio: 'contabilidadwii.com'
  };
}

/**
 * Guarda los ajustes predeterminados de correo
 */
export function guardarAjustesCorreo(nuevos = {}) {
  const actual = obtenerAjustesCorreo();
  const actualizado = { ...actual, ...nuevos };
  savels(STORAGE_KEY_AJUSTES, actualizado);
  return actualizado;
}

/**
 * Obtiene la API Key de Resend (desde variables de entorno)
 */
function getResendApiKey() {
  return (
    import.meta.env.PUBLIC_RESEND_API_KEY ||
    import.meta.env.RESEND_API_KEY ||
    ''
  ).trim();
}

/**
 * Formatea una fecha a formato amigable en español: "21 Sep 2026, 12:38 pm"
 */
function formatearFechaLegible(dateObj = new Date()) {
  const d = dateObj instanceof Date ? dateObj : new Date(dateObj);
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(d);
}

/**
 * Limpia y extrae una dirección de correo válida evitando símbolos extra o envoltorios erróneos
 */
export function limpiarEmail(str = '') {
  if (!str || typeof str !== 'string') return '';
  const match = str.match(/<([^>]+)>/);
  const email = (match ? match[1] : str).trim();
  return email.replace(/[<>\s]/g, '').trim();
}

/**
 * Formatea el remitente estrictamente bajo el estándar requerido por Resend:
 * "Nombre Remitente <email@dominio.com>"
 */
export function formatearRemitente(nombre = '', email = '') {
  const emailPuro = limpiarEmail(email) || 'contacto@contabilidadwii.com';
  const nombrePuro = (nombre || 'Estudio Cusihuaman').replace(/[<>]/g, '').trim();

  return `${nombrePuro} <${emailPuro}>`;
}

/**
 * Obtiene el historial de correos enviados (Caché local primero, luego memoria)
 */
export function obtenerCorreos() {
  if (_memoriaCorreos) return _memoriaCorreos;

  try {
    const local = getls(STORAGE_KEY);
    if (Array.isArray(local)) {
      _memoriaCorreos = local;
      return _memoriaCorreos;
    }
  } catch (e) {}

  _memoriaCorreos = [];
  return _memoriaCorreos;
}

/**
 * Guarda un correo en la caché local
 */
export function guardarCorreoLocal(correo) {
  const actual = obtenerCorreos();
  // Evitar duplicados por ID
  const filtrados = actual.filter(c => c.id !== correo.id);
  const nuevoHistorial = [correo, ...filtrados];
  _memoriaCorreos = nuevoHistorial;
  savels(STORAGE_KEY, nuevoHistorial);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('contabilidad:correo-enviado', { detail: correo }));
  }
}

/**
 * Envía un correo electrónico a través de la API de Resend y lo registra en Firestore 'correos'
 */
export async function enviarCorreo({
  para,
  nombre = '',
  cc = [],
  asunto,
  tipo = 'general',
  mensaje = '',
  html = '',
  pedidoId = '',
  clienteId = '',
  desde = '',
  responderA = ''
} = {}) {
  const apiKey = getResendApiKey();
  if (!apiKey) {
    throw new Error('Falta la clave RESEND_API_KEY en las variables de entorno.');
  }

  if (!para) {
    throw new Error('Debes indicar al menos un correo de destinatario.');
  }

  if (!asunto) {
    throw new Error('El asunto del correo no puede estar vacío.');
  }

  const ajustes = obtenerAjustesCorreo();
  const remitenteFinal = desde 
    ? (desde.includes('<') ? desde : `${ajustes.remitenteNombre} <${limpiarEmail(desde)}>`)
    : formatearRemitente(ajustes.remitenteNombre, ajustes.remitenteEmail);

  const responderAFinal = responderA 
    ? limpiarEmail(responderA) 
    : (limpiarEmail(ajustes.responderA) || 'contacto@contabilidadwii.com');

  // Limpiar y asegurar formato de los destinatarios
  const rawDestinatarios = Array.isArray(para)
    ? para
    : [para];

  const destinatariosArray = rawDestinatarios
    .map(p => {
      const emailLimpio = limpiarEmail(p);
      return emailLimpio;
    })
    .filter(Boolean);

  if (destinatariosArray.length === 0) {
    throw new Error('El correo del destinatario no tiene un formato válido.');
  }

  // Limpiar y asegurar formato de las copias (CC)
  const rawCc = Array.isArray(cc)
    ? cc
    : (typeof cc === 'string' && cc ? cc.split(',') : []);

  const ccArray = rawCc
    .map(c => limpiarEmail(c))
    .filter(Boolean);

  // 1. Enviar a través de la API REST oficial de Resend
  const payloadResend = {
    from: remitenteFinal,
    to: destinatariosArray,
    subject: asunto,
    html: html || `<p>${mensaje.replace(/\n/g, '<br/>')}</p>`
  };

  if (ccArray.length > 0) {
    payloadResend.cc = ccArray;
  }
  if (responderAFinal) {
    payloadResend.reply_to = responderAFinal;
  }

  let respuestaResend = null;
  try {
    const endpoint = 'https://gaswii-correo.lourdesinformatica10.workers.dev/enviar';

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payloadResend)
    });

    respuestaResend = await res.json();

    if (!res.ok) {
      let errorMsg = respuestaResend?.message || `Error en Resend HTTP ${res.status}`;
      if (errorMsg.includes('Invalid `from` field') || errorMsg.includes('Invalid `to` field')) {
        errorMsg = 'Formato de remitente o destinatario no válido. Se espera un correo limpio.';
      }
      throw new Error(errorMsg);
    }
  } catch (err) {
    console.error('[dataCorreo] Error al enviar con Resend:', err);
    throw err;
  }

  // 2. Preparar documento oficial para Firestore con campos raíz limpios
  const ahora = new Date();
  const timestamp = ahora.getTime();
  const docId = `correo_${timestamp}`;
  const usuario = getUsuarioActivo();

  const registroCorreo = {
    id: docId,
    resendId: respuestaResend?.id || '',
    estado: 'enviado',
    destinatario: {
      para: destinatariosArray.join(', '),
      nombre: nombre || '',
      cc: ccArray
    },
    remitente: {
      desde,
      responderA
    },
    mensaje: {
      asunto,
      tipo,
      resumen: mensaje ? mensaje.substring(0, 90) : asunto,
      html: html || ''
    },
    relacion: {
      pedidoId: pedidoId || '',
      clienteId: clienteId || ''
    },
    autor: usuario.autor || 'CPC Lourdes Cusihuaman',
    userId: usuario.userId || '',
    email: usuario.email || '',
    fecha: formatearFechaLegible(ahora),
    creado: serverTimestamp()
  };

  // 3. Guardar en caché local inmediatamente
  guardarCorreoLocal({
    ...registroCorreo,
    creado: timestamp
  });

  // 4. Guardar en Firestore en segundo plano (asíncrono)
  if (db) {
    setDoc(doc(db, COLECCION_CORREOS, docId), registroCorreo).catch(err => {
      console.warn('[dataCorreo] Error al sincronizar con Firestore:', err?.message || err);
    });
  }

  return registroCorreo;
}

/**
 * Carga los correos más recientes desde Firestore y actualiza la caché local
 */
export async function sincronizarCorreosDesdeFirestore() {
  if (!db) return obtenerCorreos();

  try {
    const q = query(
      collection(db, COLECCION_CORREOS),
      orderBy('creado', 'desc'),
      limit(50)
    );

    const snap = await getDocs(q);
    if (!snap.empty) {
      const remotos = snap.docs.map(d => {
        const data = d.data();
        let fechaFormateada = data.fecha;
        if (!fechaFormateada && data.creado?.seconds) {
          fechaFormateada = formatearFechaLegible(new Date(data.creado.seconds * 1000));
        }
        return {
          ...data,
          id: d.id,
          fecha: fechaFormateada || 'Reciente'
        };
      });

      _memoriaCorreos = remotos;
      savels(STORAGE_KEY, remotos);
      return remotos;
    }
  } catch (err) {
    console.warn('[dataCorreo] Error al leer historial de Firestore:', err?.message || err);
  }

  return obtenerCorreos();
}

const RECIBIDOS_DEMO = [
  {
    id: 'rec_101',
    carpeta: 'recibidos',
    estado: 'recibido',
    leido: false,
    destinatario: { para: 'contacto@contabilidadwii.com', nombre: 'Estudio Cusihuaman' },
    remitente: { desde: 'Valeria Mendoza <valeria.mendoza@gmail.com>', responderA: 'valeria.mendoza@gmail.com' },
    mensaje: {
      asunto: '📋 Consulta: Suspensión de Retenciones 4ta Categoría (RHE 2026)',
      tipo: 'consulta',
      resumen: 'Estimada CPC Lourdes, buenas tardes. Este año mis ingresos como diseñadora independiente superarán los S/ 45,000...',
      html: '<div style="font-family: sans-serif; padding: 20px; line-height: 1.6; color: #1e293b;"><h2 style="color: #9e7b4f; margin-top: 0;">Consulta Tributaria de 4ta Categoría</h2><p>Buenas tardes CPC Lourdes,</p><p>He revisado sus publicaciones sobre el Formulario Virtual 1609 para suspensión del 8% de retención de recibos por honorarios.</p><p>Quisiera agendar una asesoría de 1 hora para proyectar mis ingresos del ejercicio fiscal 2026 y saber en qué mes debo tramitar la constancia ante SUNAT sin caer en contingencias.</p><p>Quedo a la espera de su confirmación y de los números de cuenta para el abono del honorario.</p><p>Saludos cordiales,<br/><strong>Valeria Mendoza</strong><br/>📱 987 654 321</p></div>'
    },
    fecha: 'Hoy, 02:45 p. m.'
  },
  {
    id: 'rec_102',
    carpeta: 'recibidos',
    estado: 'recibido',
    leido: false,
    destinatario: { para: 'contacto@contabilidadwii.com', nombre: 'Estudio Cusihuaman' },
    remitente: { desde: 'Restaurante El Rincón Criollo <administracion@rinconcriollo.pe>', responderA: 'administracion@rinconcriollo.pe' },
    mensaje: {
      asunto: '📁 Envío de Comprobantes de Ventas y Compras - Mes Agosto 2026',
      tipo: 'declaracion',
      resumen: 'Estimado Estudio, adjuntamos la carpeta con los XML y PDF de ventas y compras del restaurante para la liquidación mensual...',
      html: '<div style="font-family: sans-serif; padding: 20px; line-height: 1.6; color: #1e293b;"><h2 style="color: #9e7b4f; margin-top: 0;">Envío de Información para PDT 621 y SIRE</h2><p>Estimada CPC Lourdes Cusihuaman,</p><p>Adjuntamos los comprobantes correspondientes al mes de Agosto 2026 de nuestra empresa:</p><ul><li><strong>Razón Social:</strong> Inversiones Gastronómicas El Rincón Criollo S.A.C.</li><li><strong>RUC:</strong> 20554897123 (Régimen MYPE Tributario)</li><li><strong>Ventas del mes:</strong> 42 Facturas electrónicas</li><li><strong>Compras del mes:</strong> 28 Facturas de proveedores</li><li><strong>Planilla:</strong> 4 trabajadores (sin variaciones este mes)</li></ul><p>Por favor emitir la liquidación de IGV-Renta y el código NPS para realizar el pago a tiempo. Muchas gracias.</p><p>Atentamente,<br/><strong>Gerencia de Administración</strong></p></div>'
    },
    fecha: 'Ayer, 06:10 p. m.'
  },
  {
    id: 'rec_103',
    carpeta: 'recibidos',
    estado: 'recibido',
    leido: true,
    destinatario: { para: 'contacto@contabilidadwii.com', nombre: 'Estudio Cusihuaman' },
    remitente: { desde: 'SUNAT Virtual Notificaciones <notificaciones@sunat.gob.pe>', responderA: 'notificaciones@sunat.gob.pe' },
    mensaje: {
      asunto: '🔔 Aviso de Cumplimiento: Declaración Jurada Mensual PDT 621',
      tipo: 'sunat',
      resumen: 'Recordatorio oficial de vencimientos para contribuyentes del Régimen MYPE y Régimen Especial del período tributario vigente...',
      html: '<div style="font-family: sans-serif; padding: 20px; line-height: 1.6; color: #1e293b;"><h2 style="color: #0284c7; margin-top: 0;">Notificación Electrónica SUNAT</h2><p>Estimado contribuyente,</p><p>Se le recuerda que el cronograma de vencimiento para la presentación de la Declaración Jurada Mensual y Registro de Compras y Ventas Electrónicas (SIRE) iniciará el próximo 14 del presente mes según el último dígito del RUC.</p><p>Le recomendamos verificar las declaraciones a través de la plataforma SUNAT Operaciones en Línea (SOL).</p><p>Atentamente,<br/><strong>Superintendencia Nacional de Aduanas y de Administración Tributaria (SUNAT)</strong></p></div>'
    },
    fecha: '23 Sep, 11:20 a. m.'
  }
];

/**
 * Obtiene la lista de correos recibidos (inbox)
 */
export function obtenerRecibidos() {
  try {
    const local = getls(STORAGE_KEY_RECIBIDOS);
    if (Array.isArray(local) && local.length > 0) {
      return local;
    }
  } catch (e) {}

  savels(STORAGE_KEY_RECIBIDOS, RECIBIDOS_DEMO);
  return RECIBIDOS_DEMO;
}

/**
 * Marca un correo como leído
 */
export function marcarCorreoLeido(id) {
  const recibidos = obtenerRecibidos();
  const actualizados = recibidos.map(r => r.id === id ? { ...r, leido: true } : r);
  savels(STORAGE_KEY_RECIBIDOS, actualizados);
  return actualizados;
}

/**
 * Obtiene la lista de borradores
 */
export function obtenerBorradores() {
  try {
    const local = getls(STORAGE_KEY_BORRADORES);
    if (Array.isArray(local)) return local;
  } catch (e) {}
  return [];
}

/**
 * Guarda o actualiza un borrador
 */
export function guardarBorrador(borrador) {
  const actuales = obtenerBorradores();
  const id = borrador.id || `draft_${Date.now()}`;
  const filtrados = actuales.filter(b => b.id !== id);
  const nuevo = {
    ...borrador,
    id,
    carpeta: 'borradores',
    fecha: 'Borrador guardado: ' + formatearFechaLegible(new Date())
  };
  const list = [nuevo, ...filtrados];
  savels(STORAGE_KEY_BORRADORES, list);
  return nuevo;
}

/**
 * Elimina un borrador
 */
export function eliminarBorrador(id) {
  const actuales = obtenerBorradores();
  const filtrados = actuales.filter(b => b.id !== id);
  savels(STORAGE_KEY_BORRADORES, filtrados);
  return filtrados;
}

/**
 * Elimina un correo de cualquier carpeta
 */
export function eliminarCorreoPorCarpeta(id, carpeta = 'enviados') {
  if (carpeta === 'borradores') {
    return eliminarBorrador(id);
  }
  if (carpeta === 'recibidos') {
    const actuales = obtenerRecibidos();
    const filtrados = actuales.filter(c => c.id !== id);
    savels(STORAGE_KEY_RECIBIDOS, filtrados);
    return filtrados;
  }
  // Enviados
  const actuales = obtenerCorreos();
  const filtrados = actuales.filter(c => c.id !== id);
  _memoriaCorreos = filtrados;
  savels(STORAGE_KEY, filtrados);
  return filtrados;
}
