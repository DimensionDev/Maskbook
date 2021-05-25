import { unstable_createMuiStrictModeTheme, useMediaQuery } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { orange, green, red, blue, grey } from '@material-ui/core/colors'
import type { Theme, ThemeOptions } from '@material-ui/core/styles/createTheme'
import { merge, cloneDeep } from 'lodash-es'
import { appearanceSettings, languageSettings } from '../settings/settings'
import { useValueRef } from './hooks/useValueRef'
import { useMemo, useRef } from 'react'
import { zhTW, koKR, jaJP } from '@material-ui/core/locale/index'
import { safeUnreachable } from './utils'
import { or } from '../components/custom-ui-helper'
import { activatedSocialNetworkUI } from '../social-network'
import { ValueRef } from '@dimensiondev/holoflows-kit'
import { Appearance, Language } from '@dimensiondev/maskbook-theme'

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
        primary: { main: '#1c68f3' }, // blue,
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
            styleOverrides: { root: { textTransform: 'unset', padding: '0' } },
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

// Theme
const MaskbookLightTheme = unstable_createMuiStrictModeTheme(baseTheme('light'))
const MaskbookDarkTheme = unstable_createMuiStrictModeTheme(baseTheme('dark'))

export function getMaskbookTheme(opt?: { appearance?: Appearance; language?: Language }) {
    const language = opt?.language ?? languageSettings.value
    const preference = opt?.appearance ?? appearanceSettings.value

    // Priority:
    // PaletteModeProvider (in SNS adaptor) > User preference > OS preference
    const isDarkBrowser = matchMedia('(prefers-color-scheme: dark)').matches
    const detectedPalette = activatedSocialNetworkUI.customization.paletteMode?.current.value
    let isDark = (isDarkBrowser && preference === Appearance.default) || preference === Appearance.dark
    if (detectedPalette) {
        isDark = detectedPalette === 'dark'
    } else if (preference === Appearance.default) {
        isDark = isDarkBrowser
    } else {
        isDark = preference === Appearance.dark
    }
    const baseTheme = isDark ? MaskbookDarkTheme : MaskbookLightTheme
    switch (language) {
        case Language.en:
            return baseTheme
        case Language.ja:
            return unstable_createMuiStrictModeTheme(baseTheme, jaJP)
        case Language.ko:
            return unstable_createMuiStrictModeTheme(baseTheme, koKR)
        case Language.zh:
            return unstable_createMuiStrictModeTheme(baseTheme, zhTW)
        default:
            safeUnreachable(language)
            return baseTheme
    }
}
// We're developing a new theme in the theme/ package
export function useClassicMaskTheme(opt?: { appearance?: Appearance; language?: Language }) {
    const language = or(opt?.language, useValueRef(languageSettings))
    const appearance = or(opt?.appearance, useValueRef(appearanceSettings))
    const systemPreference = useMediaQuery('(prefers-color-scheme: dark)')
    const paletteProvider = useRef(
        activatedSocialNetworkUI.customization.paletteMode?.current || new ValueRef('light'),
    ).current
    const palette = useValueRef(paletteProvider)
    return useMemo(() => getMaskbookTheme({ appearance, language }), [language, appearance, systemPreference, palette])
}

export const useColorStyles = makeStyles((theme: typeof MaskbookDarkTheme) => {
    const dark = theme.palette.mode === 'dark'
    return {
        error: {
            color: dark ? red[500] : red[900],
        },
        success: {
            color: dark ? green[500] : green[800],
        },
        info: {
            color: dark ? blue[500] : blue[800],
        },
    }
})

export const useErrorStyles = makeStyles((theme) => {
    const dark = theme.palette.mode === 'dark'
    return {
        containedPrimary: {
            backgroundColor: dark ? red[500] : red[900],
            '&:hover': {
                backgroundColor: dark ? red[900] : red[700],
            },
        },
        outlinedPrimary: {
            borderColor: dark ? red[500] : red[900],
            color: dark ? red[500] : red[900],
            '&:hover': {
                borderColor: dark ? red[900] : red[700],
            },
        },
    }
})
export function extendsTheme(extend: (theme: Theme) => ThemeOptions) {
    return (theme: Theme) => merge(cloneDeep(theme), extend(theme))
}

declare module '@material-ui/core/styles/createPalette.d' {
    export interface TypeText {
        hint: string
    }
}
