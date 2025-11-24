import { useState, useEffect, useMemo } from "react";
import { Calendar, Views, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Header } from "../../components/Header";
import { fetchEventos } from "../../data/EventosCrud";
import { fetchVendedores } from "../../data/VendedoresCrud";
import { fetchClientes } from "../../data/ClientsCrud";
import type { Evento } from "../../types/EventsType";
import type { Vendedor } from "../../types/SellersType";
import type { Cliente } from "../../types/ClientsType";
import { useNavigate } from "react-router";
import { ESTADOS_TAREA, getEventoCalendarioColor } from "../../constants/estadosTareas";

// Configurar el localizador para español
const locales = {
  'es': es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: es }),
  getDay,
  locales,
});

// Mensajes en español para el calendario
const messages = {
  allDay: 'Todo el día',
  previous: 'Anterior',
  next: 'Siguiente',
  today: 'Hoy',
  month: 'Mes',
  week: 'Semana',
  day: 'Día',
  agenda: 'Agenda',
  date: 'Fecha',
  time: 'Hora',
  event: 'Evento',
  noEventsInRange: 'No hay eventos en este rango',
  showMore: (total: number) => `+ Ver más (${total})`
};

// Interfaz para los eventos en el formato que espera react-big-calendar
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource?: any;
  estado: string;
  cliente: string;
  vendedor: string;
  descripcion: string;
}

export const CalendarioEventos = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtrosVendedores, setFiltrosVendedores] = useState<string[]>([]);
  const [filtrosEstados, setFiltrosEstados] = useState<string[]>([]);
  const [vista, setVista] = useState<string>(Views.MONTH);
  const [currentDate, setCurrentDate] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchVendedores(),
      fetchClientes(),
      fetchEventos()
    ]).then(([vendedoresData, clientesData, eventosData]) => {
      if (vendedoresData) setVendedores(vendedoresData);
      if (clientesData) setClientes(clientesData);
      if (eventosData) setEventos(eventosData);
      setLoading(false);
    }).catch(error => {
      console.error("Error al cargar datos:", error);
      setLoading(false);
    });
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

  // Convertir eventos al formato que espera react-big-calendar
  const calendarEvents = useMemo(() => {
    return eventos
      .filter(evento => {
        // Si hay filtros de vendedores seleccionados y el evento no coincide con ninguno, no mostrar
        if (filtrosVendedores.length > 0 && !filtrosVendedores.includes(evento.tarea_vendedor_id)) return false;
        // Si hay filtros de estados seleccionados y el evento no coincide con ninguno, no mostrar
        if (filtrosEstados.length > 0 && !filtrosEstados.includes(evento.estado_tarea)) return false;
        return true;
      })
      .map(evento => {
        const fechaEvento = parseISO(evento.fecha_realizacion);
        // Crear fecha de fin (1 hora después del inicio por defecto)
        const fechaFin = new Date(fechaEvento);
        fechaFin.setHours(fechaFin.getHours() + 1);
        
        return {
          id: evento.id,
          title: evento.titulo,
          start: fechaEvento,
          end: fechaFin,
          allDay: false,
          estado: evento.estado_tarea,
          cliente: evento.cliente ? evento.cliente.nombre : getNombreCliente(evento.tarea_client_id),
          vendedor: evento.vendedor ? evento.vendedor.nombre : getNombreVendedor(evento.tarea_vendedor_id),
          descripcion: evento.descripcion
        };
      });
  }, [eventos, filtrosVendedores, filtrosEstados, vendedores, clientes]);

  // Función para obtener el estilo del evento según su estado
  const eventStyleGetter = (event: CalendarEvent) => {
    // Obtener el color de fondo según el estado desde las constantes
    const backgroundColor = getEventoCalendarioColor(event.estado);
    
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  // Función para manejar el clic en un evento
  // Función para manejar el clic en un evento existente
  const handleSelectEvent = (event: CalendarEvent) => {
    // Redirigir al detalle del evento/tarea
    navigate(`/detalle-evento/${event.id}`);
  };

  // Función para manejar la selección de un día/slot vacío
  const handleSelectSlot = (slotInfo: { start: Date }) => {
    const fechaSeleccionada = format(slotInfo.start, 'yyyy-MM-dd');
    navigate(`/create-evento?fecha=${fechaSeleccionada}`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Calendario de Tareas</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => navigate("/eventos")}
              className="cursor-pointer bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded"
            >
              Ver Lista
            </button>
            <button
              onClick={() => navigate("/create-evento")}
              className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
            >
              Crear Tarea
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por Vendedores
              </label>
              <div className="max-h-40 overflow-y-auto p-2 border border-gray-300 rounded-md">
                {vendedores.length > 0 ? (
                  vendedores.map((vendedor) => (
                    <div key={vendedor.id} className="flex items-center mb-1">
                      <input
                        id={`vendedor-${vendedor.id}`}
                        type="checkbox"
                        checked={filtrosVendedores.includes(vendedor.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFiltrosVendedores([...filtrosVendedores, vendedor.id]);
                          } else {
                            setFiltrosVendedores(filtrosVendedores.filter(id => id !== vendedor.id));
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`vendedor-${vendedor.id}`} className="ml-2 block text-sm text-gray-900">
                        {vendedor.nombre}
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No hay vendedores disponibles</p>
                )}
                {filtrosVendedores.length > 0 && (
                  <button 
                    onClick={() => setFiltrosVendedores([])} 
                    className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por Estado
              </label>
              <div className="max-h-40 overflow-y-auto p-2 border border-gray-300 rounded-md">
                {ESTADOS_TAREA.map((estado) => (
                  <div key={estado} className="flex items-center mb-1">
                    <input
                      id={`estado-${estado}`}
                      type="checkbox"
                      checked={filtrosEstados.includes(estado)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFiltrosEstados([...filtrosEstados, estado]);
                        } else {
                          setFiltrosEstados(filtrosEstados.filter(e => e !== estado));
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`estado-${estado}`} className="ml-2 block text-sm text-gray-900">
                      {estado}
                    </label>
                  </div>
                ))}
                {filtrosEstados.length > 0 && (
                  <button 
                    onClick={() => setFiltrosEstados([])} 
                    className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vista
              </label>
              <select
                value={vista}
                onChange={(e) => setVista(e.target.value as any)}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value={Views.MONTH}>Mes</option>
                <option value={Views.WEEK}>Semana</option>
                <option value={Views.DAY}>Día</option>
                <option value={Views.AGENDA}>Agenda</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden" style={{ height: '700px' }}>
            <Calendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              messages={messages}
              eventPropGetter={eventStyleGetter}
              onSelectEvent={handleSelectEvent}
              view={vista as any}
              onView={(view) => setVista(view)}
              views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA] as any}
              date={currentDate}
              onNavigate={(date) => setCurrentDate(date)}
              popup
              selectable
              onSelectSlot={handleSelectSlot}
            />
          </div>
        )}
      </div>
    </div>
  );
};
