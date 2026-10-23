import { useEffect, useRef, useState } from 'react'
import { Button, Card, Checkbox } from '@heroui/react'
import { ROLE_LABELS, type Product, type Role } from '../types'
import { currency, lineTotal } from '../lib/calculations'

interface Props {
  products: Product[]
  onRemove: (id: string) => void
  onToggleCard: (id: string, card: boolean) => void
}

const ROLE_BADGE: Record<Role, string> = {
  vendedor: 'bg-accent-soft text-accent-soft-foreground',
  doctor: 'bg-success-soft text-success-soft-foreground',
}

function RoleBadge({ role }: { role: Role }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_BADGE[role]}`}
    >
      {ROLE_LABELS[role]}
    </span>
  )
}

export function ProductList({ products, onRemove, onToggleCard }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const prevCount = useRef(products.length)
  const [flashId, setFlashId] = useState<string>()
  const flashTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Al agregar un producto: llevar el scroll a la fila nueva y resaltarla un momento
  useEffect(() => {
    const added = products.length > prevCount.current
    prevCount.current = products.length
    if (!added) return
    const id = products[products.length - 1].id
    rootRef.current
      ?.querySelectorAll<HTMLElement>(`[data-row-id="${id}"]`)
      .forEach((el) => {
        if (el.offsetParent !== null) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      })
    setFlashId(id)
    // El timer vive en un ref: cambios posteriores en `products` (p. ej. marcar P/tarjeta)
    // no deben cancelarlo, o el resaltado se quedaría pegado.
    clearTimeout(flashTimer.current)
    flashTimer.current = setTimeout(() => setFlashId(undefined), 2000)
  }, [products])

  useEffect(() => () => clearTimeout(flashTimer.current), [])

  const flash = (id: string) => (id === flashId ? 'bg-accent-soft' : '')

  return (
    <Card ref={rootRef}>
      <Card.Header>
        <Card.Title>Productos</Card.Title>
        <Card.Description>
          {products.length === 0
            ? 'Aún no hay productos.'
            : `${products.length} producto${products.length === 1 ? '' : 's'}`}
        </Card.Description>
      </Card.Header>
      <Card.Content>
        {products.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">
            Agrega tu primer producto con el formulario.
          </p>
        ) : (
          <>
            {/* Móvil: tarjetas apiladas */}
            <ul className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto md:hidden">
              {products.map((p, i) => (
                <li
                  key={p.id}
                  data-row-id={p.id}
                  className={`flex flex-col gap-2 rounded-xl border border-divider p-3 transition-colors duration-500 ${flash(p.id)}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <Checkbox
                      isSelected={p.card}
                      onChange={(v) => onToggleCard(p.id, v)}
                      aria-label={`P/tarjeta ${p.name}`}
                    >
                      <Checkbox.Content>
                        <Checkbox.Control className="border-2 border-accent in-data-[selected=true]:bg-accent">
                          <Checkbox.Indicator />
                        </Checkbox.Control>
                      </Checkbox.Content>
                    </Checkbox>
                    <span className="text-sm text-muted tabular-nums">{i + 1}</span>
                    <div className="flex flex-1 flex-col items-start gap-1">
                      <span className="font-medium break-words">{p.name}</span>
                      <RoleBadge role={p.role} />
                    </div>
                    <Button
                      size="sm"
                      variant="danger-soft"
                      aria-label={`Eliminar ${p.name}`}
                      onPress={() => onRemove(p.id)}
                    >
                      Quitar
                    </Button>
                  </div>
                  <dl className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <dt className="text-muted">Cant.</dt>
                      <dd>{p.quantity}</dd>
                    </div>
                    <div>
                      <dt className="text-muted">Precio</dt>
                      <dd>{currency.format(p.price)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted">Total</dt>
                      <dd className="font-medium">{currency.format(lineTotal(p))}</dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>

            {/* Tablet / escritorio: tabla */}
            <div className="hidden max-h-[60vh] overflow-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 z-10 bg-surface text-muted">
                  <tr className="border-b border-divider">
                    <th className="w-10 py-2 pr-4 font-medium">#</th>
                    <th className="w-24 py-2 pr-4 font-medium">P/tarjeta</th>
                    <th className="py-2 pr-4 font-medium">Nombre</th>
                    <th className="py-2 pr-4 font-medium">Tipo</th>
                    <th className="py-2 pr-4 text-right font-medium">Cantidad</th>
                    <th className="py-2 pr-4 text-right font-medium">Precio</th>
                    <th className="py-2 pr-4 text-right font-medium">Total</th>
                    <th className="w-24 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, i) => (
                    <tr
                      key={p.id}
                      data-row-id={p.id}
                      className={`border-b border-divider transition-colors duration-500 last:border-0 ${flash(p.id)}`}
                    >
                      <td className="py-3 pr-4 text-muted tabular-nums">{i + 1}</td>
                      <td className="py-3 pr-4">
                        <Checkbox
                          isSelected={p.card}
                          onChange={(v) => onToggleCard(p.id, v)}
                          aria-label={`P/tarjeta ${p.name}`}
                        >
                          <Checkbox.Content>
                            <Checkbox.Control className="border-2 border-accent in-data-[selected=true]:bg-accent">
                              <Checkbox.Indicator />
                            </Checkbox.Control>
                          </Checkbox.Content>
                        </Checkbox>
                      </td>
                      <td className="py-3 pr-4">{p.name}</td>
                      <td className="py-3 pr-4">
                        <RoleBadge role={p.role} />
                      </td>
                      <td className="py-3 pr-4 text-right tabular-nums">{p.quantity}</td>
                      <td className="py-3 pr-4 text-right tabular-nums">
                        {currency.format(p.price)}
                      </td>
                      <td className="py-3 pr-4 text-right font-medium tabular-nums">
                        {currency.format(lineTotal(p))}
                      </td>
                      <td className="py-3 text-right">
                        <Button
                          size="sm"
                          variant="danger-soft"
                          aria-label={`Eliminar ${p.name}`}
                          onPress={() => onRemove(p.id)}
                        >
                          Quitar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card.Content>
    </Card>
  )
}
