import { buttonClasses, unstable_createMuiStrictModeTheme } from '@mui/material'
import type { Theme } from '@mui/material/styles/createTheme'
import { useRef } from 'react'
import { activatedSocialNetworkUI } from '../../social-network'
import { useSubscription } from 'use-subscription'
import { MaskDarkTheme, MaskLightTheme } from './MaskTheme'
import { useThemeLanguage } from './useThemeLanguage'
import { createSubscriptionFromValueRef } from '@masknet/shared-base'
import { ValueRef } from '@dimensiondev/holoflows-kit'
import { useValueRef } from '@masknet/shared-base-ui'
import { languageSettings } from '../../settings/settings'
import produce, { setAutoFreeze } from 'immer'
import { MaskColors, parseColor } from '@masknet/theme'

const staticRef = createSubscriptionFromValueRef(new ValueRef('light'))
const defaultUseTheme = (t: Theme) => t
/**
 * @deprecated Should migrate to \@masknet/theme
 */
export function useClassicMaskSNSTheme() {
    const provider = useRef(activatedSocialNetworkUI.customization.paletteMode?.current || staticRef).current
    const usePostTheme = useRef(activatedSocialNetworkUI.customization.useTheme || defaultUseTheme).current
    const palette = useSubscription(provider)

    const baseTheme = palette === 'dark' ? MaskDarkTheme : MaskLightTheme

    setAutoFreeze(false)
    const maskTheme = produce(baseTheme, (theme) => {
        const colorSchema = MaskColors[theme.palette.mode]

        const colors = Object.keys(colorSchema) as Array<keyof typeof colorSchema>

        colors.forEach((color) => {
            if (typeof theme.palette[color] === 'object') {
                Object.assign(theme.palette[color] ?? {}, colorSchema[color])
            }
        })
        theme.palette.maskColor = colorSchema.maskColor
        theme.palette.divider = colorSchema.divider
        theme.palette.secondaryDivider = colorSchema.secondaryDivider
        theme.components = theme.components || {}
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
                        variant: 'contained',
                    },
                    style: {
                        backgroundColor: theme.palette.maskColor.main,
                        ['&:hover']: {
                            backgroundColor: theme.palette.maskColor.main,
                            boxShadow:
                                theme.palette.mode === 'dark'
                                    ? '0 8px 25px rgba(255, 255, 255, 0.2)'
                                    : '0 8px 25px rgba(0, 0, 0, 0.2)',
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            background: theme.palette.maskColor.primaryMain,
                            opacity: 0.6,
                            color: theme.palette.background.paper,
                        },
                    },
                },
                {
                    props: {
                        variant: 'outlined',
                    },
                    style: {
                        backgroundColor: theme.palette.maskColor.thirdMain,
                        color: theme.palette.maskColor.main,
                        border: 'none!important',
                        ['&:hover']: {
                            background: theme.palette.maskColor.bottom,
                            boxShadow: `0 8px 25px ${parseColor(theme.palette.maskColor.primary)
                                .setAlpha(0.1)
                                .toRgbString()}`,
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            color: theme.palette.maskColor.main,
                            background: theme.palette.maskColor.thirdMain,
                            opacity: 0.4,
                        },
                    },
                },
                {
                    props: {
                        variant: 'text',
                    },
                    style: {
                        color: theme.palette.maskColor.main,
                        ['&:hover']: {
                            background: theme.palette.maskColor.thirdMain,
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
                        background: theme.palette.maskColor.primary,
                        color: theme.palette.maskColor.white,
                        ['&:hover']: {
                            background: theme.palette.maskColor.primary,
                            boxShadow: `0 8px 25px ${parseColor(theme.palette.maskColor.primary)
                                .setAlpha(0.3)
                                .toRgbString()}`,
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            background: parseColor(theme.palette.maskColor.primary).setAlpha(0.3).toRgbString(),
                            opacity: 0.6,
                        },
                    },
                },
                {
                    props: {
                        variant: 'outlined',
                        color: 'info',
                    },
                    style: {
                        backgroundColor: parseColor(theme.palette.maskColor.primary).setAlpha(0.1).toRgbString(),
                        color: theme.palette.maskColor.primary,
                        border: 'none!important',
                        ['&:hover']: {
                            background:
                                theme.palette.mode === 'dark'
                                    ? parseColor(theme.palette.maskColor.primary).setAlpha(0.3).toRgbString()
                                    : theme.palette.maskColor.white,
                            boxShadow: `0 8px 25px ${parseColor(theme.palette.maskColor.primary)
                                .setAlpha(0.1)
                                .toRgbString()}`,
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            color: theme.palette.maskColor.primary,
                            background: parseColor(theme.palette.maskColor.primary).setAlpha(0.1).toRgbString(),
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
                        color: theme.palette.maskColor.primary,
                        ['&:hover']: {
                            background: parseColor(theme.palette.maskColor.primary).setAlpha(0.1).toRgbString(),
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            color: theme.palette.maskColor.primary,
                            opacity: 0.4,
                        },
                    },
                },

                // warn button
                {
                    props: {
                        variant: 'contained',
                        color: 'warning',
                    },
                    style: {
                        backgroundColor: theme.palette.maskColor.warn,
                        color: theme.palette.maskColor.white,
                        ['&:hover']: {
                            background: theme.palette.maskColor.warn,
                            boxShadow: `0 8px 25px ${parseColor(theme.palette.maskColor.warn)
                                .setAlpha(0.3)
                                .toRgbString()}`,
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            background: parseColor(theme.palette.maskColor.warn).setAlpha(0.5).toRgbString(),
                            opacity: 0.6,
                        },
                    },
                },
                {
                    props: {
                        variant: 'outlined',
                        color: 'warning',
                    },
                    style: {
                        backgroundColor: parseColor(theme.palette.maskColor.warn).setAlpha(0.1).toRgbString(),
                        color: theme.palette.maskColor.warn,
                        border: 'none!important',
                        ['&:hover']: {
                            background:
                                theme.palette.mode === 'dark'
                                    ? parseColor(theme.palette.maskColor.warn).setAlpha(0.3).toRgbString()
                                    : theme.palette.maskColor.white,
                            boxShadow: `0 8px 25px ${parseColor(theme.palette.maskColor.warn)
                                .setAlpha(0.1)
                                .toRgbString()}`,
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            color: theme.palette.maskColor.warn,
                            background: parseColor(theme.palette.maskColor.warn).setAlpha(0.1).toRgbString(),
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
                        color: theme.palette.maskColor.warn,
                        ['&:hover']: {
                            background: parseColor(theme.palette.maskColor.warn).setAlpha(0.1).toRgbString(),
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            color: theme.palette.maskColor.warn,
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
                        background: theme.palette.maskColor.success,
                        color: theme.palette.maskColor.white,
                        ['&:hover']: {
                            background: theme.palette.maskColor.success,
                            boxShadow: `0 8px 25px ${parseColor(theme.palette.maskColor.success)
                                .setAlpha(0.3)
                                .toRgbString()}`,
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            background: parseColor(theme.palette.maskColor.success).setAlpha(0.5).toRgbString(),
                            opacity: 0.6,
                        },
                    },
                },
                {
                    props: {
                        variant: 'outlined',
                        color: 'success',
                    },
                    style: {
                        background: parseColor(theme.palette.maskColor.success).setAlpha(0.1).toRgbString(),
                        color: theme.palette.maskColor.warn,
                        border: 'none',
                        ['&:hover']: {
                            background:
                                theme.palette.mode === 'dark'
                                    ? parseColor(theme.palette.maskColor.success).setAlpha(0.3).toRgbString()
                                    : theme.palette.maskColor.white,
                            boxShadow: `0 8px 25px ${parseColor(theme.palette.maskColor.success)
                                .setAlpha(0.1)
                                .toRgbString()}`,
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            color: theme.palette.maskColor.success,
                            background: parseColor(theme.palette.maskColor.success).setAlpha(0.1).toRgbString(),
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
                        color: theme.palette.maskColor.success,
                        ['&:hover']: {
                            background: parseColor(theme.palette.maskColor.success).setAlpha(0.1).toRgbString(),
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            color: theme.palette.maskColor.success,
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
                        backgroundColor: theme.palette.maskColor.danger,
                        color: theme.palette.maskColor.white,
                        ['&:hover']: {
                            background: theme.palette.maskColor.danger,
                            boxShadow: `0 8px 25px ${parseColor(theme.palette.maskColor.danger)
                                .setAlpha(0.3)
                                .toRgbString()}`,
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            background: parseColor(theme.palette.maskColor.danger).setAlpha(0.5).toRgbString(),
                            opacity: 0.6,
                        },
                    },
                },
                {
                    props: {
                        variant: 'outlined',
                        color: 'error',
                    },
                    style: {
                        backgroundColor: parseColor(theme.palette.maskColor.danger).setAlpha(0.1).toRgbString(),
                        color: theme.palette.maskColor.danger,
                        border: 'none',
                        ['&:hover']: {
                            background:
                                theme.palette.mode === 'dark'
                                    ? parseColor(theme.palette.maskColor.danger).setAlpha(0.3).toRgbString()
                                    : theme.palette.maskColor.white,
                            boxShadow: `0 8px 25px ${parseColor(theme.palette.maskColor.danger)
                                .setAlpha(0.1)
                                .toRgbString()}`,
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            color: theme.palette.maskColor.danger,
                            background: parseColor(theme.palette.maskColor.danger).setAlpha(0.1).toRgbString(),
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
                        color: theme.palette.maskColor.danger,
                        ['&:hover']: {
                            background: parseColor(theme.palette.maskColor.danger).setAlpha(0.1).toRgbString(),
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            color: theme.palette.maskColor.danger,
                            opacity: 0.4,
                        },
                    },
                },

                // rounded button
                {
                    props: {
                        variant: 'roundedContained',
                    },
                    style: {
                        backgroundColor: theme.palette.maskColor.main,
                        borderRadius: 99,
                        ['&:hover']: {
                            backgroundColor: theme.palette.maskColor.main,
                            boxShadow: `0 8px 25px ${parseColor(theme.palette.maskColor.main)
                                .setAlpha(0.2)
                                .toRgbString()}`,
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            background: theme.palette.maskColor.primaryMain,
                            opacity: 0.6,
                            color: theme.palette.maskColor.bottom,
                        },
                    },
                },
                {
                    props: {
                        variant: 'roundedDark',
                    },
                    style: {
                        backgroundColor: theme.palette.maskColor.dark,
                        color: theme.palette.maskColor.white,
                        borderRadius: 99,
                        ['&:hover']: {
                            backgroundColor: theme.palette.maskColor.dark,
                            boxShadow: '0 8px 25px rgba(255, 255, 255, 0.2)',
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            background: theme.palette.maskColor.secondaryDark,
                            opacity: 0.6,
                            color: theme.palette.maskColor.white,
                        },
                    },
                },
                {
                    props: {
                        variant: 'roundedOutlined',
                    },
                    style: {
                        borderRadius: 99,
                        backgroundColor: theme.palette.maskColor.thirdMain,
                        color: theme.palette.maskColor.main,
                        border: 'none!important',
                        ['&:hover']: {
                            background: theme.palette.maskColor.bottom,
                            boxShadow: `0 8px 25px ${parseColor(theme.palette.maskColor.bottom)
                                .setAlpha(0.1)
                                .toRgbString()}`,
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            opacity: 0.4,
                            color: theme.palette.maskColor.main,
                        },
                    },
                },
                {
                    props: {
                        variant: 'roundedText',
                    },
                    style: {
                        color: theme.palette.maskColor.main,
                        borderRadius: 99,
                        ['&:hover']: {
                            background: theme.palette.maskColor.thirdMain,
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
                        background: theme.palette.maskColor.primary,
                        color: theme.palette.maskColor.white,
                        borderRadius: 99,
                        ['&:hover']: {
                            background: theme.palette.maskColor.primary,
                            boxShadow: `0 8px 25px ${parseColor(theme.palette.maskColor.primary)
                                .setAlpha(0.3)
                                .toRgbString()}`,
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            background: parseColor(theme.palette.maskColor.primary).setAlpha(0.3).toRgbString(),
                            opacity: 0.6,
                        },
                    },
                },
                {
                    props: {
                        variant: 'roundedOutlined',
                        color: 'info',
                    },
                    style: {
                        backgroundColor: parseColor(theme.palette.maskColor.primary).setAlpha(0.1).toRgbString(),
                        color: theme.palette.maskColor.primary,
                        borderRadius: 99,
                        border: 'none!important',
                        ['&:hover']: {
                            background:
                                theme.palette.mode === 'dark'
                                    ? parseColor(theme.palette.maskColor.primary).setAlpha(0.3).toRgbString()
                                    : theme.palette.maskColor.white,
                            boxShadow: `0 8px 25px ${parseColor(theme.palette.maskColor.primary)
                                .setAlpha(0.1)
                                .toRgbString()}`,
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            color: theme.palette.maskColor.primary,
                            background: parseColor(theme.palette.maskColor.primary).setAlpha(0.1).toRgbString(),
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
                        color: theme.palette.maskColor.primary,
                        borderRadius: 99,
                        ['&:hover']: {
                            background: parseColor(theme.palette.maskColor.primary).setAlpha(0.1).toRgbString(),
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            color: theme.palette.maskColor.primary,
                            opacity: 0.4,
                        },
                    },
                },
                // warn button
                {
                    props: {
                        variant: 'roundedContained',
                        color: 'warning',
                    },
                    style: {
                        borderRadius: 99,
                        backgroundColor: theme.palette.maskColor.warn,
                        color: theme.palette.maskColor.white,
                        ['&:hover']: {
                            background: theme.palette.maskColor.warn,
                            boxShadow: `0 8px 25px ${parseColor(theme.palette.maskColor.warn)
                                .setAlpha(0.3)
                                .toRgbString()}`,
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            background: parseColor(theme.palette.maskColor.warn).setAlpha(0.5).toRgbString(),
                            opacity: 0.6,
                        },
                    },
                },
                {
                    props: {
                        variant: 'roundedOutlined',
                        color: 'warning',
                    },
                    style: {
                        borderRadius: 99,
                        backgroundColor: parseColor(theme.palette.maskColor.warn).setAlpha(0.1).toRgbString(),
                        color: theme.palette.maskColor.warn,
                        border: 'none!important',
                        ['&:hover']: {
                            background:
                                theme.palette.mode === 'dark'
                                    ? parseColor(theme.palette.maskColor.warn).setAlpha(0.3).toRgbString()
                                    : theme.palette.maskColor.white,
                            boxShadow: `0 8px 25px ${parseColor(theme.palette.maskColor.warn)
                                .setAlpha(0.1)
                                .toRgbString()}`,
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            color: theme.palette.maskColor.warn,
                            background: parseColor(theme.palette.maskColor.warn).setAlpha(0.1).toRgbString(),
                            opacity: 0.4,
                        },
                    },
                },
                {
                    props: {
                        variant: 'roundedText',
                        color: 'warning',
                    },
                    style: {
                        color: theme.palette.maskColor.warn,
                        borderRadius: 99,
                        border: 'none',
                        ['&:hover']: {
                            background: parseColor(theme.palette.maskColor.warn).setAlpha(0.1).toRgbString(),
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            color: theme.palette.maskColor.warn,
                            opacity: 0.4,
                        },
                    },
                },

                // success button
                {
                    props: {
                        variant: 'roundedContained',
                        color: 'success',
                    },
                    style: {
                        borderRadius: 99,
                        background: theme.palette.maskColor.success,
                        color: theme.palette.maskColor.white,
                        ['&:hover']: {
                            background: theme.palette.maskColor.success,
                            boxShadow: `0 8px 25px ${parseColor(theme.palette.maskColor.success)
                                .setAlpha(0.3)
                                .toRgbString()}`,
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            background: parseColor(theme.palette.maskColor.success).setAlpha(0.5).toRgbString(),
                            opacity: 0.6,
                        },
                    },
                },
                {
                    props: {
                        variant: 'roundedOutlined',
                        color: 'success',
                    },
                    style: {
                        borderRadius: 99,
                        background: parseColor(theme.palette.maskColor.success).setAlpha(0.1).toRgbString(),
                        color: theme.palette.maskColor.warn,
                        border: 'none!important',
                        ['&:hover']: {
                            background:
                                theme.palette.mode === 'dark'
                                    ? parseColor(theme.palette.maskColor.success).setAlpha(0.3).toRgbString()
                                    : theme.palette.maskColor.white,
                            boxShadow: `0 8px 25px ${parseColor(theme.palette.maskColor.success)
                                .setAlpha(0.1)
                                .toRgbString()}`,
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            color: theme.palette.maskColor.success,
                            background: parseColor(theme.palette.maskColor.success).setAlpha(0.1).toRgbString(),
                            opacity: 0.4,
                        },
                    },
                },
                {
                    props: {
                        variant: 'roundedText',
                        color: 'success',
                    },
                    style: {
                        borderRadius: 99,
                        color: theme.palette.maskColor.success,
                        ['&:hover']: {
                            background: parseColor(theme.palette.maskColor.success).setAlpha(0.1).toRgbString(),
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            color: theme.palette.maskColor.success,
                            opacity: 0.4,
                        },
                    },
                },

                // error button
                {
                    props: {
                        variant: 'roundedContained',
                        color: 'error',
                    },
                    style: {
                        borderRadius: 99,
                        backgroundColor: theme.palette.maskColor.danger,
                        color: theme.palette.maskColor.white,
                        ['&:hover']: {
                            background: theme.palette.maskColor.danger,
                            boxShadow: `0 8px 25px ${parseColor(theme.palette.maskColor.danger)
                                .setAlpha(0.3)
                                .toRgbString()}`,
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            background: parseColor(theme.palette.maskColor.danger).setAlpha(0.5).toRgbString(),
                            opacity: 0.6,
                        },
                    },
                },
                {
                    props: {
                        variant: 'roundedOutlined',
                        color: 'error',
                    },
                    style: {
                        borderRadius: 99,
                        backgroundColor: parseColor(theme.palette.maskColor.danger).setAlpha(0.1).toRgbString(),
                        color: theme.palette.maskColor.danger,
                        border: 'none!important',
                        ['&:hover']: {
                            background:
                                theme.palette.mode === 'dark'
                                    ? parseColor(theme.palette.maskColor.danger).setAlpha(0.3).toRgbString()
                                    : theme.palette.maskColor.white,
                            boxShadow: `0 8px 25px ${parseColor(theme.palette.maskColor.danger)
                                .setAlpha(0.1)
                                .toRgbString()}`,
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            color: theme.palette.maskColor.danger,
                            background: parseColor(theme.palette.maskColor.danger).setAlpha(0.1).toRgbString(),
                            opacity: 0.4,
                        },
                    },
                },
                {
                    props: {
                        variant: 'roundedText',
                        color: 'error',
                    },
                    style: {
                        borderRadius: 99,
                        color: theme.palette.maskColor.danger,
                        ['&:hover']: {
                            background: parseColor(theme.palette.maskColor.danger).setAlpha(0.1).toRgbString(),
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            color: theme.palette.maskColor.danger,
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
    })
    setAutoFreeze(true)
    // TODO: support RTL?

    const [localization, isRTL] = useThemeLanguage(useValueRef(languageSettings))
    const theme = unstable_createMuiStrictModeTheme(maskTheme, localization)
    return usePostTheme(theme)
}
