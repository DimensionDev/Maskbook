import { useMemo } from 'react'
import { unstable_createMuiStrictModeTheme } from '@mui/material'
import { activatedSiteAdaptorUI } from '../site-adaptor-infra/index.js'
import { useThemeSettings } from './DataSource/useActivatedUI.js'

export function useMaskSiteAdaptorMixedTheme() {
    const { mode, color, size } = useThemeSettings()
    const { getTheme } = activatedSiteAdaptorUI!.customization
    const siteAdaptorMixedTheme = useMemo(() => {
        if (!getTheme) return
        return unstable_createMuiStrictModeTheme(getTheme({ mode, color, size }))
    }, [getTheme, mode, color, size])
    return siteAdaptorMixedTheme
}
