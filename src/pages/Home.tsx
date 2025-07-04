import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase';

export const Home = () => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Obtener datos del usuario al cargar el componente
        const getUserData = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                setUser(user);
            } catch (error) {
                console.error('Error al obtener datos del usuario:', error);
            } finally {
                setLoading(false);
            }
        };

        getUserData();
    }, []);

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Panel Principal</h1>
                    <button 
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                        Cerrar Sesión
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : user ? (
                    <div className="bg-gray-50 p-4 rounded-md">
                        <h2 className="text-xl font-semibold mb-4">Información del Usuario</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="font-medium">{user.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">ID de Usuario</p>
                                <p className="font-medium">{user.id}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Último inicio de sesión</p>
                                <p className="font-medium">
                                    {new Date(user.last_sign_in_at).toLocaleString('es-ES')}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Creado el</p>
                                <p className="font-medium">
                                    {new Date(user.created_at).toLocaleString('es-ES')}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-gray-500">No se encontró información del usuario</p>
                )}
            </div>
        </div>
    );
};