import { useMemo } from 'react'
import produce, { setAutoFreeze } from 'immer'
import { MutationObserverWatcher, ValueRef } from '@dimensiondev/holoflows-kit'
import { createLookupTableResolver, createSubscriptionFromValueRef } from '@masknet/shared-base'
import type { SocialNetworkUI } from '@masknet/types'
import { useValueRef } from '@masknet/shared-base-ui'
import { Twitter, TwitterBaseAPI } from '@masknet/web3-providers'
import { PaletteMode, Theme, unstable_createMuiStrictModeTheme } from '@mui/material'
import { fromRGB, getBackgroundColor, getForegroundColor, isDark, shade, toRGB } from '../../../utils/theme/index.js'
import { isMobileTwitter } from '../utils/isMobile.js'
import { composeAnchorSelector, composeAnchorTextSelector, headingTextSelector } from '../utils/selector.js'

const resolveThemeColor = createLookupTableResolver<TwitterBaseAPI.ThemeColor, string>(
    {
        [TwitterBaseAPI.ThemeColor.blue]: 'rgb(29, 155, 240)',
        [TwitterBaseAPI.ThemeColor.yellow]: 'rgb(255, 212, 0)',
        [TwitterBaseAPI.ThemeColor.purple]: 'rgb(249, 24, 128)',
        [TwitterBaseAPI.ThemeColor.magenta]: 'rgb(120, 86, 255)',
        [TwitterBaseAPI.ThemeColor.orange]: 'rgb(255, 122, 0)',
        [TwitterBaseAPI.ThemeColor.green]: 'rgb(0, 186, 124)',
    },
    'rgb(29, 155, 240)',
)

const resolveTextColor = createLookupTableResolver<TwitterBaseAPI.ThemeMode, string>(
    {
        [TwitterBaseAPI.ThemeMode.dark]: 'rgb(255, 255, 255)',
        [TwitterBaseAPI.ThemeMode.dim]: 'rgb(255, 255, 255)',
        [TwitterBaseAPI.ThemeMode.light]: 'rgb(255, 255, 255)',
    },
    '',
)

const resolveBackgroundColor = createLookupTableResolver<TwitterBaseAPI.ThemeMode, string>(
    {
        [TwitterBaseAPI.ThemeMode.dark]: 'rgb(0, 0, 0)',
        [TwitterBaseAPI.ThemeMode.dim]: 'rgb(21, 32, 43)',
        [TwitterBaseAPI.ThemeMode.light]: 'rgb(255, 255, 255)',
    },
    'rgb(255, 255, 255)',
)

const resolveThemeMode = createLookupTableResolver<TwitterBaseAPI.ThemeMode, 'dark' | 'light'>(
    {
        [TwitterBaseAPI.ThemeMode.dark]: 'dark',
        [TwitterBaseAPI.ThemeMode.dim]: 'dark',
        [TwitterBaseAPI.ThemeMode.light]: 'light',
    },
    'light',
)

const themeColorRef = new ValueRef(resolveThemeColor(TwitterBaseAPI.ThemeColor.blue))
const textColorRef = new ValueRef(resolveTextColor(TwitterBaseAPI.ThemeMode.light))
const backgroundColorRef = new ValueRef(resolveBackgroundColor(TwitterBaseAPI.ThemeMode.light))
const paletteModeRef = new ValueRef<PaletteMode>(resolveThemeMode(TwitterBaseAPI.ThemeMode.light))

export const PaletteModeProviderTwitter: SocialNetworkUI.Customization.PaletteModeProvider = {
    current: createSubscriptionFromValueRef(paletteModeRef),
    start: startWatchThemeColor,
}

export function startWatchThemeColor(signal: AbortSignal) {
    async function updateThemeByAPI() {
        const userSettings = await Twitter.getUserSettings()
        if (!userSettings) throw new Error('Failed to update theme by API.')

        themeColorRef.value = resolveThemeColor(userSettings.themeColor)
        textColorRef.value = resolveTextColor(userSettings.themeBackground)
        backgroundColorRef.value = resolveBackgroundColor(userSettings.themeBackground)
        paletteModeRef.value = resolveThemeMode(userSettings.themeBackground)
    }

    function updateThemeByDOM() {
        const composeAnchor = composeAnchorSelector().evaluate()
        const anchorText = composeAnchorTextSelector().evaluate()

        themeColorRef.value = getBackgroundColor(composeAnchor)
        textColorRef.value = getForegroundColor(anchorText)
        backgroundColorRef.value = getBackgroundColor(document.body)
        paletteModeRef.value = isDark(fromRGB(backgroundColorRef.value)!) ? 'dark' : 'light'
    }

    async function updateThemeColor() {
        try {
            await updateThemeByAPI()
        } catch {
            updateThemeByDOM()
        }
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
