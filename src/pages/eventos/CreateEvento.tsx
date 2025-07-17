import { useState, useEffect } from "react";
import { Header } from "../../components/Header";
import { useNavigate } from "react-router";
import { crearEvento } from "../../data/EventosCrud";
import { fetchClientes } from "../../data/ClientsCrud";
import { fetchVendedores } from "../../data/VendedoresCrud";
import type { Cliente } from "../../types/ClientsType";
import type { Vendedor } from "../../types/SellersType";
import { GetSession } from "../../data/AuthsCrud";
import { Search } from "lucide-react";
import { ESTADOS_TAREA, ESTADO_TAREA_DEFAULT } from "../../constants/estadosTareas";

export const CreateEvento = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  
  // Estado para los datos del formulario
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    fecha_realizacion: "",
    hora_realizacion: "",
    estado_tarea: ESTADO_TAREA_DEFAULT,
    tarea_client_id: "",
    tarea_vendedor_id: "",
  });
  
  // Estado para el campo de búsqueda de clientes
  const [clienteSearch, setClienteSearch] = useState("");
  const [clientesFiltrados, setClientesFiltrados] = useState<Cliente[]>([]);
  const [showClienteDropdown, setShowClienteDropdown] = useState(false);
  const [selectedClienteNombre, setSelectedClienteNombre] = useState("");

  // Opciones para el estado de la tarea se importan desde constants/estadosTareas.ts

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Cargar clientes
        const clientesData = await fetchClientes();
        if (clientesData) {
          setClientes(clientesData);
        }

        // Cargar vendedores
        const vendedoresData = await fetchVendedores();
        if (vendedoresData) {
          setVendedores(vendedoresData);
        }

        // Obtener el email del usuario actual
        const session = await GetSession();
        if (session) {
          setUserEmail(session.email || null);
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Manejar cambios en los campos del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  // Manejar la búsqueda de clientes
  const handleClienteSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value.toLowerCase();
    setClienteSearch(searchTerm);
    
    if (searchTerm.trim() === "") {
      setClientesFiltrados([]);
      setShowClienteDropdown(false);
      return;
    }
    
    const filtered = clientes.filter(cliente => 
      cliente.nombre.toLowerCase().includes(searchTerm)
    );
    
    setClientesFiltrados(filtered);
    setShowClienteDropdown(true);
  };
  
  // Seleccionar un cliente
  const selectCliente = (cliente: Cliente | null) => {
    if (cliente) {
      setFormData({
        ...formData,
        tarea_client_id: cliente.id
      });
      setSelectedClienteNombre(cliente.nombre);
    } else {
      setFormData({
        ...formData,
        tarea_client_id: ""
      });
      setSelectedClienteNombre("");
    }
    
    setClienteSearch("");
    setClientesFiltrados([]);
    setShowClienteDropdown(false);
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Obtener los valores del formulario
      const fecha = formData.fecha_realizacion; // YYYY-MM-DD
      const hora = formData.hora_realizacion;   // HH:MM
      
      // Crear una fecha local con los valores del formulario
      const fechaHoraLocal = `${fecha}T${hora}:00`;
      const fechaLocal = new Date(fechaHoraLocal);
      
      // Convertir a UTC usando el método toISOString() que siempre devuelve en UTC
      const fechaUTC = fechaLocal.toISOString();

      const eventoData = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        fecha_realizacion: fechaUTC, // Fecha en formato UTC
        estado_tarea: formData.estado_tarea,
        tarea_client_id: formData.tarea_client_id || null, // Enviar null si no hay cliente seleccionado
        tarea_vendedor_id: formData.tarea_vendedor_id || null, // Enviar null si no hay vendedor seleccionado
        created_by: userEmail,
      };

      console.log("Fecha y hora local ingresada:", fechaHoraLocal);
      console.log("Guardando evento con fecha UTC:", fechaUTC);
      await crearEvento(eventoData);
      navigate("/eventos");
    } catch (error) {
      console.error("Error al crear el evento:", error);
      alert("Error al crear el evento. Por favor, inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Crear Nuevo Evento</h1>
          <button
            onClick={() => navigate("/eventos")}
            className="cursor-pointer bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded"
          >
            Cancelar
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Título */}
                <div className="col-span-2">
                  <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">
                    Título *
                  </label>
                  <input
                    type="text"
                    id="titulo"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Descripción */}
                <div className="col-span-2">
                  <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Fecha de realización */}
                <div>
                  <label htmlFor="fecha_realizacion" className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de realización *
                  </label>
                  <input
                    type="date"
                    id="fecha_realizacion"
                    name="fecha_realizacion"
                    value={formData.fecha_realizacion}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Hora de realización */}
                <div>
                  <label htmlFor="hora_realizacion" className="block text-sm font-medium text-gray-700 mb-1">
                    Hora de realización *
                  </label>
                  <input
                    type="time"
                    id="hora_realizacion"
                    name="hora_realizacion"
                    value={formData.hora_realizacion}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Estado de la tarea */}
                <div>
                  <label htmlFor="estado_tarea" className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    id="estado_tarea"
                    name="estado_tarea"
                    value={formData.estado_tarea}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {ESTADOS_TAREA.map((estado: string) => (
                      <option key={estado} value={estado}>
                        {estado}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cliente - Campo de búsqueda */}
                <div className="relative">
                  <label htmlFor="cliente_search" className="block text-sm font-medium text-gray-700 mb-1">
                    Cliente
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="cliente_search"
                      placeholder="Buscar cliente..."
                      value={clienteSearch}
                      onChange={handleClienteSearch}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      autoComplete="off"
                    />
                    {selectedClienteNombre && (
                      <div className="mt-1 text-sm text-blue-600">
                        Cliente seleccionado: <span className="font-medium">{selectedClienteNombre}</span>
                        <button 
                          type="button" 
                          onClick={() => selectCliente(null)} 
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Dropdown de resultados */}
                  {showClienteDropdown && clientesFiltrados.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-300 max-h-60 overflow-auto">
                      <ul className="py-1">
                        {clientesFiltrados.map(cliente => (
                          <li 
                            key={cliente.id}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => selectCliente(cliente)}
                          >
                            {cliente.nombre}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Campo oculto para mantener el ID del cliente seleccionado */}
                  <input 
                    type="hidden" 
                    name="tarea_client_id" 
                    value={formData.tarea_client_id} 
                  />
                </div>

                {/* Ejecutor */}
                <div>
                  <label htmlFor="tarea_vendedor_id" className="block text-sm font-medium text-gray-700 mb-1">
                    Ejecutor
                  </label>
                  <select
                    id="tarea_vendedor_id"
                    name="tarea_vendedor_id"
                    value={formData.tarea_vendedor_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Sin ejecutor</option>
                    <option disabled>──────────────</option>
                    {vendedores.map((vendedor) => (
                      <option key={vendedor.id} value={vendedor.id}>
                        {vendedor.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Botón de envío */}
              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
                >
                  {loading ? "Guardando..." : "Guardar Evento"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
