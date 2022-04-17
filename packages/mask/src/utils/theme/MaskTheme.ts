// ! This file is used during SSR. DO NOT import new files that does not work in SSR

import { unstable_createMuiStrictModeTheme, type ThemeOptions } from '@mui/material'
import { grey, orange } from '@mui/material/colors'
import { cloneDeep, merge } from 'lodash-unified'

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
        primary: { main: '#1c68f3' },
        secondary: orange,
        text: { hint: 'rgba(0, 0, 0, 0.38)' },
    },
    typography: {
        fontFamily: getFontFamily(),
    },
    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 1112,
            lg: 1280,
            xl: 1920,
        },
    },
    components: {
        MuiLink: { defaultProps: { underline: 'hover' } },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'unset',
                    minWidth: '100px',
                },
            },
            defaultProps: {
                size: 'small',
                disableElevation: true,
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    textTransform: 'unset',
                    padding: '0',
                    // up-sm
                    '@media screen and (min-width: 600px)': {
                        minWidth: 160,
                    },
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: '12px',
                },
            },
        },
    },
}
const lightThemePatch: Partial<ThemeOptions> = {
    palette: {
        mode: 'light',
    },
}
const darkThemePatch: Partial<ThemeOptions> = {
    palette: {
        mode: 'dark',
        background: {
            paper: grey[900],
        },
    },
    components: {
        MuiPaper: {
            // https://github.com/mui-org/material-ui/pull/25522
            styleOverrides: { root: { backgroundImage: 'unset' } },
        },
    },
}
const baseTheme = (theme: 'dark' | 'light') => {
    if (theme === 'light') return merge(cloneDeep(base), lightThemePatch)
    return merge(cloneDeep(base), darkThemePatch)
}
/** @deprecated Only use it from useClassicMaskSNSTheme  */
export const MaskLightTheme = unstable_createMuiStrictModeTheme(baseTheme('light'))
/** @deprecated Only use it from useClassicMaskSNSTheme  */
export const MaskDarkTheme = unstable_createMuiStrictModeTheme(baseTheme('dark'))
