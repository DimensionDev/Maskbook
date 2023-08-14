import { useMemo } from 'react'
import { useSubscription } from 'use-subscription'
import type { Theme } from '@mui/material'
import { FontSize, ThemeColor, ThemeMode } from '@masknet/web3-shared-base'
import { useSiteAdaptorContext } from '../dom/useSiteAdaptorContext.js'
import { getBackgroundColor } from '../utils/theme/color-tools.js'

const defaults = {
    mode: ThemeMode.Light,
    size: FontSize.Normal,
    color: ThemeColor.Blue,
}

export function useThemeSettings() {
    const { themeSettings, getThemeSettings } = useSiteAdaptorContext()
    const settings = useSubscription(themeSettings)
    return useMemo(() => {
        return {
            ...defaults,
            ...getThemeSettings(),
            ...settings,
        }
    }, [settings, getThemeSettings])
}

export function useThemeMode() {
    const { mode } = useThemeSettings()
    return mode
}

export function useThemeSize() {
    const { size } = useThemeSettings()
    return size
}

export function useThemeColor() {
    const { color } = useThemeSettings()
    return color
}

export function useSiteThemeMode(theme: Theme) {
    const backgroundColor = getBackgroundColor(document.body)
    const isDark = theme.palette.mode === 'dark'
    const isDarker = backgroundColor === 'rgb(0,0,0)'

    return isDark ? (!isDarker ? 'dim' : 'dark') : 'light'
}
