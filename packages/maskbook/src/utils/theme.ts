import { ValueRef } from '@dimensiondev/holoflows-kit'
import { useValueRef, or, SubscriptionFromValueRef } from '@masknet/shared'
import { Appearance } from '@masknet/theme'
import { LanguageOptions, SupportedLanguages } from '@masknet/public-api'
import { PaletteMode, unstable_createMuiStrictModeTheme } from '@material-ui/core'
import { blue, green, grey, orange, red } from '@material-ui/core/colors'
import {
    jaJP,
    koKR,
    zhTW,
    zhCN,
    esES,
    itIT,
    ruRU,
    faIR,
    frFR,
    enUS,
    Localization,
} from '@material-ui/core/locale/index'
import { makeStyles } from '@masknet/theme'
import type { Theme, ThemeOptions } from '@material-ui/core/styles/createTheme'
import { cloneDeep, merge } from 'lodash-es'
import { useRef } from 'react'
import { appearanceSettings, languageSettings } from '../settings/settings'
import { activatedSocialNetworkUI } from '../social-network'
import './theme-global.d'
import { Subscription, useSubscription } from 'use-subscription'

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
const staticSubscription: Subscription<PaletteMode> = SubscriptionFromValueRef(new ValueRef('light'))
export function useClassicMaskSNSTheme() {
    const { current: provider } = useRef(
        activatedSocialNetworkUI.customization.paletteMode?.current || staticSubscription,
    )
    const { current: usePostTheme = (t: Theme) => t } = useRef(activatedSocialNetworkUI.customization.useTheme)
    const palette = useSubscription(provider)
    const baseTheme = palette === 'dark' ? MaskDarkTheme : MaskLightTheme

    // TODO: support RTL?
    const [localization, isRTL] = useThemeLanguage()
    const theme = unstable_createMuiStrictModeTheme(baseTheme, localization)
    return usePostTheme(theme)
}
/**
 * @deprecated
 * - 1.x dashboard: will be removed in 2.0
 * - Popups: migrate to \@masknet/theme package
 */
export function useClassicMaskFullPageTheme(overwrite?: ClassicMaskFullPageThemeOptions) {
    const userPreference = or(overwrite?.forcePalette, useValueRef(appearanceSettings))
    const systemPreference: PaletteMode = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const finalPalette: PaletteMode = userPreference === Appearance.default ? systemPreference : userPreference

    const baseTheme = finalPalette === 'dark' ? MaskDarkTheme : MaskLightTheme
    const [localization, isRTL] = useThemeLanguage()
    // TODO: support RTL
    return unstable_createMuiStrictModeTheme(baseTheme, localization)
}

function useThemeLanguage(): [loc: Localization, RTL: boolean] {
    let language = useValueRef(languageSettings)
    // TODO: support auto language
    if (language === LanguageOptions.__auto__) language = LanguageOptions.enUS

    const displayLanguage = language as any as SupportedLanguages

    const langs: Record<SupportedLanguages, Localization> = {
        [SupportedLanguages.enUS]: enUS,
        [SupportedLanguages.jaJP]: jaJP,
        [SupportedLanguages.koKR]: koKR,
        [SupportedLanguages.zhTW]: zhTW,
        [SupportedLanguages.zhCN]: zhCN,
        [SupportedLanguages.ruRU]: ruRU,
        [SupportedLanguages.itIT]: itIT,
        [SupportedLanguages.esES]: esES,
        [SupportedLanguages.frFR]: frFR,
        [SupportedLanguages.faIR]: faIR,
    }
    return [langs[displayLanguage] || enUS, language === LanguageOptions.faIR]
}

export interface ClassicMaskFullPageThemeOptions {
    forcePalette?: Appearance
}

export const useColorStyles = makeStyles()((theme: typeof MaskDarkTheme) => {
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
export const useErrorStyles = makeStyles()((theme) => {
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
