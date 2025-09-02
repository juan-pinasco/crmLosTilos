import { Header } from "../components/Header";
import { useState, useEffect } from "react";
import type { Observacion } from "../types/ObservationsType";
import type { Vendedor } from "../types/SellersType";
import type { Cliente } from "../types/ClientsType";
import { fetchObservaciones } from "../data/ObservacionesCrud";
import { fetchVendedores } from "../data/VendedoresCrud";
import { fetchClientes } from "../data/ClientsCrud";
import ObservacionesTable from "../components/observaciones/ObservacionesTable";


export const Observaciones = () => {
  const [observaciones, setObservaciones] = useState<Observacion[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    // Cargar vendedores
    const loadVendedores = async () => {
      try {
        const vendedoresData = await fetchVendedores();
        if (vendedoresData) {
          setVendedores(vendedoresData);
        }
      } catch (error) {
        console.error("Error al cargar vendedores:", error);
      }
    };

    // Cargar clientes
    const loadClientes = async () => {
      try {
        const clientesData = await fetchClientes();
        if (clientesData) {
          setClientes(clientesData);
        }
      } catch (error) {
        console.error("Error al cargar clientes:", error);
      }
    };

    // Cargar observaciones
    const loadObservaciones = async () => {
      try {
        const observacionesData = await fetchObservaciones();
        if (observacionesData) {
          setObservaciones(observacionesData);
        }
      } catch (error) {
        console.error("Error al cargar observaciones:", error);
      } finally {
        setLoading(false);
      }
    };

    loadVendedores();
    loadClientes();
    loadObservaciones();
  }, []);

  // Función para obtener el nombre del vendedor por su ID
  const getNombreVendedor = (vendedorId: string | null | undefined) => {
    if (!vendedorId) return "No asignado";
    const vendedor = vendedores.find((v) => v.id === vendedorId);
    return vendedor ? vendedor.nombre : "No asignado";
  };

  // Función para obtener el nombre del cliente por su ID
  const getNombreCliente = (clienteId: string) => {
    const cliente = clientes.find((c) => c.id === clienteId);
    return cliente ? cliente.nombre : "No asignado";
  };


  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="mx-auto px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <ObservacionesTable 
            observaciones={observaciones}
            vendedores={vendedores}
            clientes={clientes}
            getNombreVendedor={getNombreVendedor}
            getNombreCliente={getNombreCliente}
          />
        )}
      </div>
    </div>
  );
};