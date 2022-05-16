import { MutationObserverWatcher, ValueRef } from '@dimensiondev/holoflows-kit'
import { createSubscriptionFromValueRef } from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared-base-ui'
import { PaletteMode, Theme, unstable_createMuiStrictModeTheme, buttonClasses } from '@mui/material'
import produce, { setAutoFreeze } from 'immer'
import { useMemo } from 'react'
import type { SocialNetworkUI } from '../../../social-network'
import { fromRGB, getBackgroundColor, getForegroundColor, isDark, shade, toRGB } from '../../../utils/theme'
import { isMobileTwitter } from '../utils/isMobile'
import { composeAnchorSelector, composeAnchorTextSelector, headingTextSelector } from '../utils/selector'
import twitterColorSchema from './twitter-color-schema.json'
import { noop } from 'lodash-unified'
import { parseColor } from '@masknet/theme'

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
            const isDark = theme.palette.mode === 'dark'
            theme.palette.primary = {
                light: toRGB(shade(primaryColorRGB, 10)),
                main: toRGB(primaryColorRGB),
                dark: toRGB(shade(primaryColorRGB, -10)),
                contrastText: toRGB(primaryContrastColorRGB),
            }
            const themeName = isDark ? 'dark' : 'light'

            const colorSchema = twitterColorSchema[themeName]
            const colors = Object.keys(colorSchema) as Array<keyof typeof colorSchema>
            colors.forEach((color) => {
                if (typeof theme.palette[color] === 'object') {
                    Object.assign(theme.palette[color], colorSchema[color])
                }
            })

            theme.palette.public = colorSchema.public
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
                        props: {
                            size: 'small',
                        },
                        style: {
                            padding: '8px 12px',
                            borderRadius: 6,
                            fontSize: 12,
                            lineHeight: '16px',
                        },
                    },
                    {
                        props: {
                            size: 'medium',
                        },
                        style: {
                            padding: '11px 18px',
                            borderRadius: 8,
                            fontSize: 14,
                            lineHeight: '18px',
                        },
                    },
                    {
                        props: {
                            size: 'large',
                        },
                        style: {
                            padding: '14px 20px',
                            borderRadius: 10,
                            fontSize: 16,
                            lineHeight: '20px',
                        },
                    },
                    {
                        props: {
                            variant: 'outlined',
                        },
                        style: {
                            background: theme.palette.grey.third,
                            color: theme.palette.text.primary,
                            ['&:hover']: {
                                backgroundColor: theme.palette.background.paper,
                                border: 'none',
                                boxShadow:
                                    theme.palette.mode === 'dark'
                                        ? '0 8px 25px rgba(255, 255, 255, 0.1)'
                                        : '0 8px 25px rgba(0, 0, 0, 0.1)',
                            },
                            [`&.${buttonClasses.disabled}`]: {
                                opacity: 0.4,
                                color: theme.palette.text.primary,
                            },
                        },
                    },
                    {
                        props: {
                            variant: 'flat',
                        },
                        style: {
                            background: theme.palette.grey.third,
                            color: theme.palette.text.primary,
                            ['&:hover']: {
                                backgroundColor: theme.palette.background.paper,
                                boxShadow:
                                    theme.palette.mode === 'dark'
                                        ? '0 8px 25px rgba(255, 255, 255, 0.1)'
                                        : '0 8px 25px rgba(0, 0, 0, 0.1)',
                            },
                            [`&.${buttonClasses.disabled}`]: {
                                opacity: 0.4,
                                color: theme.palette.text.primary,
                            },
                        },
                    },
                    {
                        props: {
                            variant: 'contained',
                        },
                        style: {
                            backgroundColor: theme.palette.text.primary,
                            ['&:hover']: {
                                backgroundColor: theme.palette.text.primary,
                                boxShadow:
                                    theme.palette.mode === 'dark'
                                        ? '0 8px 25px rgba(255, 255, 255, 0.2)'
                                        : '0 8px 25px rgba(0, 0, 0, 0.2)',
                            },
                            [`&.${buttonClasses.disabled}`]: {
                                background: theme.palette.grey.primary,
                                opacity: 0.6,
                                color: theme.palette.background.paper,
                            },
                        },
                    },
                    {
                        props: {
                            variant: 'text',
                        },
                        style: {
                            color: theme.palette.text.primary,
                            ['&:hover']: {
                                background: theme.palette.grey.third,
                            },
                            [`&.${buttonClasses.disabled}`]: {
                                opacity: 0.4,
                            },
                        },
                    },
                    // info button
                    {
                        props: {
                            variant: 'contained',
                            color: 'info',
                        },
                        style: {
                            background: theme.palette.public.primary,
                            color: theme.palette.public.white,
                            ['&:hover']: {
                                background: theme.palette.public.primary,
                                boxShadow: `0 8px 25px ${parseColor(theme.palette.public.primary)
                                    .setAlpha(0.3)
                                    .toRgbString()}`,
                            },
                            [`&.${buttonClasses.disabled}`]: {
                                background: parseColor(theme.palette.public.primary).setAlpha(0.3).toRgbString(),
                                opacity: 0.6,
                            },
                        },
                    },
                    {
                        props: {
                            variant: 'flat',
                            color: 'info',
                        },
                        style: {
                            backgroundColor: parseColor(theme.palette.public.primary).setAlpha(0.1).toRgbString(),
                            color: theme.palette.public.primary,
                            ['&:hover']: {
                                background:
                                    theme.palette.mode === 'dark'
                                        ? parseColor(theme.palette.public.primary).setAlpha(0.3).toRgbString()
                                        : theme.palette.public.white,
                                boxShadow: `0 8px 25px ${parseColor(theme.palette.public.primary)
                                    .setAlpha(0.1)
                                    .toRgbString()}`,
                            },
                            [`&.${buttonClasses.disabled}`]: {
                                color: theme.palette.public.primary,
                                background: parseColor(theme.palette.public.primary).setAlpha(0.1).toRgbString(),
                                opacity: 0.4,
                            },
                        },
                    },
                    {
                        props: {
                            variant: 'text',
                            color: 'info',
                        },
                        style: {
                            color: theme.palette.public.primary,
                            ['&:hover']: {
                                background: parseColor(theme.palette.public.primary).setAlpha(0.1).toRgbString(),
                            },
                            [`&.${buttonClasses.disabled}`]: {
                                color: theme.palette.public.primary,
                                opacity: 0.4,
                            },
                        },
                    },

                    // warning button
                    {
                        props: {
                            variant: 'contained',
                            color: 'warning',
                        },
                        style: {
                            backgroundColor: theme.palette.public.warning,
                            color: theme.palette.public.white,
                            ['&:hover']: {
                                background: theme.palette.public.warning,
                                boxShadow: `0 8px 25px ${parseColor(theme.palette.public.warning)
                                    .setAlpha(0.3)
                                    .toRgbString()}`,
                            },
                            [`&.${buttonClasses.disabled}`]: {
                                background: parseColor(theme.palette.public.warning).setAlpha(0.5).toRgbString(),
                                opacity: 0.6,
                            },
                        },
                    },
                    {
                        props: {
                            variant: 'flat',
                            color: 'warning',
                        },
                        style: {
                            backgroundColor: parseColor(theme.palette.public.warning).setAlpha(0.1).toRgbString(),
                            color: theme.palette.public.warning,
                            ['&:hover']: {
                                background:
                                    theme.palette.mode === 'dark'
                                        ? parseColor(theme.palette.public.warning).setAlpha(0.3).toRgbString()
                                        : theme.palette.public.white,
                                boxShadow: `0 8px 25px ${parseColor(theme.palette.public.warning)
                                    .setAlpha(0.1)
                                    .toRgbString()}`,
                            },
                            [`&.${buttonClasses.disabled}`]: {
                                color: theme.palette.public.warning,
                                background: parseColor(theme.palette.public.warning).setAlpha(0.1).toRgbString(),
                                opacity: 0.4,
                            },
                        },
                    },
                    {
                        props: {
                            variant: 'text',
                            color: 'warning',
                        },
                        style: {
                            color: theme.palette.public.warning,
                            ['&:hover']: {
                                background: parseColor(theme.palette.public.warning).setAlpha(0.1).toRgbString(),
                            },
                            [`&.${buttonClasses.disabled}`]: {
                                color: theme.palette.public.warning,
                                opacity: 0.4,
                            },
                        },
                    },

                    // success button
                    {
                        props: {
                            variant: 'contained',
                            color: 'success',
                        },
                        style: {
                            background: theme.palette.public.success,
                            color: theme.palette.public.white,
                            ['&:hover']: {
                                background: theme.palette.public.success,
                                boxShadow: `0 8px 25px ${parseColor(theme.palette.public.success)
                                    .setAlpha(0.3)
                                    .toRgbString()}`,
                            },
                            [`&.${buttonClasses.disabled}`]: {
                                background: parseColor(theme.palette.public.success).setAlpha(0.5).toRgbString(),
                                opacity: 0.6,
                            },
                        },
                    },
                    {
                        props: {
                            variant: 'flat',
                            color: 'success',
                        },
                        style: {
                            background: parseColor(theme.palette.public.success).setAlpha(0.1).toRgbString(),
                            color: theme.palette.public.warning,
                            ['&:hover']: {
                                background:
                                    theme.palette.mode === 'dark'
                                        ? parseColor(theme.palette.public.success).setAlpha(0.3).toRgbString()
                                        : theme.palette.public.white,
                                boxShadow: `0 8px 25px ${parseColor(theme.palette.public.success)
                                    .setAlpha(0.1)
                                    .toRgbString()}`,
                            },
                            [`&.${buttonClasses.disabled}`]: {
                                color: theme.palette.public.success,
                                background: parseColor(theme.palette.public.success).setAlpha(0.1).toRgbString(),
                                opacity: 0.4,
                            },
                        },
                    },
                    {
                        props: {
                            variant: 'text',
                            color: 'success',
                        },
                        style: {
                            color: theme.palette.public.success,
                            ['&:hover']: {
                                background: parseColor(theme.palette.public.success).setAlpha(0.1).toRgbString(),
                            },
                            [`&.${buttonClasses.disabled}`]: {
                                color: theme.palette.public.success,
                                opacity: 0.4,
                            },
                        },
                    },

                    // error button
                    {
                        props: {
                            variant: 'contained',
                            color: 'error',
                        },
                        style: {
                            backgroundColor: theme.palette.public.danger,
                            color: theme.palette.public.white,
                            ['&:hover']: {
                                background: theme.palette.public.danger,
                                boxShadow: `0 8px 25px ${parseColor(theme.palette.public.danger)
                                    .setAlpha(0.3)
                                    .toRgbString()}`,
                            },
                            [`&.${buttonClasses.disabled}`]: {
                                background: parseColor(theme.palette.public.danger).setAlpha(0.5).toRgbString(),
                                opacity: 0.6,
                            },
                        },
                    },
                    {
                        props: {
                            variant: 'flat',
                            color: 'error',
                        },
                        style: {
                            backgroundColor: parseColor(theme.palette.public.danger).setAlpha(0.1).toRgbString(),
                            color: theme.palette.public.danger,
                            ['&:hover']: {
                                background:
                                    theme.palette.mode === 'dark'
                                        ? parseColor(theme.palette.public.danger).setAlpha(0.3).toRgbString()
                                        : theme.palette.public.white,
                                boxShadow: `0 8px 25px ${parseColor(theme.palette.public.danger)
                                    .setAlpha(0.1)
                                    .toRgbString()}`,
                            },
                            [`&.${buttonClasses.disabled}`]: {
                                color: theme.palette.public.danger,
                                background: parseColor(theme.palette.public.danger).setAlpha(0.1).toRgbString(),
                                opacity: 0.4,
                            },
                        },
                    },
                    {
                        props: {
                            variant: 'text',
                            color: 'error',
                        },
                        style: {
                            color: theme.palette.public.danger,
                            ['&:hover']: {
                                background: parseColor(theme.palette.public.danger).setAlpha(0.1).toRgbString(),
                            },
                            [`&.${buttonClasses.disabled}`]: {
                                color: theme.palette.public.danger,
                                opacity: 0.4,
                            },
                        },
                    },

                    // rounded button
                    {
                        props: {
                            variant: 'roundedFlat',
                        },
                        style: {
                            borderRadius: 99,
                            background: theme.palette.grey.third,
                            color: theme.palette.text.primary,
                            ['&:hover']: {
                                backgroundColor: theme.palette.background.paper,
                                boxShadow:
                                    theme.palette.mode === 'dark'
                                        ? '0 8px 25px rgba(255, 255, 255, 0.1)'
                                        : '0 8px 25px rgba(0, 0, 0, 0.1)',
                            },
                            [`&.${buttonClasses.disabled}`]: {
                                opacity: 0.4,
                                color: theme.palette.text.primary,
                            },
                        },
                    },
                    {
                        props: {
                            variant: 'roundedContained',
                        },
                        style: {
                            backgroundColor: theme.palette.text.primary,
                            borderRadius: 99,
                            ['&:hover']: {
                                backgroundColor: theme.palette.text.primary,
                                boxShadow: `0 8px 25px ${parseColor(theme.palette.text.primary)
                                    .setAlpha(0.3)
                                    .toRgbString()}`,
                            },
                            [`&.${buttonClasses.disabled}`]: {
                                background: theme.palette.grey.primary,
                                opacity: 0.6,
                                color: theme.palette.background.paper,
                            },
                        },
                    },
                    {
                        props: {
                            variant: 'roundedText',
                        },
                        style: {
                            color: theme.palette.text.primary,
                            borderRadius: 99,
                            ['&:hover']: {
                                background: theme.palette.grey.third,
                            },
                            [`&.${buttonClasses.disabled}`]: {
                                opacity: 0.4,
                            },
                        },
                    },
                    {
                        props: {
                            variant: 'roundedContained',
                            color: 'info',
                        },
                        style: {
                            background: theme.palette.public.primary,
                            color: theme.palette.public.white,
                            borderRadius: 99,
                            ['&:hover']: {
                                background: theme.palette.public.primary,
                                boxShadow: `0 8px 25px ${parseColor(theme.palette.public.primary)
                                    .setAlpha(0.3)
                                    .toRgbString()}`,
                            },
                            [`&.${buttonClasses.disabled}`]: {
                                background: parseColor(theme.palette.public.primary).setAlpha(0.3).toRgbString(),
                                opacity: 0.6,
                            },
                        },
                    },
                    {
                        props: {
                            variant: 'roundedFlat',
                            color: 'info',
                        },
                        style: {
                            backgroundColor: parseColor(theme.palette.public.primary).setAlpha(0.1).toRgbString(),
                            color: theme.palette.public.primary,
                            borderRadius: 99,
                            ['&:hover']: {
                                background:
                                    theme.palette.mode === 'dark'
                                        ? parseColor(theme.palette.public.primary).setAlpha(0.3).toRgbString()
                                        : theme.palette.public.white,
                                boxShadow: `0 8px 25px ${parseColor(theme.palette.public.primary)
                                    .setAlpha(0.1)
                                    .toRgbString()}`,
                            },
                            [`&.${buttonClasses.disabled}`]: {
                                color: theme.palette.public.primary,
                                background: parseColor(theme.palette.public.primary).setAlpha(0.1).toRgbString(),
                                opacity: 0.4,
                            },
                        },
                    },
                    {
                        props: {
                            variant: 'roundedText',
                            color: 'info',
                        },
                        style: {
                            color: theme.palette.public.primary,
                            borderRadius: 99,
                            ['&:hover']: {
                                background: parseColor(theme.palette.public.primary).setAlpha(0.1).toRgbString(),
                            },
                            [`&.${buttonClasses.disabled}`]: {
                                color: theme.palette.public.primary,
                                opacity: 0.4,
                            },
                        },
                    },
                ],
                styleOverrides: {
                    root: {
                        textTransform: 'initial',
                        fontWeight: 700,
                        color: theme.palette.background.paper,
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
                        filter: `drop-shadow(0 0 16px ${theme.palette.background.messageShadow});`,
                    },
                },
            }
        })
        setAutoFreeze(true)
        return unstable_createMuiStrictModeTheme(TwitterTheme)
    }, [baseTheme, backgroundColor, primaryColor, primaryContrastColor])
}
