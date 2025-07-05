import { Header } from '../components/Header';
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase';
//import { useNavigate } from 'react-router';

interface Cliente {
    id: string;
    created_at: string;
    nombre: string;
    descripcion: string;
    email: string;
    telefono: string;
    pais: string;
    ciudad: string;
    barrio: string;
    tipo_cliente: string;
    estado: string;
    temperatura: string;
    vendedor_id: string;
    ultima_interaccion: string;
}


export const Home = () => {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [loading, setLoading] = useState(false);
    //const navigate = useNavigate();

    useEffect(() => {
        const fetchClientes = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('clientes')
                    .select(`*`);

                if (error) {
                    throw error;
                }

                if (data) {
                    setClientes(data);
                    console.log("data", data);
                }
            } catch (error) {
                console.error('Error al obtener los clientes:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchClientes();
    }, []);
    
    return (
       <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Clientes</h1>
                    <button 
                        //onClick={() => navigate('/add-cliente')}
                        className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded">
                        Añadir Cliente
                    </button>
                </div>
                
                {loading ? (
                    <div className="flex justify-center items-center py-10">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Último Contacto
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nombre
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Teléfono
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Temperatura
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Vendedor Asignado
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fecha para Recontactar
                                    </th>
                                </tr>
                            </thead>
                            
                             <tbody className="bg-white divide-y divide-gray-200">
                                {clientes.length > 0 ? (
                                    clientes.map((cliente: Cliente, index) => (
                                        <tr key={cliente.id || index}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {cliente.ultima_interaccion}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {cliente.nombre}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {cliente.telefono}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    cliente.estado === 'Activo' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {cliente.estado}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    cliente.temperatura === 'Caliente' 
                                                        ? 'bg-red-100 text-red-800' 
                                                        : cliente.temperatura === 'Cálido'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {cliente.temperatura}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {cliente.vendedor_id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {cliente.created_at}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                            No hay clientes disponibles
                                        </td>
                                    </tr>
                                )}
                            </tbody> 
                        </table>
                    </div>
                )}
            </div>
       </div>
    );
};