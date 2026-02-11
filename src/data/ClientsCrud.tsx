import { supabase } from "../integrations/supabase";
import type { Cliente } from "../types/ClientsType";
import Swal from "sweetalert2";

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
      .order("created_at", { ascending: true });

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

export const deleteClient = async (id: string): Promise<boolean> => {
  return new Promise((resolve) => {
    Swal.fire({
      title: "¿Eliminar cliente?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          console.log(`Intentando eliminar cliente con ID: ${id}`);
          
          // Verificar si el cliente existe antes de intentar eliminarlo
          const { data: clienteExistente, error: errorConsulta } = await supabase
            .from("clientes")
            .select("id")
            .eq("id", id)
            .single();
          
          if (errorConsulta) {
            console.error("Error al verificar si el cliente existe:", errorConsulta);
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "No se pudo verificar si el cliente existe"
            });
            resolve(false);
            return;
          }
          
          if (!clienteExistente) {
            console.error(`No se encontró ningún cliente con ID: ${id}`);
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "No se encontró el cliente a eliminar"
            });
            resolve(false);
            return;
          }
          
          // Intentar eliminar el cliente
          const { error } = await supabase
            .from("clientes")
            .delete()
            .eq("id", id);

          if (error) {
            console.error("Error al eliminar el cliente:", error);
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "No se pudo eliminar el cliente: Ya que tiene observaciones o tareas asociadas. Elimine primero las TAREAS y OBSERVACIONES actuales del cliente para poder eliminarlo."
            });
            resolve(false);
            return;
          }
          
          console.log(`Cliente con ID: ${id} eliminado correctamente`);
          Swal.fire({
            icon: "success",
            title: "Cliente eliminado",
            text: "El cliente ha sido eliminado correctamente",
            timer: 2000
          });
          resolve(true);
        } catch (error) {
          console.error("Error inesperado al eliminar el cliente:", error);
          Swal.fire({
            icon: "error",
            title: "Error inesperado",
            text: "Ocurrió un error al eliminar el cliente"
          });
          resolve(false);
        }
      } else {
        // El usuario canceló la eliminación
        resolve(false);
      }
    });
  });
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
