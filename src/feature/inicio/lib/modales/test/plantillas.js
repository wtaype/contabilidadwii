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
      ? `Important notice regarding SUNAT deadlines: Receiving an audit notice or inductive letter requires prompt action before legal deadlines expire. Inductive processes usually grant between 3 to 10 business days to file formal responses or amend returns.\n\nDo not worry; most initial SUNAT observations can be rectified with proper evidentiary documentation and legal grounds. With our Ex-SUNAT technical assessment, we will analyze your case file and draft a solid defense before fines are assessed.`
      : `Atención prioritaria con los plazos de SUNAT: Recibir una esquela o carta inductiva exige actuar de inmediato antes del vencimiento del requerimiento. La administración otorga usualmente entre 3 y 10 días hábiles para subsanar inconsistencias o formular descargos.\n\nNo te preocupes; la gran mayoría de observaciones preliminares de SUNAT pueden subsanarse favorablemente si se cuenta con el sustento técnico y probatorio adecuado. Con nuestro criterio de Ex-SUNAT analizaremos tu expediente para presentar un descargo fundamentado y blindar tu caso de multas.`;
  }

  if (textoLibre.includes('suspension') || textoLibre.includes('suspensión') || textoLibre.includes('1609') || textoLibre.includes('8%') || textoLibre.includes('retencion') || textoLibre.includes('retención')) {
    return esEn
      ? `Analysis on 4th Category Withholding Suspension: When issuing Electronic Fee Receipts over S/ 1,500, a mandatory 8% withholding applies unless Form 1609 has been approved by SUNAT for the current fiscal year.\n\nWe verify your income projection so you can safely obtain your withholding suspension certificate, allowing you to collect 100% of your earnings legitimately without improper discounts.`
      : `Análisis de Suspensión de Retenciones de 4ta Categoría: Al emitir Recibos por Honorarios mayores a S/ 1,500, la empresa contratante debe descontar el 8% salvo que cuentes con la constancia vigente del Formulario 1609 emitido en SUNAT Operaciones en Línea.\n\nVerificamos tu proyección anual de ingresos para tramitar oportunamente tu suspensión o, si ya te retuvieron en exceso, determinar tu saldo a favor acumulado para solicitar la devolución en tu cuenta bancaria.`;
  }

  if (textoLibre.includes('devolucion') || textoLibre.includes('devolución') || textoLibre.includes('saldo a favor') || textoLibre.includes('3 uit') || textoLibre.includes('saldo')) {
    return esEn
      ? `Analysis on Tax Refund & 3 Additional UITs: Peruvian tax law grants independent and payroll workers (4th and 5th categories) the right to deduct 7 automatic UITs plus up to 3 additional UITs for expenses backed by electronic receipts bearing their DNI.\n\nWe audit your eligible deductible expenses in SUNAT records (restaurants, hotels, professional services, EsSalud domestic worker fees) to calculate your exact refundable balance and expedite your direct deposit.`
      : `Análisis de Devolución de Impuestos y 3 UIT Adicionales: La normativa tributaria permite a los trabajadores de 4ta y 5ta categoría deducir automáticamente 7 UIT fijas y hasta 3 UIT adicionales acreditando gastos con boleta electrónica vinculada a su DNI.\n\nAuditamos tu historial de consumos deducibles en la plataforma de SUNAT (restaurantes, hoteles, servicios independientes y aportes de EsSalud) para calcular tu saldo a favor exacto y gestionar tu solicitud de devolución directa a tu cuenta bancaria.`;
  }

  if (textoLibre.includes('itf') || textoLibre.includes('banco') || textoLibre.includes('deposito') || textoLibre.includes('transferencia') || textoLibre.includes('desbalance') || textoLibre.includes('patrimonio')) {
    return esEn
      ? `Analysis on ITF Financial Cross-Checks & Unjustified Wealth: SUNAT routinely monitors monthly bank transactions via the Financial Transaction Tax (ITF). When deposits exceed declared earnings, algorithmic alerts flag potential discrepancies.\n\nWe reconstruct your financial traceability and prepare formal supporting documents (contracts, donations, non-taxable income) to ensure full compliance and safeguard your assets.`
      : `Análisis de Cruces de ITF e Incremento Patrimonial No Justificado: SUNAT monitorea permanentemente los movimientos en cuentas bancarias a través del ITF. Si los depósitos o abonos anuales superan tus ingresos declarados en 4ta o 5ta categoría, el sistema emite alertas de fiscalización.\n\nReconstruimos la trazabilidad de tus operaciones financieras y preparamos el sustento documentario (contratos, préstamos, donaciones o rentas inafectas) para justificar tus movimientos y dejar tu patrimonio 100% blindado.`;
  }

  // 2. Respuesta según el caso tributario seleccionado
  switch (casoId) {
    case '4ta':
      return esEn
        ? `Preliminary Diagnostic · 4th Category (Independent Fees): Independent professionals must monitor monthly invoicing thresholds, issue electronic fee receipts correctly, and plan for annual tax returns.\n\nWe guide you on filing Form 1609 to prevent 8% withholdings and optimizing additional deductible expenses so you pay only what is fair or receive a legitimate refund.`
        : `Diagnóstico Preliminar · 4ta Categoría (Honorarios Independientes): Los profesionales independientes deben cuidar los topes mensuales de facturación, la correcta emisión de RHE y el cómputo de retenciones acumuladas en el año.\n\nTe asesoramos en la tramitación del Formulario 1609 para evitar descuentos indebidos del 8% y en la deducción de gastos para pagar lo justo o recuperar saldos a favor directamente de SUNAT.`;

    case '5ta':
      return esEn
        ? `Preliminary Diagnostic · 5th Category (Payroll Workers): Payroll income is subject to progressive cumulative tax brackets (8% to 30%). Employers often miscalculate withholdings across job transitions.\n\nWe verify your tax withholdings, integrate your eligible 3 UIT deductible expenses, and file your annual tax return to claim direct refunds from SUNAT.`
        : `Diagnóstico Preliminar · 5ta Categoría (Trabajadores en Planilla): Las rentas de quinta categoría están afectas a escalas progresivas acumulativas (del 8% al 30%). Es muy común que existan retenciones en exceso si cambiaste de empleador o tuviste bonificaciones extraordinarias.\n\nAuditamos tu liquidación anual de quinta categoría, incorporamos tus 3 UIT de gastos deducibles y tramitamos la devolución correspondiente ante la administración tributaria.`;

    case 'buzon':
      return esEn
        ? `Preliminary Diagnostic · SUNAT SOL Mailbox Notice: Notifications deposited in your electronic SOL mailbox are considered legally delivered. Ignoring them risks automatic fines of up to 50% of the UIT.\n\nWith former SUNAT tax officer expertise, we review the exact administrative code and grounds of the notice to draft an effective, compliant response.`
        : `Diagnóstico Preliminar · Notificación en Buzón SOL de SUNAT: Toda notificación depositada en el Buzón Electrónico SOL surte efectos legales de forma automática. Dejarla pasar puede acarrear multas pecuniarias de hasta el 50% de la UIT.\n\nCon criterio técnico de Ex-SUNAT, revisamos el contenido técnico de la esquela, identificamos la inconsistencia detectada y redactamos la subsanación oportuna para archivar la observación.`;

    case 'itf':
      return esEn
        ? `Preliminary Diagnostic · ITF Bank Cross-Checks: Banking movements are constantly matched against monthly and annual tax declarations. High transaction volume without declared revenue requires preventive documentation.\n\nWe organize your financial evidence and prepare technical documentation so your banking transactions are fully supported before any inquiry from the tax authority.`
        : `Diagnóstico Preliminar · Cruces de ITF y Cuentas Bancarias: Toda transferencia o depósito bancario es reportado por los bancos a SUNAT mediante el ITF. Mover importes relevantes sin la debida declaración tributaria activa cruces automatizados.\n\nEstructuramos el soporte contable y bancario preventivo de tus ingresos para que toda operación cuente con respaldo técnico antes de cualquier requerimiento formal de SUNAT.`;

    default:
      return esEn
        ? `Preliminary Diagnostic · General Tax Advisory: Every taxpayer scenario requires a tailored technical approach. Proper tax planning prevents costly surprises with the tax authority.\n\nAt Estudio Cusihuaman, we provide specialized advice backed by former SUNAT audit criteria to safeguard your finances.`
        : `Diagnóstico Preliminar · Asesoría Tributaria Especializada: Cada contribuyente presenta particularidades fiscales que requieren un enfoque técnico preventivo. Una adecuada planificación tributaria evita contingencias y pagos innecesarios.\n\nEn Estudio Cusihuaman te brindamos el respaldo de criterio experto de Ex-SUNAT para proteger tu economía con total legalidad.`;
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
