export type RolUsuario = "comercial" | "vigilancia" | "almacen" | "sub_admin" | "admin";

export type TipoComprobante = "factura" | "boleta";

export type EstadoPedido =
  | "en_extraccion"
  | "contabilizado"
  | "facturado"
  | "entregado";

export type OrigenPedido = "fuerza_ventas" | "mostrador";

export type TipoAtencion = "recojo_qr" | "atencion_mostrador";

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  rol: RolUsuario;
  created_at: string;
}

export interface Pedido {
  id: string;
  fecha_registro: string;
  bp: string;
  documento_identidad: string;
  razon_social: string;
  pedido_venta: string;
  ob: string;
  tipo_comprobante: TipoComprobante;
  estado: EstadoPedido;
  origen: OrigenPedido;
  prioridad: boolean;
  qr_codigo_hash: string | null;
  usuario_creacion_id: string | null;
  updated_at: string;
  /** OBs adicionales (más allá de `ob`), traídas por join con pedido_obs. No viene en eventos realtime. */
  obsAdicionales: string[];
}

export interface PedidoOb {
  id: string;
  pedido_id: string;
  ob: string;
}

export interface RegistroVigilancia {
  id: string;
  pedido_id: string | null;
  documento_cliente: string;
  razon_social: string;
  tipo_atencion: TipoAtencion;
  fecha_ingreso: string;
  fecha_salida: string | null;
  usuario_vigilancia_id: string | null;
  dni_receptor: string | null;
  nombre_receptor: string | null;
}

export interface RegistroVigilanciaPedido {
  id: string;
  registro_vigilancia_id: string;
  pedido_id: string;
}

export interface ComprobanteSalida {
  id: string;
  registro_vigilancia_id: string;
  numero_comprobante: string;
  created_at: string;
}

export interface QrPedidoItem {
  pedidoId: string;
  pedidoVenta: string;
  obs: string[];
}

export interface QrPayload {
  bp: string;
  ruc: string;
  razonSocial: string;
  pedidos: QrPedidoItem[];
}

export interface Cliente {
  id: string;
  ruc_dni: string;
  bp: string | null;
  razon_social: string;
  fuente: "importado" | "manual";
  registrado_por: string | null;
  datos_adicionales: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface Cartera {
  id: string;
  bp: string;
  vendedor_nombre: string;
  datos_adicionales: Record<string, unknown> | null;
  created_at: string;
}

export interface ResultadoBusquedaCliente {
  registrado: boolean;
  ruc_dni: string;
  bp: string | null;
  razon_social: string;
  vendedor_nombre: string | null;
}

export const ESTADO_LABELS: Record<EstadoPedido, string> = {
  en_extraccion: "En Extracción",
  contabilizado: "Contabilizado",
  facturado: "Facturado",
  entregado: "Entregado",
};
