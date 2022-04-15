import { MutationObserverWatcher, ValueRef } from '@dimensiondev/holoflows-kit'
import { createSubscriptionFromValueRef } from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared-base-ui'
import { PaletteMode, Theme, unstable_createMuiStrictModeTheme } from '@mui/material'
import produce, { setAutoFreeze } from 'immer'
import { useMemo } from 'react'
import type { SocialNetworkUI } from '../../../social-network'
import { fromRGB, getBackgroundColor, getForegroundColor, isDark, shade, toRGB } from '../../../utils/theme'
import { isMobileTwitter } from '../utils/isMobile'
import { composeAnchorSelector, composeAnchorTextSelector, headingTextSelector } from '../utils/selector'
import twitterColorSchema from './twitter-color-schema.json'
import { parseColor } from '@masknet/theme'
import { noop } from 'lodash-unified'

const themeColorRef = new ValueRef('rgb(29, 161, 242)')
const textColorRef = new ValueRef('rgb(255, 255, 255)')
const backgroundColorRef = new ValueRef('rgb(255, 255, 255)')

const currentTheme = new ValueRef<PaletteMode>('light')
export const PaletteModeProviderTwitter: SocialNetworkUI.Customization.PaletteModeProvider = {
    current: createSubscriptionFromValueRef(currentTheme),
    start: startWatchThemeColor,
}

export function startWatchThemeColor(signal: AbortSignal) {
    function updateThemeColor() {
        const composeAnchor = composeAnchorSelector().evaluate()
        const anchorText = composeAnchorTextSelector().evaluate()
        const headingText = headingTextSelector().evaluate()
        const themeColor = getBackgroundColor(composeAnchor)
        const textColor = getForegroundColor(anchorText || headingText)
        const backgroundColor = getBackgroundColor(document.body)
        currentTheme.value = isDark(fromRGB(backgroundColor)!) ? 'dark' : 'light'

        if (themeColor) themeColorRef.value = themeColor
        if (textColor) textColorRef.value = textColor
        if (backgroundColor) backgroundColorRef.value = backgroundColor
    }
    const watcher = new MutationObserverWatcher(composeAnchorSelector())
        .addListener('onAdd', updateThemeColor)
        .addListener('onChange', updateThemeColor)
        .startWatch({
            childList: true,
            subtree: true,
        })
    const unwatchAnchor = () => watcher.stopWatch()
    let unwatchHeadingText = noop

    if (isMobileTwitter) {
        const headingWatcher = new MutationObserverWatcher(headingTextSelector())
            .addListener('onAdd', updateThemeColor)
            .addListener('onChange', updateThemeColor)
            .startWatch({
                childList: true,
                subtree: true,
            })
        unwatchHeadingText = () => headingWatcher.stopWatch()
    }
    signal.addEventListener('abort', () => {
        unwatchAnchor()
        unwatchHeadingText()
    })
}
export function useThemeTwitterVariant(baseTheme: Theme) {
    const primaryColor = useValueRef(themeColorRef)
    const primaryContrastColor = useValueRef(textColorRef)
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
            theme.palette.secondaryDivider = colorSchema.secondaryDivider
            theme.shape.borderRadius = isMobileTwitter ? 0 : 15
            theme.breakpoints.values = { xs: 0, sm: 687, md: 1024, lg: 1280, xl: 1920 }
            theme.components = theme.components || {}
            const smallQuery = `@media (max-width: ${theme.breakpoints.values.sm}px)`
            theme.components.MuiButton = {
                defaultProps: {
                    size: 'medium',
                    disableElevation: true,
                    variant: 'contained',
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
                    {
                        props: { color: 'error' },
                        style: {
                            backgroundColor: theme.palette.error.main,
                            color: theme.palette.common.white,
                            '&:hover': {
                                backgroundColor: '#f53b47',
                            },
                        },
                    },
                ],
                styleOverrides: {
                    root: {
                        borderRadius: 500,
                        textTransform: 'initial',
                        fontWeight: 600,
                        minHeight: 39,
                        paddingLeft: 15,
                        paddingRight: 15,
                        boxShadow: 'none',
                        [smallQuery]: {
                            '&': {
                                height: 30,
                                minHeight: 'auto !important',
                                padding: '0 14px !important',
                            },
                        },
                    },
                    contained: {
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
                        borderColor: theme.palette.secondaryDivider,
                        backgroundColor: 'transparent',
                        '&:hover': {
                            color: theme.palette.action.buttonHover,
                            borderColor: theme.palette.secondaryDivider,
                            backgroundColor: parseColor(theme.palette.text.primary).setAlpha(0.1).toRgbString(),
                        },
                        '&.Mui-disabled': {
                            opacity: 0.5,
                            color: theme.palette.text.strong,
                            backgroundColor: 'transparent',
                        },
                    },
                    sizeLarge: {
                        minHeight: 40,
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
                    colorPrimary: {
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.common.white,
                        '&:hover': {
                            backgroundColor: `${theme.palette.primary.main} !important`,
                            opacity: 0.9,
                        },
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
            theme.components.MuiTooltip = {
                styleOverrides: {
                    tooltip: {
                        backgroundColor: theme.palette.background.tipMask,
                        color: theme.palette.text.buttonText,
                        borderRadius: 8,
                    },
                    tooltipArrow: {
                        backgroundColor: theme.palette.background.tipMask,
                    },
                    arrow: {
                        color: theme.palette.background.tipMask,
                    },
                },
            }
            theme.components.MuiSnackbar = {
                styleOverrides: {
                    root: {
                        filter: `drop-shadow(0px 0px 16px ${theme.palette.background.messageShadow});`,
                    },
                },
            }
        })
        setAutoFreeze(true)
        return unstable_createMuiStrictModeTheme(TwitterTheme)
    }, [baseTheme, backgroundColor, primaryColor, primaryContrastColor])
}
