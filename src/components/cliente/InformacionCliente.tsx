import { Edit } from "lucide-react";
import type { Cliente } from "../../types/ClientsType";
import type { Vendedor } from "../../types/SellersType";
import { formatearFecha } from "../../utils/dateUtils";

interface InformacionClienteProps {
  cliente: Cliente;
  vendedores: Vendedor[];
}

export const InformacionCliente = ({ cliente, vendedores }: InformacionClienteProps) => {
  // Función para mostrar texto vacío en gris claro
  const vacio = () => <span className="text-gray-400">Sin datos</span>;

  // Función para obtener el nombre del vendedor por su ID
  const getNombreVendedor = (vendedorId: string | null | undefined) => {
    if (!vendedorId) return vacio();
    const vendedor = vendedores.find((v) => v.id === vendedorId);
    return vendedor ? vendedor.nombre : vacio();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-1 text-gray-800">
        {cliente.nombre}
      </h1>
      <p className="text-gray-600 mb-8">{"Empleo No Proporcionado"}</p>

      <div className="pt-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            Información de Contacto
          </h2>
          <button className="bg-gray-200 hover:bg-gray-300 cursor-pointer text-gray-800 font-medium py-2 px-4 rounded-md flex items-center">
            <Edit size={16} className="mr-2" />
            Editar
          </button>
        </div>

        <div>
          <div className="mb-4">
            <h3 className="text-gray-500 text-sm mb-1">Descripción</h3>
            <p>{cliente.descripcion || vacio()}</p>
          </div>
          <div className="border-b-2 border-gray-200 my-4"></div>

          {/* Estado */}
          <div className="mb-4">
            <h3 className="text-gray-500 text-sm mb-1">Estado</h3>
            <p>{cliente.estado || vacio()}</p>
          </div>
          <div className="border-b-2 border-gray-200 my-4"></div>
          <div className="mb-4">
            <h3 className="text-gray-500 text-sm mb-1">Temperatura</h3>
            <p>{cliente.temperatura || vacio()}</p>
          </div>
          <div className="border-b-2 border-gray-200 my-4"></div>

          {/* Información de contacto */}
          <div className="flex flex-row justify-between w-full">
            <div className="mb-4 w-1/2 pr-2">
              <h3 className="text-gray-500 text-sm mb-1">Teléfono</h3>
              <p>{cliente.telefono || vacio()}</p>
            </div>
            <div className="mb-4 w-1/2 pl-2">
              <h3 className="text-gray-500 text-sm mb-1">
                Correo Electrónico
              </h3>
              <p>{cliente.email || vacio()}</p>
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
              <h3 className="text-gray-500 text-sm mb-1">
                Vendedor Asignado
              </h3>
              <p>{getNombreVendedor(cliente.vendedor_id)}</p>
            </div>
          </div>
          <div className="border-b-2 border-gray-200 my-4"></div>

          {/* Tipo de cliente */}
          <div className="mb-4">
            <h3 className="text-gray-500 text-sm mb-1">Tipo de cliente</h3>
            <p>{cliente.tipo_cliente || vacio()}</p>
          </div>
          <div className="border-b-2 border-gray-200 my-4"></div>

          {/* Información de ubicación */}
          <div className="flex flex-row justify-between w-full">
            <div className="mb-4 w-1/3 pr-2">
              <h3 className="text-gray-500 text-sm mb-1">Ciudad</h3>
              <p>{cliente.ciudad || vacio()}</p>
            </div>
            <div className="mb-4 w-1/3 px-2">
              <h3 className="text-gray-500 text-sm mb-1">Barrio</h3>
              <p>{cliente.barrio || vacio()}</p>
            </div>
            <div className="mb-4 w-1/3 pl-2">
              <h3 className="text-gray-500 text-sm mb-1">País</h3>
              <p>{cliente.pais || vacio()}</p>
            </div>
          </div>
          <div className="border-b-2 border-gray-200 my-4"></div>

          {/* Información de fecha */}
          <div className="flex flex-row justify-between w-full">
            <div className="mb-4 w-1/2 pr-2">
              <h3 className="text-gray-500 text-sm mb-1">
                Fecha de creación
              </h3>
              <p>{formatearFecha(cliente.created_at) || vacio()}</p>
            </div>
            <div className="mb-4 w-1/2 pl-2">
              <h3 className="text-gray-500 text-sm mb-1">
                Ultima interacción
              </h3>
              <p>
                {formatearFecha(cliente.ultima_interaccion, true) ||
                  vacio()}
              </p>
            </div>
          </div>
          <div className="border-b-2 border-gray-200 my-4"></div>
        </div>
      </div>
    </div>
  );
};
