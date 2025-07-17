import React from "react";
import { FileText } from "lucide-react";
import type { Evento } from "../../../types/EventsType";

interface EventoDescripcionCardProps {
  evento: Evento;
  isEditing: boolean;
  editForm: {
    descripcion: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export const EventoDescripcionCard: React.FC<EventoDescripcionCardProps> = ({
  evento,
  isEditing,
  editForm,
  handleInputChange
}) => {
  return (
    <div className="mt-6 bg-white rounded-lg p-4 border border-gray-200">
      <h3 className="text-lg font-semibold mb-3 flex items-center text-gray-700">
        <FileText size={18} className="mr-2 text-blue-500" />
        Descripción
      </h3>
      {isEditing ? (
        <textarea
          name="descripcion"
          value={editForm.descripcion}
          onChange={handleInputChange}
          className="w-full h-32 border border-gray-300 rounded p-2 whitespace-pre-wrap"
          placeholder="Descripción del evento"
        />
      ) : (
        <div className="bg-white p-4 rounded-lg whitespace-pre-wrap">
          {evento.descripcion ? evento.descripcion : "Sin descripción disponible"}
        </div>
      )}
    </div>
  );
};
