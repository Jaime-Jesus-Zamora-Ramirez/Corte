import { useEffect, useRef, useState } from 'react'
import { Button, Card, Checkbox } from '@heroui/react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type Modifier,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ROLE_LABELS, type Product, type Role } from '../types'
import { currency, lineTotal } from '../lib/calculations'

interface Props {
  products: Product[]
  onRemove: (id: string) => void
  onToggleCard: (id: string, card: boolean) => void
  onReorder: (activeId: string, overId: string) => void
}

const ROLE_BADGE: Record<Role, string> = {
  vendedor: 'bg-accent-soft text-accent-soft-foreground',
  doctor: 'bg-success-soft text-success-soft-foreground',
  servicios: 'bg-warning-soft text-warning-soft-foreground',
}

function RoleBadge({ role }: { role: Role }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_BADGE[role]}`}
    >
      {ROLE_LABELS[role]}
    </span>
  )
}

const restrictToVerticalAxis: Modifier = ({ transform }) => ({ ...transform, x: 0 })

/** Arrastrar solo desde el asa, para no interferir con el check ni los botones. */
function useRow(id: string) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    position: 'relative',
    zIndex: isDragging ? 20 : undefined,
  }
  const handle = (
    <button
      type="button"
      ref={setActivatorNodeRef}
      aria-label="Arrastrar para reordenar"
      className="flex h-8 w-6 shrink-0 cursor-grab touch-none items-center justify-center rounded text-muted hover:bg-default active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      <svg width="12" height="18" viewBox="0 0 12 18" fill="currentColor" aria-hidden="true">
        <circle cx="3" cy="3" r="1.5" />
        <circle cx="9" cy="3" r="1.5" />
        <circle cx="3" cy="9" r="1.5" />
        <circle cx="9" cy="9" r="1.5" />
        <circle cx="3" cy="15" r="1.5" />
        <circle cx="9" cy="15" r="1.5" />
      </svg>
    </button>
  )
  return { setNodeRef, style, handle, isDragging }
}

interface RowProps {
  product: Product
  index: number
  flashClass: string
  onRemove: (id: string) => void
  onToggleCard: (id: string, card: boolean) => void
}

function CardCheckbox({ product, onToggleCard }: Pick<RowProps, 'product' | 'onToggleCard'>) {
  return (
    <Checkbox
      isSelected={product.card}
      onChange={(v) => onToggleCard(product.id, v)}
      aria-label={`P/tarjeta ${product.name}`}
    >
      <Checkbox.Content>
        <Checkbox.Control className="border-2 border-accent in-data-[selected=true]:bg-accent">
          <Checkbox.Indicator />
        </Checkbox.Control>
      </Checkbox.Content>
    </Checkbox>
  )
}

function ProductCardItem({ product: p, index, flashClass, onRemove, onToggleCard }: RowProps) {
  const { setNodeRef, style, handle, isDragging } = useRow(p.id)
  return (
    <li
      ref={setNodeRef}
      style={style}
      data-row-id={p.id}
      className={`flex flex-col gap-2 rounded-xl border border-divider bg-surface p-3 transition-colors duration-500 ${flashClass} ${isDragging ? 'shadow-lg' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        {handle}
        <CardCheckbox product={p} onToggleCard={onToggleCard} />
        <span className="text-sm text-muted tabular-nums">{index + 1}</span>
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
  )
}

function ProductTableRow({ product: p, index, flashClass, onRemove, onToggleCard }: RowProps) {
  const { setNodeRef, style, handle, isDragging } = useRow(p.id)
  return (
    <tr
      ref={setNodeRef}
      style={style}
      data-row-id={p.id}
      className={`border-b border-divider bg-surface transition-colors duration-500 last:border-0 ${flashClass} ${isDragging ? 'shadow-lg' : ''}`}
    >
      <td className="py-3 pr-1">{handle}</td>
      <td className="py-3 pr-4 text-muted tabular-nums">{index + 1}</td>
      <td className="py-3 pr-4">
        <CardCheckbox product={p} onToggleCard={onToggleCard} />
      </td>
      <td className="py-3 pr-4">{p.name}</td>
      <td className="py-3 pr-4">
        <RoleBadge role={p.role} />
      </td>
      <td className="py-3 pr-4 text-right tabular-nums">{p.quantity}</td>
      <td className="py-3 pr-4 text-right tabular-nums">{currency.format(p.price)}</td>
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
  )
}

export function ProductList({ products, onRemove, onToggleCard, onReorder }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const prevCount = useRef(products.length)
  const [flashId, setFlashId] = useState<string>()
  const flashTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const ids = products.map((p) => p.id)

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (over && active.id !== over.id) onReorder(String(active.id), String(over.id))
  }

  // Al agregar un producto: llevar el scroll a la fila nueva y resaltarla un momento.
  // Reordenar no cambia la cantidad, así que no dispara esto.
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
            <DndContext
              id="dnd-cards"
              sensors={sensors}
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis]}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                <ul className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto md:hidden">
                  {products.map((p, i) => (
                    <ProductCardItem
                      key={p.id}
                      product={p}
                      index={i}
                      flashClass={flash(p.id)}
                      onRemove={onRemove}
                      onToggleCard={onToggleCard}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>

            {/* Tablet / escritorio: tabla */}
            <div className="hidden max-h-[60vh] overflow-auto md:block">
              <DndContext
                id="dnd-table"
                sensors={sensors}
                collisionDetection={closestCenter}
                modifiers={[restrictToVerticalAxis]}
                onDragEnd={handleDragEnd}
              >
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 z-30 bg-surface text-muted">
                    <tr className="border-b border-divider">
                      <th className="w-7 py-2" />
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
                    <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                      {products.map((p, i) => (
                        <ProductTableRow
                          key={p.id}
                          product={p}
                          index={i}
                          flashClass={flash(p.id)}
                          onRemove={onRemove}
                          onToggleCard={onToggleCard}
                        />
                      ))}
                    </SortableContext>
                  </tbody>
                </table>
              </DndContext>
            </div>
          </>
        )}
      </Card.Content>
    </Card>
  )
}
