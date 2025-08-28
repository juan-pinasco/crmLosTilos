import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { fetchClienteById } from "../data/ClientsCrud";
import { fetchVendedores } from "../data/VendedoresCrud";
import { fetchObservacionesByClienteId } from "../data/ObservacionesCrud";
import type { Cliente } from "../types/ClientsType";
import type { Vendedor } from "../types/SellersType";
import type { Observacion } from "../types/ObservationsType";
import { Header } from "../components/Header";
// Importar los nuevos componentes
import { ObservacionesCliente } from "../components/perfilClienteComp/ObservacionesCliente";
import { InformacionClienteInline } from "../components/perfilClienteComp/InformacionClienteInline";
import { RecontactoCliente } from "../components/perfilClienteComp/recontactoCliente/RecontactoCliente";

export const ProfileClient = () => {
  const { id } = useParams<{ id: string }>();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [observaciones, setObservaciones] = useState<Observacion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  // Estado para la fecha de recontacto que se compartirá entre componentes
  const [fechaRecontacto, setFechaRecontacto] = useState<string | null>(null);

  useEffect(() => {
    const cargarDatos = async () => {
      if (id) {
        setLoading(true);

        // Cargar vendedores
        const vendedoresData = await fetchVendedores();
        if (vendedoresData) {
          setVendedores(vendedoresData);
        }

        // Cargar cliente
        const data = await fetchClienteById(id);
        if (data) {
          setCliente(data);
          // Inicializar la fecha de recontacto con la del cliente
          setFechaRecontacto(data.fecha_recontacto);
        }

        // Cargar observaciones del cliente
        const observacionesData = await fetchObservacionesByClienteId(id);
        setObservaciones(observacionesData);

        setLoading(false);
      }
    };

    cargarDatos();
  }, [id]);

  // Función para actualizar la fecha de recontacto desde RecontactoCliente
  const handleFechaRecontactoChange = (nuevaFecha: string | null) => {
    setFechaRecontacto(nuevaFecha);
    
    // También actualizamos el cliente local para mantener todo sincronizado
    if (cliente) {
      setCliente({
        ...cliente,
        fecha_recontacto: nuevaFecha
      });
    }
    
    console.log(`Fecha de recontacto actualizada en ProfileClient: ${nuevaFecha}`);
  };

  // Función para manejar la actualización del cliente desde InformacionCliente
  const handleClienteActualizado = (clienteActualizado: Cliente) => {
    console.log('Cliente actualizado en ProfileClient:', clienteActualizado);
    setCliente(clienteActualizado);
    // Actualizar también la fecha de recontacto si ha cambiado
    if (clienteActualizado.fecha_recontacto !== fechaRecontacto) {
      setFechaRecontacto(clienteActualizado.fecha_recontacto);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Cargando...
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="flex justify-center items-center h-screen">
        Cliente no encontrado
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="grid grid-cols-12 gap-8 p-6">
        {/* Columna izquierda - Observaciones del cliente */}
        <div className="col-span-12 md:col-span-3">
          <ObservacionesCliente 
            clienteId={id || ''}
            cliente={cliente}
            setCliente={setCliente}
            observaciones={observaciones}
            setObservaciones={setObservaciones}
          />
        </div>

        {/* Columna central - Información del cliente */}
        <div className="col-span-12 md:col-span-6">
          <InformacionClienteInline 
            cliente={{
              ...cliente,
              fecha_recontacto: fechaRecontacto // Usamos el estado compartido
            }} 
            vendedores={vendedores}
            onClienteActualizado={handleClienteActualizado}
          />
        </div>

        {/* Columna derecha - Próximos recontactos */}
        <div className="col-span-12 md:col-span-3">
          <RecontactoCliente 
            clienteId={id || ''} 
            onFechaRecontactoChange={handleFechaRecontactoChange}
          />
        </div>
      </div>
    </div>
  );
};
