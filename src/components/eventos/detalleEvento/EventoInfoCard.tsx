import React from "react";
import { Calendar, Tag } from "lucide-react";
import type { Evento } from "../../../types/EventsType";
import { formatearFecha } from "../../../utils/dateUtils";
import { getEstadoClass, ESTADOS_TAREA } from "../../../constants/estadosTareas";

interface EventoInfoCardProps {
  evento: Evento;
  isEditing: boolean;
  editForm: {
    fecha_realizacion: string;
    estado_tarea: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export const EventoInfoCard: React.FC<EventoInfoCardProps> = ({
  evento,
  isEditing,
  editForm,
  handleInputChange
}) => {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <h3 className="text-lg font-semibold mb-3 flex items-center text-gray-700">
        <Calendar size={18} className="mr-2 text-blue-500" />
        Información de la Tarea
      </h3>
      <div className="space-y-4">
        <div>
          <div className="flex items-center text-sm font-medium text-gray-500 mb-1">
            <Calendar size={16} className="mr-2 text-gray-400" />
            Fecha de realización
          </div>
          {isEditing ? (
            <input
              type="datetime-local"
              name="fecha_realizacion"
              value={editForm.fecha_realizacion}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-2 py-1 text-gray-800"
            />
          ) : (
            <p className="text-gray-800 font-medium">{formatearFecha(evento.fecha_realizacion, true)}</p>
          )}
        </div>
        <div>
          <div className="flex items-center text-sm font-medium text-gray-500 mb-1">
            <Tag size={16} className="mr-2 text-gray-400" />
            Estado
          </div>
          {isEditing ? (
            <select
              name="estado_tarea"
              value={editForm.estado_tarea}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-2 py-1 text-gray-800"
            >
              {ESTADOS_TAREA.map((estado) => (
                <option key={estado} value={estado}>{estado}</option>
              ))}
            </select>
          ) : (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEstadoClass(evento.estado_tarea)}`}>
              {evento.estado_tarea}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
