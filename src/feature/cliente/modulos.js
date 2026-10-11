// src/feature/cliente/modulos.js
// Registro y configuración desacoplada del Portal de Clientes
// Gobernado dinámicamente por src/semillas/config.json
import configSemilla from '@/semillas/config.json';

const modulosConfig = configSemilla?.portalCliente?.modulos || [
  { id: 'pedidos',   nombre: 'Servicios',        icono: 'fa-solid fa-briefcase', activo: true },
  { id: 'direccion', nombre: 'Domicilio Fiscal', icono: 'fa-solid fa-building',  activo: true },
  { id: 'cuenta',    nombre: 'Mi Cuenta Fiscal', icono: 'fa-solid fa-id-card',   activo: true },
  { id: 'soporte',   nombre: 'Consultas SUNAT',  icono: 'fa-solid fa-headset',   activo: true }
];

export const moduloDefecto = configSemilla?.portalCliente?.moduloDefecto || 'pedidos';
export const modulos = modulosConfig;

// Obtener solo los módulos habilitados para el sidebar y navegación
export const getModulosActivos = () => modulos.filter(m => m.activo);

// Obtener el módulo por defecto
export const getModuloDefecto = () => moduloDefecto;

// Validar si un módulo existe y está activo
export const esModuloValido = (id) => modulos.some(m => m.activo && m.id === id);
