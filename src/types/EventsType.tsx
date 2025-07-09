import type { Vendedor } from "./SellersType";
import type { Cliente } from "./ClientsType";

export interface Evento {
  id: string;
  created_at: string;
  titulo: string;
  descripcion: string;
  created_by: string;
  fecha_realizacion: string;
  estado_tarea: string;
  tarea_client_id: string;
  tarea_vendedor_id: string;
  vendedor?: Vendedor;
  cliente?: Cliente;
}
