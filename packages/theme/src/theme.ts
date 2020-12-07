import { createMuiTheme, PaletteMode } from '@material-ui/core'
import { Components } from '@material-ui/core/styles/components'

const MuiButton: Components['MuiButton'] = {
    styleOverrides: {
        root: {
            textTransform: 'unset',
        },
    },
}
function MaskTheme(mode: PaletteMode) {
    return createMuiTheme({
        palette: { mode },
        components: {
            MuiButton,
        },
    })
}
export const MaskLightTheme = MaskTheme('light')
export const MaskDarkTheme = MaskTheme('dark')
