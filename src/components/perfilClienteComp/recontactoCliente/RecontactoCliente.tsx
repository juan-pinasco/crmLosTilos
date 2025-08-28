import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { fetchVendedores } from "../../../data/VendedoresCrud";
import type { Vendedor } from "../../../types/SellersType";
import type { Evento } from "../../../types/EventsType";
import { GetSession } from "../../../data/AuthsCrud";
import {
  fetchEventosByCliente,
  crearEvento,
  actualizarEstadoEvento,
  eliminarEvento,
} from "../../../data/EventosCrud";
import { EventosList } from "./EventosList";
import { EventoModal } from "./EventoModal";
import { ESTADO_TAREA_DEFAULT } from "../../../constants/estadosTareas";
import { updateFechaRecontacto } from "../../../data/ClientsCrud";

interface RecontactoClienteProps {
  clienteId: string;
  onFechaRecontactoChange?: (nuevaFecha: string | null) => void;
}

export const RecontactoCliente = ({
  clienteId,
  onFechaRecontactoChange,
}: RecontactoClienteProps) => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoEvento, setNuevoEvento] = useState({
    titulo: "",
    descripcion: "",
    fecha_realizacion: new Date().toISOString().slice(0, 16),
    estado_tarea: ESTADO_TAREA_DEFAULT,
    tarea_vendedor_id: "",
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
        actualizarFechaRecontacto(data);
      }
    } catch (err) {
      console.error("Error al cargar eventos:", err);
      setError("Error al cargar los eventos");
    }
  };

  // Función para obtener la fecha más lejana de los eventos con estado pendiente
  const obtenerFechaMasLejana = (eventos: Evento[]): string | null => {
    if (!eventos || eventos.length === 0) return null;

    // Filtrar solo eventos con estado "Pendiente"
    const eventosPendientes = eventos.filter(
      (evento) => evento.estado_tarea === "Pendiente"
    );

    // Si no hay eventos pendientes, retornar null
    if (eventosPendientes.length === 0) return null;

    // Ordenar eventos pendientes por fecha de realización (descendente)
    const eventosOrdenados = [...eventosPendientes].sort((a, b) => {
      const fechaA = new Date(a.fecha_realizacion).getTime();
      const fechaB = new Date(b.fecha_realizacion).getTime();
      return fechaB - fechaA; // Orden descendente para obtener la más lejana primero
    });

    // Retornar la fecha más lejana (la primera después de ordenar)
    return eventosOrdenados[0]?.fecha_realizacion || null;
  };

  // Función para actualizar la fecha de recontacto
  const actualizarFechaRecontacto = async (eventosActualizados: Evento[]) => {
    const fechaMasLejana = obtenerFechaMasLejana(eventosActualizados);

    if (fechaMasLejana) {
      // Actualizar en la base de datos
      await updateFechaRecontacto(clienteId, fechaMasLejana);

      // Notificar al componente padre si existe la función
      if (onFechaRecontactoChange) {
        onFechaRecontactoChange(fechaMasLejana);
      }

      console.log(
        `Fecha de recontacto actualizada para cliente ${clienteId}: ${fechaMasLejana}`
      );
    } else {
      // Si no hay eventos, la fecha de recontacto debe ser null
      await updateFechaRecontacto(clienteId, null);

      // Notificar al componente padre si existe la función
      if (onFechaRecontactoChange) {
        onFechaRecontactoChange(null);
      }

      console.log(
        `No hay eventos para el cliente ${clienteId}, fecha de recontacto establecida a null`
      );
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setNuevoEvento((prev) => ({
      ...prev,
      [name]: value,
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
        fecha_realizacion: new Date(
          nuevoEvento.fecha_realizacion
        ).toISOString(),
        estado_tarea: nuevoEvento.estado_tarea || ESTADO_TAREA_DEFAULT,
        tarea_client_id: clienteId,
        tarea_vendedor_id:
          nuevoEvento.tarea_vendedor_id === ""
            ? null
            : nuevoEvento.tarea_vendedor_id,
        created_by: userEmail || "usuario@sistema.com",
      };

      const nuevoEventoCreado = await crearEvento(eventoData);

      // Limpiar formulario y cerrar modal
      setNuevoEvento({
        titulo: "",
        descripcion: "",
        fecha_realizacion: new Date().toISOString().slice(0, 16),
        estado_tarea: ESTADO_TAREA_DEFAULT,
        tarea_vendedor_id: "",
      });
      setMostrarModal(false);

      // Actualizar la lista de eventos y la fecha de recontacto
      const eventosActualizados = nuevoEventoCreado
        ? [...eventos, nuevoEventoCreado]
        : eventos;
      setEventos(eventosActualizados);
      actualizarFechaRecontacto(eventosActualizados);
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
      const eventosActualizados = eventos.filter(
        (evento) => evento.id !== eventoId
      );
      setEventos(eventosActualizados);

      // Actualizar fecha de recontacto
      actualizarFechaRecontacto(eventosActualizados);
    } catch (err) {
      console.error("Error al eliminar evento:", err);
      setError("Error al eliminar el evento");
    }
  };

  const handleCambiarEstado = async (eventoId: string, nuevoEstado: string) => {
    try {
      const resultado = await actualizarEstadoEvento(eventoId, nuevoEstado);

      if (resultado) {
        // Actualizar lista de eventos con el nuevo estado
        const eventosActualizados = eventos.map((evento) =>
          evento.id === eventoId
            ? { ...evento, estado_tarea: nuevoEstado }
            : evento
        );
        
        // Actualizar el estado local
        setEventos(eventosActualizados);
        
        // Actualizar la fecha de recontacto basada en los eventos actualizados
        await actualizarFechaRecontacto(eventosActualizados);
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
    return fecha.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold text-gray-800">Tareas con el cliente</h2>
        <button
          onClick={() => setMostrarModal(true)}
          className="cursor-pointer bg-blue-400 hover:bg-blue-500 text-white font-medium py-2 px-2 rounded-md flex items-center"
        >
          <Plus size={20} />
          Tarea
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
