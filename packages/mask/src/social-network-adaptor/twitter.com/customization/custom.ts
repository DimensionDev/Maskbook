import { useMemo } from 'react'
import produce, { setAutoFreeze } from 'immer'
import { MutationObserverWatcher, ValueRef } from '@dimensiondev/holoflows-kit'
import { createLookupTableResolver } from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared-base-ui'
import { Twitter, TwitterBaseAPI } from '@masknet/web3-providers'
import { PaletteMode, Theme, unstable_createMuiStrictModeTheme } from '@mui/material'
import { fromRGB, shade, toRGB } from '../../../utils/theme/index.js'
import { isMobileTwitter } from '../utils/isMobile.js'
import { composeAnchorSelector, headingTextSelector } from '../utils/selector.js'
import { ThemeMode } from '@masknet/web3-shared-base'

const resolveThemeColor = createLookupTableResolver<TwitterBaseAPI.ThemeColor, string>(
    {
        [TwitterBaseAPI.ThemeColor.Blue]: 'rgb(29, 155, 240)',
        [TwitterBaseAPI.ThemeColor.Yellow]: 'rgb(255, 212, 0)',
        [TwitterBaseAPI.ThemeColor.Purple]: 'rgb(120, 86, 255)',
        [TwitterBaseAPI.ThemeColor.Magenta]: 'rgb(249, 24, 128)',
        [TwitterBaseAPI.ThemeColor.Orange]: 'rgb(255, 122, 0)',
        [TwitterBaseAPI.ThemeColor.Green]: 'rgb(0, 186, 124)',
    },
    'rgb(29, 155, 240)',
)

const resolveTextColor = createLookupTableResolver<TwitterBaseAPI.ThemeMode, string>(
    {
        [TwitterBaseAPI.ThemeMode.Dark]: 'rgb(255, 255, 255)',
        [TwitterBaseAPI.ThemeMode.Dim]: 'rgb(255, 255, 255)',
        [TwitterBaseAPI.ThemeMode.Light]: 'rgb(255, 255, 255)',
    },
    'rgb(255, 255, 255)',
)

const resolveBackgroundColor = createLookupTableResolver<TwitterBaseAPI.ThemeMode, string>(
    {
        [TwitterBaseAPI.ThemeMode.Dark]: 'rgb(0, 0, 0)',
        [TwitterBaseAPI.ThemeMode.Dim]: 'rgb(21, 32, 43)',
        [TwitterBaseAPI.ThemeMode.Light]: 'rgb(255, 255, 255)',
    },
    'rgb(255, 255, 255)',
)

const resolveThemeMode = createLookupTableResolver<TwitterBaseAPI.ThemeMode, ThemeMode>(
    {
        [TwitterBaseAPI.ThemeMode.Dark]: ThemeMode.Dark,
        [TwitterBaseAPI.ThemeMode.Dim]: ThemeMode.Dark,
        [TwitterBaseAPI.ThemeMode.Light]: ThemeMode.Light,
    },
    ThemeMode.Light,
)

const themeColorRef = new ValueRef(resolveThemeColor(TwitterBaseAPI.ThemeColor.Blue))
const textColorRef = new ValueRef(resolveTextColor(TwitterBaseAPI.ThemeMode.Light))
const backgroundColorRef = new ValueRef(resolveBackgroundColor(TwitterBaseAPI.ThemeMode.Light))
const paletteModeRef = new ValueRef<PaletteMode>(resolveThemeMode(TwitterBaseAPI.ThemeMode.Light))

export async function startWatchThemeColor(signal: AbortSignal) {
    async function updateThemeColor() {
        const userSettings = await Twitter.getUserSettings(true)
        themeColorRef.value = resolveThemeColor(userSettings.themeColor!)
        textColorRef.value = resolveTextColor(userSettings.themeBackground!)
        backgroundColorRef.value = resolveBackgroundColor(userSettings.themeBackground!)
        paletteModeRef.value = resolveThemeMode(userSettings.themeBackground!)
    }

    new MutationObserverWatcher(composeAnchorSelector())
        .addListener('onAdd', updateThemeColor)
        .addListener('onChange', updateThemeColor)
        .startWatch({ childList: true, subtree: true }, signal)

    if (isMobileTwitter) {
        new MutationObserverWatcher(headingTextSelector())
            .addListener('onAdd', updateThemeColor)
            .addListener('onChange', updateThemeColor)
            .startWatch({ childList: true, subtree: true }, signal)
    }

    await updateThemeColor()
}
export function useThemeTwitterVariant(baseTheme: Theme) {
    const primaryColor = useValueRef(themeColorRef)
    const primaryContrastColor = useValueRef(textColorRef)
    const backgroundColor = useValueRef(backgroundColorRef)
    return useMemo(() => {
        const primaryColorRGB = fromRGB(primaryColor)!
        const primaryContrastColorRGB = fromRGB(primaryContrastColor)
        setAutoFreeze(false)

        const TwitterTheme = produce(baseTheme, (theme) => {
            theme.palette.primary = {
                light: toRGB(shade(primaryColorRGB, 10)),
                main: toRGB(primaryColorRGB),
                dark: toRGB(shade(primaryColorRGB, -10)),
                contrastText: toRGB(primaryContrastColorRGB),
            }
            theme.shape.borderRadius = isMobileTwitter ? 0 : 15
            theme.breakpoints.values = { xs: 0, sm: 687, md: 1024, lg: 1280, xl: 1920 }
            theme.components = theme.components || {}

            theme.components.MuiPaper = {
                defaultProps: {
                    elevation: 0,
                },
            }
            theme.components.MuiTab = {
                styleOverrides: {
                    root: {
                        textTransform: 'none',
                    },
                },
            }
            theme.components.MuiBackdrop = {
                styleOverrides: {
                    root: {
                        backgroundColor: theme.palette.action.mask,
                    },
                    invisible: {
                        opacity: '0 !important',
                    },
                },
            }
        })
        setAutoFreeze(true)
        return unstable_createMuiStrictModeTheme(TwitterTheme)
    }, [baseTheme, backgroundColor, primaryColor, primaryContrastColor])
}
