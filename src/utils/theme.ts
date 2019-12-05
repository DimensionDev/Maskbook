import { createMuiTheme } from '@material-ui/core'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import { orange, green, red, blue } from '@material-ui/core/colors'

function getFontFamily(monospace?: boolean) {
    // We want to look native.

    // Windows has no CJK sans monospace. Accomendate that.
    // We only use it for fingerprints anyway so CJK coverage aint a problem... yet.
    const monofont = navigator.platform.startsWith('Win') ? 'Consolas, monospace' : 'monospace'
    // https://caniuse.com/font-family-system-ui
    // Firefox does NOT support yet it in any form on Windows, but tests indicate that it agrees with Edge in using the UI font for sans-serif:
    // Microsoft YaHei on zh-Hans-CN.
    return !monospace ? '-apple-system, system-ui, sans-serif' : monofont
}

const baseTheme = (theme: 'dark' | 'light') =>
    ({
        palette: {
            primary: { main: '#1C68F3' },
            secondary: { main: orange[800] },
            error: { main: red[500] },
            type: theme,
        },
        typography: {
            fontFamily: getFontFamily(),
        },
        shape: { borderRadius: 4 },
        overrides: {
            MuiButton: {
                root: {
                    textTransform: 'none',
                },
            },
        },
        breakpoints: {
            values: { xs: 0, sm: 600, md: 1024, lg: 1280, xl: 1920 },
        },
    } as const)
// Theme
export const MaskbookLightTheme = createMuiTheme(baseTheme('light'))
export const MaskbookDarkTheme = createMuiTheme(baseTheme('dark'))

export const FixedWidthFonts = getFontFamily(true)

export const useColorProvider = makeStyles((theme: typeof MaskbookDarkTheme) =>
    createStyles({
        error: {
            color: theme.palette.error.main,
        },
        success: {
            color: theme.palette.type === 'dark' ? green[500] : green[800],
        },
        info: {
            color: theme.palette.type === 'dark' ? blue[500] : blue[800],
        },
    }),
)
