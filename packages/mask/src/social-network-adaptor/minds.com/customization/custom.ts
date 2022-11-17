import { useMemo } from 'react'
import produce, { setAutoFreeze } from 'immer'
import { ValueRef } from '@dimensiondev/holoflows-kit'
import { PaletteMode, Theme, unstable_createMuiStrictModeTheme } from '@mui/material'
import { useValueRef } from '@masknet/shared-base-ui'
import { createSubscriptionFromValueRef } from '@masknet/shared-base'
import type { SocialNetworkUI } from '@masknet/types'
import { fromRGB, getBackgroundColor, getForegroundColor, isDark, shade, toRGB } from '../../../utils/theme/index.js'
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

export async function startWatchThemeColor(signal: AbortSignal) {
    function updateThemeColor() {
        const contrastColor = getForegroundColor(themeListItemSelector().evaluate()!)
        const backgroundColor = getBackgroundColor(document.body)
        currentTheme.value = isDark(fromRGB(backgroundColor)!) ? 'dark' : 'light'
        if (contrastColor) primaryColorContrastColorRef.value = contrastColor
        if (backgroundColor) backgroundColorRef.value = backgroundColor
    }

    updateThemeColor()
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            updateThemeColor()
        })
    })

    observer.observe(document.querySelector('body') as Node, {
        attributes: true,
        attributeOldValue: true,
        attributeFilter: ['class'],
    })

    signal.addEventListener('abort', () => observer.disconnect())
}

export function useThemeMindsVariant(baseTheme: Theme) {
    const primaryColor = useValueRef(primaryColorContrastColorRef)
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
