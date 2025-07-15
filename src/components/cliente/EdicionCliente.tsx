import { Save, X } from "lucide-react";
import type { Cliente } from "../../types/ClientsType";
import type { Vendedor } from "../../types/SellersType";
import { ESTADOS_CLIENTE } from "../../constants/estadosCliente";
import { TEMPERATURAS_CLIENTE } from "../../constants/temperaturasCliente";
import { TIPOS_CLIENTE } from "../../constants/tiposCliente";
import { updateCliente } from "../../data/ClientsCrud";
import React from "react";

interface EdicionClienteProps {
  cliente: Cliente;
  clienteEditado: Cliente;
  vendedores: Vendedor[];
  setClienteEditado: (cliente: Cliente) => void;
  onCancelar: () => void;
  onGuardar: (clienteActualizado: Cliente) => void;
  vacio: () => React.ReactNode;
}

export const EdicionCliente = ({
  cliente,
  clienteEditado,
  vendedores,
  setClienteEditado,
  onCancelar,
  onGuardar,
  vacio
}: EdicionClienteProps) => {
  
  // Manejador para guardar los cambios
  const handleGuardarCambios = async () => {
    try {
      const clienteActualizado = await updateCliente(cliente.id, clienteEditado);
      if (clienteActualizado) {
        onGuardar(clienteActualizado);
      }
    } catch (error) {
      console.error("Error al guardar los cambios:", error);
    }
  };

  return (
    <>
      {/* Botones de acción */}
      <div className="flex space-x-2">
        <button 
          onClick={handleGuardarCambios}
          className="bg-green-500 hover:bg-green-600 cursor-pointer text-white font-medium py-2 px-4 rounded-md flex items-center"
        >
          <Save size={16} className="mr-2" />
          Guardar
        </button>
        <button 
          onClick={onCancelar}
          className="bg-gray-200 hover:bg-gray-300 cursor-pointer text-gray-800 font-medium py-2 px-4 rounded-md flex items-center"
        >
          <X size={16} className="mr-2" />
          Cancelar
        </button>
      </div>
      
      {/* Formulario de edición */}
      <div className="pt-4">
        {/* Nombre y empleo */}
        <div>
          <input
            type="text"
            value={clienteEditado.nombre || ""}
            onChange={(e) => setClienteEditado({...clienteEditado, nombre: e.target.value})}
            className="w-full text-3xl font-bold mb-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="text"
            value={clienteEditado.empleo || ""}
            onChange={(e) => setClienteEditado({...clienteEditado, empleo: e.target.value})}
            className="w-full text-gray-600 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Empleo"
          />
        </div>
        
        {/* Descripción */}
        <div className="mb-4 mt-4">
          <h3 className="text-gray-500 text-sm mb-1">Descripción</h3>
          <textarea
            value={clienteEditado.descripcion || ""}
            onChange={(e) => setClienteEditado({...clienteEditado, descripcion: e.target.value})}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
        </div>
        <div className="border-b-2 border-gray-200 my-4"></div>
        
        {/* Estado */}
        <div className="mb-4">
          <h3 className="text-gray-500 text-sm mb-1">Estado</h3>
          <select
            value={clienteEditado.estado || ""}
            onChange={(e) => setClienteEditado({...clienteEditado, estado: e.target.value})}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Seleccionar estado</option>
            {ESTADOS_CLIENTE.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>
        </div>
        <div className="border-b-2 border-gray-200 my-4"></div>
        
        {/* Temperatura */}
        <div className="mb-4">
          <h3 className="text-gray-500 text-sm mb-1">Temperatura</h3>
          <select
            value={clienteEditado.temperatura || ""}
            onChange={(e) => setClienteEditado({...clienteEditado, temperatura: e.target.value})}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Seleccionar temperatura</option>
            {TEMPERATURAS_CLIENTE.map((temperatura) => (
              <option key={temperatura} value={temperatura}>
                {temperatura}
              </option>
            ))}
          </select>
        </div>
        <div className="border-b-2 border-gray-200 my-4"></div>
        
        {/* Información de contacto */}
        <div className="flex flex-row justify-between w-full">
          <div className="mb-4 w-1/2 pr-2">
            <h3 className="text-gray-500 text-sm mb-1">Teléfono</h3>
            <input
              type="text"
              value={clienteEditado.telefono || ""}
              onChange={(e) => setClienteEditado({...clienteEditado, telefono: e.target.value})}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="mb-4 w-1/2 pl-2">
            <h3 className="text-gray-500 text-sm mb-1">Correo Electrónico</h3>
            <input
              type="email"
              value={clienteEditado.email || ""}
              onChange={(e) => setClienteEditado({...clienteEditado, email: e.target.value})}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="border-b-2 border-gray-200 my-4"></div>
        
        {/* Información de vendedor */}
        <div className="flex flex-row justify-between w-full">
          <div className="mb-4 w-1/2 pr-2">
            <h3 className="text-gray-500 text-sm mb-1">Creado por</h3>
            <p>{cliente.created_by || vacio()}</p>
          </div>
          <div className="mb-4 w-1/2 pl-2">
            <h3 className="text-gray-500 text-sm mb-1">Vendedor Asignado</h3>
            <select
              value={clienteEditado.vendedor_id || ""}
              onChange={(e) => setClienteEditado({...clienteEditado, vendedor_id: e.target.value})}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccionar vendedor</option>
              {vendedores.map((vendedor) => (
                <option key={vendedor.id} value={vendedor.id}>
                  {vendedor.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="border-b-2 border-gray-200 my-4"></div>
        
        {/* Tipo de cliente */}
        <div className="mb-4">
          <h3 className="text-gray-500 text-sm mb-1">Tipo de cliente</h3>
          <select
            value={clienteEditado.tipo_cliente || ""}
            onChange={(e) => setClienteEditado({...clienteEditado, tipo_cliente: e.target.value})}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Seleccionar tipo</option>
            {TIPOS_CLIENTE.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
        </div>
        <div className="border-b-2 border-gray-200 my-4"></div>
        
        {/* Información de ubicación */}
        <div className="flex flex-row justify-between w-full">
          <div className="mb-4 w-1/3 pr-2">
            <h3 className="text-gray-500 text-sm mb-1">Ciudad</h3>
            <input
              type="text"
              value={clienteEditado.ciudad || ""}
              onChange={(e) => setClienteEditado({...clienteEditado, ciudad: e.target.value})}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="mb-4 w-1/3 px-2">
            <h3 className="text-gray-500 text-sm mb-1">Barrio</h3>
            <input
              type="text"
              value={clienteEditado.barrio || ""}
              onChange={(e) => setClienteEditado({...clienteEditado, barrio: e.target.value})}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="mb-4 w-1/3 pl-2">
            <h3 className="text-gray-500 text-sm mb-1">País</h3>
            <input
              type="text"
              value={clienteEditado.pais || ""}
              onChange={(e) => setClienteEditado({...clienteEditado, pais: e.target.value})}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </>
  );
};
