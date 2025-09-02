import { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { GetSession } from "../data/AuthsCrud";
import { fetchVendedorByAuthId } from "../data/VendedoresCrud";

import type { Vendedor } from "../types/SellersType";

export const UserProfile = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);
  const [vendedor, setVendedor] = useState<Vendedor | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Obtener la sesión actual
        const sessionUser = await GetSession();
        if (!sessionUser) {
          console.error("No hay sesión activa");
          setLoading(false);
          return;
        }
        
        setUser(sessionUser);
        
        // Obtener datos del vendedor asociado al usuario
        const vendedorData = await fetchVendedorByAuthId(sessionUser.id);
        if (vendedorData) {
          setVendedor(vendedorData);
        }
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow-md rounded-lg p-6 max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-green-600 mb-6">Perfil de Usuario</h1>
          
          {loading ? (
            <div className="flex justify-center">
              <p className="text-gray-500">Cargando datos...</p>
            </div>
          ) : (
            <>
              {user && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Información de la cuenta</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm text-gray-500">ID de Usuario</p>
                      <p className="font-medium">{user.id}</p>
                    </div>
                  </div>
                </div>
              )}

              {vendedor ? (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Información del Vendedor</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm text-gray-500">Nombre</p>
                      <p className="font-medium">{vendedor.nombre}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{vendedor.email}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                  <p className="text-yellow-700">
                    No se encontró información de vendedor asociada a esta cuenta.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};