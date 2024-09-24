import { useMemo } from 'react'
import { produce, setAutoFreeze } from 'immer'
import { type Theme, unstable_createMuiStrictModeTheme } from '@mui/material'
import { fromRGB, shade, toRGB } from '@masknet/plugin-infra/content-script'
import { useThemeSettings } from '../../../components/DataSource/useActivatedUI.js'

export function useThemeFacebookVariant(baseTheme: Theme) {
    const themeSettings = useThemeSettings()

    return useMemo(() => {
        const primaryColorRGB = fromRGB(themeSettings.color)!
        const primaryContrastColorRGB = fromRGB('rgb(255, 255, 255)')
        setAutoFreeze(false)

        const FacebookTheme = produce(baseTheme, (theme) => {
            theme.palette.primary = {
                light: toRGB(shade(primaryColorRGB, 10)),
                main: toRGB(primaryColorRGB),
                dark: toRGB(shade(primaryColorRGB, -10)),
                contrastText: toRGB(primaryContrastColorRGB),
            }
            theme.shape.borderRadius = 15
            theme.breakpoints.values = { xs: 0, sm: 687, md: 1024, lg: 1280, xl: 1920 }
            theme.components = theme.components || {}
            theme.components.MuiTypography = {
                styleOverrides: {
                    root: {
                        // cspell:disable-next-line
                        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, '.SFNSText-Regular', sans-serif",
                    },
                },
            }
            theme.components.MuiPaper = {
                defaultProps: {
                    elevation: 0,
                },
            }
            theme.components.MuiTab = {
                styleOverrides: {
                    root: {
                        textTransform: 'none',
                    },
                },
            }
        })
        setAutoFreeze(true)
        return unstable_createMuiStrictModeTheme(FacebookTheme)
    }, [baseTheme, themeSettings])
}
