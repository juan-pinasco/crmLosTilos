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
import { ObservacionesCliente } from "../components/cliente/ObservacionesCliente";
import { InformacionCliente } from "../components/cliente/InformacionCliente";
import { RecontactoCliente } from "../components/cliente/RecontactoCliente";

export const ProfileClient = () => {
  const { id } = useParams<{ id: string }>();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [observaciones, setObservaciones] = useState<Observacion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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
        }

        // Cargar observaciones del cliente
        const observacionesData = await fetchObservacionesByClienteId(id);
        setObservaciones(observacionesData);

        setLoading(false);
      }
    };

    cargarDatos();
  }, [id]);

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
          <InformacionCliente 
            cliente={cliente} 
            vendedores={vendedores} 
          />
        </div>

        {/* Columna derecha - Próximos recontactos */}
        <div className="col-span-12 md:col-span-3">
          <RecontactoCliente clienteId={id || ''} />
        </div>
      </div>
    </div>
  );
};
