import React from "react";
import { Save, X, Edit } from "lucide-react";
import type { Evento } from "../../../types/EventsType";

interface EventoHeaderProps {
  evento: Evento;
  isEditing: boolean;
  editForm: {
    titulo: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  guardarCambios: () => void;
  cancelarEdicion: () => void;
  setIsEditing: (value: boolean) => void;
}

export const EventoHeader: React.FC<EventoHeaderProps> = ({
  evento,
  isEditing,
  editForm,
  handleInputChange,
  guardarCambios,
  cancelarEdicion,
  setIsEditing
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    guardarCambios();
  };

  return (
    <div className="px-6 py-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
      <div className="flex justify-between items-start">
        <div className="w-full">
          {isEditing ? (
            <form onSubmit={handleSubmit} id="eventoForm">
              <input
                type="text"
                name="titulo"
                value={editForm.titulo}
                onChange={handleInputChange}
                required
                className="w-full text-xl font-bold text-gray-800 bg-white border border-gray-300 rounded px-2 py-1"
              />
            </form>
          ) : (
            <h2 className="text-xl font-bold text-gray-800">{evento.titulo}</h2>
          )}
          <div className="flex items-center mt-2 text-sm text-gray-600">
            <span>Creado el {new Date(evento.created_at).toLocaleDateString()}</span>
            {evento.created_by && (
              <span className="flex items-center ml-3">
                <span>por {evento.created_by}</span>
              </span>
            )}
          </div>
        </div>
        {/* Botones de edición */}
        <div className="ml-4">
          {isEditing ? (
            <div className="flex space-x-2">
              <button
                type="submit"
                form="eventoForm"
                className="cursor-pointer bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded flex items-center"
              >
                <Save size={16} className="mr-1" /> Guardar
              </button>
              <button
                type="button"
                onClick={cancelarEdicion}
                className="cursor-pointer bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded flex items-center"
              >
                <X size={16} className="mr-1" /> Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center"
            >
              <Edit size={16} className="mr-1" />
              Editar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
