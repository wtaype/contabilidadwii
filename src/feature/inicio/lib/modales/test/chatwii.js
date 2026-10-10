// src/feature/inicio/lib/modales/test/chatwii.js
// 🎯 ChatWii: Asistente Clínico Inteligente con Gemini 2.5 Flash y Fallback Empático Inmediato

import { consultarGemini } from '../../../../../core/servicios/gemini.js';
import { generarDevolucionEmpatica, obtenerPlantillaDerivacion } from './plantillas.js';
import { datosNegocio } from '../../../../../negocio.js';

/**
 * Genera la respuesta empática en vivo (Preview) cuando el paciente elige una emoción o escribe en el textarea
 * @param {Object} datos - { emocionId, emocionTexto, desahogo, tiempo }
 * @param {string} [lang='es'] - Idioma ('es' o 'en')
 * @returns {Promise<string>} Mensaje empático
 */
export async function solicitarDevolucionChatWii(datos = {}, lang = 'es') {
  const esEn = lang === 'en';
  const fallback = generarDevolucionEmpatica(datos, lang);

  // Si no hay desahogo escrito y solo hay emoción, el fallback es instantáneo y perfecto
  if (!datos.desahogo || datos.desahogo.trim().length < 5) {
    return fallback;
  }

  // Intentar consultar a Gemini Flash con timeout estricto de 2.2 segundos para no demorar la UI
  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout ChatWii')), 2200)
    );

    const promptIa = `El contribuyente solicita orientación tributaria:
- Tipo de consulta: ${datos.emocionTexto || datos.emocionId}
- Detalle de su caso: "${datos.desahogo.trim()}"
- Periodo fiscal: ${datos.tiempo || 'Actual'}
Idioma requerido: ${esEn ? 'English' : 'Spanish'}.

REGLAS DE RESPUESTA:
- Sé conciso, claro y directo (máximo 2 párrafos cortos de 2 a 3 líneas cada uno).
- NO uses frases redundantes como "Diagnóstico Preliminar", "En este diagnóstico" o introducciones largas.
- PÁRRAFO 1: Explica en sencillo la clave del trámite o normativa de SUNAT que aplica a su caso.
- PÁRRAFO 2: Explica la solución práctica con la asesoría de Lourdes Cusihuaman (ex-SUNAT) para resolverlo a tiempo.
Separa ambos párrafos con salto doble de línea (\\n\\n).`;

    const systemInstruction = `Eres ChatWii, el asesor tributario inteligente de Estudio Cusihuaman y de Lourdes Cusihuaman Gálvez (ex-funcionaria de SUNAT y especialista en 4ta y 5ta categoría). Tu tono es técnico, seguro, preventivo y claro.`;

    const aiPromise = consultarGemini({
      prompt: promptIa,
      systemInstruction,
      responseMimeType: 'text/plain'
    });

    const resultadoTexto = await Promise.race([aiPromise, timeoutPromise]);
    if (resultadoTexto && resultadoTexto.length > 20) {
      return resultadoTexto.trim();
    }
  } catch (err) {
    // Falla silenciosa hacia el análisis heurístico de plantillas.js
  }

  return fallback;
}

/**
 * Construye el mensaje estructurado de WhatsApp para derivar el caso a Lourdes Cusihuaman
 * @param {Object} datos - Datos completos de Etapa 1 y Etapa 2
 * @param {Object} t - Diccionario de textos
 * @returns {string} URL de WhatsApp con texto prellenado
 */
export function construirUrlWhatsApp(datos = {}, t = {}) {
  const nombre = datos.nombre?.trim() || 'Contribuyente';
  const celular = datos.celular?.trim() || '';
  const correo = datos.correo?.trim() || '';
  const estado = datos.emocionTexto || datos.emocionId || 'Consulta';
  const desahogo = datos.desahogo?.trim() ? `"${datos.desahogo.trim()}"` : 'Prefirió coordinarlo en sesión';
  const tiempo = datos.tiempo || 'Por coordinar';
  const modalidad = datos.modalidad || '💻 Online';
  const fecha = datos.fecha || 'Por coordinar';
  const hora = datos.hora || 'Por coordinar';
  const orientacion = datos.devolucionEmpatica || 'Orientación Terapéutica Personalizada';

  const mensaje = `${t.waSaludo}\n\n` +
    `${t.waPaciente} ${nombre}\n` +
    (celular ? `${t.waCelular} ${celular}\n` : '') +
    (correo ? `${t.waCorreo} ${correo}\n` : '') +
    `${t.waEstado} ${estado}\n` +
    `${t.waDesahogo} ${desahogo}\n` +
    `${t.waTiempo} ${tiempo}\n` +
    `${t.waModalidad} ${modalidad}\n` +
    `${t.waFecha} ${fecha}\n` +
    `${t.waHora} ${hora}\n\n` +
    `• ${t.resumenEspecialista || 'Orientación preliminar:'}\n"${orientacion.slice(0, 160)}..."\n\n` +
    `${t.waPregunta}\n` +
    `${t.waAtribucion}\n` +
    `${t.waDespedida}`;

  return `https://wa.me/${datosNegocio.whatsappLimpio}?text=${encodeURIComponent(mensaje)}`;
}

export default {
  solicitarDevolucionChatWii,
  construirUrlWhatsApp
};
