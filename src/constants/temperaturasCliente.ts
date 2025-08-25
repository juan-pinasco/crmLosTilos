/**
 * Constantes para las temperaturas de cliente
 * Este archivo centraliza las temperaturas de cliente utilizadas en toda la aplicación
 */

// Temperaturas de cliente disponibles
export const TEMPERATURAS_CLIENTE = ["Caliente", "Templado", "Frío", "Helado"];

// Temperatura por defecto para nuevos clientes
export const TEMPERATURA_CLIENTE_DEFAULT = "Caliente";

// Mapeo de temperaturas a clases de colores para Tailwind CSS
export const TEMPERATURA_CLIENTE_COLORS: Record<string, string> = {
  "Caliente": "bg-red-100 text-red-800",
  "Templado": "bg-yellow-100 text-yellow-800",
  "Frío": "bg-blue-100 text-blue-800",
  "Helado": "bg-gray-100 text-gray-800"
};

// Interfaz para la temperatura de cliente
export interface TemperaturaCliente {
  valor: string;
  color: string;
}

// Función para obtener todas las temperaturas de cliente con sus colores
export const obtenerTemperaturasCliente = (): TemperaturaCliente[] => {
  return TEMPERATURAS_CLIENTE.map(temperatura => ({
    valor: temperatura,
    color: TEMPERATURA_CLIENTE_COLORS[temperatura]
  }));
};

// Función para validar si una temperatura de cliente es válida
export const esTemperaturaClienteValida = (temperatura: string): boolean => {
  return TEMPERATURAS_CLIENTE.includes(temperatura);
};
