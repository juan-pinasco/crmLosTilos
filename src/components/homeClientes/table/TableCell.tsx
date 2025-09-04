import React from "react";
import { formatearFecha } from "../../../utils/dateUtils";
import { ESTADO_CLIENTE_COLORS } from "../../../constants/estadosCliente";
import { TEMPERATURA_CLIENTE_COLORS } from "../../../constants/temperaturasCliente";
import { TIPO_CLIENTE_COLORS } from "../../../constants/tiposCliente";

// Función para truncar texto y añadir puntos suspensivos
const truncateText = (text: string | null | undefined, maxLength: number) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

// Celda de texto básica
export const TextCell: React.FC<{ text: string | null | undefined; maxLength?: number }> = ({ 
  text, 
  maxLength = 12 
}) => (
  <td className="px-3 py-4 text-center whitespace-nowrap text-sm text-gray-500" title={text || ''}>
    {truncateText(text, maxLength)}
  </td>
);

// Celda de nombre (con estilo diferente)
export const NameCell: React.FC<{ text: string | null | undefined; pendientes?: number; maxLength?: number }> = ({ 
  text, 
  pendientes = 0,
  maxLength = 40 
}) => (
  <td className="px-3 py-2 flex flex-row justify-between text-sm font-medium text-gray-900" title={text || ''}>
    {/* <div className="relative inline-flex"> */}
    <div className=" overflow-y-auto ">
      {truncateText(text, maxLength)}
      
    </div>
    <div>
    {pendientes > 0 && (
        <span className="ml-1 inline-flex items-center justify-center text-xs font-bold leading-none text-white bg-red-600 rounded-full w-5 h-5">
          {pendientes}
        </span>
      )}
    </div>
  </td>
);

// Celda de descripción (puede tener múltiples líneas)

export const DescriptionCell: React.FC<{ text: string | null | undefined; maxLength?: number }> = ({ 
  text,
  maxLength = 50
}) => (
  <td className="px-3 py-2 max-w-[100px] text-sm text-gray-500 whitespace-pre-wrap align-top" title={text || ''}>
    <div className="max-h-[100px] overflow-y-auto break-words">
      {truncateText(text, maxLength)}
    </div>
  </td>
);

// Celda de fecha
export const DateCell: React.FC<{ date: string | null | undefined }> = ({ date }) => (
  <td className="px-3 py-4 text-left whitespace-nowrap text-sm text-gray-500">
    {date ? formatearFecha(date) : '-'}
  </td>
);

// Celda con estado (con color de fondo)
export const EstadoCell: React.FC<{ estado: string | null | undefined; maxLength?: number }> = ({ 
  estado, 
  maxLength = 20 
}) => (
  <td className="px-3 py-4 text-center whitespace-nowrap" title={estado || ''}>
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
        estado ? ESTADO_CLIENTE_COLORS[estado] || "bg-gray-100 text-gray-800" : "bg-gray-100 text-gray-800"
      }`}
    >
      {truncateText(estado, maxLength)}
    </span>
  </td>
);

// Celda con temperatura (con color de fondo)
export const TemperaturaCell: React.FC<{ temperatura: string | null | undefined; maxLength?: number }> = ({ 
  temperatura, 
  maxLength = 20 
}) => (
  <td className="px-3 py-4 text-center whitespace-nowrap" title={temperatura || ''}>
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
        temperatura ? TEMPERATURA_CLIENTE_COLORS[temperatura] || "bg-gray-100 text-gray-800" : "bg-gray-100 text-gray-800"
      }`}
    >
      {truncateText(temperatura, maxLength)}
    </span>
  </td>
);

// Celda con tipo de cliente (con color de fondo)
export const TipoClienteCell: React.FC<{ tipoCliente: string | null | undefined; maxLength?: number }> = ({ 
  tipoCliente, 
  maxLength = 20 
}) => (
  <td className="px-3 py-4 text-center whitespace-nowrap" title={tipoCliente || ''}>
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
        tipoCliente ? TIPO_CLIENTE_COLORS[tipoCliente] || "bg-gray-100 text-gray-800" : "bg-gray-100 text-gray-800"
      }`}
    >
      {truncateText(tipoCliente, maxLength)}
    </span>
  </td>
);

// Celda de vendedor
export const VendedorCell: React.FC<{ 
  vendedorId: string; 
  getNombreVendedor: (id: string) => string;
  maxLength?: number 
}> = ({ 
  vendedorId, 
  getNombreVendedor, 
  maxLength = 20 
}) => {
  const nombreVendedor = getNombreVendedor(vendedorId);
  return (
    <td className="px-3 py-4 text-center whitespace-nowrap text-sm text-gray-500" title={nombreVendedor}>
      {truncateText(nombreVendedor, maxLength)}
    </td>
  );
};
