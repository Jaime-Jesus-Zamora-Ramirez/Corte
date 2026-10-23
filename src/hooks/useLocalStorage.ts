import { useEffect, useState } from 'react'

/** useState que se guarda en localStorage. `parse` valida lo leído; si falla se usa `initial`. */
export function useLocalStorage<T>(
  key: string,
  initial: T,
  parse: (raw: unknown) => T | undefined = (raw) => raw as T,
) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw !== null) {
        const parsed = parse(JSON.parse(raw))
        if (parsed !== undefined) return parsed
      }
    } catch {
      // JSON inválido o localStorage no disponible: usar el valor inicial
    }
    return initial
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // cuota llena o storage bloqueado: la app sigue funcionando sin persistir
    }
  }, [key, value])

  return [value, setValue] as const
}
