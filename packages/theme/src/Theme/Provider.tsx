import { CssBaseline, type Theme, ThemeProvider } from '@mui/material'
import { type MaskIconPalette, MaskIconPaletteContext } from '@masknet/icons'
import { useRef } from 'react'

export interface MaskThemeProvider extends React.PropsWithChildren {
    useTheme(): Theme
    useMaskIconPalette(theme: Theme): MaskIconPalette
}

export function MaskThemeProvider(props: MaskThemeProvider) {
    const { children, useTheme, useMaskIconPalette } = props
    // eslint-disable-next-line react-compiler/react-compiler
    const theme = useRef(useTheme).current()
    // eslint-disable-next-line react-compiler/react-compiler
    const MaskIconPalette = useRef(useMaskIconPalette).current(theme)

    return (
        <MaskIconPaletteContext value={MaskIconPalette}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </MaskIconPaletteContext>
    )
}
