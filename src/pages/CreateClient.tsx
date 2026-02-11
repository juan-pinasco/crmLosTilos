import { Header } from "../components/Header";
import { useState, useEffect } from "react";
import { create } from "../data/ClientsCrud";
import { fetchVendedores } from "../data/VendedoresCrud";
import { GetSession } from "../data/AuthsCrud";
import type { Cliente } from "../types/ClientsType";
import type { Vendedor } from "../types/SellersType";
import { useNavigate } from "react-router";
import {
  /* TIPOS_CLIENTE, */ TIPO_CLIENTE_DEFAULT,
} from "../constants/tiposCliente";
import {
  /* ESTADOS_CLIENTE, */
  ESTADO_CLIENTE_DEFAULT,
} from "../constants/estadosCliente";
import {
  /* TEMPERATURAS_CLIENTE, */
  TEMPERATURA_CLIENTE_DEFAULT,
} from "../constants/temperaturasCliente";

export const CreateClient = () => {
  const navigate = useNavigate();
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  
  // Función para obtener la fecha y hora actual en formato datetime-local
  const getFechaActual = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };
  
  const [fechaCreacion, setFechaCreacion] = useState<string>(getFechaActual());
  const [formData, setFormData] = useState<Omit<Cliente, "id" | "created_at">>({
    nombre: "",
    descripcion: "",
    email: "",
    telefono: "",
    pais: "",
    ciudad: "",
    barrio: "",
    tipo_cliente: TIPO_CLIENTE_DEFAULT,
    estado: ESTADO_CLIENTE_DEFAULT,
    temperatura: TEMPERATURA_CLIENTE_DEFAULT,
    vendedor_id: "",
    ultima_interaccion: new Date().toISOString(),
    created_by: "", // Campo añadido para indicar quién creó el cliente
    empleo: "", // Nuevo campo para el empleo del cliente
    fecha_recontacto: null, // Inicializado como null para compatibilidad con el tipo timestamp en Supabase
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadVendedores = async () => {
      try {
        const data = await fetchVendedores();
        if (data) {
          setVendedores(data);
        }
      } catch (err) {
        console.error("Error al cargar vendedores:", err);
        setError("Error al cargar la lista de vendedores");
      }
    };

    loadVendedores();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Obtener el usuario actual
      const currentUser = await GetSession();

      // Crear una copia del formData con el created_by, created_at y ultima_interaccion actualizados
      const fechaCreacionISO = fechaCreacion ? new Date(fechaCreacion).toISOString() : new Date().toISOString();
      const clienteData = {
        ...formData,
        created_by: currentUser?.email || "sistema",
        created_at: fechaCreacionISO,
        ultima_interaccion: fechaCreacionISO, // La última interacción es la fecha de creación
      };

      const clienteCreado = await create(clienteData as Cliente);
      console.log("Cliente creado exitosamente:", clienteCreado);
      
      if (clienteCreado && clienteCreado[0]) {
        navigate(`/profile-client/${clienteCreado[0].id}`);
      } else {
        setError("Error al crear el cliente. Es probable que el cliente ya exista. No pueden existir dos clientes con el mismo numero de telefono. En este caso busca el cliente y agregale una nueva Observacion.");
      }
      //navigate("/"); // Redirigir a la página principal después de crear
    } catch (err) {
      setError("Error al crear el cliente. Por favor, inténtelo de nuevo.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h1 className="text-2xl font-semibold text-gray-900">
              Crear Nuevo Cliente
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Complete los campos para crear nuevo cliente. "Nombre" y "Vendedor asignado" son requeridos
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 mx-6">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4">
              {/* Información básica */}
              <div>
                <label
                  htmlFor="nombre"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nombre
                </label>
                <input
                  type="text"
                  name="nombre"
                  id="nombre"
                  required
                  value={formData.nombre}
                  onChange={handleChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2"
                />
              </div>

              <div>
                <label
                  htmlFor="telefono"
                  className="block text-sm font-medium text-gray-700"
                >
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="telefono"
                  id="telefono"
                  value={formData.telefono === null || formData.telefono?.startsWith('no-phone-') ? '' : formData.telefono}
                  onChange={(e) => {
                    const value = e.target.value.trim();
                    const randomId = Math.random().toString(36).substring(2, 10);
                    setFormData(prev => ({
                      ...prev,
                      telefono: value === '' ? `no-phone-${randomId}` : value
                    }));
                  }}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2"
                />
              </div>

              <div>
                <label
                  htmlFor="vendedor_id"
                  className="block text-sm font-medium text-gray-700"
                >
                  Vendedor asignado
                </label>
                <select
                  name="vendedor_id"
                  id="vendedor_id"
                  required
                  value={formData.vendedor_id}
                  onChange={handleChange}
                  className="mt-1 block w-full py-3 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
                >
                  <option value="">Seleccionar vendedor</option>
                  {vendedores.map((vendedor) => (
                    <option key={vendedor.id} value={vendedor.id}>
                      {vendedor.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="fechaCreacion"
                  className="block text-sm font-medium text-gray-700"
                >
                  Fecha de creación
                </label>
                <input
                  type="datetime-local"
                  name="fechaCreacion"
                  id="fechaCreacion"
                  value={fechaCreacion}
                  onChange={(e) => setFechaCreacion(e.target.value)}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2"
                />
              </div>

              {/*  <div>
                <label
                  htmlFor="descripcion"
                  className="block text-sm font-medium text-gray-700"
                >
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  id="descripcion"
                  rows={4}
                  value={formData.descripcion}
                  onChange={handleChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-4"
                />
              </div>

              <div>
                <label
                  htmlFor="pais"
                  className="block text-sm font-medium text-gray-700"
                >
                  País
                </label>
                <input
                  type="text"
                  name="pais"
                  id="pais"
                  value={formData.pais}
                  onChange={handleChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-3"
                />
              </div>

              <div>
                <label
                  htmlFor="ciudad"
                  className="block text-sm font-medium text-gray-700"
                >
                  Ciudad
                </label>
                <input
                  type="text"
                  name="ciudad"
                  id="ciudad"
                  value={formData.ciudad}
                  onChange={handleChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-3"
                />
              </div>

              <div>
                <label
                  htmlFor="barrio"
                  className="block text-sm font-medium text-gray-700"
                >
                  Barrio
                </label>
                <input
                  type="text"
                  name="barrio"
                  id="barrio"
                  value={formData.barrio}
                  onChange={handleChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-3"
                />
              </div> 

              <div>
                <label
                  htmlFor="empleo"
                  className="block text-sm font-medium text-gray-700"
                >
                  Empleo
                </label>
                <input
                  type="text"
                  name="empleo"
                  id="empleo"
                  value={formData.empleo}
                  onChange={handleChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-3"
                />
              </div> */}

              {/*  <div>
                <label
                  htmlFor="tipo_cliente"
                  className="block text-sm font-medium text-gray-700"
                >
                  Tipo de Cliente
                </label>
                <select
                  name="tipo_cliente"
                  id="tipo_cliente"
                  value={formData.tipo_cliente}
                  onChange={handleChange}
                  className="mt-1 block w-full py-3 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  {TIPOS_CLIENTE.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="estado"
                  className="block text-sm font-medium text-gray-700"
                >
                  Estado
                </label>
                <select
                  name="estado"
                  id="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  className="mt-1 block w-full py-3 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  {ESTADOS_CLIENTE.map((estado) => (
                    <option key={estado} value={estado}>
                      {estado}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="temperatura"
                  className="block text-sm font-medium text-gray-700"
                >
                  Temperatura
                </label>
                <select
                  name="temperatura"
                  id="temperatura"
                  value={formData.temperatura}
                  onChange={handleChange}
                  className="mt-1 block w-full py-3 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  {TEMPERATURAS_CLIENTE.map((temperatura) => (
                    <option key={temperatura} value={temperatura}>
                      {temperatura}
                    </option>
                  ))}
                </select>
              </div> */}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="mr-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {loading ? "Guardando..." : "Guardar Cliente"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
