import { useRef } from 'react'
import { type Theme, unstable_createMuiStrictModeTheme } from '@mui/material'
import { MaskDarkTheme, MaskLightTheme } from '@masknet/theme'
import { languageSettings } from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared-base-ui'
import { ThemeMode } from '@masknet/web3-shared-base'
import { useThemeLanguage } from '../../shared-ui/hooks/useThemeLanguage.js'
import { activatedSiteAdaptorUI } from '../site-adaptor-infra/index.js'
import { useThemeSettings } from './DataSource/useActivatedUI.js'

const defaultUseTheme = (t: Theme) => t

export function useMaskSiteAdaptorMixedTheme() {
    const { mode } = useThemeSettings()
    // false positive
    // eslint-disable-next-line react-compiler/react-compiler
    const useMixedTheme = useRef(activatedSiteAdaptorUI!.customization.useTheme || defaultUseTheme).current

    const [localization] = useThemeLanguage(useValueRef(languageSettings))
    const theme = unstable_createMuiStrictModeTheme(
        mode === ThemeMode.Dark ? MaskDarkTheme : MaskLightTheme,
        localization,
    )
    // eslint-disable-next-line react-compiler/react-compiler
    return useMixedTheme(theme)
}
