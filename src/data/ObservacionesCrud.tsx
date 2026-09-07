import type { Observacion } from "../types/ObservationsType";

// Helper para obtener el token de autenticación
const getAuthToken = () => {
  const authKeys = Object.keys(localStorage).filter(
    (key) => key.startsWith("sb-") && key.includes("-auth-token"),
  );

  if (authKeys.length === 0) {
    throw new Error("No se encontró token de autenticación");
  }

  const authData = JSON.parse(localStorage.getItem(authKeys[0]) || "{}");
  const token = authData?.access_token;

  if (!token) {
    throw new Error("No se encontró access token");
  }

  return token;
};

// Helper para hacer fetch con timeout
const fetchWithTimeout = async (
  url: string,
  options: RequestInit,
  timeout = 10000,
) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// Obtener todas las observaciones
export const fetchObservaciones = async () => {
  try {
    const token = getAuthToken();

    const response = await fetchWithTimeout(
      `${import.meta.env.VITE_APP_SUPABASE_URL}/rest/v1/observaciones_cliente?select=id,created_at,id_cliente,id_vendedor,observacion&order=created_at.desc`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_APP_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    return [];
  }
};

export const fetchObservacionesByClienteId = async (clienteId: string) => {
  try {
    const token = getAuthToken();

    // Primero obtenemos las observaciones
    const response = await fetchWithTimeout(
      `${import.meta.env.VITE_APP_SUPABASE_URL}/rest/v1/observaciones_cliente?id_cliente=eq.${clienteId}&select=id,created_at,id_cliente,id_vendedor,observacion&order=created_at.desc`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_APP_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const observaciones = await response.json();

    // Si no hay observaciones, retornamos un array vacío
    if (!observaciones || observaciones.length === 0) {
      return [];
    }

    // Obtenemos los IDs únicos de vendedores
    const vendedorIds = observaciones
      .map((obs: any) => obs.id_vendedor)
      .filter((id: any) => id !== null && id !== undefined);

    // Si no hay vendedores, retornamos las observaciones sin nombres de vendedor
    if (vendedorIds.length === 0) {
      return observaciones.map((obs: any) => ({
        ...obs,
        nombre_vendedor: null,
      }));
    }

    // Obtenemos los datos de los vendedores
    const vendedoresResponse = await fetchWithTimeout(
      `${import.meta.env.VITE_APP_SUPABASE_URL}/rest/v1/vendedores?id=in.(${vendedorIds.join(",")})&select=id,nombre`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_APP_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!vendedoresResponse.ok) {
      // Si hay error, retornamos las observaciones sin nombres de vendedor
      return observaciones.map((obs: any) => ({
        ...obs,
        nombre_vendedor: null,
      }));
    }

    const vendedores = await vendedoresResponse.json();

    // Creamos un mapa de id -> nombre para los vendedores
    const vendedoresMap = vendedores.reduce(
      (
        map: Record<string, string>,
        vendedor: { id: string; nombre: string },
      ) => {
        map[vendedor.id] = vendedor.nombre;
        return map;
      },
      {} as Record<string, string>,
    );

    // Combinamos los datos
    const observacionesConNombreVendedor = observaciones.map((obs: any) => ({
      ...obs,
      nombre_vendedor: obs.id_vendedor
        ? vendedoresMap[obs.id_vendedor] || null
        : null,
    }));

    return observacionesConNombreVendedor;
  } catch (error) {
    return [];
  }
};

// Crear una nueva observación
export const createObservacion = async (observacion: Observacion) => {
  try {
    // Validar que los campos requeridos estén presentes
    if (!observacion.id_cliente) {
      return null;
    }

    if (!observacion.observacion || observacion.observacion.trim() === "") {
      return null;
    }

    // Asegurarse de que los tipos sean correctos
    // Extraemos nombre_vendedor para no enviarlo a la base de datos
    const { nombre_vendedor, ...observacionSinNombre } = observacion;

    const nuevaObservacion = {
      ...observacionSinNombre,
      // Asegurarse de que id_cliente sea un string (UUID)
      id_cliente: String(observacion.id_cliente),
      // Si id_vendedor es null o undefined, dejarlo así, de lo contrario convertirlo a string
      id_vendedor: observacion.id_vendedor
        ? String(observacion.id_vendedor)
        : null,
      // Usar created_at personalizado si se proporciona, sino usar la fecha actual
      created_at: observacion.created_at
        ? new Date(observacion.created_at).toISOString()
        : new Date().toISOString(),
    };

    console.log("Datos que se enviarán a Supabase:", nuevaObservacion);

    const token = getAuthToken();
    const response = await fetchWithTimeout(
      `${import.meta.env.VITE_APP_SUPABASE_URL}/rest/v1/observaciones_cliente`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_APP_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${token}`,
          Prefer: "return=representation",
        },
        body: JSON.stringify([nuevaObservacion]),
      },
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

// Actualizar una observación
export const updateObservacion = async (
  id: number,
  observacion: string,
  created_at?: string,
  id_vendedor?: string,
) => {
  try {
    const updateData: any = {
      observacion: observacion.trim(),
    };

    // Si se proporciona created_at, incluirlo en la actualización
    if (created_at) {
      updateData.created_at = new Date(created_at).toISOString();
    }

    // Si se proporciona id_vendedor, incluirlo en la actualización
    if (id_vendedor !== undefined) {
      updateData.id_vendedor = id_vendedor || null;
    }

    const token = getAuthToken();

    const response = await fetchWithTimeout(
      `${import.meta.env.VITE_APP_SUPABASE_URL}/rest/v1/observaciones_cliente?id=eq.${id}&select=id,created_at,id_cliente,id_vendedor,observacion`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_APP_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${token}`,
          Prefer: "return=representation",
        },
        body: JSON.stringify(updateData),
      },
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

// Eliminar una observación
export const deleteObservacion = async (id: number) => {
  try {
    const token = getAuthToken();

    const response = await fetchWithTimeout(
      `${import.meta.env.VITE_APP_SUPABASE_URL}/rest/v1/observaciones_cliente?id=eq.${id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_APP_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return true;
  } catch (error) {
    return false;
  }
};
