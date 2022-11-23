import { useRef } from 'react'
import { ValueRef } from '@dimensiondev/holoflows-kit'
import { unstable_createMuiStrictModeTheme } from '@mui/material'
import type { Theme } from '@mui/material'
import { useValueRef } from '@masknet/shared-base-ui'
import { MaskDarkTheme, MaskLightTheme } from '@masknet/theme'
import { ThemeMode, ThemeSettings } from '@masknet/web3-shared-base'
import { useThemeLanguage } from './useThemeLanguage.js'
import { activatedSocialNetworkUI } from '../../social-network/index.js'
import { languageSettings } from '../../../shared/legacy-settings/settings.js'

const staticRef = new ValueRef<Partial<ThemeSettings>>({})
const defaultUseTheme = (t: Theme) => t

export function useMaskSiteAdaptorMixedTheme() {
    const { mode } = useValueRef(activatedSocialNetworkUI.collecting.themeSettingsProvider?.recognized || staticRef)
    const useMixedTheme = useRef(activatedSocialNetworkUI.customization.useTheme || defaultUseTheme).current

    const [localization, isRTL] = useThemeLanguage(useValueRef(languageSettings))
    const theme = unstable_createMuiStrictModeTheme(
        mode === ThemeMode.Dark ? MaskDarkTheme : MaskLightTheme,
        localization,
    )
    return useMixedTheme(theme)
}
