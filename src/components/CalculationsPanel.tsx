import { Button, Card } from '@heroui/react'
import type { Product } from '../types'
import { calculations, type CalcOptions } from '../lib/calculations'

interface Props {
  products: Product[]
  options: CalcOptions
  onClear: () => void
  onPdf: () => void
}

/** Espacio reservado para los cálculos; se alimenta del registro en lib/calculations.ts */
export function CalculationsPanel({ products, options, onClear, onPdf }: Props) {
  return (
    <Card>
      <Card.Header>
        <Card.Title>Cálculos</Card.Title>
      </Card.Header>
      <Card.Content>
        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
          {calculations.map((calc) => {
            const r = calc(products, options)
            const highlight = r.id === 'total-final'
            const warning = r.id === 'total-card'
            return (
              <div
                key={r.id}
                className={
                  highlight
                    ? 'col-span-full rounded-xl bg-accent px-3 py-2 text-accent-foreground'
                    : warning
                      ? 'rounded-xl bg-warning px-3 py-1.5 text-white'
                      : 'rounded-xl border border-divider px-3 py-1.5'
                }
              >
                <dt className={highlight || warning ? 'text-xs opacity-90' : 'text-xs text-muted'}>
                  {r.label}
                </dt>
                <dd className={`font-semibold leading-snug tabular-nums ${highlight ? 'text-xl' : 'text-base'}`}>
                  {r.value}
                </dd>
              </div>
            )
          })}
        </dl>
      </Card.Content>
      <Card.Footer className="flex justify-between gap-2">
        <Button variant="danger-soft" onPress={onClear}>
          Limpiar
        </Button>
        <Button variant="primary" onPress={onPdf}>
          PDF
        </Button>
      </Card.Footer>
    </Card>
  )
}
