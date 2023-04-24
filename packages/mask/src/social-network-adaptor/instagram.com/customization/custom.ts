import { useMemo } from 'react'
import { produce, setAutoFreeze } from 'immer'
import { type Theme, unstable_createMuiStrictModeTheme } from '@mui/material'
import { useThemeSettings } from '../../../components/DataSource/useActivatedUI.js'

export function useThemeInstagramVariant(baseTheme: Theme) {
    const themeSettings = useThemeSettings()

    return useMemo(() => {
        setAutoFreeze(false)

        const InstagramTheme = produce(baseTheme, (theme) => {
            theme.components = theme.components || {}
            theme.components.MuiTypography = {
                styleOverrides: {
                    root: {
                        fontFamily:
                            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                    },
                },
            }
        })
        setAutoFreeze(true)
        return unstable_createMuiStrictModeTheme(InstagramTheme)
    }, [baseTheme, themeSettings])
}
