import { supabase } from "../integrations/supabase";
import type { Cliente } from "../types/ClientsType";

export const fetchClientes = async () => {
  try {
    // Consulta explícita para obtener clientes con todos sus campos, incluyendo created_by
    const { data, error } = await supabase
      .from("clientes")
      .select(
        `
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
        created_by,
        empleo,
        fecha_recontacto
      `
      )
      .order("ultima_interaccion", { ascending: true });

    if (error) {
      throw error;
    }

    if (data) {
      console.log("Clientes:", data);
      // Procesar los teléfonos con formato 'no-phone-'
      const clientesProcesados = data.map((cliente) => {
        if (cliente.telefono && cliente.telefono.startsWith("no-phone-")) {
          return {
            ...cliente,
            telefono: null, // Establecer como null para que se muestre "Sin datos"
          };
        }
        return cliente;
      });
      return clientesProcesados;
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
    // Asegurar que el teléfono tenga un valor único si está vacío
    if (!cliente.telefono) {
      const randomId = Math.random().toString(36).substring(2, 10);
      cliente.telefono = `no-phone-${randomId}`;
    }

    const { data, error } = await supabase
      .from("clientes")
      .insert([cliente])
      .select();

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
      .select(
        `
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
        created_by,
        empleo,
        fecha_recontacto
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }

    if (data) {
      // Procesar el teléfono si tiene formato 'no-phone-'
      if (data.telefono && data.telefono.startsWith("no-phone-")) {
        data.telefono = null; // Establecer como null para que se muestre "Sin datos"
      }
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
    console.error(
      "Error al actualizar la última interacción del cliente:",
      error
    );
    return null;
  }
};

// Actualizar la fecha de recontacto del cliente
export const updateFechaRecontacto = async (
  id: string,
  fecha: string | null
) => {
  try {
    console.log(
      `Actualizando fecha de recontacto del cliente ${id} a ${
        fecha === null ? "NULL" : fecha
      }`
    );

    const { data, error } = await supabase
      .from("clientes")
      .update({ fecha_recontacto: fecha })
      .eq("id", id)
      .select();

    if (error) {
      console.error("Error al actualizar la fecha de recontacto:", error);
      throw error;
    }

    console.log("Fecha de recontacto actualizada correctamente:", data);
    return data;
  } catch (error) {
    console.error(
      "Error al actualizar la fecha de recontacto del cliente:",
      error
    );
    return null;
  }
};

// Actualizar datos del cliente
export const updateCliente = async (
  id: string,
  clienteData: Partial<Cliente>
) => {
  try {
    console.log(`Actualizando datos del cliente ${id}:`, clienteData);
    // Asegurar que el teléfono tenga un valor único si está vacío
    if (clienteData.telefono === null || clienteData.telefono === "") {
      const randomId = Math.random().toString(36).substring(2, 10);
      clienteData.telefono = `no-phone-${randomId}`;
    }

    const { data, error } = await supabase
      .from("clientes")
      .update(clienteData)
      .eq("id", id)
      .select();

    if (error) {
      console.error("Error al actualizar el cliente:", error);
      throw error;
    }

    console.log("Cliente actualizado correctamente:", data);
    return data[0];
  } catch (error) {
    console.error("Error al actualizar el cliente:", error);
    return null;
  }
};
