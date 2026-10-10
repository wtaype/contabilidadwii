// src/feature/personal/modulos/correo/plantillas/mensajes.js
// Plantilla para Mensajes Libres, Comunicados Tributarios y Orientación

import { envoltorioBase } from './base.js';
import { mdToEmailHtml } from './parser.js';

export function generarPlantillaLibre({
  cliente = 'Estimado/a cliente',
  asunto = 'Comunicado Tributario Oficial',
  mensajeMarkdown = '',
  negocio = {}
} = {}) {
  const contenidoMarkdownFinal = mensajeMarkdown || `
Estimado cliente, te compartimos información importante de nuestro estudio:

- **Monitoreo de Buzón SOL:** Mantenemos vigilancia activa de las notificaciones que emite la SUNAT para tu RUC.
- **Canal Directo de Asesoría:** Consultas directas vía WhatsApp institucional y correo oficial.
- **Cumplimiento Puntual:** Presentación de declaraciones con anticipación para evitar contingencias.
  `.trim();

  const contenidoHtml = `
    <h2 style="color: #0f172a; margin-top: 0; font-size: 21px; font-weight: 700;">${asunto}</h2>
    <p style="font-size: 15px;">Hola <strong>${cliente}</strong>,</p>
    <div style="margin: 18px 0;">
      ${mdToEmailHtml(contenidoMarkdownFinal)}
    </div>
  `;

  const vistaPreviaTexto = asunto;
  return { asunto, html: envoltorioBase({ contenidoHtml, asunto, vistaPreviaTexto, negocio }), resumen: vistaPreviaTexto };
}
