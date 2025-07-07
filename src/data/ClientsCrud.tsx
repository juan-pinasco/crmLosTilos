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
      `);

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
