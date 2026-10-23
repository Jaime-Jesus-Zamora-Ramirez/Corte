import { ROLE_LABELS, type Product } from '../types'
import { calculations, currency, lineTotal, type CalcOptions } from './calculations'

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)

export function buildInvoiceHtml(products: Product[], options: CalcOptions): string {
  const now = new Date()
  const date = now.toLocaleString('es-MX', { dateStyle: 'long', timeStyle: 'short' })
  // El navegador propone <title> como nombre de archivo al guardar como PDF
  const fileDate = now.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')

  const rows = products
    .map(
      (p, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${escapeHtml(p.name)}</td>
        <td><span class="badge ${p.role}">${ROLE_LABELS[p.role]}</span></td>
        <td class="c">${p.card ? 'Sí' : ''}</td>
        <td class="r">${p.quantity}</td>
        <td class="r">${currency.format(p.price)}</td>
        <td class="r">${currency.format(lineTotal(p))}</td>
      </tr>`,
    )
    .join('')

  const totals = calculations
    .map((calc) => calc(products, options))
    .map(
      (r) => `
      <tr class="${r.id === 'total-final' ? 'final' : ''}">
        <td>${escapeHtml(r.label)}</td>
        <td class="r">${r.value}</td>
      </tr>`,
    )
    .join('')

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Ventas (${fileDate})</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: system-ui, sans-serif; color: #18181b; margin: 0; padding: 24px; background: #f4f4f5; }
  .sheet { max-width: 800px; margin: 0 auto; background: #fff; padding: 32px; border-radius: 12px; }
  header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; }
  h1 { margin: 0; font-size: 28px; }
  .meta { color: #52525b; font-size: 14px; text-align: right; }
  table { width: 100%; border-collapse: collapse; margin-top: 24px; font-size: 14px; }
  th, td { padding: 8px; border-bottom: 1px solid #e4e4e7; text-align: left; }
  th { background: #f4f4f5; }
  .r { text-align: right; font-variant-numeric: tabular-nums; }
  .c { text-align: center; }
  .wrap { overflow-x: auto; }
  .totals { width: 100%; max-width: 360px; margin-left: auto; }
  .final td { font-weight: 700; font-size: 16px; background: #0485f7; color: #fff; border: 0; }
  .badge { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; }
  .badge.vendedor { background: #dbeafe; color: #1d4ed8; }
  .badge.doctor { background: #dcfce7; color: #15803d; }
  .empty { text-align: center; color: #71717a; padding: 24px; }
  button { margin-top: 24px; padding: 10px 18px; border: 0; border-radius: 8px; background: #18181b; color: #fff; font-size: 14px; cursor: pointer; }
  @media print { body { background: #fff; padding: 0; } .sheet { padding: 0; } button { display: none; } }
</style>
</head>
<body>
<div class="sheet">
  <header>
    <h1>Ventas</h1>
    <div class="meta">Fecha: ${escapeHtml(date)}<br>Folio: ${now.getTime()}</div>
  </header>
  <div class="wrap">
  <table>
    <thead>
      <tr><th>#</th><th>Producto</th><th>Tipo</th><th class="c">P/tarjeta</th><th class="r">Cantidad</th><th class="r">Precio</th><th class="r">Importe</th></tr>
    </thead>
    <tbody>${rows || '<tr><td class="empty" colspan="7">Sin productos</td></tr>'}</tbody>
  </table>
  </div>
  <table class="totals"><tbody>${totals}</tbody></table>
  <button onclick="window.print()">Imprimir / Guardar como PDF</button>
</div>
</body>
</html>`
}

let lastUrl: string | undefined

/** Abre la factura en una pestaña nueva; si ya estaba abierta, la reemplaza con la información actual. */
export function openInvoice(products: Product[], options: CalcOptions) {
  const url = URL.createObjectURL(
    new Blob([buildInvoiceHtml(products, options)], { type: 'text/html;charset=utf-8' }),
  )
  window.open(url, 'factura')
  if (lastUrl) URL.revokeObjectURL(lastUrl)
  lastUrl = url
}
