// src/feature/inicio/lib/modales/test/plantillas.js
// 🎯 Plantillas de Diagnóstico Tributario Preventivo Instantáneo (0ms)
// Genera respuestas técnicas, claras y preventivas basadas en criterio Ex-SUNAT.

/**
 * Genera una devolución diagnóstica en vivo según la consulta y el caso del contribuyente
 * @param {Object} datos - { emocionId, emocionTexto, desahogo, tiempo }
 * @param {string} [lang='es'] - Idioma ('es' o 'en')
 * @returns {string} Devolución diagnóstica
 */
export function generarDevolucionEmpatica(datos = {}, lang = 'es') {
  const esEn = lang === 'en';
  const textoLibre = (datos.desahogo || '').toLowerCase();
  const casoId = datos.emocionId || '4ta';

  // 1. Análisis Heurístico de Términos Críticos en Consulta Libre
  if (textoLibre.includes('multa') || textoLibre.includes('esquela') || textoLibre.includes('carta inductiva') || textoLibre.includes('notificac') || textoLibre.includes('plazo') || textoLibre.includes('cierre')) {
    return esEn
      ? `Priority notice regarding SUNAT deadlines: Inductive letters or notices usually grant 3 to 10 business days to file formal responses.\n\nMost initial observations can be resolved favorably with proper supporting documents. We review your case and file a clear defense to avoid fines.`
      : `Atención con los plazos de SUNAT: Las cartas o requerimientos suelen otorgar entre 3 y 10 días hábiles para responder o regularizar.\n\nLa gran mayoría de observaciones se resuelven a tiempo con el sustento adecuado. Revisamos tu esquela de inmediato y redactamos el descargo formal para evitar multas.`;
  }

  if (textoLibre.includes('suspension') || textoLibre.includes('suspensión') || textoLibre.includes('1609') || textoLibre.includes('8%') || textoLibre.includes('retencion') || textoLibre.includes('retención')) {
    return esEn
      ? `Withholding Exemption (Form 1609): When issuing fee receipts over S/ 1,500, a mandatory 8% withholding applies unless Form 1609 is active.\n\nWe verify your income projection to obtain your suspension certificate and collect 100% of your earnings without discounts.`
      : `Suspensión de Retenciones de 4ta Categoría: Al emitir recibos por más de S/ 1,500 te descuentan el 8% salvo que cuentes con el Formulario 1609 vigente en SUNAT.\n\nRevisamos tu proyección de ingresos para tramitar tu suspensión de inmediato o recuperar los saldos retenidos en exceso.`;
  }

  if (textoLibre.includes('devolucion') || textoLibre.includes('devolución') || textoLibre.includes('saldo a favor') || textoLibre.includes('3 uit') || textoLibre.includes('saldo')) {
    return esEn
      ? `Tax Refund & 3 Additional UITs: You can deduct up to 3 additional UITs for expenses backed by electronic receipts with your DNI.\n\nWe audit your eligible expenses in SUNAT (restaurants, hotels, medical services) to claim your refund directly to your bank account.`
      : `Devolución de Impuestos y Saldo a Favor: Tienes derecho a deducir hasta 3 UIT adicionales por gastos personales sustentados con boleta electrónica y DNI.\n\nRevisamos tus consumos registrados en SUNAT (restaurantes, hoteles, salud) para calcular tu saldo a favor y tramitar el abono a tu cuenta bancaria.`;
  }

  if (textoLibre.includes('itf') || textoLibre.includes('banco') || textoLibre.includes('deposito') || textoLibre.includes('transferencia') || textoLibre.includes('desbalance') || textoLibre.includes('patrimonio')) {
    return esEn
      ? `Bank Movements & Financial Traceability: High monthly banking volume without declared earnings can trigger automated audit checks.\n\nWe organize your financial evidence (contracts, loans, non-taxable income) to ensure full compliance and peace of mind.`
      : `Movimientos Bancarios y Cruces por ITF: Mover importes altos en cuentas bancarias o transferencias sin declarar puede generar alertas de fiscalización.\n\nRevisamos el origen de tus fondos y armamos el sustento documentario (contratos, préstamos o rentas inafectas) para dejar tus cuentas 100% justificadas.`;
  }

  // 2. Respuesta según el caso tributario seleccionado
  switch (casoId) {
    case '4ta':
      return esEn
        ? `Independent Professional Fees (4th Category): Proper management of monthly thresholds and Form 1609 ensures you keep 100% of your earnings.\n\nWe assist you in obtaining your withholding suspension and deducting expenses to pay only what is fair or receive tax refunds.`
        : `Recibos por Honorarios (4ta Categoría): Gestionar a tiempo el Formulario 1609 evita que las empresas te retengan el 8% de tus honorarios.\n\nTe ayudamos a tramitar la suspensión de retenciones, emitir recibos sin errores y recuperar saldos a favor acumulados.`;

    case '5ta':
      return esEn
        ? `Payroll & Salaries (5th Category): Withholdings are calculated on progressive tax brackets. Retentions often exceed the required amount when switching jobs.\n\nWe review your annual tax liquidation and integrate deductible expenses to request your refund from SUNAT.`
        : `Trabajadores en Planilla (5ta Categoría): Es muy común que tu empresa te haya retenido impuestos de más, sobre todo si cambiaste de trabajo o recibiste bonificaciones.\n\nRevisamos tus retenciones anuales, sumamos tus gastos deducibles de 3 UIT y gestionamos la devolución de tu dinero.`;

    case 'buzon':
    case 'carta':
      return esEn
        ? `SUNAT SOL Mailbox & Notices: Administrative notifications require prompt action to prevent automatic penalties.\n\nWith former SUNAT tax officer experience, we identify the exact issue and prepare a solid response to close the matter.`
        : `Cartas y Notificaciones de SUNAT: Toda notificación en tu Buzón SOL tiene plazos legales estrictos que no se deben dejar pasar.\n\nCon criterio técnico de Ex-SUNAT, revisamos la inconsistencia observada y redactamos la respuesta oportuna para archivar el requerimiento.`;

    case 'itf':
      return esEn
        ? `Banking & Transfer Monitoring: High movement volumes should always be supported with financial documentation.\n\nWe prepare preventive accounting backup so your banking operations are fully compliant before any tax inquiry.`
        : `Cuentas Bancarias y Cruce de ITF: Los bancos reportan tus movimientos mensuales a SUNAT. Cuando hay depósitos altos, se requiere sustento previo.\n\nEstructuramos el soporte contable y documentario de tus ingresos para que tengas total tranquilidad ante cualquier consulta fiscal.`;

    default:
      return esEn
        ? `Personalized Tax Evaluation: Every case has unique details that require practical guidance.\n\nAt Estudio Cusihuaman, we provide friendly advice backed by former SUNAT audit criteria to keep your accounts in order.`
        : `Orientación Tributaria Especializada: Cada situación fiscal tiene detalles particulares que se resuelven con un enfoque claro y práctico.\n\nEn Estudio Cusihuaman te brindamos el criterio directo de Ex-SUNAT para tener tus impuestos al día sin complicaciones.`;
  }
}

/**
 * Ficha de Consulta final para la etapa 2
 */
export function obtenerPlantillaDerivacion(datos = {}, lang = 'es') {
  const esEn = lang === 'en';
  const nombre = datos.nombre?.trim() || (esEn ? 'Taxpayer' : 'Contribuyente');
  const casoTexto = datos.emocionTexto || (esEn ? 'Tax consultation' : 'Consulta tributaria');

  return {
    tituloPerfil: esEn ? `Tax Consultation Profile for ${nombre}` : `Perfil de Consulta Tributaria para ${nombre}`,
    enfoqueRecomendado: esEn
      ? 'Ex-SUNAT Tax Assessment & Preventive Shielding'
      : 'Diagnóstico y Blindaje Tributario Ex-SUNAT',
    sintesis: esEn
      ? `The taxpayer requests advisory regarding: ${casoTexto.toLowerCase()}, seeking technical review with Lourdes Cusihuaman Gálvez.`
      : `El/la contribuyente consulta sobre: ${casoTexto.toLowerCase()}, solicitando revisión técnica y acompañamiento con Lourdes Cusihuaman Gálvez.`
  };
}

export default {
  generarDevolucionEmpatica,
  obtenerPlantillaDerivacion
};
