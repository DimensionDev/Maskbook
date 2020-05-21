import { createMuiTheme } from '@material-ui/core'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import { orange, green, red, blue, grey } from '@material-ui/core/colors'
import type { ThemeOptions } from '@material-ui/core/styles/createMuiTheme'
import { merge, cloneDeep } from 'lodash-es'

function getFontFamily(monospace?: boolean) {
    // We want to look native.

    // Windows has no CJK sans monospace. Accommodate that.
    // We only use it for fingerprints anyway so CJK coverage ain't a problem... yet.
    const monofont = navigator.platform.startsWith('Win') ? 'Consolas, monospace' : 'monospace'
    // https://caniuse.com/font-family-system-ui
    // Firefox does NOT support yet it in any form on Windows, but tests indicate that it agrees with Edge in using the UI font for sans-serif:
    // Microsoft YaHei on zh-Hans-CN.
    return !monospace ? '-apple-system, system-ui, sans-serif' : monofont
}

const base: ThemeOptions = {
    palette: {
        primary: blue,
        secondary: orange,
    },
    typography: {
        fontFamily: getFontFamily(),
    },
    overrides: {
        MuiButton: { root: { textTransform: 'unset', minWidth: '100px' } },
        MuiTab: { root: { textTransform: 'unset', padding: '0' } },
        MuiDialog: { paper: { borderRadius: '12px' } },
    },
    props: {
        MuiButton: { size: 'small', disableElevation: true },
    },
}

const lightThemePatch: Partial<ThemeOptions> = {
    palette: {
        type: 'light',
    },
}

const darkThemePatch: Partial<ThemeOptions> = {
    palette: {
        type: 'dark',
        background: {
            paper: grey[900],
        },
    },
}

const baseTheme = (theme: 'dark' | 'light') => {
    if (theme === 'light') return merge(cloneDeep(base), lightThemePatch)
    return merge(cloneDeep(base), darkThemePatch)
}

// Theme
export const MaskbookLightTheme = createMuiTheme(baseTheme('light'))
export const MaskbookDarkTheme = createMuiTheme(baseTheme('dark'))

const FixedWidthFonts = getFontFamily(true)

export const useColorProvider = makeStyles((theme: typeof MaskbookDarkTheme) => {
    const dark = theme.palette.type === 'dark'
    return createStyles({
        error: {
            color: dark ? red[500] : red[900],
        },
        success: {
            color: dark ? green[500] : green[800],
        },
        info: {
            color: dark ? blue[500] : blue[800],
        },
        errorButton: {
            color: theme.palette.getContrastText(red[900]),
            '&>.MuiButton-label': {
                color: theme.palette.getContrastText(red[900]),
            },
            '&:hover': {
                background: dark ? red[900] : red[700],
            },
            background: dark ? red[700] : red[900],
        },
    })
})
