import { createTheme, PaletteMode, ThemeOptions } from '@mui/material'
import * as Changes from './changes'
import * as Components from './component-changes'
import { merge } from 'lodash-unified'
import type { PaletteOptions } from '@mui/material/styles/createPalette'
import { DarkColor, LightColor, Color } from '../CSSVariables'
import { MaskColors } from './colors'

/**
 * TODO: Remove this and css color var after the dashboard be removed.
 */
const color = (mode: PaletteMode, color: Color): PaletteOptions => ({
    mode,
    primary: { main: color.primary, contrastText: color.primaryContrastText },
    secondary: { main: color.primary, contrastText: color.primaryContrastText }, // Yes, not a typo, it's primary
    background: { paper: color.primaryBackground, default: color.secondaryBackground },
    error: { main: color.redMain, contrastText: color.redContrastText },
    success: { main: color.greenMain },
    warning: { main: color.orangeMain },
    divider: color.divider,
    text: { primary: color.textPrimary, secondary: color.textSecondary },
})

function MaskTheme(mode: PaletteMode) {
    const colors = mode === 'dark' ? DarkColor : LightColor
    const maskColors = MaskColors[mode]

    const theme = merge(
        { palette: { ...color(mode, colors), maskColor: maskColors.maskColor } } as ThemeOptions,
        ...Object.values(Changes).map(applyColors),
        ...Object.values(Components).map(applyColors),
    )
    return createTheme(theme)
    function applyColors(x: any) {
        if (typeof x === 'function') return x(mode, colors)
        return x
    }
}
export const MaskLightTheme = MaskTheme('light')
export const MaskDarkTheme = MaskTheme('dark')
