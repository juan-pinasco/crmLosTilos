import React, { useState, useEffect } from "react";
import { useParams } from "react-router";
import { Header } from "../../components/Header";
import type { Evento } from "../../types/EventsType";
import { fetchEventoPorId, actualizarEvento } from "../../data/EventosCrud";
import { fetchVendedores } from "../../data/VendedoresCrud";
import { fetchClientes } from "../../data/ClientsCrud";
import {
  EventoHeader,
  EventoInfoCard,
  EventoPersonasCard,
  EventoDescripcionCard,
  LoadingSpinner,
  ErrorMessage,
  NoEventoMessage,
} from "../../components/eventos/detalleEvento";

export const DetalleEvento = () => {
  const { id } = useParams<{ id: string }>();
  const [evento, setEvento] = useState<Evento | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [vendedores, setVendedores] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [clientesBuscados, setClientesBuscados] = useState<any[]>([]);
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [editForm, setEditForm] = useState({
    titulo: "",
    descripcion: "",
    fecha_realizacion: "",
    estado_tarea: "",
    tarea_client_id: "",
    tarea_vendedor_id: "",
  });

  useEffect(() => {
    if (id) {
      cargarEvento(id);
      cargarVendedores();
      cargarClientes();
    }
  }, [id]);

  const cargarVendedores = async () => {
    try {
      const data = await fetchVendedores();
      if (data) {
        setVendedores(data);
      }
    } catch (err) {
      console.error("Error al cargar vendedores:", err);
    }
  };

  const cargarClientes = async () => {
    try {
      const data = await fetchClientes();
      if (data) {
        setClientes(data);
      }
    } catch (err) {
      console.error("Error al cargar clientes:", err);
    }
  };

  const cargarEvento = async (eventoId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEventoPorId(eventoId);
      if (data) {
        setEvento(data);
        setEditForm({
          titulo: data.titulo,
          descripcion: data.descripcion || "",
          fecha_realizacion: data.fecha_realizacion
            ? data.fecha_realizacion.substring(0, 16)
            : "",
          estado_tarea: data.estado_tarea,
          tarea_client_id: data.tarea_client_id || "",
          tarea_vendedor_id: data.tarea_vendedor_id || "",
        });
      } else {
        setError("No se encontró el evento");
      }
    } catch (err: any) {
      setError(err.message || "Error al cargar el evento");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClienteSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const busqueda = e.target.value;
    setBusquedaCliente(busqueda);

    if (busqueda.trim() === "") {
      setClientesBuscados([]);
      return;
    }

    const resultados = clientes.filter((cliente) =>
      cliente.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
    setClientesBuscados(resultados.slice(0, 5)); // Limitar a 5 resultados
  };

  const seleccionarCliente = (clienteId: string) => {
    setEditForm((prev) => ({
      ...prev,
      tarea_client_id: clienteId,
    }));
    setBusquedaCliente("");
    setClientesBuscados([]);
  };

  const guardarCambios = async () => {
    if (!id) return;

    try {
      // Convertir la fecha local a UTC
      let fechaUTC: string | undefined = undefined;
      if (editForm.fecha_realizacion) {
        const fechaLocal = new Date(editForm.fecha_realizacion);
        fechaUTC = fechaLocal.toISOString(); // Convierte a formato ISO en UTC
      }

      const eventoActualizado = await actualizarEvento(id, {
        titulo: editForm.titulo,
        descripcion: editForm.descripcion,
        fecha_realizacion: fechaUTC,
        estado_tarea: editForm.estado_tarea,
        tarea_client_id: editForm.tarea_client_id || null,
        tarea_vendedor_id: editForm.tarea_vendedor_id || null,
      });

      if (eventoActualizado) {
        setEvento(eventoActualizado);
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Error al actualizar el evento:", err);
      alert("Error al guardar los cambios");
    }
  };

  const cancelarEdicion = () => {
    if (evento) {
      setEditForm({
        titulo: evento.titulo,
        descripcion: evento.descripcion || "",
        fecha_realizacion: evento.fecha_realizacion
          ? evento.fecha_realizacion.substring(0, 16)
          : "",
        estado_tarea: evento.estado_tarea,
        tarea_client_id: evento.tarea_client_id || "",
        tarea_vendedor_id: evento.tarea_vendedor_id || "",
      });
    }
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Detalles del Evento</h1>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : evento ? (
          <div className="space-y-6">
            {/* Tarjeta principal del evento */}
            <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
              <EventoHeader
                evento={evento}
                isEditing={isEditing}
                editForm={editForm}
                handleInputChange={handleInputChange}
                guardarCambios={guardarCambios}
                cancelarEdicion={cancelarEdicion}
                setIsEditing={setIsEditing}
              />

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Columna izquierda */}
                  <div className="space-y-6">
                    <EventoInfoCard
                      evento={evento}
                      isEditing={isEditing}
                      editForm={editForm}
                      handleInputChange={handleInputChange}
                    />
                  </div>

                  {/* Columna derecha */}
                  <div className="space-y-6">
                    <EventoPersonasCard
                      evento={evento}
                      isEditing={isEditing}
                      editForm={editForm}
                      handleInputChange={handleInputChange}
                      busquedaCliente={busquedaCliente}
                      handleClienteSearch={handleClienteSearch}
                      clientesBuscados={clientesBuscados}
                      seleccionarCliente={seleccionarCliente}
                      clientes={clientes}
                      vendedores={vendedores}
                    />
                  </div>
                </div>

                {/* Descripción completa */}
                <EventoDescripcionCard
                  evento={evento}
                  isEditing={isEditing}
                  editForm={editForm}
                  handleInputChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        ) : (
          <NoEventoMessage />
        )}
      </div>
    </div>
  );
};
