import * as XLSX from 'xlsx';
import { supabase } from '../integrations/supabase';
import Swal from 'sweetalert2';

export const exportBackupToExcel = async () => {
  // Mostrar opciones de formato
  const result = await Swal.fire({
    title: 'Selecciona el formato de exportación',
    text: 'Se descargarán 4 archivos (uno por tabla)',
    icon: 'question',
    showDenyButton: true,
    showCancelButton: true,
    confirmButtonText: 'Excel (.xlsx)',
    denyButtonText: 'CSV (.csv)',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#10b981',
    denyButtonColor: '#3b82f6',
    cancelButtonColor: '#6b7280',
    allowOutsideClick: false
  });

  // Si el usuario canceló o cerró el diálogo
  if (result.isDismissed) {
    return;
  }

  // isConfirmed = Excel, isDenied = CSV
  const formato = result.isConfirmed ? 'excel' : 'csv';

  try {
    // Mostrar loading
    Swal.fire({
      title: 'Generando archivos...',
      text: 'Por favor espera mientras se exportan los datos',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Obtener todas las tablas
    const [clientes, vendedores, observaciones, eventos] = await Promise.all([
      fetchClientes(),
      fetchVendedores(),
      fetchObservaciones(),
      fetchEventos()
    ]);

    const fecha = new Date().toISOString().split('T')[0];

    // Exportar cada tabla en un archivo separado
    if (formato === 'excel') {
      exportToExcel('clientes', clientes, fecha);
      exportToExcel('vendedores', vendedores, fecha);
      exportToExcel('observaciones_cliente', observaciones, fecha);
      exportToExcel('eventos', eventos, fecha);
    } else {
      exportToCSV('clientes', clientes, fecha);
      exportToCSV('vendedores', vendedores, fecha);
      exportToCSV('observaciones_cliente', observaciones, fecha);
      exportToCSV('eventos', eventos, fecha);
    }

    // Mostrar éxito
    Swal.fire({
      icon: 'success',
      title: '¡Exportación completada!',
      html: `
        <div class="text-left">
          <p>Se han descargado 4 archivos:</p>
          <ul class="text-sm mt-2">
            <li>✅ clientes_${fecha}.${formato === 'excel' ? 'xlsx' : 'csv'}</li>
            <li>✅ vendedores_${fecha}.${formato === 'excel' ? 'xlsx' : 'csv'}</li>
            <li>✅ observaciones_cliente_${fecha}.${formato === 'excel' ? 'xlsx' : 'csv'}</li>
            <li>✅ eventos_${fecha}.${formato === 'excel' ? 'xlsx' : 'csv'}</li>
          </ul>
        </div>
      `,
      timer: 5000
    });

    return true;
  } catch (error) {
    console.error('Error al generar archivos:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudieron exportar los datos. Por favor intenta nuevamente.'
    });
    return false;
  }
};

// Función para exportar a Excel
const exportToExcel = (tableName: string, data: any[], fecha: string) => {
  if (!data || data.length === 0) {
    console.warn(`Tabla ${tableName} está vacía, no se exportará`);
    return;
  }

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, worksheet, tableName);
  XLSX.writeFile(workbook, `${tableName}_${fecha}.xlsx`);
};

// Función para exportar a CSV
const exportToCSV = (tableName: string, data: any[], fecha: string) => {
  if (!data || data.length === 0) {
    console.warn(`Tabla ${tableName} está vacía, no se exportará`);
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  
  // Crear blob y descargar
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${tableName}_${fecha}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Función para obtener clientes (con nombres de columnas exactos de Supabase)
const fetchClientes = async () => {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Retornar con nombres de columnas exactos de Supabase
    return data?.map(cliente => ({
      id: cliente.id,
      created_at: cliente.created_at,
      nombre: cliente.nombre,
      descripcion: cliente.descripcion,
      email: cliente.email,
      telefono: cliente.telefono?.startsWith('no-phone-') ? null : cliente.telefono,
      pais: cliente.pais,
      ciudad: cliente.ciudad,
      barrio: cliente.barrio,
      tipo_cliente: cliente.tipo_cliente,
      estado: cliente.estado,
      temperatura: cliente.temperatura,
      vendedor_id: cliente.vendedor_id,
      ultima_interaccion: cliente.ultima_interaccion,
      created_by: cliente.created_by,
      empleo: cliente.empleo,
      fecha_recontacto: cliente.fecha_recontacto
    }));
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    return [];
  }
};

// Función para obtener vendedores (con nombres de columnas exactos de Supabase)
const fetchVendedores = async () => {
  try {
    const { data, error } = await supabase
      .from('vendedores')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) throw error;

    // Retornar con nombres de columnas exactos de Supabase
    return data?.map(vendedor => ({
      id: vendedor.id,
      created_at: vendedor.created_at,
      nombre: vendedor.nombre,
      email: vendedor.email,
      auth_user_id: vendedor.auth_user_id
    }));
  } catch (error) {
    console.error('Error al obtener vendedores:', error);
    return [];
  }
};

// Función para obtener observaciones (con nombres de columnas exactos de Supabase)
const fetchObservaciones = async () => {
  try {
    const { data, error } = await supabase
      .from('observaciones_cliente')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Retornar con nombres de columnas exactos de Supabase
    return data?.map(obs => ({
      id: obs.id,
      created_at: obs.created_at,
      id_cliente: obs.id_cliente,
      id_vendedor: obs.id_vendedor,
      observacion: obs.observacion
    }));
  } catch (error) {
    console.error('Error al obtener observaciones:', error);
    return [];
  }
};

// Función para obtener eventos/tareas (con nombres de columnas exactos de Supabase)
const fetchEventos = async () => {
  try {
    const { data, error } = await supabase
      .from('eventos')
      .select('*')
      .order('fecha_realizacion', { ascending: false });

    if (error) throw error;

    // Retornar con nombres de columnas exactos de Supabase
    return data?.map(evento => ({
      id: evento.id,
      created_at: evento.created_at,
      titulo: evento.titulo,
      descripcion: evento.descripcion,
      fecha_realizacion: evento.fecha_realizacion,
      estado_tarea: evento.estado_tarea,
      tarea_client_id: evento.tarea_client_id,
      tarea_vendedor_id: evento.tarea_vendedor_id,
      created_by: evento.created_by
    }));
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    return [];
  }
};
