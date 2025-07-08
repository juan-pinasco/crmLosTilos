import { Plus } from "lucide-react";

interface RecontactoClienteProps {
  clienteId: string;
}

export const RecontactoCliente = ({ clienteId }: RecontactoClienteProps) => {
  // Aquí se implementará la lógica para gestionar los recontactos
  // Por ahora solo tenemos el botón para agregar recontactos

  const handleAgregarRecontacto = () => {
    // Implementar la lógica para agregar un recontacto
    console.log("Agregar recontacto para cliente:", clienteId);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6 text-gray-800">
        Próximo Recontacto
      </h2>

      {/* Aquí se mostrarán los recontactos programados cuando se implementen */}

      <button 
        onClick={handleAgregarRecontacto}
        className="mt-6 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 px-6 rounded-md flex items-center justify-center w-full"
      >
        <Plus size={16} className="mr-2" />
        Agregar Recontacto
      </button>
    </div>
  );
};
