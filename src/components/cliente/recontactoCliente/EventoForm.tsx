import React from "react";
import type { Vendedor } from "../../../types/SellersType";
import { ESTADOS_TAREA } from "../../../constants/estadosTareas";

interface EventoFormProps {
  nuevoEvento: {
    titulo: string;
    descripcion: string;
    fecha_realizacion: string;
    estado_tarea: string;
    tarea_vendedor_id: string | null;
  };
  vendedores: Vendedor[];
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const EventoForm = ({
  nuevoEvento,
  vendedores,
  onInputChange,
  onSubmit,
  onCancel
}: EventoFormProps) => {
  return (
    <form onSubmit={onSubmit}>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="titulo">
          Título *
        </label>
        <input
          type="text"
          id="titulo"
          name="titulo"
          value={nuevoEvento.titulo}
          onChange={onInputChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="descripcion">
          Descripción
        </label>
        <textarea
          id="descripcion"
          name="descripcion"
          value={nuevoEvento.descripcion}
          onChange={onInputChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          rows={3}
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fecha_realizacion">
          Fecha y Hora *
        </label>
        <input
          type="datetime-local"
          id="fecha_realizacion"
          name="fecha_realizacion"
          value={nuevoEvento.fecha_realizacion}
          onChange={onInputChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tarea_vendedor_id">
          Vendedor Asignado
        </label>
        <select
          id="tarea_vendedor_id"
          name="tarea_vendedor_id"
          value={nuevoEvento.tarea_vendedor_id || ""}
          onChange={onInputChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        >
          <option value="">Seleccionar vendedor</option>
          {vendedores.map(vendedor => (
            <option key={vendedor.id} value={vendedor.id}>
              {vendedor.nombre}
            </option>
          ))}
        </select>
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="estado_tarea">
          Estado
        </label>
        <select
          id="estado_tarea"
          name="estado_tarea"
          value={nuevoEvento.estado_tarea}
          onChange={onInputChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        >
          {ESTADOS_TAREA.map((estado) => (
            <option key={estado} value={estado}>
              {estado}
            </option>
          ))}
        </select>
      </div>
      
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-md"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
        >
          Guardar
        </button>
      </div>
    </form>
  );
};
