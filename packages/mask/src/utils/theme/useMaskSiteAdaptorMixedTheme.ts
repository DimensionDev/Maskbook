import { useRef } from 'react'
import { type Theme, unstable_createMuiStrictModeTheme } from '@mui/material'
import { MaskDarkTheme, MaskLightTheme } from '@masknet/theme'
import { languageSettings } from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared-base-ui'
import { ThemeMode } from '@masknet/web3-shared-base'
import { useThemeLanguage } from './useThemeLanguage.js'
import { activatedSiteAdaptorUI } from '../../site-adaptor-infra/index.js'
import { useThemeSettings } from '../../components/DataSource/useActivatedUI.js'

const defaultUseTheme = (t: Theme) => t

export function useMaskSiteAdaptorMixedTheme() {
    const { mode } = useThemeSettings()
    const useMixedTheme = useRef(activatedSiteAdaptorUI!.customization.useTheme || defaultUseTheme).current

    const [localization, isRTL] = useThemeLanguage(useValueRef(languageSettings))
    const theme = unstable_createMuiStrictModeTheme(
        mode === ThemeMode.Dark ? MaskDarkTheme : MaskLightTheme,
        localization,
    )
    return useMixedTheme(theme)
}
