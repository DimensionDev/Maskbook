import { GlobalStyles, type Theme, useTheme } from '@mui/material'
import { useRef } from 'react'
import { CSSVariableInjectorCSS } from './applyToDOM.js'

export interface CSSVariableInjectorProps extends React.PropsWithChildren<{}> {
    useTheme?: () => Theme
}
export function CSSVariableInjector(props: CSSVariableInjectorProps) {
    const { current: useConsistentTheme } = useRef(props.useTheme || useTheme)
    const colorScheme = useConsistentTheme().palette.mode

    return <GlobalStyles styles={CSSVariableInjectorCSS(colorScheme)} />
}
