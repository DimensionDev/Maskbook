import { applyMaskColorVars } from '@masknet/theme'
import { Theme, useTheme } from '@mui/material'
import { useLayoutEffect, useRef } from 'react'

export function CSSVariableInjector(props: React.PropsWithChildren<{ useTheme?: () => Theme }>) {
    const ref = useRef<HTMLSpanElement | null>(null)
    const { current: useConsistentTheme } = useRef(props.useTheme || useTheme)
    const colorScheme = useConsistentTheme().palette.mode

    useLayoutEffect(() => {
        const host = ref.current!.closest('main')!.parentNode!.querySelector('head')!
        let style: HTMLStyleElement = host.querySelector('style[data-css-var]')!
        if (!style) {
            host.insertBefore((style = document.createElement('style')), host.firstChild)
            style.dataset.cssVar = ''
        }

        applyMaskColorVars(style, colorScheme)
    }, [colorScheme])
    return <span ref={ref} children={props.children} />
}
