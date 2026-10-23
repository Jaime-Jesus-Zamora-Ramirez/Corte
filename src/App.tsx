import { useState } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import { openInvoice } from './lib/invoice'
import type { Product } from './types'
import { ProductForm } from './components/ProductForm'
import { ProductList } from './components/ProductList'
import { CalculationsPanel } from './components/CalculationsPanel'

export default function App() {
  const [products, setProducts] = useLocalStorage<Product[]>('products', [], (raw) =>
    Array.isArray(raw)
      ? raw.map((p) => ({ ...p, card: Boolean(p.card) }) as Product)
      : undefined,
  )
  const [discount, setDiscount] = useLocalStorage('discount', false, (v) =>
    typeof v === 'boolean' ? v : undefined,
  )
  // Cambiar la key remonta el formulario y descarta su borrador
  const [formKey, setFormKey] = useState(0)

  const clearAll = () => {
    if (!window.confirm('¿Limpiar todos los productos y el formulario?')) return
    setProducts([])
    for (const k of ['name', 'quantity', 'price', 'role']) {
      try {
        localStorage.removeItem(`draft:${k}`)
      } catch {
        // storage no disponible
      }
    }
    setFormKey((k) => k + 1)
  }

  const addProduct = (p: Omit<Product, 'id' | 'card'>) =>
    setProducts((prev) => [...prev, { ...p, id: crypto.randomUUID(), card: false }])

  const toggleCard = (id: string, card: boolean) =>
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, card } : p)))

  const removeProduct = (id: string) =>
    setProducts((prev) => prev.filter((p) => p.id !== id))

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-4 bg-background p-4 sm:p-6">
      <ProductForm
        key={formKey}
        onAdd={addProduct}
        discount={discount}
        onDiscountChange={setDiscount}
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px] lg:items-start">
        <ProductList products={products} onRemove={removeProduct} onToggleCard={toggleCard} />
        <div className="lg:sticky lg:top-4">
          <CalculationsPanel
            products={products}
            options={{ discount }}
            onClear={clearAll}
            onPdf={() => openInvoice(products, { discount })}
          />
        </div>
      </div>
    </main>
  )
}
