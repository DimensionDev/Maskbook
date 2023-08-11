import { Appearance } from '@masknet/public-api'
import { MaskDarkTheme, MaskLightTheme, useSystemPreferencePalette } from '@masknet/theme'
import { useThemeMode } from './useThemeMode.js'

export function useTheme() {
    const mode = useThemeMode()
    const systemMode = useSystemPreferencePalette()

    const computedMode = mode === Appearance.default ? systemMode : mode

    if (computedMode === Appearance.dark) return MaskDarkTheme
    return MaskLightTheme
}
