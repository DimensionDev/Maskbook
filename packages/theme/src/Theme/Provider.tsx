import {
    CssBaseline,
    type Theme,
    ThemeProvider,
    type PaletteMode,
    unstable_createMuiStrictModeTheme,
    useColorScheme,
} from '@mui/material'
import { type MaskIconPalette, MaskIconPaletteContext } from '@masknet/icons'
import { getBackgroundColor } from './color-tools.ts'
import { MaskTheme } from './theme.js'
import type { Localization } from '@mui/material/locale'
import { useMemo } from 'react'

export interface MaskThemeProviderProps extends React.PropsWithChildren {
    theme?: Theme
    localization?: Localization
    palette: PaletteMode
    supportsDimPalette?: boolean
}

export function MaskThemeProvider(props: MaskThemeProviderProps) {
    const { children, theme = MaskTheme, localization, supportsDimPalette } = props
    // TODO: palette
    let maskIconPalette = useMaskIconPalette()
    maskIconPalette =
        supportsDimPalette ? maskIconPalette
        : maskIconPalette === 'dim' ? 'dark'
        : maskIconPalette
    const themeWithLocalization = useMemo(() => {
        if (!localization) return theme
        return unstable_createMuiStrictModeTheme(theme, localization)
    }, [theme, localization])

    return (
        <ThemeProvider theme={themeWithLocalization}>
            <MaskIconPaletteContext value={maskIconPalette}>
                <CssBaseline />
                {children}
            </MaskIconPaletteContext>
        </ThemeProvider>
    )
}

/**
 * In content script, if background color is pure black, it returns 'dim' rather than 'dark'.
 */
export function useMaskIconPalette(): MaskIconPalette {
    const palette = usePalette()
    if (palette === 'dark') {
        const backgroundColor = getBackgroundColor(document.body)
        return backgroundColor === 'rgb(0,0,0)' ? 'dim' : 'dark'
    }
    return 'light'
}

export function usePalette(): PaletteMode {
    const { mode, systemMode } = useColorScheme()
    return (mode === 'system' ? systemMode : mode) || 'light'
}
