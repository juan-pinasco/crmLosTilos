import { supabase } from "../integrations/supabase";

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