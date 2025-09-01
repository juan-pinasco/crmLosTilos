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
import Swal from "sweetalert2";

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
    // Buscar el evento para obtener el ID del cliente antes de eliminarlo
    const eventoAEliminar = eventos.find(evento => evento.id === id);
    const clienteId = eventoAEliminar?.tarea_client_id || null;

    // Mostrar confirmación antes de eliminar
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás recuperar esta tarea una vez eliminada',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    // Si el usuario cancela, no hacer nada
    if (!result.isConfirmed) {
      return;
    }

    setLoading(true);
    try {
      const eliminado = await eliminarEvento(id);
      
      if (eliminado) {
        // Mostrar mensaje de éxito
        Swal.fire({
          title: 'Eliminado',
          text: 'La tarea ha sido eliminada correctamente',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        
        // Si hay un cliente asociado, navegar a su perfil
        if (clienteId) {
          navigate(`/profile-client/${clienteId}`);
          return; // Importante: salir de la función para evitar actualizar la lista de eventos
        }
        
        // Actualizar la lista de eventos solo si no navegamos a otra página
        const nuevosEventos = await fetchEventos();
        if (nuevosEventos) {
          setEventos(nuevosEventos);
        }
      } else {
        // Mostrar mensaje de error
        Swal.fire({
          title: 'Error',
          text: 'No se pudo eliminar la tarea',
          icon: 'error'
        });
      }
    } catch (error) {
      console.error('Error al eliminar evento:', error);
      Swal.fire({
        title: 'Error',
        text: 'Ocurrió un error al intentar eliminar la tarea',
        icon: 'error'
      });
    } finally {
      setLoading(false);
    }
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
