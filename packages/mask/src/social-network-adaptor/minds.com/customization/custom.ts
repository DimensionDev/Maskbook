import { MutationObserverWatcher, ValueRef } from '@dimensiondev/holoflows-kit'
import { PaletteMode, Theme, unstable_createMuiStrictModeTheme } from '@mui/material'
import produce, { setAutoFreeze } from 'immer'
import { useMemo } from 'react'
import { useValueRef } from '@masknet/shared-base-ui'
import { createSubscriptionFromValueRef } from '@masknet/shared-base'
import type { SocialNetworkUI } from '../../../social-network/index.js'
import { fromRGB, getBackgroundColor, getForegroundColor, shade, toRGB } from '../../../utils/theme/index.js'
import { themeListItemSelector } from '../utils/selector.js'

// TODO: get this from DOM. But currently Minds has a single primary color
const primaryColorRef = new ValueRef(toRGB([68, 170, 255]))
const primaryColorContrastColorRef = new ValueRef(toRGB([255, 255, 255]))
const backgroundColorRef = new ValueRef(toRGB([255, 255, 255]))

const currentTheme = new ValueRef<PaletteMode>('light')
export const PaletteModeProviderMinds: SocialNetworkUI.Customization.PaletteModeProvider = {
    current: createSubscriptionFromValueRef(currentTheme),
    start: startWatchThemeColor,
}

export function startWatchThemeColor(signal: AbortSignal) {
    function updateThemeColor() {
        const contrastColor = getForegroundColor(themeListItemSelector().evaluate()!)
        const backgroundColor = getBackgroundColor(document.body)
        currentTheme.value = contrastColor === 'rgb(255,255,255)' ? 'dark' : 'light'
        if (contrastColor) primaryColorContrastColorRef.value = contrastColor
        if (backgroundColor)
            backgroundColorRef.value = currentTheme.value === 'light' ? 'rgb(244, 244 ,245)' : 'rgb(26, 32, 37)'
    }
    // init
    currentTheme.value = getBackgroundColor(document.body) === 'rgb(255,255,255)' ? 'light' : 'dark'

    // update
    new MutationObserverWatcher(themeListItemSelector())
        .addListener('onAdd', updateThemeColor)
        .addListener('onChange', updateThemeColor)
        .startWatch(
            {
                childList: true,
                subtree: true,
            },
            signal,
        )
}

export function useThemeMindsVariant(baseTheme: Theme) {
    const primaryColor = useValueRef(primaryColorRef)
    const primaryContrastColor = useValueRef(primaryColorContrastColorRef)
    const backgroundColor = useValueRef(backgroundColorRef)
    return useMemo(() => {
        const primaryColorRGB = fromRGB(primaryColor)!
        const primaryContrastColorRGB = fromRGB(primaryContrastColor)
        setAutoFreeze(false)

        const MindsTheme = produce(baseTheme, (theme) => {
            theme.palette.primary = {
                light: toRGB(shade(primaryColorRGB, 10)),
                main: toRGB(primaryColorRGB),
                dark: toRGB(shade(primaryColorRGB, -10)),
                contrastText: toRGB(primaryContrastColorRGB),
            }
            theme.shape.borderRadius = 15
            theme.breakpoints.values = { xs: 0, sm: 687, md: 1024, lg: 1220, xl: 1920 }
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
        })
        setAutoFreeze(true)
        return unstable_createMuiStrictModeTheme(MindsTheme)
    }, [baseTheme, backgroundColor, primaryColor, primaryContrastColor])
}
