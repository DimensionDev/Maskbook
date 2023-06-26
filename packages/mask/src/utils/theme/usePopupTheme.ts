import { languageSettings } from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared-base-ui'
import { useThemeSettings } from '../../components/DataSource/useActivatedUI.js'
import { useThemeLanguage } from './useThemeLanguage.js'
import { unstable_createMuiStrictModeTheme } from '@mui/material'
import { ThemeMode } from '@masknet/web3-shared-base'
import { MaskDarkTheme, MaskLightTheme } from '@masknet/theme'

export function usePopupTheme() {
    const { mode } = useThemeSettings()
    const [localization, isRTL] = useThemeLanguage(useValueRef(languageSettings))

    return unstable_createMuiStrictModeTheme(mode === ThemeMode.Dark ? MaskDarkTheme : MaskLightTheme, localization)
}
