import { useAsyncRetry } from 'react-use'
import { useSNSAdaptorContext } from '../entry-content-script.js'

export function useThemeSettings() {
    const { getThemeSettings, getDefaultThemeSettings } = useSNSAdaptorContext()
    const { value: settings = getDefaultThemeSettings() } = useAsyncRetry(async () => getThemeSettings(), [])
    return settings
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
