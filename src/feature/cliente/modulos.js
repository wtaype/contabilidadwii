// src/feature/cliente/modulos.js
// Registro y configuración central de módulos para el Feature Cliente (Estudio Cusihuaman)
// Permite activar/desactivar módulos y definir el módulo por defecto desde un único lugar

export const moduloDefecto = 'pedidos';

export const modulos = [
  { id: 'pedidos',   nombre: 'Servicios',        icono: 'fa-solid fa-briefcase',        activo: true },
  { id: 'direccion', nombre: 'Domicilio Fiscal', icono: 'fa-solid fa-building',         activo: true },
  { id: 'cuenta',    nombre: 'Mi Cuenta Fiscal', icono: 'fa-solid fa-id-card',          activo: true },
  { id: 'soporte',   nombre: 'Consultas SUNAT',  icono: 'fa-solid fa-headset',          activo: true }
];

// Obtener solo los módulos habilitados para el sidebar y navegación
export const getModulosActivos = () => modulos.filter(m => m.activo);

// Obtener el módulo por defecto
export const getModuloDefecto = () => moduloDefecto;

// Validar si un módulo existe y está activo
export const esModuloValido = (id) => modulos.some(m => m.activo && m.id === id);
