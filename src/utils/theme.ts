import { createMuiTheme } from '@material-ui/core'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import { orange, green, red, blue } from '@material-ui/core/colors'
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
        primary: { main: '#1C68F3' },
        secondary: { main: orange[800] },
        text: {
            secondary: '#939393',
        },
        background: {
            default: '#FFF',
        },
    },
    typography: {
        fontFamily: getFontFamily(),
    },
    shape: { borderRadius: 4 },
    breakpoints: {
        values: { xs: 0, sm: 600, md: 1024, lg: 1280, xl: 1920 },
    },
    overrides: {
        MuiButton: {
            root: {
                textTransform: 'unset',
                minWidth: '100px',
            },
        },
        MuiTab: {
            root: {
                textTransform: 'unset',
                padding: '0',
            },
        },
        MuiDialog: {
            paper: {
                borderRadius: '12px',
            },
        },
    },
    props: {
        MuiButton: {
            disableElevation: true,
            size: 'small',
        },
    },
}

const lightThemePatch: Partial<ThemeOptions> = {
    palette: {
        type: 'light',
        background: {
            paper: '#FFF',
        },
    },
}

const darkThemePatch: Partial<ThemeOptions> = {
    palette: {
        type: 'dark',
        background: {
            paper: '#212121',
        },
    },
    overrides: {
        MuiButton: {
            outlinedPrimary: {
                border: '1px solid rgba(255, 255, 255, 0.6)',
                color: '#FFF',
                '&:hover': {
                    border: '1px solid rgba(255, 255, 255, 1)',
                },
            },
            textPrimary: {
                color: '#FFF',
                '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
            },
        },
        MuiTab: {
            textColorPrimary: {
                '&$selected$selected': {
                    color: '#FFF',
                },
            },
        },
        MuiOutlinedInput: {
            root: {
                '&$focused$focused $notchedOutline': {
                    borderColor: '#FFF',
                },
            },
        },
        MuiFormLabel: {
            root: {
                '&$focused$focused': {
                    color: '#FFF',
                },
            },
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

export const useColorProvider = makeStyles((theme: typeof MaskbookDarkTheme) =>
    createStyles({
        error: {
            color: theme.palette.type === 'dark' ? red[500] : red[900],
        },
        success: {
            color: theme.palette.type === 'dark' ? green[500] : green[800],
        },
        info: {
            color: theme.palette.type === 'dark' ? blue[500] : blue[800],
        },
        errorButton: {
            color: theme.palette.getContrastText(red[900]),
            '&>.MuiButton-label': {
                color: theme.palette.getContrastText(red[900]),
            },
            '&:hover': {
                background: theme.palette.type === 'dark' ? red[900] : red[700],
            },
            background: theme.palette.type === 'dark' ? red[700] : red[900],
        },
    }),
)
