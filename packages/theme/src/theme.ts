import { createMuiTheme, PaletteMode } from '@material-ui/core'
import * as Changes from './changes'
import { merge } from 'lodash-es'

function MaskTheme(mode: PaletteMode) {
    const theme = merge({ palette: { mode } }, ...Object.values(Changes))
    return createMuiTheme(theme)
}
export const MaskLightTheme = MaskTheme('light')
export const MaskDarkTheme = MaskTheme('dark')
