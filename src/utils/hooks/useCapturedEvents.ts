/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useCallback } from 'react'
import { or } from '../../components/custom-ui-helper'
import React from 'react'

/**
 * ! Call this hook inside Shadow Root!
 */
export function useCapturedInput(
    onChange: (newVal: string) => void,
    deps: any[] = [],
    _ref?: React.MutableRefObject<HTMLInputElement | undefined | null>,
) {
    const ref = or(_ref, React.useRef(null))
    const stop = useCallback((e: Event) => e.stopPropagation(), deps)
    const use = useCallback(
        (e: Event) => onChange((e.currentTarget as HTMLInputElement)?.value ?? (e.target as HTMLInputElement)?.value),
        [onChange].concat(deps),
    )
    function binder<T extends keyof HTMLElementEventMap>(keys: T[], fn: (e: HTMLElementEventMap[T]) => void) {
        let current: HTMLInputElement | null
        const bind = (input: HTMLInputElement) => keys.forEach(k => input.addEventListener(k, fn, true))
        const unbind = (input: HTMLInputElement) => keys.forEach(k => input.removeEventListener(k, fn, true))

        return () => {
            if (!ref.current) return
            current = ref.current
            bind(current)
            return () => {
                if (!current) return
                unbind(current)
                current = null
            }
        }
    }
    useEffect(binder(['input'], use), [ref.current].concat(deps))
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
        [ref.current].concat(deps),
    )
    return [binder, ref] as const
}
