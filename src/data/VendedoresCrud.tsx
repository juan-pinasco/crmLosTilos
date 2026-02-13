import type { Vendedor } from "../types/SellersType";

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

export const fetchVendedores = async () => {
    try {
        const token = getAuthToken();
        
        const response = await fetchWithTimeout(
            `${import.meta.env.VITE_APP_SUPABASE_URL}/rest/v1/vendedores?select=*`,
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
            return data;
        }
    } catch (error) {
    }
};

export const fetchVendedorById = async (id: string) => {
    try {
        const token = getAuthToken();
        
        const response = await fetchWithTimeout(
            `${import.meta.env.VITE_APP_SUPABASE_URL}/rest/v1/vendedores?id=eq.${id}&select=*`,
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
            return data[0];
        }
    } catch (error) {
    }
};

export const fetchVendedorByAuthId = async (authUserId: string) => {
    try {
        const token = getAuthToken();
        
        const response = await fetchWithTimeout(
            `${import.meta.env.VITE_APP_SUPABASE_URL}/rest/v1/vendedores?auth_user_id=eq.${authUserId}&select=*`,
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
            return null;
        }

        const data = await response.json();
        
        if (data && data.length > 0) {
            return data[0];
        }
        
        return null;
    } catch (error) {
        return null;
    }
};

export const updateVendedor = async (id: string, updates: Partial<Vendedor>) => {
    try {
        const token = getAuthToken();
        
        // Verificamos que el vendedor existe
        const checkResponse = await fetchWithTimeout(
            `${import.meta.env.VITE_APP_SUPABASE_URL}/rest/v1/vendedores?id=eq.${id}&select=*`,
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
            return { success: false, error: "No se encontró el vendedor" };
        }
        
        const existingVendedor = await checkResponse.json();
        
        if (!existingVendedor || existingVendedor.length === 0) {
            return { success: false, error: "No se encontró el vendedor" };
        }
        
        // Realizamos la actualización
        const updateResponse = await fetchWithTimeout(
            `${import.meta.env.VITE_APP_SUPABASE_URL}/rest/v1/vendedores?id=eq.${id}`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': import.meta.env.VITE_APP_SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updates)
            }
        );
            
        if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            return { success: false, error: errorText };
        }
        
        // Obtenemos el vendedor actualizado
        const fetchResponse = await fetchWithTimeout(
            `${import.meta.env.VITE_APP_SUPABASE_URL}/rest/v1/vendedores?id=eq.${id}&select=*`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': import.meta.env.VITE_APP_SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${token}`
                }
            }
        );
            
        if (!fetchResponse.ok) {
            // Si no podemos obtener el vendedor actualizado, devolvemos el original con las actualizaciones
            return { 
                success: true, 
                data: { ...existingVendedor[0], ...updates } 
            };
        }
        
        const updatedVendedor = await fetchResponse.json();
        
        return { success: true, data: updatedVendedor[0] };
    } catch (error: any) {
        return { success: false, error: error.message || "Error desconocido" };
    }
};