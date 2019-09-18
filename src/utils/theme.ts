import { createMuiTheme } from '@material-ui/core'
import { ThemeOptions } from '@material-ui/core/styles/createMuiTheme'
import indigo from '@material-ui/core/colors/indigo'
import orange from '@material-ui/core/colors/orange'

const _refTheme = createMuiTheme()
const _refThemeDark = createMuiTheme({ palette: { type: 'dark' } })
const baseTheme = (theme: 'dark' | 'light') =>
    ({
        palette: {
            primary: { main: indigo[400] },
            secondary: { main: orange[800] },
            type: theme,
        },
        shape: { borderRadius: 4 },
        overrides: {
            MuiButton: {
                root: {
                    textTransform: 'none',
                },
            },
        },
    } as ThemeOptions)
// Theme
export const MaskbookLightTheme = createMuiTheme(baseTheme('light'))
export const MaskbookDarkTheme = createMuiTheme(baseTheme('dark'))
export const FixedWidthFonts = `Droid Sans Mono', Consolas, Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace, serif`
