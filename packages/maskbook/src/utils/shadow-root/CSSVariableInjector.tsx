import { applyMaskColorVars } from '@masknet/theme'
import { useTheme } from '@material-ui/core'
import { useLayoutEffect, useRef } from 'react'

export function CSSVariableInjector(props: React.PropsWithChildren<{}>) {
    const ref = useRef<HTMLSpanElement | null>(null)
    const colorScheme = useTheme().palette.mode

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
