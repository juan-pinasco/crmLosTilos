/**
 * Constantes para los tipos de cliente
 * Este archivo centraliza los tipos de cliente utilizados en toda la aplicación
 */

// Tipos de cliente disponibles
export const TIPOS_CLIENTE = ["SI Reunion/Visita","NO Reunion/Visita"];

// Tipo por defecto para nuevos clientes
export const TIPO_CLIENTE_DEFAULT = "SI Reunion/Visita";

// Mapeo de tipos a clases de colores para Tailwind CSS
export const TIPO_CLIENTE_COLORS: Record<string, string> = {
  "SI Reunion/Visita": "bg-green-100 text-green-800",
  "NO Reunion/Visita": "bg-red-100 text-red-800",
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
