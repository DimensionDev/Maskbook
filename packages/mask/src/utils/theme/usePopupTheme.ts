import { unstable_createMuiStrictModeTheme } from '@mui/material'
import { MaskDarkTheme, MaskLightTheme } from '@masknet/theme'
import { languageSettings } from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared-base-ui'
import { ThemeMode } from '@masknet/web3-shared-base'
import { useThemeSettings } from '../../components/DataSource/useActivatedUI.js'
import { useThemeLanguage } from './useThemeLanguage.js'

export function usePopupTheme() {
    const { mode } = useThemeSettings()
    const [localization, isRTL] = useThemeLanguage(useValueRef(languageSettings))

    return unstable_createMuiStrictModeTheme(mode === ThemeMode.Dark ? MaskDarkTheme : MaskLightTheme, localization)
}
