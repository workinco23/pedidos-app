export type RolUsuario = "comercial" | "vigilancia" | "almacen" | "admin";

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
  qr_codigo_hash: string | null;
  usuario_creacion_id: string | null;
  updated_at: string;
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
}

export interface ComprobanteSalida {
  id: string;
  registro_vigilancia_id: string;
  numero_comprobante: string;
  created_at: string;
}

export interface QrPayload {
  ob: string;
  pedido: string;
  bp: string;
  ruc: string;
  razonSocial: string;
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
