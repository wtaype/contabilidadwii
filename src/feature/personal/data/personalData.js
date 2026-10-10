// src/feature/personal/data/personalData.js
// Datos comerciales y de Firebase para el feature Personal (Estudio Cusihuaman)
import { datosNegocio } from '@/negocio.js';

export const estadisticasDemo = [
  { 
    id: 'stat1', 
    titulo: 'S/ 80.00', 
    subtitulo: 'Orientación SUNAT (Precio Web)', 
    icono: 'fa-solid fa-scale-balanced', 
    color: 'orange' 
  },
  { 
    id: 'stat2', 
    titulo: 'S/ 3,450.00', 
    subtitulo: 'Facturado SUNAT', 
    icono: 'fa-solid fa-file-invoice-dollar', 
    color: 'green' 
  },
  { 
    id: 'stat3', 
    titulo: '48 Clientes', 
    subtitulo: 'Activos en Cartera', 
    icono: 'fa-solid fa-address-book', 
    color: 'blue' 
  },
  { 
    id: 'stat4', 
    titulo: '3 Notas', 
    subtitulo: 'Agenda Tributaria', 
    icono: 'fa-solid fa-note-sticky', 
    color: 'purple' 
  }
];

export const clientesRecientesDemo = [
  { 
    id: 'c1', 
    nombre: 'Dra. Valeria Mendoza', 
    telefono: '987 654 321', 
    direccion: 'Jr. Dante 260, Surquillo', 
    habitual: 'Rentas de 4ta Categoría (RHE)', 
    comprobante: 'Recibo Honorarios (DNI 74829103)' 
  },
  { 
    id: 'c2', 
    nombre: 'Inversiones Gastronómicas El Rincón S.A.C.', 
    telefono: '981 123 456', 
    direccion: 'Av. Angamos Este 1240, Surquillo', 
    habitual: 'Régimen MYPE Tributario (Mensual)', 
    comprobante: 'Factura (RUC 20554897123)' 
  },
  { 
    id: 'c3', 
    nombre: 'Arq. Carlos Alarcón', 
    telefono: '992 234 567', 
    direccion: 'Calle Esperanza 342, Miraflores', 
    habitual: 'Suspensión Retenciones (Form. 1609)', 
    comprobante: 'Boleta (DNI 45892147)' 
  },
  { 
    id: 'c4', 
    nombre: 'Comercializadora Brasa & Leña E.I.R.L.', 
    telefono: '973 345 678', 
    direccion: 'Av. Aviación 2890, San Borja', 
    habitual: 'Régimen Especial (RER) + PLAME', 
    comprobante: 'Factura (RUC 20608945123)' 
  }
];

export const notasInicialesDemo = [
  { 
    id: 'n1', 
    tag: 'Urgente', 
    titulo: 'Cronograma SUNAT: Vencimiento RUC dígito 4 y 5', 
    texto: 'Presentar declaración jurada mensual IGV/Renta de clientes con RUC terminado en 4 y 5 antes del cierre del cronograma.', 
    fecha: 'Octubre 2026', 
    done: false 
  },
  { 
    id: 'n2', 
    tag: 'Trámite', 
    titulo: 'Suspensión de Retenciones Formulario 1609', 
    texto: 'Generar solicitud de suspensión de retenciones de 4ta categoría en SUNAT Operaciones en Línea para profesionales independientes.', 
    fecha: 'Octubre 2026', 
    done: false 
  },
  { 
    id: 'n3', 
    tag: 'Buzón SOL', 
    titulo: 'Revisión preventiva de Buzón SOL', 
    texto: 'Auditar mensajes y resoluciones en Buzón SOL para empresas en Surquillo a fin de prevenir multas u órdenes de pago.', 
    fecha: 'Octubre 2026', 
    done: true 
  }
];
