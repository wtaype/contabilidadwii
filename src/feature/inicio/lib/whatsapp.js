// src/feature/inicio/lib/whatsapp.js
// 🚀 Motor Centralizado de Mensajes WhatsApp para Contabilidadwii
// Funciona de forma isomórfica (Build-time SSR en Astro + Runtime en Cliente)
// Prioridad:
// 1. Cliente: localStorage ('wi_negocio' o 'minegocio' actualizado desde Firestore)
// 2. Compilación (al cocinarse): datos frescos de Firebase Firestore ('negocio/principal')
// 3. Semilla: semillas/negocio.json
// 4. Si no existe o se eliminó: '' (cadena vacía, 0 números quemados)

import { datosNegocio } from '../../../negocio.js';
import negocioSemilla from '@/semillas/negocio.json';

/**
 * Obtiene el saludo dinámico según la hora del día en Perú
 */
export function obtenerSaludoHora() {
  const hora = new Date().getHours();
  if (hora >= 5 && hora < 12) return 'Buenos días';
  if (hora >= 12 && hora < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

/**
 * Obtiene el número de WhatsApp canónico siguiendo la prioridad:
 * 1. Cliente: localStorage ('wi_negocio' / 'minegocio' de Firestore)
 * 2. Compilación / Firebase: datosNegocio.whatsappLimpio
 * 3. Semilla: semillas/negocio.json
 * 4. Vacío '' si no hay número
 */
export function obtenerNumeroWhatsApp() {
  // 1. Cliente: consultar último número actualizado en caché local de Firestore
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('wi_negocio') || localStorage.getItem('minegocio');
      if (raw) {
        const cfg = JSON.parse(raw);
        const wa = cfg.contacto?.whatsappLimpio || cfg.contacto?.whatsapp || cfg.contacto?.telefonoLimpio || cfg.contacto?.telefono;
        if (wa) return String(wa).replace(/\D/g, '');
      }
    } catch (e) {}
  }

  // 2. Al momento de cocinarse / servidor: consultar datos frescos de Firebase Firestore
  try {
    const waBuild = datosNegocio?.whatsappLimpio || datosNegocio?.whatsapp;
    if (waBuild) return String(waBuild).replace(/\D/g, '');
  } catch (e) {}

  // 3. Respaldo de Semillas
  const waSemilla = negocioSemilla?.contacto?.whatsapp || negocioSemilla?.contacto?.telefono;
  if (waSemilla) return String(waSemilla).replace(/\D/g, '');

  // 4. Si no hay número configurado o el dueño lo eliminó: ''
  return '';
}

/**
 * Obtiene el nombre del negocio (desde caché local, Firebase o semillas)
 */
export function obtenerNombreNegocio() {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('wi_negocio') || localStorage.getItem('minegocio');
      if (raw) {
        const cfg = JSON.parse(raw);
        const nom = cfg.identidad?.nombre || cfg.nombre;
        if (nom) return nom;
      }
    } catch (e) {}
  }
  return datosNegocio?.nombre || negocioSemilla?.identidad?.nombre || '';
}

/**
 * Genera el texto formateado simple, natural y sin etiquetas técnicas
 */
export function generarMensajeWhatsApp({
  origen = '',
  producto = '',
  precio = null,
  cantidad = 1,
  distrito = '',
  direccion = '',
  cliente = '',
  celular = '',
  metodoPago = '',
  detalle = '',
  notas = '',
  extra = ''
} = {}) {
  const saludo = obtenerSaludoHora();
  const lineas = [];

  const cantTxt = cantidad > 1 ? `${cantidad}x ` : '';
  const precioTxt = precio !== null && precio !== undefined && !isNaN(Number(precio))
    ? ` (S/ ${Number(precio).toFixed(2)})`
    : '';

  // CASO A: Pedido formal desde el Modal Express (con dirección, cliente o pago)
  if (cliente || direccion || metodoPago) {
    lineas.push(`${saludo}, quiero realizar un pedido:`);
    if (cliente) {
      const cel = celular ? ` (📱 ${celular})` : '';
      lineas.push(`👤 Soy: ${cliente}${cel}`);
    }
    if (producto) {
      lineas.push(`📦 ${cantTxt}${producto}${precioTxt}`);
    }
    if (direccion || distrito) {
      const dirCompleta = direccion && distrito 
        ? `${direccion}, ${distrito}` 
        : (direccion || distrito);
      lineas.push(`📍 Entrega: ${dirCompleta}`);
    }
    if (metodoPago) {
      lineas.push(`💳 Pago: ${metodoPago}`);
    }
    if (notas) {
      lineas.push(`📝 Nota: ${notas}`);
    }
    if (extra) {
      lineas.push(extra);
    }
    lineas.push(``);
    lineas.push(`¿Podrían confirmarme el pedido, por favor? ¡Muchas gracias!`);
    return lineas.join('\n');
  }

  // CASO B: Clic directo en tarjeta de producto (Card de Inicio)
  if (producto) {
    lineas.push(`${saludo}. He visto en su página web el ${cantTxt}${producto}${precioTxt}. Quiero realizar el pedido, ¿podrían confirmarme por favor? ¡Muchas gracias!`);
    if (notas) lineas.push(`📝 Nota: ${notas}`);
    if (extra) lineas.push(extra);
    return lineas.join('\n');
  }

  // CASO C: Consulta de sección específica (Balanza, Garantía, FAQ, etc.)
  if (detalle) {
    lineas.push(`${saludo}. He visto en su página web: ${detalle}. Quisiera consultar la atención, ¿podrían confirmarme por favor? ¡Muchas gracias!`);
    return lineas.join('\n');
  }

  const nombreNegocio = obtenerNombreNegocio();
  lineas.push(`${saludo}, ${nombreNegocio}. He visto su página web y deseo consultar sobre sus servicios contables y asesoría SUNAT. ¿Podrían orientarme, por favor? ¡Muchas gracias!`);
  return lineas.join('\n');
}

/**
 * Genera el enlace directo de WhatsApp wa.me codificado
 */
export function crearEnlaceWhatsApp(opciones = {}, numeroPersonalizado = null) {
  const num = numeroPersonalizado ? String(numeroPersonalizado).replace(/\D/g, '') : obtenerNumeroWhatsApp();
  const msg = typeof opciones === 'string' ? opciones : generarMensajeWhatsApp(opciones);
  if (!num) return '#';
  return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
}

export default {
  obtenerSaludoHora,
  obtenerNumeroWhatsApp,
  obtenerNombreNegocio,
  generarMensajeWhatsApp,
  crearEnlaceWhatsApp
};
