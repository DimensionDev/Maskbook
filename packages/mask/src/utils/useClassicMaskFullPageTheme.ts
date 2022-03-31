import { Appearance } from '@masknet/theme'
import { PaletteMode, unstable_createMuiStrictModeTheme } from '@mui/material'
import type { Localization } from '@mui/material/locale'
import { MaskDarkTheme, MaskLightTheme } from './MaskTheme'

/**
 * @deprecated
 * - Popups: migrate to \@masknet/theme package
 */
export function useClassicMaskFullPageTheme(
    userPreference: Appearance,
    [localization]: [loc: Localization, RTL: boolean],
) {
    const systemPreference: PaletteMode =
        'matchMedia' in globalThis ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : 'light'
    const finalPalette: PaletteMode = userPreference === Appearance.default ? systemPreference : userPreference

    const baseTheme = finalPalette === 'dark' ? MaskDarkTheme : MaskLightTheme
    return unstable_createMuiStrictModeTheme(baseTheme, localization)
}
