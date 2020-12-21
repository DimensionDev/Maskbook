import { createMuiTheme, PaletteMode, ThemeOptions } from '@material-ui/core'
import * as Changes from './changes'
import * as Components from './components'
import { merge } from 'lodash-es'

function MaskTheme(mode: PaletteMode) {
    const theme = merge(
        {
            palette: {
                mode,
                primary: { main: 'rgb(41, 104, 243)', light: 'rgb(233, 240, 254)' },
                // Not using the secondary color
                secondary: { main: 'rgb(41, 104, 243)', light: 'rgb(233, 240, 254)' },
                error: { main: 'rgb(255, 95, 95)' },
                success: { main: 'rgb(119, 224, 181)' },
                warning: { main: 'rgb(255, 185, 21)' },
            },
        } as ThemeOptions,
        ...Object.values(Changes),
        ...Object.values(Components),
    )
    return createMuiTheme(theme)
}
export const MaskLightTheme = MaskTheme('light')
export const MaskDarkTheme = MaskTheme('dark')
