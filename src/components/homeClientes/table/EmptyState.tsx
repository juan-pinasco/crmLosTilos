import React from "react";

interface EmptyStateProps {
  columnsCount: number;
  message?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  columnsCount,
  message = "No hay clientes disponibles" 
}) => {
  return (
    <tr>
      <td
        colSpan={columnsCount + 1}
        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
      >
        {message}
      </td>
    </tr>
  );
};

export default EmptyState;
