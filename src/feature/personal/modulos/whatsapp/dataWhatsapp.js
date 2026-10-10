// src/feature/personal/modulos/whatsapp/dataWhatsapp.js
// Centro de Plantillas y Generador de Mensajes Oficiales de WhatsApp (Estudio Cusihuaman)
// 100% JS Nativo · Integrado con @widev y Local-First

export const PLANTILLAS_WHATSAPP = [
  {
    id: 'tpl_vencimiento_sunat',
    nombre: 'Recordatorio Vencimiento SUNAT',
    icono: 'fa-solid fa-calendar-check',
    categoria: 'tributario',
    descripcion: 'Alerta oportuna de la fecha límite según el último dígito del RUC.',
    mensaje: `¡Hola *{cliente}*! 👋 Le saluda el *Estudio Contable CPC Lourdes Cusihuaman Gálvez*.

⏰ *Recordatorio de Vencimiento SUNAT*
• RUC: *{ruc}* (Último dígito: *{digito}*)
• Período Fiscal: *{periodo}*
• Fecha Límite Oficial: *{fechaVencimiento}*

Le recordamos hacernos llegar sus comprobantes de compras y ventas a la brevedad para realizar el cierre contable y evitar multas o recargos por presentación extemporánea.

¿Tiene sus comprobantes listos para enviárnoslos hoy?`
  },
  {
    id: 'tpl_liquidacion_impuestos',
    nombre: 'Liquidación Mensual de Impuestos',
    icono: 'fa-solid fa-calculator',
    categoria: 'declaracion',
    descripcion: 'Resumen del impuesto calculado (IGV/Renta) con el código de pago NPS.',
    mensaje: `Estimado/a *{cliente}*, le compartimos el resumen de su declaración mensual:

📊 *Liquidación de Impuestos - Período {periodo}*
• Régimen Fiscal: *{regimen}*
• Total Tributos por Pagar: *S/ {monto}*
• Código de Pago SUNAT (NPS): *{nps}*
• Fecha Límite de Pago: *{fechaVencimiento}*

💳 *¿Cómo pagar con NPS?*
Puede pagarlo desde la app o web de su banco (BCP, BBVA, Interbank) en:
*Pago de Servicios > SUNAT > Pago con NPS* ingresando el código *{nps}*.

Cualquier duda quedamos atentos para orientarle.`
  },
  {
    id: 'tpl_asesoria_agendada',
    nombre: 'Confirmación de Asesoría Tributaria',
    icono: 'fa-solid fa-user-check',
    categoria: 'asesoria',
    descripcion: 'Confirmación formal de cita tributaria presencial u online.',
    mensaje: `¡Hola *{cliente}*! Su cita tributaria ha sido confirmada con éxito. 🤝

💼 *Detalle de la Asesoría:*
• Especialista: *CPC Lourdes Cusihuaman Gálvez* (Ex-orientadora SUNAT)
• Modalidad: *{modalidad}*
• Fecha y Hora: *{fechaHora}*
• Honorario: *S/ {honorario}*

📌 *Dirección / Enlace:*
{lugarEnlace}

Agradecemos tener a la mano su Clave SOL y los documentos que desea revisar. ¡Le esperamos!`
  },
  {
    id: 'tpl_suspension_rhe',
    nombre: 'Suspensión Retenciones 4ta Cat (RHE)',
    icono: 'fa-solid fa-file-shield',
    categoria: 'rentas',
    descripcion: 'Orientación para emitir recibos por honorarios sin el 8% de descuento.',
    mensaje: `Estimado/a *{cliente}*, sobre su consulta de *Suspensión del 8% de Retenciones*:

📄 *Formulario Virtual 1609 SUNAT*
Si proyecta que sus ingresos por 4ta Categoría no superarán el tope anual establecido por SUNAT para este ejercicio, tiene derecho a suspender las retenciones del 8% en cada recibo que supere los S/ 1,500.

Podemos tramitar su constancia autorizada de forma inmediata y entregarle el documento en PDF para su empleador o clientes.

¿Desea que procedamos con la emisión hoy?`
  },
  {
    id: 'tpl_comprobante_honorarios',
    nombre: 'Envío de Factura / Boleta de Honorarios',
    icono: 'fa-solid fa-file-invoice-dollar',
    categoria: 'facturacion',
    descripcion: 'Envío formal del comprobante electrónico emitido por servicios contables.',
    mensaje: `Estimado/a *{cliente}*, le adjuntamos el comprobante electrónico oficial de nuestro estudio:

🧾 *Comprobante:* {comprobanteTipo} *{comprobanteNumero}*
📅 *Fecha:* {fecha}
👤 *Cliente:* {cliente} (RUC/DNI: {ruc})
💵 *Total Honorario:* *S/ {monto}* (Inc. 18% IGV)
📌 *Concepto:* {servicio}

Puede verificar la autenticidad en el portal de SUNAT. Agradecemos su puntual preferencia.

*Estudio Contable CPC Lourdes Cusihuaman Gálvez*`
  },
  {
    id: 'tpl_cierre_contable',
    nombre: 'Solicitud de Documentos para Cierre',
    icono: 'fa-solid fa-folder-open',
    categoria: 'operaciones',
    descripcion: 'Solicitud proactiva de compras, ventas y estados de cuenta bancarios.',
    mensaje: `Estimados señores de *{cliente}*, un cordial saludo desde el *Estudio Cusihuaman*. 📂

Estamos iniciando el procesamiento de la información contable para el período *{periodo}*. Por favor remitirnos:

1. Archivos XML y PDF de facturas de compras del mes.
2. Estado de cuenta bancario para conciliación mensual.
3. Altas, bajas o novedades de personal en planilla (si aplica).

Quedamos atentos a la recepción de sus archivos para trabajar su liquidación con debida anticipación. ¡Muchas gracias!`
  }
];

export function formatearPlantilla(textoBase, valores = {}) {
  let resultado = textoBase;
  const defaults = {
    cliente: 'Inversiones Gastronómicas S.A.C.',
    ruc: '20554897123',
    digito: '3',
    periodo: 'Agosto 2026',
    fechaVencimiento: '18 de Septiembre de 2026',
    regimen: 'Régimen MYPE Tributario',
    monto: '185.00',
    nps: '9827364510',
    modalidad: 'Presencial (Sede Surquillo) / Virtual Meet',
    fechaHora: 'Viernes 25 Sep · 4:00 p.m.',
    honorario: '80.00',
    lugarEnlace: 'Jr. Dante 260, Surquillo (previa cita) / Link: meet.google.com/abc-defg-hij',
    comprobanteTipo: 'Factura Electrónica',
    comprobanteNumero: 'F001-000104',
    fecha: '25 Sep 2026',
    servicio: 'Servicio Contable Mensual MYPE'
  };

  const merge = { ...defaults, ...valores };

  for (const [clave, val] of Object.entries(merge)) {
    const regex = new RegExp(`\\{${clave}\\}`, 'g');
    resultado = resultado.replace(regex, val || '');
  }

  return resultado;
}
