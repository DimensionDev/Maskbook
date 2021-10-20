import { ValueRef } from '@dimensiondev/holoflows-kit'
import { PaletteMode, ThemeProvider, unstable_createMuiStrictModeTheme } from '@mui/material'
import produce, { setAutoFreeze } from 'immer'
import { createElement, useMemo } from 'react'
import { Appearance } from '@masknet/theme'
import { useValueRef } from '@masknet/shared'
import type { SocialNetworkUI } from '../../../social-network'
import { useClassicMaskTheme } from '../../../utils/theme'
import { fromRGB, isDark, shade, toRGB } from '../../../utils/theme-tools'

const primaryColorRef = new ValueRef(toRGB([29, 161, 242]))
const primaryColorContrastColorRef = new ValueRef(toRGB([255, 255, 255]))
const backgroundColorRef = new ValueRef(toRGB([255, 255, 255]))

export const PaletteModeProviderFacebook: SocialNetworkUI.Customization.PaletteModeProvider = {
    current: new ValueRef<PaletteMode>('light'),
    start: startWatchThemeColor,
}

export function startWatchThemeColor(signal: AbortSignal) {
    function updateThemeColor(isDarkMode: boolean) {
        const contrastColor = 'rgb(255,255,255)'
        const backgroundColor = isDarkMode ? 'rgb(0,0,0)' : 'rgb(255,255,255)'
        PaletteModeProviderFacebook.current.value = isDark(fromRGB(backgroundColor)!) ? 'dark' : 'light'
        primaryColorContrastColorRef.value = contrastColor
        backgroundColorRef.value = backgroundColor
    }

    const htmlElement = document.querySelector('html')

    updateThemeColor(Boolean(htmlElement?.className.includes('dark-mode')))

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            updateThemeColor(!mutation.oldValue?.includes('dark-mode'))
        })
    })

    observer.observe(document.querySelector('html') as Node, {
        attributes: true,
        attributeOldValue: true,
        attributeFilter: ['class'],
    })

    signal.addEventListener('abort', () => observer.disconnect())
}

export function useThemeFacebookVariant() {
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

        const FacebookTheme = produce(MaskbookTheme, (theme) => {
            theme.palette.background.paper = backgroundColor
            theme.palette.primary = {
                light: toRGB(shade(primaryColorRGB, 10)),
                main: toRGB(primaryColorRGB),
                dark: toRGB(shade(primaryColorRGB, -10)),
                contrastText: toRGB(primaryContrastColorRGB),
            }
            theme.shape.borderRadius = 15
            theme.breakpoints.values = { xs: 0, sm: 687, md: 1024, lg: 1280, xl: 1920 }
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
        return unstable_createMuiStrictModeTheme(FacebookTheme)
    }, [MaskbookTheme, backgroundColor, primaryColor, primaryContrastColor])
}

export function FacebookThemeProvider(props: Required<React.PropsWithChildren<{}>>) {
    if (!process.env.STORYBOOK) throw new Error('This API is only for Storybook!')
    return createElement(ThemeProvider, { theme: useThemeFacebookVariant(), ...props })
}
