import { ValueRef } from '@dimensiondev/holoflows-kit'
import { useValueRef, or } from '@masknet/shared'
import { safeUnreachable } from '@dimensiondev/kit'
import { Appearance } from '@masknet/theme'
import { LanguageOptions, SupportedLanguages } from '@masknet/public-api'
import { unstable_createMuiStrictModeTheme, useMediaQuery } from '@mui/material'
import { blue, green, grey, orange, red } from '@mui/material/colors'
import { jaJP, koKR, zhTW, zhCN, esES, itIT, ruRU, faIR, frFR } from '@mui/material/locale/index'
import { makeStyles } from '@masknet/theme'
import type { Theme, ThemeOptions } from '@mui/material/styles/createTheme'
import { cloneDeep, merge } from 'lodash-es'
import { useMemo, useRef } from 'react'
import { appearanceSettings, languageSettings } from '../settings/settings'
import { activatedSocialNetworkUI } from '../social-network'
import './theme-global.d'

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

// Theme
const MaskLightTheme = unstable_createMuiStrictModeTheme(baseTheme('light'))
const MaskDarkTheme = unstable_createMuiStrictModeTheme(baseTheme('dark'))

export function getMaskTheme(opt?: { appearance?: Appearance; language?: SupportedLanguages }) {
    let language = opt?.language
    if (!language) {
        const settings = languageSettings.value
        // TODO:
        if (settings === LanguageOptions.__auto__) language = SupportedLanguages.enUS
        else language = settings as any
    }
    if (!language) language = SupportedLanguages.enUS
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
    const baseTheme = isDark ? MaskDarkTheme : MaskLightTheme
    switch (language) {
        case SupportedLanguages.enUS:
            return baseTheme
        case SupportedLanguages.jaJP:
            return unstable_createMuiStrictModeTheme(baseTheme, jaJP)
        case SupportedLanguages.koKR:
            return unstable_createMuiStrictModeTheme(baseTheme, koKR)
        case SupportedLanguages.zhTW:
            return unstable_createMuiStrictModeTheme(baseTheme, zhTW)
        case SupportedLanguages.zhCN:
            return unstable_createMuiStrictModeTheme(baseTheme, zhCN)
        case SupportedLanguages.ruRU:
            return unstable_createMuiStrictModeTheme(baseTheme, ruRU)
        case SupportedLanguages.itIT:
            return unstable_createMuiStrictModeTheme(baseTheme, itIT)
        case SupportedLanguages.esES:
            return unstable_createMuiStrictModeTheme(baseTheme, esES)
        case SupportedLanguages.frFR:
            return unstable_createMuiStrictModeTheme(baseTheme, frFR)
        // TODO: it should be a RTL theme.
        case SupportedLanguages.faIR:
            return unstable_createMuiStrictModeTheme(baseTheme, faIR)
        default:
            safeUnreachable(language)
            return baseTheme
    }
}
// We're developing a new theme in the theme/ package
export function useClassicMaskTheme(opt?: { appearance?: Appearance; language?: SupportedLanguages }) {
    const langSettingsValue = useValueRef(languageSettings)
    let language = opt?.language
    if (!language) {
        // TODO:
        if (langSettingsValue === LanguageOptions.__auto__) language = SupportedLanguages.enUS
        else language = langSettingsValue as any
    }

    const appearance = or(opt?.appearance, useValueRef(appearanceSettings))
    const systemPreference = useMediaQuery('(prefers-color-scheme: dark)')
    const paletteProvider = useRef(
        activatedSocialNetworkUI.customization.paletteMode?.current || new ValueRef('light'),
    ).current
    const palette = useValueRef(paletteProvider)
    return useMemo(() => getMaskTheme({ appearance, language }), [language, appearance, systemPreference, palette])
}

export const useColorStyles: (params: void) => {
    classes: Record<'error' | 'success' | 'info', string>
} = makeStyles()((theme: typeof MaskDarkTheme) => {
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
export const useErrorStyles: (params: void) => {
    classes: Record<'containedPrimary' | 'outlinedPrimary', string>
} = makeStyles()((theme) => {
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
