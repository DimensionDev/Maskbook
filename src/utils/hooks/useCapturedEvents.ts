/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useCallback } from 'react'
import React from 'react'

export const captureEevnts: (keyof HTMLElementEventMap)[] = [
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

function binder<T extends keyof HTMLElementEventMap>(
    node: HTMLInputElement | null,
    keys: T[],
    fn: (e: HTMLElementEventMap[T]) => void,
) {
    let current: HTMLInputElement | null
    const bind = (input: HTMLInputElement) => keys.forEach(k => input.addEventListener(k, fn, true))
    const unbind = (input: HTMLInputElement) => keys.forEach(k => input.removeEventListener(k, fn, true))
    return () => {
        if (!node) return
        current = node
        bind(current)
        return () => {
            if (!current) return
            unbind(current)
            current = null
        }
    }
}

/**
 * ! Call this hook inside Shadow Root!
 */
export function useCapturedInput(onChange: (newVal: string) => void, deps: any[] = []) {
    const [node, setNode] = React.useState<HTMLInputElement | null>(null)
    const ref = useCallback((nextNode: HTMLInputElement | null) => setNode(nextNode), [])
    const stop = useCallback((e: Event) => e.stopPropagation(), deps)
    const use = useCallback(
        (e: Event) => onChange((e.currentTarget as HTMLInputElement)?.value ?? (e.target as HTMLInputElement)?.value),
        [onChange].concat(deps),
    )
    useEffect(binder(node, ['input'], use), [node].concat(deps))
    useEffect(binder(node, captureEevnts, stop), [node].concat(deps))
    return [
        <T extends keyof HTMLElementEventMap>(keys: T[], fn: (e: HTMLElementEventMap[T]) => void) =>
            binder(node, keys, fn),
        ref,
        node,
    ] as const
}
