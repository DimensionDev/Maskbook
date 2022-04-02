// ! This file is used during SSR. DO NOT import new files that does not work in SSR

import type { LanguageOptions } from '@masknet/public-api'
import { Appearance } from '@masknet/theme'
import { PaletteMode, unstable_createMuiStrictModeTheme } from '@mui/material'
import { MaskDarkTheme, MaskLightTheme } from './MaskTheme'
import { useThemeLanguage } from './useThemeLanguage'

/**
 * @deprecated Should migrate to \@masknet/theme
 */
export function useClassicMaskFullPageTheme(userPreference: Appearance, language: LanguageOptions) {
    const systemPreference: PaletteMode =
        'matchMedia' in globalThis ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : 'light'
    const finalPalette: PaletteMode = userPreference === Appearance.default ? systemPreference : userPreference

    const baseTheme = finalPalette === 'dark' ? MaskDarkTheme : MaskLightTheme
    return unstable_createMuiStrictModeTheme(baseTheme, useThemeLanguage(language))
}

/**
 * @deprecated Should migrate to \@masknet/theme
 */
export function usePopupFullPageTheme(language: LanguageOptions) {
    return useClassicMaskFullPageTheme(Appearance.light, language)
}
