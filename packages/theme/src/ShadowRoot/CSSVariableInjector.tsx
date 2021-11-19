import { applyMaskColorVars } from '../constants'
import { Theme, useTheme } from '@mui/material'
import { useLayoutEffect, useRef } from 'react'

export function useCSSVariableInjector(useTheme: () => Theme, host: HTMLHeadElement | null) {
    const { current: useConsistentTheme } = useRef(useTheme)
    const colorScheme = useConsistentTheme().palette.mode

    useLayoutEffect(() => {
        if (!host) return
        let style: HTMLStyleElement = host.querySelector('style[data-css-var]')!
        if (!style) {
            host.insertBefore((style = document.createElement('style')), host.firstChild)
            style.dataset.cssVar = ''
        }

        applyMaskColorVars(style, colorScheme)
    }, [colorScheme])
}

export function CSSVariableInjector(props: React.PropsWithChildren<{ useTheme?: () => Theme }>) {
    const ref = useRef<HTMLSpanElement | null>(null)
    useCSSVariableInjector(
        props.useTheme || useTheme,
        ref.current?.closest('main')?.parentNode?.querySelector('head') ?? null,
    )
    return <span ref={ref} children={props.children} />
}
