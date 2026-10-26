import type { Product, Role } from '../types'

export const currency = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
})

export const lineTotal = (p: Product) => p.quantity * p.price

/**
 * Resultado de un cálculo mostrado en el panel de cálculos.
 * Para agregar un cálculo nuevo: escribe la función y regístrala en `calculations`.
 */
export interface CalculationResult {
  id: string
  label: string
  value: string
}

/** Ajustes que afectan los cálculos (los controla el switch del encabezado) */
export interface CalcOptions {
  discount: boolean
}

export type Calculation = (products: Product[], options: CalcOptions) => CalculationResult

/** Monto fijo que se resta al subtotal cuando el switch está activo */
export const DISCOUNT_AMOUNT = 300

export const grandTotal = (products: Product[]) =>
  products.reduce((acc, p) => acc + lineTotal(p), 0)

const totalByRole =
  (role: Role, label: string): Calculation =>
  (products) => ({
    id: `total-${role}`,
    label,
    value: currency.format(grandTotal(products.filter((p) => p.role === role))),
  })

const totalCard: Calculation = (products) => {
  const sum = grandTotal(products.filter((p) => p.card))
  return {
    id: 'total-card',
    label: 'Total P/tarjeta',
    value: currency.format(sum > 0 ? -sum : 0),
  }
}

const total: Calculation = (products) => ({
  id: 'total',
  label: 'Subtotal',
  value: currency.format(grandTotal(products)),
})

const totalDiscount: Calculation = (_products, { discount }) => ({
  id: 'total-discount',
  label: 'Pago Doctor',
  value: currency.format(discount ? -DISCOUNT_AMOUNT : 0),
})

const totalAfterCard: Calculation = (products, { discount }) => ({
  id: 'total-final',
  label: 'Total Final',
  value: currency.format(
    grandTotal(products) -
      grandTotal(products.filter((p) => p.card)) -
      (discount ? DISCOUNT_AMOUNT : 0),
  ),
})

/** Registro de cálculos: aquí se agregarán los siguientes. */
export const calculations: Calculation[] = [
  totalByRole('vendedor', 'Total Vendedor'),
  totalByRole('doctor', 'Total Doctor'),
  totalByRole('servicios', 'Total Servicios Médicos'),
  total,
  totalCard,
  totalDiscount,
  totalAfterCard,
]
