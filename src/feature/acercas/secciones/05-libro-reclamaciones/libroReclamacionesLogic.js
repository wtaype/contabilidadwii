// src/feature/acercas/secciones/05-libro-reclamaciones/libroReclamacionesLogic.js
// Lógica de Persistencia y Despacho Legal para el Libro de Reclamaciones (Estudio Cusihuaman)
// Conforme a INDECOPI: Ley N° 29571 y Ley N° 31435 (Plazo improrrogable de 15 días hábiles)

import { datosNegocio } from '../../../../negocio.js';

const FIRESTORE_PROJECT_ID = import.meta.env.PUBLIC_FIREBASE_PROJECT_ID || 'contabilidadwii';
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT_ID}/databases/(default)/documents`;
const CLOUDFLARE_CORREO_ENDPOINT = 'https://contabilidad-correo.lourdesinformatica10.workers.dev/enviar';

/**
 * Guarda la reclamación en Firestore (colección 'reclamaciones') y en caché local
 */
export async function guardarReclamoFirestore(reclamo) {
  // 1. Guardar en LocalStorage para consulta del cliente (Local-First)
  try {
    const listRaw = localStorage.getItem('wiReclamaciones');
    const lista = listRaw ? JSON.parse(listRaw) : [];
    lista.unshift(reclamo);
    localStorage.setItem('wiReclamaciones', JSON.stringify(lista.slice(0, 15)));
  } catch (e) {}

  // 2. Guardar en Firestore REST API
  try {
    const docId = reclamo.codigoHR.replace(/[^a-zA-Z0-9_-]/g, '_');
    const fields = {
      codigoHR: { stringValue: reclamo.codigoHR },
      fecha: { stringValue: reclamo.fecha },
      fechaTexto: { stringValue: reclamo.fechaTexto },
      nombre: { stringValue: reclamo.nombre || '' },
      tipoDoc: { stringValue: reclamo.tipoDoc || 'DNI' },
      numDoc: { stringValue: reclamo.numDoc || '' },
      telefono: { stringValue: reclamo.telefono || '' },
      email: { stringValue: reclamo.email || '' },
      direccion: { stringValue: reclamo.direccion || '' },
      apoderado: { stringValue: reclamo.apoderado || '' },
      tipoBien: { stringValue: reclamo.tipoBien || 'Servicio' },
      monto: { stringValue: String(reclamo.monto || '0.00') },
      descBien: { stringValue: reclamo.descBien || '' },
      tipoReclamacion: { stringValue: reclamo.tipoReclamacion || 'Reclamo' },
      detalle: { stringValue: reclamo.detalle || '' },
      pedido: { stringValue: reclamo.pedido || '' },
      estado: { stringValue: 'pendiente' },
      plazoLegal: { stringValue: '15 días hábiles (Ley N° 31435)' },
      proveedorRuc: { stringValue: datosNegocio.ruc || '10414732151' },
      proveedorRazon: { stringValue: datosNegocio.razonSocial || 'CPC Lourdes Cusihuaman Gálvez' }
    };

    const res = await fetch(`${FIRESTORE_BASE}/reclamaciones?documentId=${docId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields })
    });

    return res.ok;
  } catch (err) {
    console.warn('[LibroReclamaciones] Firestore write fallback:', err);
    return false;
  }
}

/**
 * Despacha confirmación por correo electrónico al cliente (conforme a ley INDECOPI)
 */
export async function enviarConfirmacionCorreo(reclamo) {
  if (!reclamo.email) return;

  try {
    const asunto = `📋 Hoja de Reclamación ${reclamo.codigoHR} · Estudio Contable Cusihuaman`;
    const html = `
      <div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif; max-width:620px; margin:0 auto; padding:24px; border:1px solid #e2e8f0; border-radius:12px; background:#ffffff;">
        <div style="background:#9e7b4f; padding:18px 22px; border-radius:8px 8px 0 0; color:#ffffff;">
          <h2 style="margin:0; font-size:1.3rem; letter-spacing:0.02em;">LIBRO DE RECLAMACIONES VIRTUAL</h2>
          <p style="margin:4px 0 0; font-size:0.85rem; opacity:0.95;">${datosNegocio.nombre || 'CPC Lourdes Cusihuaman Gálvez'} · Sede Jr. Dante 260, Surquillo, Lima</p>
        </div>
        <div style="padding:22px; color:#334155; font-size:0.95rem; line-height:1.6;">
          <p>Estimado(a) <strong>${reclamo.nombre}</strong>,</p>
          <p>Le confirmamos que su <strong>${reclamo.tipoReclamacion.toUpperCase()}</strong> ha sido ingresado(a) formalmente en nuestro sistema en cumplimiento del Código de Protección y Defensa del Consumidor de INDECOPI (Ley N° 29571).</p>
          
          <div style="background:#fdfbf7; border:1px solid #e6d8c3; border-radius:8px; padding:18px; margin:20px 0;">
            <p style="margin:0; font-size:1.15rem; font-weight:bold; color:#9e7b4f;">Código Oficial: ${reclamo.codigoHR}</p>
            <p style="margin:6px 0 0; font-size:0.85rem; color:#64748b;">Fecha y Hora de Registro: ${reclamo.fechaTexto}</p>
            <hr style="border:none; border-top:1px solid #e2e8f0; margin:14px 0;" />
            <p style="margin:0; font-size:0.9rem;"><strong>Tipo:</strong> ${reclamo.tipoReclamacion} (${reclamo.tipoReclamacion === 'Reclamo' ? 'Disconformidad con el servicio contable' : 'Queja sobre atención'})</p>
            <p style="margin:6px 0 0; font-size:0.9rem;"><strong>Servicio / Prestación:</strong> ${reclamo.tipoBien} - ${reclamo.descBien}</p>
            ${reclamo.monto && reclamo.monto !== '0.00' ? `<p style="margin:4px 0 0; font-size:0.9rem;"><strong>Monto Reclamado:</strong> S/ ${reclamo.monto}</p>` : ''}
            <p style="margin:8px 0 0; font-size:0.88rem; color:#475569;"><strong>Detalle Expuesto:</strong> ${reclamo.detalle}</p>
            <p style="margin:6px 0 0; font-size:0.88rem; color:#0f172a;"><strong>Solución Solicitada:</strong> ${reclamo.pedido}</p>
          </div>

          <div style="background:#ecfdf5; border:1px solid #a7f3d0; border-radius:8px; padding:12px 16px; margin:16px 0;">
            <p style="font-size:0.9rem; color:#065f46; font-weight:600; margin:0;">
              ⚖️ Plazo Legal Obligatorio (Ley N° 31435): Le brindaremos respuesta formal debidamente motivada en un plazo máximo e improrrogable de 15 días hábiles a su correo electrónico.
            </p>
          </div>
          
          <p style="font-size:0.85rem; color:#64748b; margin-top:22px;">
            Atentamente,<br />
            <strong>${datosNegocio.nombre || 'CPC Lourdes Cusihuaman Gálvez'}</strong><br />
            Asesoría Contable y Tributaria SUNAT<br />
            Jr. Dante 260, Surquillo · Lima, Perú<br />
            Central Telefónica: ${datosNegocio.telefonoMostrado || '987 594 558'}
          </p>
        </div>
      </div>
    `;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    await fetch(CLOUDFLARE_CORREO_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        tipo: 'reclamo',
        para: reclamo.email,
        nombre: reclamo.nombre,
        asunto,
        resumen: `Hoja de Reclamación ${reclamo.codigoHR} registrada en Estudio Cusihuaman.`,
        html
      })
    });
    clearTimeout(timeout);
  } catch (err) {
    console.warn('[LibroReclamaciones] Despacho email worker:', err);
  }
}
