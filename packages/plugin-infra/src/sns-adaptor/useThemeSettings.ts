import { useMemo } from 'react'
import { useSubscription } from 'use-subscription'
import { FontSize, ThemeColor, ThemeMode } from '@masknet/web3-shared-base'
import { useSNSAdaptorContext } from './SNSAdaptorContext.js'
import type { Theme } from '@mui/material'
import { getBackgroundColor } from '../utils/theme/color-tools.js'

const defaults = {
    mode: ThemeMode.Light,
    size: FontSize.Normal,
    color: ThemeColor.Blue,
}

export function useThemeSettings() {
    const { themeSettings, getThemeSettings } = useSNSAdaptorContext()
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

export function useSNSThemeMode(theme: Theme) {
    const backgroundColor = getBackgroundColor(document.body)
    const isDark = theme.palette.mode === 'dark'
    const isDarker = backgroundColor === 'rgb(0,0,0)'

    return isDark ? (!isDarker ? 'dim' : 'dark') : 'light'
}
