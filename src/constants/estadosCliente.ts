/**
 * Constantes para los estados de cliente
 * Este archivo centraliza los estados de cliente utilizados en toda la aplicación
 */

// Estados de cliente disponibles
export const ESTADOS_CLIENTE = ["Activo", "Inactivo", "Pendiente", "Archivado", "Baja"];

// Estado por defecto para nuevos clientes
export const ESTADO_CLIENTE_DEFAULT = "Activo";

// Mapeo de estados a clases de colores para Tailwind CSS
export const ESTADO_CLIENTE_COLORS: Record<string, string> = {
  "Activo": "bg-green-100 text-green-800",
  "Inactivo": "bg-gray-100 text-gray-800",
  "Pendiente": "bg-yellow-100 text-yellow-800",
  "Archivado": "bg-red-100 text-red-800",
  "Baja": "bg-red-100 text-red-800"
};

// Interfaz para el estado de cliente
export interface EstadoCliente {
  valor: string;
  color: string;
}

// Función para obtener todos los estados de cliente con sus colores
export const obtenerEstadosCliente = (): EstadoCliente[] => {
  return ESTADOS_CLIENTE.map(estado => ({
    valor: estado,
    color: ESTADO_CLIENTE_COLORS[estado]
  }));
};

// Función para validar si un estado de cliente es válido
export const esEstadoClienteValido = (estado: string): boolean => {
  return ESTADOS_CLIENTE.includes(estado);
};
