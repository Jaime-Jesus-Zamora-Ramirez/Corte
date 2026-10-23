export type Role = 'vendedor' | 'doctor'

export const ROLE_LABELS: Record<Role, string> = {
  vendedor: 'Vendedor',
  doctor: 'Doctor',
}

export interface Product {
  id: string
  name: string
  quantity: number
  price: number
  role: Role
  /** P/tarjeta: el total de la fila se descuenta en el card de tarjeta */
  card: boolean
}
