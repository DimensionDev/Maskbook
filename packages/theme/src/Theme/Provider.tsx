import { CssBaseline, type Theme, ThemeProvider } from '@mui/material'
import { type MaskIconPalette, MaskIconPaletteContext } from '@masknet/icons'
import { compose } from '@masknet/shared-base'
import { CustomSnackbarProvider } from '../Components/index.js'
import { useRef } from 'react'

export interface MaskThemeProvider extends React.PropsWithChildren {
    useTheme(): Theme
    useMaskIconPalette(theme: Theme): MaskIconPalette
    CustomSnackbarOffsetY?: number
}

export function MaskThemeProvider(props: MaskThemeProvider) {
    const { children, useTheme, useMaskIconPalette, CustomSnackbarOffsetY } = props
    const theme = useRef(useTheme).current()
    const MaskIconPalette = useRef(useMaskIconPalette).current(theme)

    return compose(
        (jsx) => <MaskIconPaletteContext.Provider value={MaskIconPalette}>{jsx}</MaskIconPaletteContext.Provider>,
        (children) => ThemeProvider({ theme, children }),
        (jsx) => (
            <CustomSnackbarProvider
                disableWindowBlurListener={false}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                children={jsx}
                offsetY={CustomSnackbarOffsetY}
            />
        ),
        <>
            <CssBaseline />
            {children}
        </>,
    )
}
