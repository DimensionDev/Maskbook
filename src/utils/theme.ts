import { unstable_createMuiStrictModeTheme, useMediaQuery } from '@material-ui/core'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import { orange, green, red, blue, grey } from '@material-ui/core/colors'
import type { ThemeOptions } from '@material-ui/core/styles/createMuiTheme'
import { merge, cloneDeep } from 'lodash-es'
import { Appearance, appearanceSettings, Language, languageSettings } from '../settings/settings'
import { useValueRef } from './hooks/useValueRef'
import { useMemo } from 'react'
import { zhTW, jaJP } from '@material-ui/core/locale/index'
import { safeUnreachable } from './utils'
import { or } from '../components/custom-ui-helper'

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
    overrides: {
        MuiButton: {
            root: {
                textTransform: 'unset',
                minWidth: '100px',
            },
        },
        MuiTab: {
            root: { textTransform: 'unset', padding: '0' },
        },
        MuiDialog: {
            paper: {
                borderRadius: '12px',
            },
        },
    },
    props: {
        MuiButton: {
            size: 'small',
            disableElevation: true,
        },
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
const MaskbookLightTheme = unstable_createMuiStrictModeTheme(baseTheme('light'))
const MaskbookDarkTheme = unstable_createMuiStrictModeTheme(baseTheme('dark'))

export function getMaskbookTheme(opt?: { language?: Language; theme?: Appearance }) {
    const language = opt?.language ?? languageSettings.value
    const preference = opt?.theme ?? appearanceSettings.value
    const appearance = matchMedia('(prefers-color-scheme: dark)').matches

    const isDark = (appearance && preference === Appearance.default) || preference === Appearance.dark
    const baseTheme = isDark ? MaskbookDarkTheme : MaskbookLightTheme
    switch (language) {
        case Language.en:
            return baseTheme
        case Language.ja:
            return unstable_createMuiStrictModeTheme(baseTheme, jaJP)
        case Language.zh:
            return unstable_createMuiStrictModeTheme(baseTheme, zhTW)
        default:
            safeUnreachable(language)
            return baseTheme
    }
}

export function useMaskbookTheme(opt?: { language?: Language; theme?: Appearance }) {
    const language = or(opt?.language, useValueRef(languageSettings))
    const preference = or(opt?.theme, useValueRef(appearanceSettings))
    const appearance = useMediaQuery('(prefers-color-scheme: dark)')

    const isDark = (appearance && preference === Appearance.default) || preference === Appearance.dark
    const finalTheme = isDark ? Appearance.dark : Appearance.light
    return useMemo(() => getMaskbookTheme({ language, theme: finalTheme }), [finalTheme, language])
}

export const useColorStyles = makeStyles((theme: typeof MaskbookDarkTheme) => {
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
    })
})

export const useErrorStyles = makeStyles((theme) => {
    const dark = theme.palette.type === 'dark'
    return createStyles({
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
    })
})
