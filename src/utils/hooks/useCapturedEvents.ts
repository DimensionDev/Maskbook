import { useEffect, useCallback } from 'react'

/**
 * ! Call this hook inside Shadow Root!
 */
export function useCapturedInput(
    ref: React.MutableRefObject<HTMLInputElement | undefined | null>,
    onChange: (newVal: string) => void,
) {
    console.log(ref)
    const stop = useCallback((e: Event) => e.stopPropagation(), [])
    const use = useCallback((e: Event) => onChange((e.currentTarget as HTMLInputElement).value), [onChange])
    function binder<T extends keyof HTMLElementEventMap>(keys: T[], fn: (e: HTMLElementEventMap[T]) => void) {
        return () => {
            if (!ref.current) return
            keys.forEach(k => ref.current!.addEventListener(k, fn, true))
            return () => {
                if (!ref.current) return
                keys.forEach(k => ref.current!.removeEventListener(k, fn, true))
            }
        }
    }
    useEffect(binder(['change'], use), [ref.current])
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
    return binder
}
