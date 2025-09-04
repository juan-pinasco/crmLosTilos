import { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { GetSession } from "../data/AuthsCrud";
import { fetchVendedorByAuthId, updateVendedor } from "../data/VendedoresCrud";
import Swal from "sweetalert2";

import type { Vendedor } from "../types/SellersType";

export const UserProfile = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);
  const [vendedor, setVendedor] = useState<Vendedor | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [nombreVendedor, setNombreVendedor] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);

  const handleSaveNombre = async () => {
    if (!vendedor) return;
    
    try {
      setSaving(true);
      
      const result = await updateVendedor(vendedor.id, { nombre: nombreVendedor });
      
      if (result.success) {
        setVendedor(result.data);
        setEditMode(false);
        Swal.fire({
          title: '¡Éxito!',
          text: 'Nombre actualizado correctamente',
          icon: 'success',
          confirmButtonColor: '#10B981'
        });
      } else {
        Swal.fire({
          title: 'Error',
          text: `No se pudo actualizar el nombre: ${result.error}`,
          icon: 'error',
          confirmButtonColor: '#EF4444'
        });
      }
    } catch (error: any) {
      Swal.fire({
        title: 'Error',
        text: `Error al actualizar el nombre: ${error.message || 'Error desconocido'}`,
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setSaving(false);
    }
  };

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
          setNombreVendedor(vendedorData.nombre || "");
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
              {vendedor ? (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Información del Vendedor</h2>
                    {!editMode ? (
                      <button 
                        onClick={() => setEditMode(true)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                      >
                        Editar
                      </button>
                    ) : (
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => {
                            setEditMode(false);
                            setNombreVendedor(vendedor.nombre || "");
                          }}
                          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                          disabled={saving}
                        >
                          Cancelar
                        </button>
                        <button 
                          onClick={handleSaveNombre}
                          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                          disabled={saving}
                        >
                          {saving ? "Guardando..." : "Guardar"}
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm text-gray-500">Nombre</p>
                      {editMode ? (
                        <input
                          type="text"
                          value={nombreVendedor}
                          onChange={(e) => setNombreVendedor(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          disabled={saving}
                        />
                      ) : (
                        <p className="font-medium">{vendedor.nombre}</p>
                      )}
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
              
              {user && (
                <div className="mt-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Información de la cuenta</h2>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};