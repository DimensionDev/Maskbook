import { produce, setAutoFreeze } from 'immer'
import { colorChannel } from '@mui/system'
import { fromRGB, MaskTheme, shade, toRGB } from '@masknet/theme'
import type { ThemeSettings } from '@masknet/web3-shared-base'

export function getThemeFacebookVariant(themeSettings: ThemeSettings) {
    const primaryColorRGB = fromRGB(themeSettings.color)!
    const primaryContrastColorRGB = fromRGB('rgb(255, 255, 255)')
    setAutoFreeze(false)

    const FacebookTheme = produce(MaskTheme, (theme) => {
        const primary = {
            light: toRGB(shade(primaryColorRGB, 10)),
            main: toRGB(primaryColorRGB),
            dark: toRGB(shade(primaryColorRGB, -10)),
            contrastText: toRGB(primaryContrastColorRGB),
        }
        for (const colorScheme of Object.values(theme.colorSchemes)) {
            if (!colorScheme) continue
            colorScheme.palette.primary = {
                ...primary,
                mainChannel: colorChannel(primary.main),
                lightChannel: colorChannel(primary.light),
                darkChannel: colorChannel(primary.dark),
                contrastTextChannel: colorChannel(primary.contrastText),
            }
        }
        theme.shape.borderRadius = 15
        theme.breakpoints.values = { xs: 0, sm: 687, md: 1024, lg: 1280, xl: 1920 }
        theme.components ||= {}
        theme.components.MuiTypography = {
            styleOverrides: {
                root: {
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
    return FacebookTheme
}
