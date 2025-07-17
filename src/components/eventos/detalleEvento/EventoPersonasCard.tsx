import React from "react";
import { Link } from "react-router";
import { User, Users, Search } from "lucide-react";
import type { Evento } from "../../../types/EventsType";

interface EventoPersonasCardProps {
  evento: Evento;
  isEditing: boolean;
  editForm: {
    tarea_client_id: string;
    tarea_vendedor_id: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  busquedaCliente: string;
  handleClienteSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clientesBuscados: any[];
  seleccionarCliente: (clienteId: string) => void;
  clientes: any[];
  vendedores: any[];
}

export const EventoPersonasCard: React.FC<EventoPersonasCardProps> = ({
  evento,
  isEditing,
  editForm,
  handleInputChange,
  busquedaCliente,
  handleClienteSearch,
  clientesBuscados,
  seleccionarCliente,
  clientes,
  vendedores
}) => {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <h3 className="text-lg font-semibold mb-3 flex items-center text-gray-700">
        <Users size={18} className="mr-2 text-blue-500" />
        Personas Relacionadas
      </h3>
      <div className="space-y-4">
        <div>
          <div className="flex items-center text-sm font-medium text-gray-500 mb-1">
            <User size={16} className="mr-2 text-gray-400" />
            Cliente
          </div>
          {isEditing ? (
            <div className="relative">
              <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                <Search size={16} className="ml-2 text-gray-400" />
                <input
                  type="text"
                  value={busquedaCliente}
                  onChange={handleClienteSearch}
                  placeholder="Buscar cliente..."
                  className="w-full px-2 py-1 outline-none"
                />
              </div>
              {clientesBuscados.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg">
                  {clientesBuscados.map(cliente => (
                    <div
                      key={cliente.id}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => seleccionarCliente(cliente.id)}
                    >
                      {cliente.nombre}
                    </div>
                  ))}
                </div>
              )}
              {editForm.tarea_client_id && (
                <div className="mt-2 text-sm text-gray-600">
                  Cliente seleccionado: {clientes.find(c => c.id === editForm.tarea_client_id)?.nombre || "Cliente"}
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-800 font-medium">
              {evento.cliente ? (
                <Link to={`/profile-client/${evento.tarea_client_id}`} className="text-blue-600 hover:underline">
                  {evento.cliente.nombre}
                </Link>
              ) : "No asignado"}
            </p>
          )}
        </div>
        <div>
          <div className="flex items-center text-sm font-medium text-gray-500 mb-1">
            <User size={16} className="mr-2 text-gray-400" />
            Vendedor
          </div>
          {isEditing ? (
            <select
              name="tarea_vendedor_id"
              value={editForm.tarea_vendedor_id}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-2 py-1"
            >
              <option value="">Seleccionar vendedor</option>
              {vendedores.map(vendedor => (
                <option key={vendedor.id} value={vendedor.id}>
                  {vendedor.nombre}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-gray-800 font-medium">{evento.vendedor ? evento.vendedor.nombre : "No asignado"}</p>
          )}
        </div>
      </div>
    </div>
  );
};
