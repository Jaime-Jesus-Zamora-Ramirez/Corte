import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import {
  Alert,
  Button,
  Card,
  Input,
  Label,
  ListBox,
  NumberField,
  Select,
  Switch,
  TextField,
} from '@heroui/react'
import { ROLE_LABELS, isRole, type Product, type Role } from '../types'

interface Props {
  onAdd: (product: Omit<Product, 'id' | 'card'>) => void
  discount: boolean
  onDiscountChange: (on: boolean) => void
}

export function ProductForm({ onAdd, discount, onDiscountChange }: Props) {
  const [name, setName] = useLocalStorage('draft:name', '', (v) =>
    typeof v === 'string' ? v : undefined,
  )
  const [quantity, setQuantity] = useLocalStorage('draft:quantity', 1, (v) =>
    typeof v === 'number' ? v : undefined,
  )
  // NaN = vacío (se muestra solo el placeholder); JSON lo guarda como null
  const [price, setPrice] = useLocalStorage('draft:price', NaN, (v) =>
    v === null ? NaN : typeof v === 'number' ? v : undefined,
  )
  const [role, setRole] = useLocalStorage<Role>('draft:role', 'vendedor', (v) =>
    isRole(v) ? v : undefined,
  )

  const [errors, setErrors] = useState<string[]>([])

  const quantityInvalid = errors.length > 0 && !(quantity > 0)
  const priceInvalid = errors.length > 0 && !(price > 0)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const found: string[] = []
    if (name.trim().length === 0) found.push('El nombre del producto es obligatorio.')
    if (!(quantity > 0)) found.push('La cantidad no puede ser 0.')
    if (!(price > 0)) found.push('El precio no puede ser 0.')
    setErrors(found)
    if (found.length > 0) return
    onAdd({ name: name.trim(), quantity, price, role })
    setName('')
    setQuantity(1)
    setPrice(NaN)
    setRole('vendedor')
  }

  return (
    <Card>
      <Card.Header className="flex-row items-center justify-between gap-2">
        <Card.Title>Agregar producto</Card.Title>
        <Switch isSelected={discount} onChange={onDiscountChange}>
          <Switch.Content>
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
            <Label>Pago Doctor</Label>
          </Switch.Content>
        </Switch>
      </Card.Header>
      <Card.Content>
        {errors.length > 0 && (
          <Alert status="danger" className="mb-4" role="alert">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>No se pudo agregar el producto</Alert.Title>
              <Alert.Description>
                <ul className="list-inside list-disc">
                  {errors.map((msg) => (
                    <li key={msg}>{msg}</li>
                  ))}
                </ul>
              </Alert.Description>
            </Alert.Content>
          </Alert>
        )}
        <form
          noValidate
          onSubmit={submit}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto] lg:items-end"
        >
          <TextField
            fullWidth
            value={name}
            onChange={setName}
            className="sm:col-span-2 lg:col-span-1"
          >
            <Label>Nombre</Label>
            <Input placeholder="Nombre del producto" />
          </TextField>

          <NumberField
            fullWidth
            minValue={0}
            isInvalid={quantityInvalid}
            value={quantity}
            onChange={(v) => setQuantity(Number.isNaN(v) ? 1 : v)}
          >
            <Label>Cantidad</Label>
            <NumberField.Group>
              <NumberField.DecrementButton />
              <NumberField.Input inputMode="numeric" />
              <NumberField.IncrementButton />
            </NumberField.Group>
          </NumberField>

          <NumberField
            fullWidth
            minValue={0}
            isInvalid={priceInvalid}
            value={price}
            onChange={setPrice}
            formatOptions={{ style: 'currency', currency: 'MXN' }}
          >
            <Label>Precio</Label>
            <NumberField.Group>
              <NumberField.DecrementButton />
              <NumberField.Input inputMode="decimal" placeholder="0.00" />
              <NumberField.IncrementButton />
            </NumberField.Group>
          </NumberField>

          <Select
            fullWidth
            value={role}
            onChange={(key) => setRole(key as Role)}
            aria-label="Tipo"
          >
            <Label>Tipo</Label>
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
                  <ListBox.Item key={r} id={r} textValue={ROLE_LABELS[r]}>
                    {ROLE_LABELS[r]}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>

          <Button
            type="submit"
            variant="primary"
            className="sm:col-span-2 lg:col-span-1"
          >
            Agregar
          </Button>
        </form>
      </Card.Content>
    </Card>
  )
}
