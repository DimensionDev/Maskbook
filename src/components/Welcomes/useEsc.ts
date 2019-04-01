import { useEffect } from 'react'
export function useEsc(fn: () => void) {
    const cb = (e: KeyboardEvent) => {
        if (e.key === 'Escape') fn()
    }
    useEffect(() => {
        document.addEventListener('keydown', cb)
        return () => document.removeEventListener('keydown', cb)
    }, [fn])
}
