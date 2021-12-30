import { ValueRef } from '@dimensiondev/holoflows-kit'
import { PaletteMode, Theme, unstable_createMuiStrictModeTheme } from '@mui/material'
import produce, { setAutoFreeze } from 'immer'
import { useMemo } from 'react'
import { useValueRef } from '@masknet/shared'
import { SubscriptionFromValueRef } from '@masknet/shared-base'
import type { SocialNetworkUI } from '../../../social-network'
import { fromRGB, isDark, shade, toRGB } from '../../../utils/theme-tools'

const primaryColorRef = new ValueRef(toRGB([29, 161, 242]))
const primaryColorContrastColorRef = new ValueRef(toRGB([255, 255, 255]))
const backgroundColorRef = new ValueRef(toRGB([255, 255, 255]))

const currentTheme = new ValueRef<PaletteMode>('light')
export const PaletteModeProviderFacebook: SocialNetworkUI.Customization.PaletteModeProvider = {
    current: SubscriptionFromValueRef(currentTheme),
    start: startWatchThemeColor,
}

export function startWatchThemeColor(signal: AbortSignal) {
    function updateThemeColor(isDarkMode: boolean) {
        const contrastColor = 'rgb(255,255,255)'
        const backgroundColor = isDarkMode ? 'rgb(0,0,0)' : 'rgb(255,255,255)'
        currentTheme.value = isDark(fromRGB(backgroundColor)!) ? 'dark' : 'light'
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

export function useThemeFacebookVariant(baseTheme: Theme) {
    const primaryColor = useValueRef(primaryColorRef)
    const primaryContrastColor = useValueRef(primaryColorContrastColorRef)
    const backgroundColor = useValueRef(backgroundColorRef)
    return useMemo(() => {
        const primaryColorRGB = fromRGB(primaryColor)!
        const primaryContrastColorRGB = fromRGB(primaryContrastColor)
        setAutoFreeze(false)

        const FacebookTheme = produce(baseTheme, (theme) => {
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
    }, [baseTheme, backgroundColor, primaryColor, primaryContrastColor])
}
