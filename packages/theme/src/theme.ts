import { createMuiTheme, PaletteMode, ThemeOptions } from '@material-ui/core'
import * as Changes from './changes'
import * as Components from './components'
import { merge } from 'lodash-es'
import type { PaletteOptions } from '@material-ui/core/styles/createPalette'

const light: PaletteOptions = {
    mode: 'light',
    primary: { main: '#1c68f3' },
    background: { paper: '#ffffff', default: '#f9fafa' },
    error: { main: '#ff5f5f' },
    success: { main: '#77e0b5' },
    warning: { main: '#ffb915' },
}
const dark: PaletteOptions = {
    mode: 'dark',
    primary: { main: '#1c68f3' },
    background: { paper: '#121430', default: '#262844' },
    error: { main: '#ff5f5f' },
    success: { main: '#77e0b5' },
    warning: { main: '#ffb915' },
}

function MaskTheme(mode: PaletteMode) {
    const theme = merge(
        { palette: mode === 'light' ? light : dark } as ThemeOptions,
        ...Object.values(Changes),
        ...Object.values(Components),
    )
    return createMuiTheme(theme)
}
export const MaskLightTheme = MaskTheme('light')
export const MaskDarkTheme = MaskTheme('dark')
