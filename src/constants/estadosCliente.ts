/**
 * Constantes para los estados de cliente
 * Este archivo centraliza los estados de cliente utilizados en toda la aplicación
 */

// Estados de cliente disponibles
export const ESTADOS_CLIENTE = ["Muy Activo", "Activo", "Inactivo", "Baja"];

// Estado por defecto para nuevos clientes
export const ESTADO_CLIENTE_DEFAULT = "Activo";

// Mapeo de estados a clases de colores para Tailwind CSS
export const ESTADO_CLIENTE_COLORS: Record<string, string> = {
  "Muy Activo": "bg-green-600 text-white",
  "Activo": "bg-green-200 text-green-800",
  "Inactivo": "bg-yellow-400 text-white",
  "Baja": "bg-gray-500 text-white"
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
