import type { PaletteMode, ThemeOptions } from '@mui/material'
import { alpha, buttonClasses } from '@mui/material'
import type { MaskColor } from './colors'

export const Button = (mode: PaletteMode, colors: MaskColor): ThemeOptions => ({
    components: {
        MuiButton: {
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
                        backgroundColor: colors.maskColor.main,
                        ['&:hover']: {
                            backgroundColor: colors.maskColor.main,
                            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            background: colors.maskColor.primaryMain,
                            opacity: 0.6,
                            color: colors.background.paper,
                        },
                    },
                },
                {
                    props: {
                        variant: 'outlined',
                    },
                    style: {
                        backgroundColor: colors.maskColor.thirdMain,
                        color: colors.maskColor.main,
                        border: 'none!important',
                        ['&:hover']: {
                            background: colors.maskColor.bottom,
                            boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.1)',
                            border: 'none',
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            color: colors.maskColor.main,
                            background: colors.maskColor.thirdMain,
                            opacity: 0.4,
                        },
                    },
                },
                {
                    props: {
                        variant: 'text',
                    },
                    style: {
                        color: colors.maskColor.main,
                        ['&:hover']: {
                            background: colors.maskColor.thirdMain,
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
                        background: colors.maskColor.primary,
                        color: colors.maskColor.white,
                        ['&:hover']: {
                            background: colors.maskColor.primary,
                            boxShadow: `0 8px 25px ${alpha(colors.maskColor.primary, 0.3)}`,
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            background: alpha(colors.maskColor.primary, 0.3),
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
                        backgroundColor: alpha(colors.maskColor.primary, 0.1),
                        color: colors.maskColor.primary,
                        border: 'none!important',
                        ['&:hover']: {
                            background: alpha(colors.maskColor.primary, 0.2),
                            boxShadow: `0 8px 25px ${alpha(colors.maskColor.primary, 0.1)}`,
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            color: colors.maskColor.primary,
                            background: alpha(colors.maskColor.primary, 0.1),
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
                        color: colors.maskColor.primary,
                        ['&:hover']: {
                            background: alpha(colors.maskColor.primary, 0.1),
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            color: colors.maskColor.primary,
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
                        backgroundColor: colors.maskColor.warn,
                        color: colors.maskColor.white,
                        ['&:hover']: {
                            background: colors.maskColor.warn,
                            boxShadow: `0 8px 25px ${alpha(colors.maskColor.warn, 0.3)}`,
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            background: alpha(colors.maskColor.warn, 0.5),
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
                        backgroundColor: alpha(colors.maskColor.warn, 0.1),
                        color: colors.maskColor.warn,
                        border: 'none!important',
                        ['&:hover']: {
                            background: alpha(colors.maskColor.warn, 0.2),
                            boxShadow: `0 8px 25px ${alpha(colors.maskColor.warn, 0.1)}`,
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            color: colors.maskColor.warn,
                            background: alpha(colors.maskColor.warn, 0.1),
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
                        color: colors.maskColor.warn,
                        ['&:hover']: {
                            background: alpha(colors.maskColor.warn, 0.1),
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            color: colors.maskColor.warn,
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
                        background: colors.maskColor.success,
                        color: colors.maskColor.white,
                        ['&:hover']: {
                            background: colors.maskColor.success,
                            boxShadow: `0 8px 25px ${alpha(colors.maskColor.success, 0.3)}`,
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            background: alpha(colors.maskColor.success, 0.5),
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
                        background: alpha(colors.maskColor.success, 0.1),
                        color: colors.maskColor.success,
                        border: 'none',
                        ['&:hover']: {
                            background: alpha(colors.maskColor.success, 0.2),
                            boxShadow: `0 8px 25px ${alpha(colors.maskColor.success, 0.1)}`,
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            color: colors.maskColor.success,
                            background: alpha(colors.maskColor.success, 0.1),
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
                        color: colors.maskColor.success,
                        ['&:hover']: {
                            background: alpha(colors.maskColor.success, 0.1),
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            color: colors.maskColor.success,
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
                        backgroundColor: colors.maskColor.danger,
                        color: colors.maskColor.white,
                        ['&:hover']: {
                            background: colors.maskColor.danger,
                            boxShadow: `0 8px 25px ${alpha(colors.maskColor.danger, 0.3)}`,
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            background: alpha(colors.maskColor.danger, 0.5),
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
                        backgroundColor: alpha(colors.maskColor.danger, 0.1),
                        color: colors.maskColor.danger,
                        border: 'none',
                        ['&:hover']: {
                            background: alpha(colors.maskColor.danger, 0.2),
                            boxShadow: `0 8px 25px ${alpha(colors.maskColor.danger, 0.1)}`,
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            color: colors.maskColor.danger,
                            background: alpha(colors.maskColor.danger, 0.1),
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
                        color: colors.maskColor.danger,
                        ['&:hover']: {
                            background: alpha(colors.maskColor.danger, 0.1),
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            color: colors.maskColor.danger,
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
                        backgroundColor: colors.maskColor.main,
                        borderRadius: 99,
                        ['&:hover']: {
                            backgroundColor: colors.maskColor.main,
                            boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.2)',
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            background: colors.maskColor.primaryMain,
                            opacity: 0.6,
                            color: colors.maskColor.bottom,
                        },
                    },
                },
                {
                    props: {
                        variant: 'roundedDark',
                    },
                    style: {
                        backgroundColor: colors.maskColor.dark,
                        color: colors.maskColor.white,
                        borderRadius: 99,
                        ['&:hover']: {
                            backgroundColor: colors.maskColor.dark,
                            boxShadow: '0 8px 25px rgba(255, 255, 255, 0.2)',
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            background: colors.maskColor.secondaryDark,
                            opacity: 0.6,
                            color: colors.maskColor.white,
                        },
                    },
                },
                {
                    props: {
                        variant: 'roundedOutlined',
                    },
                    style: {
                        borderRadius: 99,
                        backgroundColor: colors.maskColor.thirdMain,
                        color: colors.maskColor.main,
                        border: 'none!important',
                        ['&:hover']: {
                            background: colors.maskColor.bottom,
                            boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.1)',
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            opacity: 0.4,
                            color: colors.maskColor.main,
                        },
                    },
                },
                {
                    props: {
                        variant: 'roundedText',
                    },
                    style: {
                        color: colors.maskColor.main,
                        borderRadius: 99,
                        ['&:hover']: {
                            background: colors.maskColor.thirdMain,
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
                        background: colors.maskColor.primary,
                        color: colors.maskColor.white,
                        borderRadius: 99,
                        ['&:hover']: {
                            background: colors.maskColor.primary,
                            boxShadow: `0 8px 25px ${alpha(colors.maskColor.primary, 0.3)}`,
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            background: alpha(colors.maskColor.primary, 0.3),
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
                        backgroundColor: alpha(colors.maskColor.primary, 0.1),
                        color: colors.maskColor.primary,
                        borderRadius: 99,
                        border: 'none!important',
                        ['&:hover']: {
                            background: alpha(colors.maskColor.primary, 0.2),
                            boxShadow: `0 8px 25px ${alpha(colors.maskColor.primary, 0.1)}`,
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            color: colors.maskColor.primary,
                            background: alpha(colors.maskColor.primary, 0.1),
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
                        color: colors.maskColor.primary,
                        borderRadius: 99,
                        ['&:hover']: {
                            background: alpha(colors.maskColor.primary, 0.1),
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            color: colors.maskColor.primary,
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
                        backgroundColor: colors.maskColor.warn,
                        color: colors.maskColor.white,
                        ['&:hover']: {
                            background: colors.maskColor.warn,
                            boxShadow: `0 8px 25px ${alpha(colors.maskColor.warn, 0.3)}`,
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            background: alpha(colors.maskColor.warn, 0.5),
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
                        backgroundColor: alpha(colors.maskColor.warn, 0.1),
                        color: colors.maskColor.warn,
                        border: 'none!important',
                        ['&:hover']: {
                            background: alpha(colors.maskColor.warn, 0.2),
                            boxShadow: `0 8px 25px ${alpha(colors.maskColor.warn, 0.1)}`,
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            color: colors.maskColor.warn,
                            background: alpha(colors.maskColor.warn, 0.1),
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
                        color: colors.maskColor.warn,
                        borderRadius: 99,
                        border: 'none',
                        ['&:hover']: {
                            background: alpha(colors.maskColor.warn, 0.1),
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            color: colors.maskColor.warn,
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
                        background: colors.maskColor.success,
                        color: colors.maskColor.white,
                        ['&:hover']: {
                            background: colors.maskColor.success,
                            boxShadow: `0 8px 25px ${alpha(colors.maskColor.success, 0.3)}`,
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            background: alpha(colors.maskColor.success, 0.5),
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
                        background: alpha(colors.maskColor.success, 0.1),
                        color: colors.maskColor.success,
                        border: 'none!important',
                        ['&:hover']: {
                            background: alpha(colors.maskColor.success, 0.2),
                            boxShadow: `0 8px 25px ${alpha(colors.maskColor.success, 0.1)}`,
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            color: colors.maskColor.success,
                            background: alpha(colors.maskColor.success, 0.1),
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
                        color: colors.maskColor.success,
                        ['&:hover']: {
                            background: alpha(colors.maskColor.success, 0.1),
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            color: colors.maskColor.success,
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
                        backgroundColor: colors.maskColor.danger,
                        color: colors.maskColor.white,
                        ['&:hover']: {
                            background: colors.maskColor.danger,
                            boxShadow: `0 8px 25px ${alpha(colors.maskColor.danger, 0.3)}`,
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            background: alpha(colors.maskColor.danger, 0.5),
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
                        backgroundColor: alpha(colors.maskColor.danger, 0.1),
                        color: colors.maskColor.danger,
                        border: 'none!important',
                        ['&:hover']: {
                            background: alpha(colors.maskColor.danger, 0.2),
                            boxShadow: `0 8px 25px ${alpha(colors.maskColor.danger, 0.1)}`,
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            color: colors.maskColor.danger,
                            background: alpha(colors.maskColor.danger, 0.1),
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
                        color: colors.maskColor.danger,
                        ['&:hover']: {
                            background: alpha(colors.maskColor.danger, 0.1),
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            color: colors.maskColor.danger,
                            opacity: 0.4,
                        },
                    },
                },
            ],
            styleOverrides: {
                root: {
                    textTransform: 'initial',
                    fontWeight: 700,
                    color: colors.background.paper,
                },
            },
        },
    },
})
