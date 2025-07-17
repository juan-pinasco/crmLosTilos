import { EventoItem } from "./EventoItem";
import type { Evento } from "../../../types/EventsType";

interface EventosListProps {
  eventos: Evento[];
  cargando: boolean;
  onCambiarEstado: (eventoId: string, nuevoEstado: string) => void;
  onEliminarEvento: (eventoId: string) => void;
  formatearFecha: (fechaISO: string) => string;
}

export const EventosList = ({
  eventos,
  cargando,
  onCambiarEstado,
  onEliminarEvento,
  formatearFecha
}: EventosListProps) => {
  if (cargando) {
    return <div className="text-center py-4">Cargando eventos...</div>;
  }
  
  if (eventos.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No hay eventos programados para este cliente.
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {eventos.map(evento => (
        <EventoItem
          key={evento.id}
          evento={evento}
          onCambiarEstado={onCambiarEstado}
          onEliminarEvento={onEliminarEvento}
          formatearFecha={formatearFecha}
        />
      ))}
    </div>
  );
};
