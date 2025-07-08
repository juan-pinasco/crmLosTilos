import { supabase } from "../integrations/supabase";
import type { Cliente } from "../types/ClientsType";

export const fetchClientes = async () => {
  try {
    // Consulta explícita para obtener clientes con todos sus campos, incluyendo created_by
    const { data, error } = await supabase
      .from("clientes")
      .select(`
        id,
        created_at,
        nombre,
        descripcion,
        email,
        telefono,
        pais,
        ciudad,
        barrio,
        tipo_cliente,
        estado,
        temperatura,
        vendedor_id,
        ultima_interaccion,
        created_by
      `)
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    if (data) {
      console.log("Clientes:",data);
      return data;
    }
  } catch (error) {
    console.error("Error al obtener los clientes:", error);
  }
};

export const deleteClient = async (id: string) => {
  try {
    const { error } = await supabase.from("clientes").delete().eq("id", id);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error al eliminar el cliente:", error);
  }
};

export const create = async (cliente: Cliente) => {
  try {
    const { data, error } = await supabase.from("clientes").insert([cliente]);

    if (error) {
      throw error;
    }

    if (data) {
      return data;
    }
  } catch (error) {
    console.error("Error al crear el cliente:", error);
  }
};

export const fetchClienteById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from("clientes")
      .select(`
        id,
        created_at,
        nombre,
        descripcion,
        email,
        telefono,
        pais,
        ciudad,
        barrio,
        tipo_cliente,
        estado,
        temperatura,
        vendedor_id,
        ultima_interaccion,
        created_by
      `)
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }

    if (data) {
      return data;
    }
  } catch (error) {
    console.error("Error al obtener el cliente:", error);
    return null;
  }
};

// Actualizar la fecha de última interacción del cliente
export const updateUltimaInteraccion = async (id: string, fecha: string) => {
  try {
    console.log(`Actualizando última interacción del cliente ${id} a ${fecha}`);
    
    const { data, error } = await supabase
      .from("clientes")
      .update({ ultima_interaccion: fecha })
      .eq("id", id)
      .select();

    if (error) {
      console.error("Error al actualizar la última interacción:", error);
      throw error;
    }

    console.log("Cliente actualizado correctamente:", data);
    return data;
  } catch (error) {
    console.error("Error al actualizar la última interacción del cliente:", error);
    return null;
  }
};
