import { X } from "lucide-react";
import { EventoForm } from "./EventoForm";
import type { Vendedor } from "../../../types/SellersType";

interface EventoModalProps {
  mostrar: boolean;
  nuevoEvento: {
    titulo: string;
    descripcion: string;
    fecha_realizacion: string;
    estado_tarea: string;
    tarea_vendedor_id: string;
  };
  vendedores: Vendedor[];
  onClose: () => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onCrearEvento: () => void;
}

export const EventoModal = ({
  mostrar,
  nuevoEvento,
  vendedores,
  onClose,
  onInputChange,
  onCrearEvento
}: EventoModalProps) => {
  if (!mostrar) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Nuevo Evento</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        <EventoForm
          nuevoEvento={nuevoEvento}
          vendedores={vendedores}
          onInputChange={onInputChange}
          onSubmit={(e) => {
            e.preventDefault();
            onCrearEvento();
          }}
          onCancel={onClose}
        />
      </div>
    </div>
  );
};
