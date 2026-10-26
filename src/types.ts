export type Role = 'vendedor' | 'doctor' | 'servicios'

export const ROLE_LABELS: Record<Role, string> = {
  vendedor: 'Vendedor',
  doctor: 'Doctor',
  servicios: 'Servicios Médicos',
}

export const isRole = (v: unknown): v is Role =>
  typeof v === 'string' && v in ROLE_LABELS

export interface Product {
  id: string
  name: string
  quantity: number
  price: number
  role: Role
  /** P/tarjeta: el total de la fila se descuenta en el card de tarjeta */
  card: boolean
}
