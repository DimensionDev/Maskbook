import { produce, setAutoFreeze } from 'immer'
import { MaskTheme } from '@masknet/theme'

export function getThemeInstagramVariant() {
    setAutoFreeze(false)

    const InstagramTheme = produce(MaskTheme, (theme) => {
        theme.components ||= {}
        theme.components.MuiTypography = {
            styleOverrides: {
                root: {
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                },
            },
        }
    })
    setAutoFreeze(true)
    return InstagramTheme
}
