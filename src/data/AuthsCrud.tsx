import { supabase } from "../integrations/supabase";

export const GetSession = async() => {
   try {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      return data.session.user || null;
    }
  } catch (error) {
    console.error("Error al obtener la sesión:", error);
  }
};

export const GetAllAuth = async () => {
    try {
        const { data, error } = await supabase.from("auths").select(`*`);

        if (error) {
            console.error("Error de Supabase:", error);
            throw error;
        }

        if (data && data.length > 0) {
            console.log("Datos obtenidos de auths:", data);
            return data;
        } else {
            console.log("No se encontraron datos en la tabla auths");
            return []; // Devolvemos un array vacío en lugar de undefined
        }
    } catch (error) {
        console.error("Error al obtener los auths:", error);
        return null; // Devolvemos null para indicar que hubo un error
    }
};
