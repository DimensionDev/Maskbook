import { unstable_createMuiStrictModeTheme } from '@mui/material'
import type { Theme } from '@mui/material/styles/createTheme'
import { useRef } from 'react'
import { activatedSocialNetworkUI } from '../../social-network/index.js'
import { useSubscription } from 'use-subscription'
import { useThemeLanguage } from './useThemeLanguage.js'
import { createSubscriptionFromValueRef } from '@masknet/shared-base'
import { ValueRef } from '@dimensiondev/holoflows-kit'
import { useValueRef } from '@masknet/shared-base-ui'
import { languageSettings } from '../../../shared/legacy-settings/settings.js'
import { MaskDarkTheme, MaskLightTheme } from '@masknet/theme'

const staticRef = createSubscriptionFromValueRef(new ValueRef('light'))
const defaultUseTheme = (t: Theme) => t

export function useMaskSiteAdaptorMixedTheme() {
    const provider = useRef(activatedSocialNetworkUI.customization.paletteMode?.current || staticRef).current
    const useMixedTheme = useRef(activatedSocialNetworkUI.customization.useTheme || defaultUseTheme).current
    const palette = useSubscription(provider)

    const maskTheme = palette === 'dark' ? MaskDarkTheme : MaskLightTheme

    const [localization, isRTL] = useThemeLanguage(useValueRef(languageSettings))
    const theme = unstable_createMuiStrictModeTheme(maskTheme, localization)
    return useMixedTheme(theme)
}
