import { useMemo } from 'react'
import { unstable_createMuiStrictModeTheme } from '@mui/material'
import { activatedSiteAdaptorUI } from '../site-adaptor-infra/index.js'
import { useThemeSettings } from './DataSource/useActivatedUI.js'
import { MaskTheme } from '@masknet/theme'

export function useMaskSiteAdaptorMixedTheme() {
    const { mode, color, size } = useThemeSettings()
    const { getTheme } = activatedSiteAdaptorUI!.customization
    const siteAdaptorMixedTheme = useMemo(() => {
        const theme = getTheme ? getTheme({ mode, color, size }) : MaskTheme
        return unstable_createMuiStrictModeTheme({
            ...theme,
            cssVariables: {
                rootSelector: ':host',
                colorSchemeSelector: ':host-context([data-%s])',
            },
        })
    }, [getTheme, mode, color, size])
    return siteAdaptorMixedTheme
}
