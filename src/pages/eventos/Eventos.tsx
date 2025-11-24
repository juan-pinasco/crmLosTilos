import { Header } from "../../components/Header";
import { useState, useEffect } from "react";
import type { Evento } from "../../types/EventsType";
import type { Vendedor } from "../../types/SellersType";
import type { Cliente } from "../../types/ClientsType";
import { useNavigate } from "react-router";
import { fetchEventos, eliminarEvento } from "../../data/EventosCrud";
import { fetchVendedores } from "../../data/VendedoresCrud";
import { fetchClientes } from "../../data/ClientsCrud";
import { EventosTable } from "../../components/eventos/eventosTable/EventosTable";

export const Eventos = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
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
      }
    };

    // Cargar eventos
    const loadEventos = async () => {
      try {
        const eventosData = await fetchEventos();
        if (eventosData) {
          setEventos(eventosData);
        }
      } catch (error) {
        console.error("Error al cargar eventos:", error);
      } finally {
        setLoading(false);
      }
    };

    loadVendedores();
    loadClientes();
    loadEventos();
  }, []);

  // Función para obtener el nombre del vendedor por su ID
  const getNombreVendedor = (vendedorId: string) => {
    const vendedor = vendedores.find((v) => v.id === vendedorId);
    return vendedor ? vendedor.nombre : "No asignado";
  };

  // Función para obtener el nombre del cliente por su ID
  const getNombreCliente = (clienteId: string) => {
    const cliente = clientes.find((c) => c.id === clienteId);
    return cliente ? cliente.nombre : "No asignado";
  };

  // Función para manejar la eliminación de un evento
  const handleDeleteEvento = async (id: string) => {
    setLoading(true);
    await eliminarEvento(id);
    const nuevosEventos = await fetchEventos();
    if (nuevosEventos) {
      setEventos(nuevosEventos);
    }
    setLoading(false);
  };

  // La función getEstadoClass ahora se importa desde constants/estadosTareas.ts

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="mx-auto px-8 py-8">
        <div className="flex justify-end items-center mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => navigate("/calendario-eventos")}
              className="cursor-pointer bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded"
            >
              Ver Calendario
            </button>
            <button
              onClick={() => navigate("/create-evento")}
              className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
            >
              Crear Tarea
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <EventosTable 
            eventos={eventos}
            vendedores={vendedores}
            onDeleteEvento={handleDeleteEvento}
            getNombreVendedor={getNombreVendedor}
            getNombreCliente={getNombreCliente}
          />
        )}
      </div>
    </div>
  );
};
