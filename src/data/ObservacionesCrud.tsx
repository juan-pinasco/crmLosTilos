import { supabase } from "../integrations/supabase";
import type { Observacion } from "../types/ObservationsType";

// Obtener todas las observaciones de un cliente
export const fetchObservacionesByClienteId = async (clienteId: string) => {
  try {
    console.log("Buscando observaciones para cliente ID:", clienteId);
    const { data, error } = await supabase
      .from("observaciones_cliente")
      .select(`
        id,
        created_at,
        id_cliente,
        id_vendedor,
        observacion
      `)
      .eq("id_cliente", clienteId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error de Supabase al obtener observaciones:", error);
      throw error;
    }

    console.log("Observaciones encontradas:", data);
    return data || [];
  } catch (error) {
    console.error("Error al obtener las observaciones del cliente:", error);
    return [];
  }
};

// Crear una nueva observación
export const createObservacion = async (observacion: Observacion) => {
  try {
    console.log("Intentando crear observación:", observacion);
    
    // Validar que los campos requeridos estén presentes
    if (!observacion.id_cliente) {
      console.error("Error: id_cliente es requerido");
      return null;
    }
    
    if (!observacion.observacion || observacion.observacion.trim() === '') {
      console.error("Error: observacion es requerida y no puede estar vacía");
      return null;
    }
    
    // Asegurarse de que los tipos sean correctos
    const nuevaObservacion = {
      ...observacion,
      // Asegurarse de que id_cliente sea un string (UUID)
      id_cliente: String(observacion.id_cliente),
      // Si id_vendedor es null o undefined, dejarlo así, de lo contrario convertirlo a string
      id_vendedor: observacion.id_vendedor ? String(observacion.id_vendedor) : null
    };
    
    console.log("Datos a insertar en Supabase:", nuevaObservacion);
    
    const { data, error } = await supabase
      .from("observaciones_cliente")
      .insert([nuevaObservacion])
      .select(); // Añadir .select() para obtener los datos insertados

    if (error) {
      console.error("Error de Supabase al crear observación:", error);
      throw error;
    }

    console.log("Observación creada exitosamente:", data);
    return data;
  } catch (error) {
    console.error("Error al crear la observación:", error);
    return null;
  }
};

// Eliminar una observación
export const deleteObservacion = async (id: number) => {
  try {
    const { error } = await supabase
      .from("observaciones_cliente")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error al eliminar la observación:", error);
    return false;
  }
};
