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
    function binder(keys: (keyof HTMLElementEventMap)[], fn: (e: Event) => void) {
        return () => {
            if (!ref.current) return
            keys.forEach(k => ref.current!.addEventListener(k, fn, true))
            return () => {
                if (!ref.current) return
                keys.forEach(k => ref.current!.removeEventListener(k, fn, true))
            }
        }
    }
    useEffect(binder(['keydown', 'keyup', 'keypress', 'change'], use), [ref.current])
    useEffect(
        binder(
            [
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
            ],
            stop,
        ),
        [ref.current],
    )
}
