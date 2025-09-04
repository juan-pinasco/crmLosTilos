import { supabase } from "../integrations/supabase";
import type { Vendedor } from "../types/SellersType";

export const fetchVendedores = async () => {
    try {
        const { data, error } = await supabase.from("vendedores").select("*");

        if (error) {
            throw error;
        }

        if (data) {
            console.log("Vendedores:",data);
            return data;
        }
    } catch (error) {
        console.error("Error al obtener los vendedores:", error);
    }
};

export const fetchVendedorById = async (id: string) => {
    try {
        const { data, error } = await supabase.from("vendedores").select("*").eq("id", id).single();

        if (error) {
            throw error;
        }

        if (data) {
            console.log("Vendedor:",data);
            return data;
        }
    } catch (error) {
        console.error("Error al obtener el vendedor:", error);
    }
};

export const fetchVendedorByAuthId = async (authUserId: string) => {
    try {
        const { data, error } = await supabase
            .from("vendedores")
            .select("*")
            .eq("auth_user_id", authUserId)
            .single();

        if (error) {
            console.error("Error al obtener el vendedor por auth_user_id:", error);
            return null;
        }

        return data;
    } catch (error) {
        console.error("Error al obtener el vendedor por auth_user_id:", error);
        return null;
    }
};

export const updateVendedor = async (id: string, updates: Partial<Vendedor>) => {
    try {
        // Verificamos que el vendedor existe
        const { data: existingVendedor, error: checkError } = await supabase
            .from("vendedores")
            .select("*")
            .eq("id", id)
            .single();
            
        if (checkError) {
            console.error("Error al verificar el vendedor:", checkError);
            return { success: false, error: "No se encontró el vendedor" };
        }
        
        // Realizamos la actualización
        const { error } = await supabase
            .from("vendedores")
            .update(updates)
            .eq("id", id);
            
        if (error) {
            console.error("Error al actualizar el vendedor:", error);
            return { success: false, error: error.message };
        }
        
        // Obtenemos el vendedor actualizado
        const { data: updatedVendedor, error: fetchError } = await supabase
            .from("vendedores")
            .select("*")
            .eq("id", id)
            .single();
            
        if (fetchError) {
            console.error("Error al obtener el vendedor actualizado:", fetchError);
            // Si no podemos obtener el vendedor actualizado, devolvemos el original con las actualizaciones
            return { 
                success: true, 
                data: { ...existingVendedor, ...updates } 
            };
        }
        
        return { success: true, data: updatedVendedor };
    } catch (error: any) {
        console.error("Error al actualizar el vendedor:", error);
        return { success: false, error: error.message || "Error desconocido" };
    }
};