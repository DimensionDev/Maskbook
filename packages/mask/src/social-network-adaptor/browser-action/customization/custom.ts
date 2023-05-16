import { unstable_createMuiStrictModeTheme, type Theme } from '@mui/material'
import { produce, setAutoFreeze } from 'immer'
import { useMemo } from 'react'
import { useThemeSettings } from '../../../components/DataSource/useActivatedUI.js'

export function useThemePopupVariant(baseTheme: Theme) {
    const themeSettings = useThemeSettings()

    return useMemo(() => {
        setAutoFreeze(false)

        const PopupTheme = produce(baseTheme, (theme) => {
            theme.components = theme.components || {}
            theme.components.MuiTypography = {
                styleOverrides: {
                    root: {
                        fontFamily: '-apple-system, system-ui, Helvetica, Roboto, sans-serif',
                    },
                },
            }
        })
        setAutoFreeze(true)
        return unstable_createMuiStrictModeTheme(PopupTheme)
    }, [baseTheme, themeSettings])
}
