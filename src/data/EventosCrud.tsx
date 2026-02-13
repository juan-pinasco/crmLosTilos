import { supabase } from "../integrations/supabase";
import type { Evento } from "../types/EventsType";

// Obtener todos los eventos
export const fetchEventos = async () => {
  try {
    const { data, error } = await supabase
      .from("eventos")
      .select(`
        *,
        vendedor:tarea_vendedor_id(id, nombre),
        cliente:tarea_client_id(id, nombre)
      `)
      .order("estado_tarea", { ascending: false })
      .order("fecha_realizacion", { ascending: true });
    
    if (error) {
      console.error("Error al obtener eventos:", error);
      throw error;
    }
    
    return data as Evento[];
  } catch (err) {
    console.error("Error al cargar eventos:", err);
    return [];
  }
};

// Obtener eventos por cliente
export const fetchEventosByCliente = async (clienteId: string) => {
  try {
    const { data, error } = await supabase
      .from("eventos")
      .select(`
        *,
        vendedor:tarea_vendedor_id(id, nombre)
      `)
      .eq("tarea_client_id", clienteId)
      .order("fecha_realizacion", { ascending: true });
    
    if (error) {
      console.error("Error al obtener eventos:", error);
      throw error;
    }
    
    return data as Evento[];
  } catch (err) {
    console.error("Error al cargar eventos:", err);
    return [];
  }
};

// Crear nuevo evento
export const crearEvento = async (eventoData: {
  titulo: string;
  descripcion: string;
  fecha_realizacion: string;
  estado_tarea: string;
  tarea_client_id: string | null;
  tarea_vendedor_id: string | null;
  created_by: string | null;
}) => {
  try {
    const nuevoEvento = {
      ...eventoData,
      descripcion: eventoData.descripcion || "",
      estado_tarea: eventoData.estado_tarea || "Pendiente",
      created_by: eventoData.created_by || "usuario@sistema.com"
    };
    
    console.log("Datos del evento a crear:", nuevoEvento);
    
    // Obtener token de autenticación del localStorage
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

    // Hacer fetch directo con timeout manual
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos
    let data: any;

    try {
      const response = await fetch(`${import.meta.env.VITE_APP_SUPABASE_URL}/rest/v1/eventos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_APP_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(nuevoEvento),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      data = await response.json();
      
      console.log("Evento creado exitosamente");
    
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
    
    // Si se creó el evento correctamente, hacer una consulta adicional para obtener el evento con la información del vendedor
    if (data && data.length > 0) {
      const eventoId = data[0].id;
      
      // Hacer fetch directo para obtener evento con vendedor
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos
      let eventoConVendedor: any;
      let errorConsulta: any;

      try {
        const response = await fetch(`${import.meta.env.VITE_APP_SUPABASE_URL}/rest/v1/eventos?id=eq.${eventoId}&select=*,vendedor:tarea_vendedor_id(id,nombre)`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_APP_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const responseData = await response.json();
        eventoConVendedor = responseData[0]; // Supabase devuelve array
        errorConsulta = null;
        
      } catch (fetchError) {
        clearTimeout(timeoutId);
        errorConsulta = fetchError;
        eventoConVendedor = null;
      }
      
      if (errorConsulta) {
        console.error("Error al obtener evento con vendedor:", errorConsulta);
        // Si hay error en la consulta adicional, devolvemos el evento original sin vendedor
        return data[0] as Evento;
      }
      
      console.log("Evento recuperado con información de vendedor");
      return eventoConVendedor as Evento;
    }
    
    return data?.[0] as Evento;
  } catch (err: any) {
    console.error("Error al crear evento:", err);
    throw new Error(`Error al crear el evento: ${err.message || err}`);
  }
};

// Actualizar estado de evento
export const actualizarEstadoEvento = async (eventoId: string, nuevoEstado: string) => {
  try {
    const { error } = await supabase
      .from("eventos")
      .update({ estado_tarea: nuevoEstado })
      .eq("id", eventoId);
    
    if (error) {
      console.error("Error al actualizar estado:", error);
      throw error;
    }
    
    return true;
  } catch (err) {
    console.error("Error al actualizar estado del evento:", err);
    return false;
  }
};

// Eliminar evento
export const eliminarEvento = async (eventoId: string) => {
  try {
    const { error } = await supabase
      .from("eventos")
      .delete()
      .eq("id", eventoId);
    
    if (error) {
      console.error("Error al eliminar evento:", error);
      throw error;
    }
    
    return true;
  } catch (err) {
    console.error("Error al eliminar evento:", err);
    return false;
  }
};

// Actualizar evento
export const actualizarEvento = async (eventoId: string, eventoData: {
  titulo?: string;
  descripcion?: string;
  fecha_realizacion?: string;
  estado_tarea?: string;
  tarea_client_id?: string | null;
  tarea_vendedor_id?: string | null;
}) => {
  try {
    const { data, error } = await supabase
      .from("eventos")
      .update(eventoData)
      .eq("id", eventoId)
      .select(`
        *,
        vendedor:tarea_vendedor_id(id, nombre),
        cliente:tarea_client_id(id, nombre)
      `);
    
    if (error) {
      console.error("Error al actualizar evento:", error);
      throw error;
    }
    
    return data?.[0] as Evento;
  } catch (err) {
    console.error("Error al actualizar evento:", err);
    return null;
  }
};

// ======================================================
// Obtener cantidad de tareas pendientes por cliente
// Devuelve un Map<clienteId, cantidad>
// ======================================================
export const fetchPendientesPorCliente = async () => {
  const { data, error } = await supabase
    .from("eventos")
    .select("id, tarea_client_id")
    .eq("estado_tarea", "Pendiente");

  if (error) {
    console.error("Error al obtener pendientes:", error);
    throw error;
  }

  const map = new Map<string, number>();
  (data || []).forEach((row: any) => {
    const idCliente = row.tarea_client_id as string;
    if (!idCliente) return;
    map.set(idCliente, (map.get(idCliente) || 0) + 1);
  });
  return map;
};

// Obtener evento por ID
export const fetchEventoPorId = async (eventoId: string) => {
  try {
    const { data, error } = await supabase
      .from("eventos")
      .select(`
        *,
        vendedor:tarea_vendedor_id(id, nombre),
        cliente:tarea_client_id(id, nombre)
      `)
      .eq("id", eventoId)
      .single();
    
    if (error) {
      console.error("Error al obtener evento:", error);
      throw error;
    }
    
    return data as Evento;
  } catch (err) {
    console.error("Error al cargar evento:", err);
    return null;
  }
};
