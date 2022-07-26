import { MaskColors } from './colors'
import type { PaletteMode, ThemeOptions } from '@mui/material'
import { createTheme } from '@mui/material'
import { merge } from 'lodash-unified'
import * as Components from './component-changes'

function MaskTheme(mode: PaletteMode) {
    const maskColors = MaskColors[mode]
    const theme = merge({ palette: maskColors }, ...Object.values(Components).map(applyColors)) as ThemeOptions

    return createTheme(theme)
    function applyColors(x: any) {
        if (typeof x === 'function') return x(mode, maskColors)
        return x
    }
}

export const MaskLightTheme = MaskTheme('light')
export const MaskDarkTheme = MaskTheme('dark')
