import { useMemo } from 'react'
import { produce, setAutoFreeze } from 'immer'
import { type Theme, unstable_createMuiStrictModeTheme } from '@mui/material'
import { useThemeSettings } from '../../../components/DataSource/useActivatedUI.js'

export function useThemeMirrorVariant(baseTheme: Theme) {
    const themeSettings = useThemeSettings()

    return useMemo(() => {
        setAutoFreeze(false)

        const MirrorTheme = produce(baseTheme, (theme) => {
            theme.components = theme.components || {}
            theme.components.MuiTypography = {
                styleOverrides: {
                    root: {
                        fontFamily:
                            '"Inter var",system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"',
                    },
                },
            }
        })
        setAutoFreeze(true)
        return unstable_createMuiStrictModeTheme(MirrorTheme)
    }, [baseTheme, themeSettings])
}
