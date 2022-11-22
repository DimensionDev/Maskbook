import { useMemo } from 'react'
import { useSNSAdaptorContext } from '../entry-content-script.js'

export function useThemeSettings() {
    const { themeSettings, getThemeSettings } = useSNSAdaptorContext()
    return useMemo(() => {
        return {
            ...getThemeSettings(),
            ...themeSettings,
        }
    }, [themeSettings, getThemeSettings])
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
