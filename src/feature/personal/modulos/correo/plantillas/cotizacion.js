// src/feature/personal/modulos/correo/plantillas/cotizacion.js
// Plantilla de Propuesta de Servicios Contables y Asesoría Tributaria

import { envoltorioBase } from './base.js';
import { mdToEmailHtml } from './parser.js';

export function generarPlantillaCotizacion({
  cliente = 'Contacto Comercial',
  empresa = 'Empresa Solicitante',
  cotizacionId = 'PROP-2026-14',
  validez = '15 días calendario',
  mensajeMarkdown = '',
  negocio = {}
} = {}) {
  const nombreEmpresa = negocio?.nombre || 'Estudio Cusihuaman';

  const contenidoMarkdownFinal = mensajeMarkdown || `
| Servicio Contable Propuesto | Modalidad | Honorario Mensual |
| :--- | :---: | :---: |
| Contabilidad Mensual Régimen MYPE | Mensual | S/ 150.00 |
| Planilla de Trabajadores (PLAME - T-Registro) | Mensual | S/ 180.00 |
| Asesoría y Monitoreo Permanente de Buzón SOL | Incluido | S/ 0.00 |

### Entregables del Servicio:
- Declaración mensual de PDT 621 (IGV - Renta).
- Envío mensual de Registros de Compras y Ventas Electrónicos (SIRE).
- Planilla electrónica PLAME y emisión de boletas de pago para sus colaboradores.
- Soporte continuo para evitar contingencias, esquelas y multas tributarias.
  `.trim();

  const tablaHtml = mdToEmailHtml(contenidoMarkdownFinal);

  const contenidoHtml = `
    <h2 style="color: #9e7b4f; margin-top: 0; font-size: 21px; font-weight: 700;">📋 Propuesta de Servicios Contables</h2>
    <p style="font-size: 15px;">Estimados señores de <strong>${empresa}</strong> (${cliente}),</p>
    <p style="color: #475569; font-size: 14px;">Presentamos nuestra propuesta formal de servicios contables, tributarios y de planillas respaldada por la trayectoria de CPC Lourdes Cusihuaman Gálvez (ex-funcionaria de SUNAT):</p>

    <div style="background:#fdfbf7;border:1px solid #ebdcc5;border-radius:8px;padding:10px 16px;margin:14px 0;display:flex;justify-content:space-between;font-size:13px;">
      <span>Propuesta: <strong>#${cotizacionId}</strong></span>
      <span>Validez: <strong>${validez}</strong></span>
    </div>

    <!-- Contenido y Tablas en Markdown -->
    ${tablaHtml}

    <div style="text-align: center; margin-top: 25px;">
      <a href="https://wa.me/${negocio.contacto?.whatsappLimpio || negocio.contacto?.whatsapp || '51987594558'}?text=${encodeURIComponent('Hola CPC Lourdes, deseo aprobar la propuesta contable #' + cotizacionId + ' para ' + empresa)}" class="btn-ws">
        🤝 Coordinar Inicio de Servicios por WhatsApp
      </a>
    </div>
  `;

  const asunto = `📋 Propuesta Contable #${cotizacionId} · ${empresa} · ${nombreEmpresa}`;
  const vistaPreviaTexto = `Propuesta formal de servicios contables #${cotizacionId} para ${empresa}.`;
  return { asunto, html: envoltorioBase({ contenidoHtml, asunto, vistaPreviaTexto, negocio }), resumen: vistaPreviaTexto };
}
