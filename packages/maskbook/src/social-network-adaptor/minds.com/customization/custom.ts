import { MutationObserverWatcher, ValueRef } from '@dimensiondev/holoflows-kit'
import { PaletteMode, ThemeProvider, unstable_createMuiStrictModeTheme } from '@material-ui/core'
import produce, { setAutoFreeze } from 'immer'
import { createElement, useMemo } from 'react'
import { Appearance } from '@masknet/theme'
import type { SocialNetworkUI } from '../../../social-network'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import { useClassicMaskTheme } from '../../../utils/theme'
import { fromRGB, getBackgroundColor, getForegroundColor, isDark, shade, toRGB } from '../../../utils/theme-tools'
import { themeListItemSelector } from '../utils/selector'

// TODO: get this from DOM. But currently Minds has a single primary color
const primaryColorRef = new ValueRef(toRGB([68, 170, 255]))
const primaryColorContrastColorRef = new ValueRef(toRGB([255, 255, 255]))
const backgroundColorRef = new ValueRef(toRGB([255, 255, 255]))

export const PaletteModeProviderMinds: SocialNetworkUI.Customization.PaletteModeProvider = {
    current: new ValueRef<PaletteMode>('light'),
    start: startWatchThemeColor,
}

export function startWatchThemeColor(signal: AbortSignal) {
    function updateThemeColor() {
        const contrastColor = getForegroundColor(themeListItemSelector().evaluate()!)
        const backgroundColor = getBackgroundColor(document.body)
        PaletteModeProviderMinds.current.value = isDark(fromRGB(backgroundColor)!) ? 'dark' : 'light'

        if (contrastColor) primaryColorContrastColorRef.value = contrastColor
        if (backgroundColor) backgroundColorRef.value = backgroundColor
    }

    const watcher = new MutationObserverWatcher(themeListItemSelector())
        .addListener('onAdd', updateThemeColor)
        .addListener('onChange', updateThemeColor)
        .startWatch({
            childList: true,
            subtree: true,
        })
    signal.addEventListener('abort', () => watcher.stopWatch())
}

export function useThemeMindsVariant() {
    const primaryColor = useValueRef(primaryColorRef)
    const primaryContrastColor = useValueRef(primaryColorContrastColorRef)
    const backgroundColor = useValueRef(backgroundColorRef)
    const MaskbookTheme = useClassicMaskTheme({
        appearance: isDark(fromRGB(backgroundColor)!) ? Appearance.dark : Appearance.light,
    })
    return useMemo(() => {
        const primaryColorRGB = fromRGB(primaryColor)!
        const primaryContrastColorRGB = fromRGB(primaryContrastColor)
        setAutoFreeze(false)

        const MindsTheme = produce(MaskbookTheme, (theme) => {
            theme.palette.background.paper = backgroundColor
            theme.palette.primary = {
                light: toRGB(shade(primaryColorRGB, 10)),
                main: toRGB(primaryColorRGB),
                dark: toRGB(shade(primaryColorRGB, -10)),
                contrastText: toRGB(primaryContrastColorRGB),
            }
            theme.shape.borderRadius = 15
            theme.breakpoints.values = { xs: 0, sm: 687, md: 1024, lg: 1220, xl: 1920 }
            theme.components = theme.components || {}
            theme.components.MuiButton = {
                defaultProps: {
                    size: 'medium',
                    disableElevation: true,
                },
                styleOverrides: {
                    root: {
                        borderRadius: 500,
                        textTransform: 'initial',
                        fontWeight: 'bold',
                        minHeight: 39,
                        paddingLeft: 15,
                        paddingRight: 15,
                        boxShadow: 'none',
                        [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
                            '&': {
                                height: '28px !important',
                                minHeight: 'auto !important',
                                padding: '0 14px !important',
                            },
                        },
                    },
                    sizeLarge: {
                        minHeight: 49,
                        paddingLeft: 30,
                        paddingRight: 30,
                    },
                    sizeSmall: {
                        minHeight: 30,
                        paddingLeft: 15,
                        paddingRight: 15,
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
        return unstable_createMuiStrictModeTheme(MindsTheme)
    }, [MaskbookTheme, backgroundColor, primaryColor, primaryContrastColor])
}

export function MindsThemeProvider(props: Required<React.PropsWithChildren<{}>>) {
    if (!process.env.STORYBOOK) throw new Error('This API is only for Storybook!')
    return createElement(ThemeProvider, { theme: useThemeMindsVariant(), ...props })
}
