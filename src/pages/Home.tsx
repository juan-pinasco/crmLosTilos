import { Header } from "../components/Header";
import { useState, useEffect } from "react";
import type { Cliente } from "../types/ClientsType";
import type { Vendedor } from "../types/SellersType";
import { useNavigate } from "react-router";
import { Plus } from 'lucide-react';
import { fetchClientes } from "../data/ClientsCrud";
import { fetchVendedores } from "../data/VendedoresCrud";
import { ClientesTable } from "../components/ClientesTable";
import { FiltrosCliente } from "../components/FiltrosCliente";
import type { FiltrosSeleccionados } from "../components/FiltrosCliente";

export const Home = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clientesFiltrados, setClientesFiltrados] = useState<Cliente[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosSeleccionados>({
    tiposCliente: [],
    estadosCliente: [],
    temperaturasCliente: []
  });
  const navigate = useNavigate();



  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      try {
        // Cargar vendedores
        const vendedoresData = await fetchVendedores();
        if (vendedoresData) {
          setVendedores(vendedoresData);
        }

        // Cargar clientes
        const clientesData = await fetchClientes();
        if (clientesData) {
          setClientes(clientesData);
          setClientesFiltrados(clientesData);
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  // Función para recargar los clientes después de eliminar uno
  const handleClienteDeleted = async () => {
    setLoading(true);
    try {
      const nuevosClientes = await fetchClientes();
      if (nuevosClientes) {
        setClientes(nuevosClientes);
        aplicarFiltros(nuevosClientes, filtros);
      }
    } catch (error) {
      console.error("Error al recargar clientes:", error);
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar cambios en los filtros y aplicarlos a la lista de clientes
  const handleFiltrosChange = (nuevosFiltros: FiltrosSeleccionados) => {
    setFiltros(nuevosFiltros);
    aplicarFiltros(clientes, nuevosFiltros);
  };

  // Función para aplicar los filtros seleccionados a la lista de clientes
  const aplicarFiltros = (listaClientes: Cliente[], filtrosAplicar: FiltrosSeleccionados) => {
    // Si no hay filtros seleccionados, mostrar todos los clientes
    if (
      filtrosAplicar.tiposCliente.length === 0 &&
      filtrosAplicar.estadosCliente.length === 0 &&
      filtrosAplicar.temperaturasCliente.length === 0
    ) {
      setClientesFiltrados(listaClientes);
      return;
    }

    // Aplicar filtros seleccionados
    const clientesFiltrados = listaClientes.filter(cliente => {
      // Verificar si el cliente cumple con los filtros de tipo
      const cumpleTipo = filtrosAplicar.tiposCliente.length === 0 || 
        filtrosAplicar.tiposCliente.includes(cliente.tipo_cliente);
      
      // Verificar si el cliente cumple con los filtros de estado
      const cumpleEstado = filtrosAplicar.estadosCliente.length === 0 || 
        filtrosAplicar.estadosCliente.includes(cliente.estado);
      
      // Verificar si el cliente cumple con los filtros de temperatura
      const cumpleTemperatura = filtrosAplicar.temperaturasCliente.length === 0 || 
        filtrosAplicar.temperaturasCliente.includes(cliente.temperatura);
      
      // El cliente debe cumplir con todos los filtros aplicados
      return cumpleTipo && cumpleEstado && cumpleTemperatura;
    });

    setClientesFiltrados(clientesFiltrados);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="w-full px-4 md:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Tabla de Clientes</h1>
          <button
            onClick={() => navigate("/create-client")}
            className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Nuevo Cliente
            <Plus size={18} className="ml-2 inline-block" />
          </button>
        </div>
        
        {/* Contenedor principal que divide la pantalla en dos columnas */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Columna izquierda para los filtros */}
          <div className="md:w-1/6">
            <FiltrosCliente onFiltrosChange={handleFiltrosChange} />
          </div>
          
          {/* Columna derecha para la tabla */}
          <div className="md:w-5/6">
            <ClientesTable 
              clientes={clientesFiltrados}
              vendedores={vendedores}
              loading={loading}
              onClienteDeleted={handleClienteDeleted}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
