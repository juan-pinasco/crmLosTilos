/**
 * Constantes para los estados de cliente
 * Este archivo centraliza los estados de cliente utilizados en toda la aplicación
 */

// Estados de cliente disponibles
export const ESTADOS_CLIENTE = ["VIC(Very Important Client)", "Interesado", "Activo/Menos30 dias", "PocoActivo/30a90 dias", "Pasivo/Mas 90 dias", "Nos Llaman", "No Seguir", "Vendido"];

// Estado por defecto para nuevos clientes
export const ESTADO_CLIENTE_DEFAULT = "Interesado";

// Mapeo de estados a clases de colores para Tailwind CSS
export const ESTADO_CLIENTE_COLORS: Record<string, string> = {
  "VIC(Very Important Client)": "bg-green-800 text-white",
  "Interesado": "bg-green-600 text-white",
  "Activo/Menos30 dias": "bg-green-200 text-green-800",
  "PocoActivo/30a90 dias": "bg-blue-200 text-blue-800",
  "Pasivo/Mas 90 dias": "bg-blue-600 text-white",
  "Nos Llaman": "bg-gray-500 text-white",
  "No Seguir": "bg-gray-200 text-gray-400",
  "Vendido": "bg-purple-800 text-white"
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
