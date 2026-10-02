// src/app.js
// 🌐 Configuración Global y Dinámica de Estudio Cusihuaman
import wii from './wii.js';
import { datosNegocio } from './negocio.js';

export const app = {
  id: wii.id,
  get app() { return datosNegocio.nombre; },
  get nombreComercial() { return datosNegocio.nombre; },
  get marcaRespaldo() { return datosNegocio.especialista; },
  get autorizacion() { return datosNegocio.registroColegio; },
  get registroColegio() { return datosNegocio.registroColegio; },
  slogan: "Asesoría contable y tributaria estratégica ante SUNAT · 4ta y 5ta categoría · Criterio Ex-SUNAT",
  sloganEn: "Strategic tax and accounting advisory in Peru · 4th and 5th category taxes · Former SUNAT expertise",
  
  // Enlaces y Contacto
  linkweb: wii.linkweb,
  linkme: wii.linkme,
  get telefono() { return datosNegocio.telefonoMostrado; },
  get telefonoLimpio() { return datosNegocio.telefonoLimpio; },
  get whatsappUrl() {
    const msg = datosNegocio.whatsappMensaje ? `&text=${encodeURIComponent(datosNegocio.whatsappMensaje)}` : '';
    return `https://api.whatsapp.com/send?phone=${datosNegocio.whatsappLimpio || datosNegocio.telefonoLimpio}${msg}`;
  },
  get mapsUrl() { return datosNegocio.mapsUrl; },

  // Sedes Físicas
  get direccion() { return datosNegocio.direccionSede; },
  get horario() { return datosNegocio.horario; },
  get horarioEn() { return datosNegocio.horarioEn; },
  get coordenadas() { return datosNegocio.coordenadas; },
  get sedes() { return datosNegocio.sedes; },

  // Redes Sociales Oficiales
  get facebook() { return datosNegocio.redes?.facebook || ''; },
  get instagram() { return datosNegocio.redes?.instagram || ''; },
  get tiktok() { return datosNegocio.redes?.tiktok || ''; }
};

export default app;