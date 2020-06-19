/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useCallback } from 'react'
import React from 'react'
import { renderInShadowRootSettings } from '../../components/shared-settings/settings'
import { useValueRef } from './useValueRef'

export const captureEvents: (keyof HTMLElementEventMap)[] = [
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
    const bind = (input: HTMLInputElement) => keys.forEach((k) => input.addEventListener(k, fn, true))
    const unbind = (input: HTMLInputElement) => keys.forEach((k) => input.removeEventListener(k, fn, true))
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
export function useCapturedInput(onChange: (newVal: string) => void, deps: unknown[] = []) {
    const [node, setNode] = React.useState<HTMLInputElement | null>(null)
    const ref = useCallback((nextNode: HTMLInputElement | null) => setNode(nextNode), [])
    const renderInShadowRoot = useValueRef(renderInShadowRootSettings)
    const stop = useCallback(
        (e: Event) => {
            if (renderInShadowRoot) e.stopPropagation()
        },
        [renderInShadowRoot],
    )
    const use = useCallback(
        (e: Event) => onChange((e.currentTarget as HTMLInputElement)?.value ?? (e.target as HTMLInputElement)?.value),
        deps.concat(onChange),
    )
    useEffect(binder(node, ['input'], use), deps.concat(node))
    useEffect(binder(node, captureEvents, stop), deps.concat(node))
    return [
        <T extends keyof HTMLElementEventMap>(keys: T[], fn: (e: HTMLElementEventMap[T]) => void) =>
            binder(node, keys, fn),
        ref,
        node,
    ] as const
}
