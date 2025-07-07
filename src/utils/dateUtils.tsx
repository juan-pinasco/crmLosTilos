/**
 * Utilidades para formatear fechas en la aplicación CRM Los Tilos
 */

/**
 * Formatea una fecha ISO a formato legible en español (Argentina)
 * @param isoDate - Fecha en formato ISO
 * @param showTime - Indica si se debe mostrar la hora (por defecto: false)
 * @returns Fecha formateada en español
 */
export const formatearFecha = (isoDate: string | null | undefined, showTime: boolean = false): string => {
  if (!isoDate) return '-';
  
  try {
    // Crear objeto Date con la fecha ISO
    const fecha = new Date(isoDate);
    
    // Opciones para formatear la fecha en español (Argentina)
    const opciones: Intl.DateTimeFormatOptions = {
      timeZone: 'America/Argentina/Buenos_Aires',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    };
    
    // Si se solicita mostrar la hora, añadir opciones de hora
    if (showTime) {
      opciones.hour = '2-digit';
      opciones.minute = '2-digit';
      opciones.hour12 = false; // Formato 24 horas
    }
    
    // Formatear la fecha según las opciones
    return new Intl.DateTimeFormat('es-AR', opciones).format(fecha);
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return isoDate || '-'; // Devolver la fecha original si hay error
  }
};
