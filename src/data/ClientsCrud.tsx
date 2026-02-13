import type { Cliente } from "../types/ClientsType";
import Swal from "sweetalert2";

// Helper para obtener el token de autenticación
const getAuthToken = () => {
  const authKeys = Object.keys(localStorage).filter(key => 
    key.startsWith('sb-') && key.includes('-auth-token')
  );
  
  if (authKeys.length === 0) {
    throw new Error('No se encontró token de autenticación');
  }
  
  const authData = JSON.parse(localStorage.getItem(authKeys[0]) || '{}');
  const token = authData?.access_token;
  
  if (!token) {
    throw new Error('No se encontró access token');
  }
  
  return token;
};

// Helper para hacer fetch con timeout
const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 10000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

export const fetchClientes = async () => {
  try {
    const token = getAuthToken();
    
    const response = await fetchWithTimeout(
      `${import.meta.env.VITE_APP_SUPABASE_URL}/rest/v1/clientes?select=id,created_at,nombre,descripcion,email,telefono,pais,ciudad,barrio,tipo_cliente,estado,temperatura,vendedor_id,ultima_interaccion,created_by,empleo,fecha_recontacto&order=created_at.asc`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_APP_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    if (data) {
      // Procesar los teléfonos con formato 'no-phone-'
      const clientesProcesados = data.map((cliente: Cliente) => {
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
    throw error;
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
          const token = getAuthToken();
          
          // Verificar si el cliente existe antes de intentar eliminarlo
          const checkResponse = await fetchWithTimeout(
            `${import.meta.env.VITE_APP_SUPABASE_URL}/rest/v1/clientes?id=eq.${id}&select=id`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'apikey': import.meta.env.VITE_APP_SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${token}`
              }
            }
          );
          
          if (!checkResponse.ok) {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "No se pudo verificar si el cliente existe"
            });
            resolve(false);
            return;
          }
          
          const clienteExistente = await checkResponse.json();
          
          if (!clienteExistente || clienteExistente.length === 0) {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "No se encontró el cliente a eliminar"
            });
            resolve(false);
            return;
          }
          
          // Intentar eliminar el cliente
          const deleteResponse = await fetchWithTimeout(
            `${import.meta.env.VITE_APP_SUPABASE_URL}/rest/v1/clientes?id=eq.${id}`,
            {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                'apikey': import.meta.env.VITE_APP_SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${token}`
              }
            }
          );

          if (!deleteResponse.ok) {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "No se pudo eliminar el cliente: Ya que tiene observaciones o tareas asociadas. Elimine primero las TAREAS y OBSERVACIONES actuales del cliente para poder eliminarlo."
            });
            resolve(false);
            return;
          }
          
          Swal.fire({
            icon: "success",
            title: "Cliente eliminado",
            text: "El cliente ha sido eliminado correctamente",
            timer: 2000
          });
          resolve(true);
        } catch (error) {
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

    const token = getAuthToken();
    
    const response = await fetchWithTimeout(
      `${import.meta.env.VITE_APP_SUPABASE_URL}/rest/v1/clientes`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_APP_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(cliente)
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      return data;
    } else {
      return [{ ...cliente, id: 'temp-id' }];
    }
    
  } catch (error) {
    throw error;
  }
};

export const fetchClienteById = async (id: string) => {
  try {
    const token = getAuthToken();
    
    const response = await fetchWithTimeout(
      `${import.meta.env.VITE_APP_SUPABASE_URL}/rest/v1/clientes?id=eq.${id}&select=id,created_at,nombre,descripcion,email,telefono,pais,ciudad,barrio,tipo_cliente,estado,temperatura,vendedor_id,ultima_interaccion,created_by,empleo,fecha_recontacto`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_APP_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    if (data && data.length > 0) {
      const cliente = data[0];
      
      // Procesar el teléfono si tiene formato 'no-phone-'
      if (cliente.telefono && cliente.telefono.startsWith("no-phone-")) {
        cliente.telefono = null; // Establecer como null para que se muestre "Sin datos"
      }
      return cliente;
    }
  } catch (error) {
    return null;
  }
};

// Actualizar la fecha de última interacción del cliente
export const updateUltimaInteraccion = async (id: string, fecha: string) => {
  try {
    const token = getAuthToken();
    
    const response = await fetchWithTimeout(
      `${import.meta.env.VITE_APP_SUPABASE_URL}/rest/v1/clientes?id=eq.${id}&select=id,created_at,nombre,descripcion,email,telefono,pais,ciudad,barrio,tipo_cliente,estado,temperatura,vendedor_id,ultima_interaccion,created_by,empleo,fecha_recontacto`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_APP_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ ultima_interaccion: fecha })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return null;
  }
};

// Actualizar la fecha de recontacto del cliente
export const updateFechaRecontacto = async (
  id: string,
  fecha: string | null
) => {
  try {
    const token = getAuthToken();
    
    const response = await fetchWithTimeout(
      `${import.meta.env.VITE_APP_SUPABASE_URL}/rest/v1/clientes?id=eq.${id}&select=id,created_at,nombre,descripcion,email,telefono,pais,ciudad,barrio,tipo_cliente,estado,temperatura,vendedor_id,ultima_interaccion,created_by,empleo,fecha_recontacto`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_APP_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ fecha_recontacto: fecha })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return null;
  }
};

// Actualizar datos del cliente
export const updateCliente = async (
  id: string,
  clienteData: Partial<Cliente>
) => {
  try {
    // Asegurar que el teléfono tenga un valor único si está vacío
    if (clienteData.telefono === null || clienteData.telefono === "") {
      const randomId = Math.random().toString(36).substring(2, 10);
      clienteData.telefono = `no-phone-${randomId}`;
    }

    const token = getAuthToken();
    
    const response = await fetchWithTimeout(
      `${import.meta.env.VITE_APP_SUPABASE_URL}/rest/v1/clientes?id=eq.${id}&select=id,created_at,nombre,descripcion,email,telefono,pais,ciudad,barrio,tipo_cliente,estado,temperatura,vendedor_id,ultima_interaccion,created_by,empleo,fecha_recontacto`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_APP_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(clienteData)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data[0];
  } catch (error) {
    return null;
  }
};
