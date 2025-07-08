export interface Observacion {
    id?: number;
    created_at?: string;
    id_cliente: string;
    id_vendedor?: string | null;
    observacion: string;
  }