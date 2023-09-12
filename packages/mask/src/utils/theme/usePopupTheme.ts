import { unstable_createMuiStrictModeTheme } from '@mui/material'
import { MaskDarkTheme, MaskLightTheme, useSystemPreferencePalette } from '@masknet/theme'
import { languageSettings } from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared-base-ui'
import { ThemeMode } from '@masknet/web3-shared-base'
import { useThemeLanguage } from './useThemeLanguage.js'
import { useAppearance } from '../../../dashboard/pages/Personas/api.js'

export function usePopupTheme() {
    const appearance = useAppearance()
    const mode = useSystemPreferencePalette()
    const [localization, isRTL] = useThemeLanguage(useValueRef(languageSettings))

    return unstable_createMuiStrictModeTheme(
        (appearance === 'default' ? mode : appearance) === ThemeMode.Dark ? MaskDarkTheme : MaskLightTheme,
        localization,
    )
}
