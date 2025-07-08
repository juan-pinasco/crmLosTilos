import { Header } from "../components/Header";
import { useState, useEffect } from "react";
import type { Cliente } from "../types/ClientsType";
import type { Vendedor } from "../types/SellersType";
import { useNavigate } from "react-router";
import { Trash } from "lucide-react";
import { fetchClientes, deleteClient } from "../data/ClientsCrud";
import { fetchVendedores } from "../data/VendedoresCrud";
import { formatearFecha } from "../utils/dateUtils";

export const Home = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);

    // Cargar vendedores
    const loadVendedores = async () => {
      try {
        const vendedoresData = await fetchVendedores();
        if (vendedoresData) {
          setVendedores(vendedoresData);
        }
      } catch (error) {
        console.error("Error al cargar vendedores:", error);
      }
    };

    // Cargar clientes
    const loadClientes = async () => {
      try {
        const clientesData = await fetchClientes();
        if (clientesData) {
          setClientes(clientesData);
        }
      } catch (error) {
        console.error("Error al cargar clientes:", error);
      } finally {
        setLoading(false);
      }
    };

    loadVendedores();
    loadClientes();
  }, []);

  // Función para obtener el nombre del vendedor por su ID.
  const getNombreVendedor = (vendedorAsignadoId: string) => {
    const vendedor = vendedores.find((v) => v.id === vendedorAsignadoId); 
    return vendedor ? vendedor.nombre : vendedorAsignadoId;
  };

  const handleDeleteClient = async (id: string) => {
    setLoading(true);
    await deleteClient(id);
    const nuevosClientes = await fetchClientes();
    if (nuevosClientes) {
      setClientes(nuevosClientes);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Clientes</h1>
          <button
            onClick={() => navigate("/create-client")}
            className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
          >
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
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Último Contacto
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Nombre
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Teléfono
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Estado
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Temperatura
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Vendedor Asignado
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Fecha de creación
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Creado por
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {clientes.length > 0 ? (
                  clientes.map((cliente: Cliente, index) => (
                    <tr 
                      key={cliente.id || index}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/profile-client/${cliente.id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatearFecha(cliente.ultima_interaccion, true)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {cliente.nombre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cliente.telefono}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            cliente.estado === "Activo"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {cliente.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            cliente.temperatura === "Caliente"
                              ? "bg-red-100 text-red-800"
                              : cliente.temperatura === "Cálido"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {cliente.temperatura}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getNombreVendedor(cliente.vendedor_id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatearFecha(cliente.created_at, true)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cliente.created_by}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          className="text-red-600 hover:text-red-900 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation(); // Evita que el evento de clic se propague a la fila
                            handleDeleteClient(cliente.id);
                          }}
                        >
                          <Trash size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                    >
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
