import type { Cliente } from "./ClientsType";
import type { Vendedor } from "./SellersType";

export interface Observacion {
  id?: number;
  created_at?: string;
  id_cliente: string;
  id_vendedor?: string | null;
  observacion: string;
  cliente?: Cliente;
  vendedor?: Vendedor;
  nombre_vendedor?: string | null;
}
