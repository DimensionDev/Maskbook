import { MutationObserverWatcher, ValueRef } from '@dimensiondev/holoflows-kit'
import { SubscriptionFromValueRef, useValueRef } from '@masknet/shared'
import { PaletteMode, Theme, unstable_createMuiStrictModeTheme } from '@mui/material'
import produce, { setAutoFreeze } from 'immer'
import { useMemo } from 'react'
import type { SocialNetworkUI } from '../../../social-network'
import { fromRGB, getBackgroundColor, getForegroundColor, isDark, shade, toRGB } from '../../../utils/theme-tools'
import { isMobileTwitter } from '../utils/isMobile'
import { composeAnchorSelector, composeAnchorTextSelector } from '../utils/selector'
import twitterColorSchema from './twitter-color-schema.json'
import { parseColor } from '@masknet/theme'

const primaryColorRef = new ValueRef(toRGB([29, 161, 242]))
const primaryColorContrastColorRef = new ValueRef(toRGB([255, 255, 255]))
const backgroundColorRef = new ValueRef(toRGB([255, 255, 255]))

const currentTheme = new ValueRef<PaletteMode>('light')
export const PaletteModeProviderTwitter: SocialNetworkUI.Customization.PaletteModeProvider = {
    current: SubscriptionFromValueRef(currentTheme),
    start: startWatchThemeColor,
}

export function startWatchThemeColor(signal: AbortSignal) {
    function updateThemeColor() {
        const color = getBackgroundColor(composeAnchorSelector().evaluate()!)
        const contrastColor = getForegroundColor(composeAnchorTextSelector().evaluate()!)
        const backgroundColor = getBackgroundColor(document.body)
        currentTheme.value = isDark(fromRGB(backgroundColor)!) ? 'dark' : 'light'

        if (color) primaryColorRef.value = color
        if (contrastColor) primaryColorContrastColorRef.value = contrastColor
        if (backgroundColor) backgroundColorRef.value = backgroundColor
    }
    const watcher = new MutationObserverWatcher(composeAnchorSelector())
        .addListener('onAdd', updateThemeColor)
        .addListener('onChange', updateThemeColor)
        .startWatch({
            childList: true,
            subtree: true,
        })
    signal.addEventListener('abort', () => watcher.stopWatch())
}
export function useThemeTwitterVariant(baseTheme: Theme) {
    const primaryColor = useValueRef(primaryColorRef)
    const primaryContrastColor = useValueRef(primaryColorContrastColorRef)
    const backgroundColor = useValueRef(backgroundColorRef)
    return useMemo(() => {
        const primaryColorRGB = fromRGB(primaryColor)!
        const primaryContrastColorRGB = fromRGB(primaryContrastColor)
        setAutoFreeze(false)

        const TwitterTheme = produce(baseTheme, (theme) => {
            theme.palette.background.paper = backgroundColor
            const isDark = theme.palette.mode === 'dark'
            const isDarker = backgroundColor === 'rgb(0,0,0)'
            theme.palette.primary = {
                light: toRGB(shade(primaryColorRGB, 10)),
                main: toRGB(primaryColorRGB),
                dark: toRGB(shade(primaryColorRGB, -10)),
                contrastText: toRGB(primaryContrastColorRGB),
            }
            const themeName = isDark ? (isDarker ? 'darker' : 'dark') : 'light'

            // Just for design
            if (themeName === 'dark') {
                theme.palette.background.paper = '#151D26'
            }

            const colorSchema = twitterColorSchema[themeName]
            const colors = Object.keys(colorSchema) as Array<keyof typeof colorSchema>
            colors.forEach((color) => {
                if (typeof theme.palette[color] === 'object') {
                    Object.assign(theme.palette[color], colorSchema[color])
                }
            })
            theme.palette.divider = colorSchema.divider
            theme.palette.divider2 = colorSchema.divider2
            theme.shape.borderRadius = isMobileTwitter ? 0 : 15
            theme.breakpoints.values = { xs: 0, sm: 687, md: 1024, lg: 1280, xl: 1920 }
            theme.components = theme.components || {}
            const smallQuery = `@media (max-width: ${theme.breakpoints.values.sm}px)`
            theme.components.MuiButton = {
                defaultProps: {
                    size: 'medium',
                    disableElevation: true,
                },
                variants: [
                    {
                        props: { variant: 'sns' },
                        style: {
                            backgroundColor: theme.palette.primary.main,
                            color: theme.palette.common.white,
                            '&:hover': {
                                backgroundColor: theme.palette.primary.dark,
                                color: theme.palette.common.white,
                            },
                            '&.Mui-disabled': {
                                opacity: 0.5,
                                backgroundColor: theme.palette.primary.main,
                                color: theme.palette.common.white,
                            },
                        },
                    },
                ],
                styleOverrides: {
                    root: {
                        borderRadius: 500,
                        textTransform: 'initial',
                        fontWeight: 'bold',
                        minHeight: 39,
                        paddingLeft: 15,
                        paddingRight: 15,
                        boxShadow: 'none',
                        backgroundColor: theme.palette.text.primary,
                        color: theme.palette.text.buttonText,
                        '&.Mui-disabled': {
                            opacity: 0.5,
                            backgroundColor: theme.palette.text.primary,
                            color: theme.palette.text.buttonText,
                        },
                        '&:hover': {
                            backgroundColor: theme.palette.action.buttonHover,
                        },
                        [smallQuery]: {
                            '&': {
                                height: 30,
                                minHeight: 'auto !important',
                                padding: '0 14px !important',
                            },
                        },
                    },
                    containedSecondary: {
                        backgroundColor: theme.palette.background.default,
                        color: theme.palette.text.strong,
                        '&:hover': {
                            color: theme.palette.action.buttonHover,
                            backgroundColor: theme.palette.action.bgHover,
                        },
                        '&.Mui-disabled': {
                            opacity: 0.5,
                            backgroundColor: theme.palette.background.default,
                            color: theme.palette.text.strong,
                        },
                    },
                    outlined: {
                        color: theme.palette.text.strong,
                        borderColor: theme.palette.divider2,
                        backgroundColor: 'transparent',
                        '&:hover': {
                            color: theme.palette.action.buttonHover,
                            borderColor: theme.palette.divider2,
                            backgroundColor: parseColor(theme.palette.text.primary).setAlpha(0.1).toRgbString(),
                        },
                        '&.Mui-disabled': {
                            opacity: 0.5,
                            color: theme.palette.text.strong,
                            backgroundColor: 'transparent',
                        },
                    },
                    sizeLarge: {
                        minHeight: 49,
                        paddingLeft: 30,
                        paddingRight: 30,
                        [smallQuery]: {
                            '&': {
                                height: 28,
                                minHeight: 28,
                                paddingLeft: 15,
                                paddingRight: 15,
                            },
                        },
                    },
                    sizeSmall: {
                        minHeight: 30,
                        paddingLeft: 15,
                        paddingRight: 15,
                        [smallQuery]: {
                            '&': {
                                height: 25,
                                minHeight: 29,
                                paddingLeft: 10,
                                paddingRight: 10,
                            },
                        },
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
            theme.components.MuiChip = {
                styleOverrides: {
                    root: {
                        backgroundColor: theme.palette.background.default,
                        color: theme.palette.text.strong,
                    },
                },
            }
            theme.components.MuiBackdrop = {
                styleOverrides: {
                    root: {
                        backgroundColor: theme.palette.action.mask,
                    },
                },
            }
        })
        setAutoFreeze(true)
        return unstable_createMuiStrictModeTheme(TwitterTheme)
    }, [baseTheme, backgroundColor, primaryColor, primaryContrastColor])
}
