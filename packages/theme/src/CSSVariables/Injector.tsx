import { GlobalStyles, type Theme, useTheme } from '@mui/material'
import { useRef } from 'react'
import { CSSVariableInjectorCSS } from './applyToDOM.js'

export interface CSSVariableInjectorProps extends React.PropsWithChildren {
    useTheme?: () => Theme
}
export function CSSVariableInjector(props: CSSVariableInjectorProps) {
    // eslint-disable-next-line react-compiler/react-compiler
    const useConsistentTheme = useRef(props.useTheme || useTheme).current
    // eslint-disable-next-line react-compiler/react-compiler
    const colorScheme = useConsistentTheme().palette.mode

    return <GlobalStyles styles={CSSVariableInjectorCSS(colorScheme)} />
}
