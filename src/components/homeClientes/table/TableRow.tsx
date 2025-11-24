import React from "react";
import { Trash } from "lucide-react";
import type { Cliente } from "../../../types/ClientsType";
import { 
  TextCell, 
  NameCell, 
  DescriptionCell, 
  DateCell, 
  EstadoCell, 
  TemperaturaCell, 
  TipoClienteCell, 
  VendedorCell 
} from "./TableCell";

interface TableRowProps {
  cliente: Cliente;
  pendientes: number;
  selectedColumns: { [key: string]: boolean };
  getNombreVendedor: (id: string) => string;
  handleDeleteClient: (id: string) => void;
  index: number;
}

const TableRow: React.FC<TableRowProps> = ({
  cliente,
  pendientes,
  selectedColumns,
  getNombreVendedor,
  handleDeleteClient,
  index
}) => {
  return (
    <tr 
      key={cliente.id || index}
      className="hover:bg-gray-100 cursor-pointer"
      onClick={(e) => {
        e.preventDefault();
        // Usar window.location.href para forzar una navegación completa
        window.location.href = `/profile-client/${cliente.id}`;
      }}
    >
      {selectedColumns['ultima_interaccion'] && (
        <DateCell date={cliente.ultima_interaccion} />
      )}
      {selectedColumns['nombre'] && (
        <NameCell text={cliente.nombre} pendientes={pendientes} />
      )}
      {selectedColumns['email'] && (
        <TextCell text={cliente.email} />
      )}
      {selectedColumns['telefono'] && (
        <TextCell text={cliente.telefono} />
      )}
      {selectedColumns['descripcion'] && (
        <DescriptionCell text={cliente.descripcion} />
      )}
      {selectedColumns['pais'] && (
        <TextCell text={cliente.pais} />
      )}
      {selectedColumns['ciudad'] && (
        <TextCell text={cliente.ciudad} />
      )}
      {selectedColumns['barrio'] && (
        <TextCell text={cliente.barrio} />
      )}
      {selectedColumns['tipo_cliente'] && (
        <TipoClienteCell tipoCliente={cliente.tipo_cliente} />
      )}
      {selectedColumns['estado'] && (
        <EstadoCell estado={cliente.estado} />
      )}
      {selectedColumns['temperatura'] && (
        <TemperaturaCell temperatura={cliente.temperatura} />
      )}
      {selectedColumns['fecha_recontacto'] && (
        <DateCell date={cliente.fecha_recontacto} />
      )}
      {selectedColumns['vendedor_id'] && (
        <VendedorCell 
          vendedorId={cliente.vendedor_id} 
          getNombreVendedor={getNombreVendedor} 
        />
      )}
      {selectedColumns['empleo'] && (
        <TextCell text={cliente.empleo} />
      )}

      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <button
          className="text-red-400 hover:text-red-800 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation(); // Evita que el evento de clic se propague a la fila
            handleDeleteClient(cliente.id);
          }}
        >
          <Trash size={18} />
        </button>
      </td>
    </tr>
  );
};

export default TableRow;
