/**
 * Constantes para los tipos de cliente
 * Este archivo centraliza los tipos de cliente utilizados en toda la aplicación
 */

// Tipos de cliente disponibles
export const TIPOS_CLIENTE = ["Reunion","Visita","Particular", "Empresa", "Inmobiliario"];

// Tipo por defecto para nuevos clientes
export const TIPO_CLIENTE_DEFAULT = "Particular";

// Mapeo de tipos a clases de colores para Tailwind CSS
export const TIPO_CLIENTE_COLORS: Record<string, string> = {
  "Reunion": "bg-blue-100 text-blue-800",
  "Visita": "bg-yellow-100 text-yellow-800",
  "Particular": "bg-purple-100 text-purple-800",
  "Empresa": "bg-green-100 text-green-800",
  "Inmobiliario": "bg-gray-100 text-gray-800"
};

// Interfaz para el tipo de cliente
export interface TipoCliente {
  valor: string;
  color: string;
}

// Función para obtener todos los tipos de cliente con sus colores
export const obtenerTiposCliente = (): TipoCliente[] => {
  return TIPOS_CLIENTE.map(tipo => ({
    valor: tipo,
    color: TIPO_CLIENTE_COLORS[tipo]
  }));
};

// Función para validar si un tipo de cliente es válido
export const esTipoClienteValido = (tipo: string): boolean => {
  return TIPOS_CLIENTE.includes(tipo);
};
