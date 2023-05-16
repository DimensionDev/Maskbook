import { useMemo } from 'react'
import { produce, setAutoFreeze } from 'immer'
import { type Theme, unstable_createMuiStrictModeTheme } from '@mui/material'
import { fromRGB, shade, toRGB } from '@masknet/plugin-infra/content-script'
import { isMobileTwitter } from '../utils/isMobile.js'
import { useThemeSettings } from '../../../components/DataSource/useActivatedUI.js'

export function useThemeTwitterVariant(baseTheme: Theme) {
    const themeSettings = useThemeSettings()

    return useMemo(() => {
        const primaryColorRGB = fromRGB(themeSettings.color)!
        const primaryContrastColorRGB = fromRGB('rgb(255, 255, 255)')
        setAutoFreeze(false)

        const TwitterTheme = produce(baseTheme, (theme) => {
            theme.palette.primary = {
                light: toRGB(shade(primaryColorRGB, 10)),
                main: toRGB(primaryColorRGB),
                dark: toRGB(shade(primaryColorRGB, -10)),
                contrastText: toRGB(primaryContrastColorRGB),
            }
            theme.shape.borderRadius = isMobileTwitter ? 0 : 15
            theme.breakpoints.values = { xs: 0, sm: 687, md: 1024, lg: 1280, xl: 1920 }
            theme.components = theme.components || {}

            theme.components.MuiTypography = {
                styleOverrides: {
                    root: {
                        fontFamily:
                            'TwitterChirp, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
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
            theme.components.MuiBackdrop = {
                styleOverrides: {
                    root: {
                        backgroundColor: theme.palette.action.mask,
                    },
                    invisible: {
                        opacity: '0 !important',
                    },
                },
            }
        })
        setAutoFreeze(true)
        return unstable_createMuiStrictModeTheme(TwitterTheme)
    }, [baseTheme, themeSettings])
}
