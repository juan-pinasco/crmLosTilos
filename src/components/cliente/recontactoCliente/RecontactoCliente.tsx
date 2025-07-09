import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { fetchVendedores } from "../../../data/VendedoresCrud";
import type { Vendedor } from "../../../types/SellersType";
import type { Evento } from "../../../types/EventsType";
import { GetSession } from "../../../data/AuthsCrud";
import { fetchEventosByCliente, crearEvento, actualizarEstadoEvento, eliminarEvento } from "../../../data/EventosCrud";
import { EventosList } from "./EventosList";
import { EventoModal } from "./EventoModal";
import { ESTADO_TAREA_DEFAULT } from "../../../constants/estadosTareas";

interface RecontactoClienteProps {
  clienteId: string;
}

export const RecontactoCliente = ({ clienteId }: RecontactoClienteProps) => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoEvento, setNuevoEvento] = useState({
    titulo: "",
    descripcion: "",
    fecha_realizacion: new Date().toISOString().split("T")[0],
    estado_tarea: ESTADO_TAREA_DEFAULT,
    tarea_vendedor_id: ""
  });
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        setError(null);
        
        // Cargar eventos del cliente
        await cargarEventos();
        
        // Cargar vendedores
        const vendedoresData = await fetchVendedores();
        if (vendedoresData) {
          setVendedores(vendedoresData);
        }
        
        // Obtener email del usuario actual
        const session = await GetSession();
        if (session) {
          setUserEmail(session.email || null);
        }
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError("Error al cargar los datos. Por favor, intenta de nuevo.");
      } finally {
        setCargando(false);
      }
    };
    
    cargarDatos();
  }, [clienteId]);

  const cargarEventos = async () => {
    try {
      const data = await fetchEventosByCliente(clienteId);
      if (data) {
        setEventos(data);
      }
    } catch (err) {
      console.error("Error al cargar eventos:", err);
      setError("Error al cargar los eventos");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNuevoEvento(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCrearEvento = async () => {
    if (!nuevoEvento.titulo || !nuevoEvento.fecha_realizacion) {
      setError("El título y la fecha son obligatorios");
      return;
    }
    
    try {
      setError(null);
      
      // Preparar datos del evento
      const eventoData = {
        titulo: nuevoEvento.titulo,
        descripcion: nuevoEvento.descripcion || "",
        fecha_realizacion: new Date(nuevoEvento.fecha_realizacion).toISOString(),
        estado_tarea: nuevoEvento.estado_tarea || ESTADO_TAREA_DEFAULT,
        tarea_client_id: clienteId,
        tarea_vendedor_id: nuevoEvento.tarea_vendedor_id,
        created_by: userEmail || "usuario@sistema.com"
      };
      
      await crearEvento(eventoData);
      
      // Limpiar formulario y cerrar modal
      setNuevoEvento({
        titulo: "",
        descripcion: "",
        fecha_realizacion: new Date().toISOString().split("T")[0],
        estado_tarea: ESTADO_TAREA_DEFAULT,
        tarea_vendedor_id: ""
      });
      setMostrarModal(false);
      
      // Recargar eventos
      await cargarEventos();
    } catch (err: any) {
      console.error("Error al crear evento:", err);
      setError(`Error al crear el evento: ${err.message || err}`);
    }
  };

  const handleEliminarEvento = async (eventoId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este evento?")) return;
    
    try {
      await eliminarEvento(eventoId);
      
      // Actualizar lista de eventos
      setEventos(prev => prev.filter(evento => evento.id !== eventoId));
    } catch (err) {
      console.error("Error al eliminar evento:", err);
      setError("Error al eliminar el evento");
    }
  };

  const handleCambiarEstado = async (eventoId: string, nuevoEstado: string) => {
    try {
      const resultado = await actualizarEstadoEvento(eventoId, nuevoEstado);
      
      if (resultado) {
        // Actualizar lista de eventos
        setEventos(prev => prev.map(evento => 
          evento.id === eventoId ? { ...evento, estado_tarea: nuevoEstado } : evento
        ));
      } else {
        throw new Error("No se pudo actualizar el estado del evento");
      }
      
    } catch (err) {
      console.error("Error al actualizar estado:", err);
      setError("Error al actualizar el estado del evento");
    }
  };

  const formatearFecha = (fechaISO: string) => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          Eventos
        </h2>
        <button 
          onClick={() => setMostrarModal(true)}
          className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 px-4 rounded-md flex items-center"
        >
          <Plus size={16} className="mr-2" />
          Nuevo Evento
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <EventosList
        eventos={eventos}
        cargando={cargando}
        onCambiarEstado={handleCambiarEstado}
        onEliminarEvento={handleEliminarEvento}
        formatearFecha={formatearFecha}
      />
      
      <EventoModal
        mostrar={mostrarModal}
        nuevoEvento={nuevoEvento}
        vendedores={vendedores}
        onClose={() => setMostrarModal(false)}
        onInputChange={handleInputChange}
        onCrearEvento={handleCrearEvento}
      />
    </div>
  );
};
