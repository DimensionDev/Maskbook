import { useAsyncRetry } from 'react-use'
import { useSNSAdaptorContext } from '../entry-content-script.js'

export function useThemeSettings() {
    const { getThemeSettings } = useSNSAdaptorContext()
    return useAsyncRetry(async () => getThemeSettings(), [])
}

export function useDefaultThemeSettings() {
    const { getDefaultThemeSettings } = useSNSAdaptorContext()
    return getDefaultThemeSettings()
}

export function useThemeMode() {
    const defaultSettings = useDefaultThemeSettings()
    const { value: settings = defaultSettings } = useThemeSettings()
    return settings.mode
}

export function useThemeSize() {
    const defaultSettings = useDefaultThemeSettings()
    const { value: settings = defaultSettings } = useThemeSettings()
    return settings.size
}

export function useThemeColor() {
    const defaultSettings = useDefaultThemeSettings()
    const { value: settings = defaultSettings } = useThemeSettings()
    return settings.color
}
