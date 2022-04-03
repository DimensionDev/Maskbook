import { unstable_createMuiStrictModeTheme } from '@mui/material'
import type { Theme } from '@mui/material/styles/createTheme'
import { useRef } from 'react'
import { activatedSocialNetworkUI } from '../../social-network'
import { useSubscription } from 'use-subscription'
import { MaskDarkTheme, MaskLightTheme } from './MaskTheme'
import { useThemeLanguage } from './useThemeLanguage'
import { SubscriptionFromValueRef } from '@masknet/shared-base'
import { ValueRef } from '@dimensiondev/holoflows-kit'
import { useValueRef } from '@masknet/shared-base-ui'
import { languageSettings } from '../../settings/settings'

const staticRef = SubscriptionFromValueRef(new ValueRef('light'))
const defaultUseTheme = (t: Theme) => t
/**
 * @deprecated Should migrate to \@masknet/theme
 */
export function useClassicMaskSNSTheme() {
    const provider = useRef(activatedSocialNetworkUI.customization.paletteMode?.current || staticRef).current
    const usePostTheme = useRef(activatedSocialNetworkUI.customization.useTheme || defaultUseTheme).current
    const palette = useSubscription(provider)
    const baseTheme = palette === 'dark' ? MaskDarkTheme : MaskLightTheme

    // TODO: support RTL?
    const [localization, isRTL] = useThemeLanguage(useValueRef(languageSettings))
    const theme = unstable_createMuiStrictModeTheme(baseTheme, localization)
    return usePostTheme(theme)
}
