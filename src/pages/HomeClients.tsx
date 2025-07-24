import { Header } from "../components/Header";
import { useState, useEffect } from "react";
import type { Cliente } from "../types/ClientsType";
import type { Vendedor } from "../types/SellersType";
import { useNavigate } from "react-router";
import { Plus, RotateCcw } from 'lucide-react';
import { fetchClientes } from "../data/ClientsCrud";
import { fetchVendedores } from "../data/VendedoresCrud";
import { fetchPendientesPorCliente } from "../data/EventosCrud";
import { ClientesTable } from "../components/homeClientes/ClientesTable";
import { FiltrosCliente } from "../components/homeClientes/filters/FiltrosCliente";
import type { FiltrosSeleccionados } from "../components/homeClientes/filters/FiltrosCliente";

// Constante para la clave de localStorage
const FILTROS_STORAGE_KEY = 'clientesHome_filtros';

export const Home = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clientesFiltrados, setClientesFiltrados] = useState<Cliente[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [loading, setLoading] = useState(false);
  const [pendientesMap, setPendientesMap] = useState<Map<string, number>>(new Map());
  
  // Inicializar filtros desde localStorage o usar valores predeterminados
  const [filtros, setFiltros] = useState<FiltrosSeleccionados>(() => {
    const savedFiltros = localStorage.getItem(FILTROS_STORAGE_KEY);
    return savedFiltros 
      ? JSON.parse(savedFiltros) 
      : {
          tiposCliente: [],
          estadosCliente: [],
          temperaturasCliente: []
        };
  });
  const navigate = useNavigate();

  // Maneja la limpieza de filtros y estados persistidos en localStorage
  const handleLimpiarFiltros = () => {
    const keysToRemove = [
      'clientesHome_filtros',
      'clientesTable_sortConfig',
      'clientesTable_searchTerm',
      'clientesTable_vendedorFilter',
      'clientesTable_selectedColumns',
    'clientesTable_dateFilters'
    ];

    keysToRemove.forEach(key => localStorage.removeItem(key));

    // Restablecer los filtros locales
    setFiltros({
      tiposCliente: [],
      estadosCliente: [],
      temperaturasCliente: []
    });

    // Recargar la página para garantizar que la tabla también se reinicie
    window.location.reload();
  };



  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      try {
        // Cargar vendedores
        const vendedoresData = await fetchVendedores();
        if (vendedoresData) {
          setVendedores(vendedoresData);
        }

        // Cargar pendientes
        try {
          const pendientes = await fetchPendientesPorCliente();
          setPendientesMap(pendientes);
        } catch (e) {
          console.error("Error cargando pendientes", e);
        }
        // Cargar clientes
        const clientesData = await fetchClientes();
        if (clientesData) {
          setClientes(clientesData);
          // Aplicar filtros guardados a los clientes cargados
          aplicarFiltros(clientesData, filtros);
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
        // Aplicar los filtros actuales (que ya están en localStorage)
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
    // No guardar directamente en localStorage aquí; persistence la maneja FiltrosCliente
    // storageManager.setItem(FILTROS_STORAGE_KEY, nuevosFiltros); // Si algún día se necesita

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
      <div className="w-full px-4 md:px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Tabla de Clientes</h1>
          <div className="flex gap-2">
            <button
              onClick={() => navigate("/create-client")}
              className="cursor-pointer px-2 py-2 bg-blue-500 text-white font-medium rounded hover:bg-blue-600 transition-colors"
            >
              <Plus size={20} className="mr-1 inline-block" />
              Crear Cliente
            </button>
            <button
              onClick={handleLimpiarFiltros}
              className="cursor-pointer px-3 py-2 bg-gray-300 text-black font-medium rounded hover:bg-gray-400 transition-colors"
            >
              <RotateCcw size={20}  />
              
            </button>
          </div>
        </div>
        
        {/* Contenedor principal que divide la pantalla en dos columnas */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Columna izquierda para los filtros */}
          <div className="md:w-2/10">
            <FiltrosCliente 
              onFiltrosChange={handleFiltrosChange} 
              initialFiltros={filtros} 
            />
          </div>
          
          {/* Columna derecha para la tabla */}
          <div className="md:w-8/10">
            <ClientesTable 
              clientes={clientesFiltrados}
              vendedores={vendedores}
              pendientesMap={pendientesMap}
              loading={loading}
              onClienteDeleted={handleClienteDeleted}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
