import { useMemo } from 'react'
import { activatedSiteAdaptorUI } from '../site-adaptor-infra/index.js'
import { useThemeSettings } from './DataSource/useActivatedUI.js'
import { createShadowRootTheme, MaskTheme } from '@masknet/theme'

export function useMaskSiteAdaptorMixedTheme() {
    const { mode, color, size } = useThemeSettings()
    const { getTheme } = activatedSiteAdaptorUI!.customization
    const siteAdaptorMixedTheme = useMemo(() => {
        const theme = getTheme ? getTheme({ mode, color, size }) : MaskTheme
        return createShadowRootTheme(theme)
    }, [getTheme, mode, color, size])
    return siteAdaptorMixedTheme
}
