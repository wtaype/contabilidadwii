// src/feature/personal/modulos/correo/plantillas/pedidos.js
// Plantilla de Confirmación de Asesoría y Servicios
// 100% Modular y Reutilizable

import { envoltorioBase } from './base.js';
import { mdToEmailHtml } from './parser.js';

export function generarPlantillaPedido({
  cliente = 'Estimado/a cliente',
  pedidoId = 'PED-1029',
  producto = 'Asesoría Profesional (1 Hora)',
  cantidad = 1,
  precio = '80.00',
  direccion = 'Atención Online / Presencial',
  metodoPago = 'Transferencia / Billetera Digital',
  tiempoEstimado = 'Sesión agendada',
  mensajeMarkdown = '',
  negocio = {}
} = {}) {
  const contenidoExtraHtml = mensajeMarkdown ? mdToEmailHtml(mensajeMarkdown) : '';
  const nombreEmpresa = negocio?.nombre || '';

  const contenidoHtml = `
    <h2 style="color: #9e7b4f; margin-top: 0; font-size: 22px; font-weight: 800;">⚖️ ¡Tu cita de asesoría está confirmada!</h2>
    <p style="font-size: 15px;">Hola <strong>${cliente}</strong>,</p>
    <p style="color: #475569; font-size: 14px; margin-bottom: 20px;">Hemos registrado tu solicitud de atención. Nuestro especialista revisará tu caso para guiarte en tu gestión.</p>

    <!-- Ficha de Datos de la Asesoría -->
    <div style="background: #fdfbf7; border: 1px solid #e5dccb; border-radius: 10px; padding: 18px; margin: 18px 0;">
      <table style="width: 100%; font-size: 14px;">
        <tr>
          <td style="padding: 6px 0; color: #64748b;">N° de Registro:</td>
          <td style="padding: 6px 0; font-weight: 800; text-align: right; color: #9e7b4f;">#${pedidoId}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Servicio contratado:</td>
          <td style="padding: 6px 0; font-weight: 700; text-align: right; color: #0f172a;">${cantidad}x ${producto}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Modalidad / Ubicación:</td>
          <td style="padding: 6px 0; font-weight: 500; text-align: right; color: #334155;">${direccion}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Medio de Pago:</td>
          <td style="padding: 6px 0; font-weight: 500; text-align: right; color: #334155;">${metodoPago}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Duración:</td>
          <td style="padding: 6px 0; font-weight: 700; text-align: right; color: #16a34a;">${tiempoEstimado}</td>
        </tr>
        <tr style="border-top: 2px dashed #e2e8f0;">
          <td style="padding: 12px 0 4px; font-size: 15px; font-weight: 800; color: #0f172a;">Honorario Total:</td>
          <td style="padding: 12px 0 4px; font-size: 20px; font-weight: 900; text-align: right; color: #9e7b4f;">S/ ${precio}</td>
        </tr>
      </table>
    </div>

    ${contenidoExtraHtml}

    <!-- Garantía Profesional Oficial -->
    <div style="background: #fdfbf7; border-left: 4px solid #9e7b4f; padding: 14px 18px; border-radius: 6px; margin: 18px 0;">
      <p style="margin: 0; color: #82633c; font-size: 13px; line-height: 1.6;">
        🛡️ <strong>Garantía Profesional:</strong> Asesoría directa con especialista colegiada ex-funcionaria de SUNAT. Absolución fundamentada en el Código Tributario y Ley del IGV/Renta.
      </p>
    </div>

    <div style="text-align: center; margin-top: 22px;">
      <a href="https://wa.me/${(negocio.contacto?.whatsappLimpio || negocio.contacto?.whatsapp || '').replace(/\D/g, '')}?text=${encodeURIComponent('Hola ' + nombreEmpresa + ', deseo coordinar el horario de mi asesoría #' + pedidoId)}" class="btn-ws">
        📲 Coordinar Horario por WhatsApp
      </a>
    </div>
  `;

  return envoltorioBase({
    tituloPre: `Confirmación de Asesoría Contable #${pedidoId}`,
    contenidoHtml,
    negocio
  });
}
