import { useEffect, useCallback } from 'react'

/**
 * ! Call this hook inside Shadow Root!
 */
export function useCapturedInput(
    ref: React.MutableRefObject<HTMLInputElement | undefined>,
    onChange: (newVal: string) => void,
) {
    const stop = useCallback((e: Event) => e.stopPropagation(), [])
    const use = useCallback((e: Event) => onChange((e.currentTarget as HTMLInputElement).value), [onChange])
    useEffect(() => {
        if (!ref.current) return
        ref.current.addEventListener('change', use, true)
    }, [ref.current])
    useEffect(() => {
        if (!ref.current) return
        const keys: (keyof HTMLElementEventMap)[] = [
            'paste',
            'keydown',
            'keypress',
            'keyup',
            'input',
            'drag',
            'dragend',
            'dragenter',
            'dragexit',
            'dragleave',
            'dragover',
            'dragstart',
            'change',
        ]
        keys.forEach(k => ref.current!.addEventListener(k, stop, true))
        return () => {
            if (!ref.current) return
            keys.forEach(k => ref.current!.removeEventListener(k, stop, true))
        }
    }, [ref.current])
}
