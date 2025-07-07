import { Header } from "../components/Header";
import { useState, useEffect } from "react";
import { create } from "../data/ClientsCrud";
import { fetchVendedores } from "../data/VendedoresCrud";
import { GetSession } from "../data/AuthsCrud";
import type { Cliente } from "../types/ClientsType";
import type { Vendedor } from "../types/SellersType";
import { useNavigate } from "react-router";

export const CreateClient = () => {
  const navigate = useNavigate();
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [formData, setFormData] = useState<Omit<Cliente, "id" | "created_at">>({
    nombre: "",
    descripcion: "",
    email: "",
    telefono: "",
    pais: "",
    ciudad: "",
    barrio: "",
    tipo_cliente: "Potencial",
    estado: "Nuevo",
    temperatura: "Fría",
    vendedor_id: "",
    ultima_interaccion: new Date().toISOString(),
    created_by: "", // Campo añadido para indicar quién creó el cliente
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
      
      // Crear una copia del formData con el created_by actualizado
      const clienteData = {
        ...formData,
        created_by: currentUser?.email || "sistema"
      };
      
      await create(clienteData as Cliente);
      navigate("/"); // Redirigir a la página principal después de crear
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
              Complete todos los campos para registrar un nuevo cliente
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
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-3"
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
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-3"
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
                  required
                  value={formData.telefono}
                  onChange={handleChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-4"
                />
              </div>

              <div>
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

              {/* Ubicación */}
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

              {/* Clasificación del cliente */}
              <div>
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
                  <option value="Potencial">Potencial</option>
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                  <option value="Antiguo">Antiguo</option>
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
                  <option value="Nuevo">Nuevo</option>
                  <option value="En seguimiento">En seguimiento</option>
                  <option value="Negociación">Negociación</option>
                  <option value="Cerrado">Cerrado</option>
                  <option value="Perdido">Perdido</option>
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
                  <option value="Fría">Fría</option>
                  <option value="Tibia">Tibia</option>
                  <option value="Caliente">Caliente</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="vendedor_id"
                  className="block text-sm font-medium text-gray-700"
                >
                  Vendedor
                </label>
                <select
                  name="vendedor_id"
                  id="vendedor_id"
                  value={formData.vendedor_id}
                  onChange={handleChange}
                  className="mt-1 block w-full py-3 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Seleccionar vendedor</option>
                  {vendedores.map((vendedor) => (
                    <option key={vendedor.id} value={vendedor.id}>
                      {vendedor.nombre}
                    </option>
                  ))}
                </select>
              </div>
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
