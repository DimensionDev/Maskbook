import { GlobalStyles, Theme, useTheme } from '@mui/material'
import { useRef } from 'react'
import { CSSVariableInjectorCSS } from './applyToDOM'

export function CSSVariableInjector(props: React.PropsWithChildren<{ useTheme?: () => Theme }>) {
    const { current: useConsistentTheme } = useRef(props.useTheme || useTheme)
    const colorScheme = useConsistentTheme().palette.mode

    return <GlobalStyles styles={CSSVariableInjectorCSS(colorScheme)} />
}
