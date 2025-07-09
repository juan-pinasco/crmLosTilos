/**
 * Constantes para los estados de tareas
 * Este archivo centraliza los estados de tareas utilizados en toda la aplicación
 */

// Estados de tareas disponibles
export const ESTADOS_TAREA = ["Pendiente", "En Progreso", "Completado", "Cancelado"];

// Estado por defecto para nuevas tareas
export const ESTADO_TAREA_DEFAULT = "Pendiente";

// Mapeo de estados a clases de colores para Tailwind CSS
export const ESTADO_TAREA_COLORS = {
  "Pendiente": "bg-yellow-100 text-yellow-800",
  "En Progreso": "bg-blue-100 text-blue-800",
  "Completado": "bg-green-100 text-green-800",
  "Cancelado": "bg-red-100 text-red-800"
};
