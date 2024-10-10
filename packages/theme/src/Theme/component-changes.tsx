import { Icons } from '@masknet/icons'
import {
    alpha,
    buttonClasses,
    radioClasses,
    checkboxClasses,
    inputBaseClasses,
    menuItemClasses,
    popoverClasses,
    menuClasses,
    type PaletteMode,
    type ThemeOptions,
    InputBase as MuiInputBase,
    switchClasses,
    alertClasses,
    linearProgressClasses,
    selectClasses,
    filledInputClasses,
    formHelperTextClasses,
    inputAdornmentClasses,
} from '@mui/material'
import type { MaskColor } from './colors.js'

type ThemeOverride = (mode: PaletteMode, colors: MaskColor) => ThemeOptions
// this override extends the mui theme and cannot fit ThemeOptions
export const Button = (mode: PaletteMode, colors: MaskColor) => ({
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
                            color: colors.maskColor.bottom,
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
                            color: colors.maskColor.white,
                        },
                        [`&.${buttonClasses.disabled}`]: {
                            background: alpha(colors.maskColor.danger, 0.5),
                            opacity: 0.5,
                            color: colors.maskColor.white,
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
                    textTransform: 'unset',
                    fontWeight: 700,
                    color: colors.background.paper,
                },
            },
        },
    },
})

export const Radio: ThemeOverride = (mode, colors) => ({
    components: {
        MuiRadio: {
            defaultProps: {
                size: 'medium',
                icon: <Icons.RadioButtonUnChecked size={20} />,
                checkedIcon: <Icons.RadioButtonChecked size={20} />,
                disableTouchRipple: true,
            },
            styleOverrides: {
                root: {
                    '&:hover': {
                        backgroundColor: 'transparent',
                    },
                    color: colors.maskColor.secondaryLine,
                    [`&.${radioClasses.checked} svg`]: {
                        filter: 'drop-shadow(0px 4px 10px rgba(28, 104, 243, 0.2))',
                    },
                    [`&.${radioClasses.disabled} svg`]: {
                        color: colors.maskColor.secondaryLine,
                        '& circle': {
                            fill: `${colors.maskColor.bg} !important`,
                        },
                    },
                },
            },
        },
    },
})

export const Checkbox: ThemeOverride = (mode, colors) => ({
    components: {
        MuiCheckbox: {
            defaultProps: {
                size: 'medium',
                checkedIcon: <Icons.Checkbox color="#1C68F3" />,
                icon: <Icons.CheckboxBlank />,
                disableTouchRipple: true,
            },
            styleOverrides: {
                root: {
                    color: colors.maskColor.secondaryLine,
                    [`&.${checkboxClasses.checked} svg`]: {
                        filter: 'drop-shadow(0px 4px 10px rgba(28, 104, 243, 0.2))',
                    },
                    [`&.${checkboxClasses.disabled} svg`]: {
                        color: colors.maskColor.secondaryLine,
                        fill: colors.maskColor.bg,
                    },
                    [`&.${checkboxClasses.checked}.${checkboxClasses.disabled} svg`]: {
                        filter: 'none',
                        fill: colors.maskColor.secondaryMain,
                        color: colors.maskColor.secondaryMain,
                    },
                },
            },
        },
    },
})

export const InputBase = (mode: PaletteMode, colors: MaskColor) => ({
    components: {
        MuiInputBase: {
            defaultProps: {
                size: 'medium',
            },
            variants: [
                {
                    props: {
                        size: 'small',
                    },
                    style: {
                        fontSize: 12,
                        [`&.${inputBaseClasses.focused} > .${inputBaseClasses.input}`]: {
                            padding: '7px 8px',
                            [`&.${selectClasses.select}`]: {
                                padding: '7px 8px',
                                height: 16,
                                minHeight: 'unset',
                            },
                        },
                        [`& .${inputBaseClasses.input}`]: {
                            padding: 8,
                            height: 16,
                            [`&.${selectClasses.select}`]: {
                                padding: 8,
                                height: 16,
                                minHeight: 'unset',
                            },
                        },
                        [`&.${inputBaseClasses.adornedStart}:last-child`]: {
                            paddingLeft: 8,
                        },
                        [`&.${inputBaseClasses.adornedEnd}:last-child`]: {
                            paddingRight: 8,
                        },
                    },
                },
                {
                    props: {
                        size: 'medium',
                    },
                    style: {
                        fontSize: 14,
                        [`& .${inputBaseClasses.input}`]: {
                            padding: '11px 12px',
                            height: 18,
                        },
                        [`&.${inputBaseClasses.adornedStart}:last-child`]: {
                            paddingLeft: 12,
                        },
                        [`&.${inputBaseClasses.adornedEnd}:last-child`]: {
                            paddingRight: 12,
                        },
                    },
                },
                {
                    props: {
                        size: 'large',
                    },
                    style: {
                        fontSize: 15,
                        [`&.${inputBaseClasses.focused} > .${inputBaseClasses.input}`]: {
                            padding: '13px 14px',
                            [`&.${selectClasses.select}`]: {
                                padding: '13px 14px',
                                height: 20,
                                minHeight: 'unset',
                            },
                        },
                        [`& .${inputBaseClasses.input}`]: {
                            padding: 14,
                            height: 20,
                            [`&.${selectClasses.select}`]: {
                                padding: 14,
                                height: 20,
                                minHeight: 'unset',
                            },
                        },
                        [`&.${inputBaseClasses.adornedStart}:last-child`]: {
                            paddingLeft: 14,
                        },
                        [`&.${inputBaseClasses.adornedEnd}:last-child`]: {
                            paddingRight: 14,
                        },
                    },
                },
                {
                    props: {
                        error: true,
                    },
                    style: {
                        outline: `2px solid ${alpha(colors.maskColor.danger, 0.2)}`,
                        border: `1px solid ${alpha(colors.maskColor.danger, 0.5)}`,
                        paddingRight: 12,
                        [`&.${inputBaseClasses.focused}`]: {
                            outline: `2px solid ${alpha(colors.maskColor.danger, 0.2)}`,
                            border: `1px solid ${alpha(colors.maskColor.danger, 0.5)}`,
                            boxShadow: 'unset',
                        },
                        [`& .${inputAdornmentClasses.positionEnd}`]: {
                            color: colors.maskColor.danger,
                        },
                    },
                },
                {
                    props: {
                        color: 'error',
                    },
                    style: {
                        outline: `2px solid ${alpha(colors.maskColor.danger, 0.2)}`,
                        border: `1px solid ${alpha(colors.maskColor.danger, 0.5)}`,
                        background: '#fffff',
                        [`&.${inputBaseClasses.focused}`]: {
                            outline: `2px solid ${alpha(colors.maskColor.danger, 0.2)}`,
                            border: `1px solid ${alpha(colors.maskColor.danger, 0.5)}`,
                            boxShadow: 'unset',
                        },
                        [`& .${inputAdornmentClasses.positionEnd}`]: {
                            color: colors.maskColor.danger,
                        },
                    },
                },
                {
                    props: {
                        color: 'warning',
                    },
                    style: {
                        outline: `2px solid ${alpha(colors.maskColor.warn, 0.2)}`,
                        border: `1px solid ${alpha(colors.maskColor.warn, 0.5)}`,
                        [`&.${inputBaseClasses.focused}`]: {
                            outline: `2px solid ${alpha(colors.maskColor.warn, 0.2)}`,
                            border: `1px solid ${alpha(colors.maskColor.warn, 0.5)}`,
                            boxShadow: 'unset',
                        },
                    },
                },
            ],
            styleOverrides: {
                root: {
                    overflow: 'unset!important',
                    borderRadius: 8,
                    backgroundColor: colors.maskColor.input,
                    border: '1px solid transparent',
                    // Increase priority
                    [`&.${inputBaseClasses.focused}.${inputBaseClasses.focused}`]: {
                        outline: `2px solid ${alpha(colors.maskColor.primary, 0.2)}`,
                        borderColor: alpha(colors.maskColor.primary, 0.5),
                        backgroundColor: 'transparent',
                    },
                    [`&.${inputBaseClasses.focused} .${inputAdornmentClasses.positionEnd}`]: {
                        color: colors.maskColor.second,
                    },
                    // For Select Menu
                    [`& .${popoverClasses.paper}`]: {
                        borderRadius: 16,
                        boxShadow:
                            mode === 'dark' ?
                                '0px 4px 30px rgba(255, 255, 255, 0.15)'
                            :   '0px 4px 30px rgba(0, 0, 0, 0.1)',
                        backgroundColor: colors.maskColor.bottom,
                        backgroundImage: 'unset',
                        [`& .${menuClasses.list}`]: {
                            padding: 12,
                            [`& .${menuItemClasses.selected}`]: {
                                backgroundColor: `${colors.maskColor.bg}!important`,
                                borderRadius: 8,
                            },
                        },
                    },
                    '&.Mui-disabled': {
                        background: colors.maskColor.input,
                    },
                    [`& .${inputBaseClasses.input}.Mui-disabled`]: {
                        opacity: 0.5,
                        color: colors.maskColor.third,
                    },
                },
                input: {
                    '&::placeholder': {
                        color: colors.maskColor.third,
                        opacity: '1',
                    },
                    '&:focus': {
                        borderRadius: 8,
                    },
                },
            },
        },
    },
})

export const TextField = (mode: PaletteMode, colors: MaskColor) => ({
    components: {
        MuiTextField: {
            defaultProps: {
                variant: 'filled',
                InputProps: {
                    disableUnderline: true,
                },
            },
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    [`& .${filledInputClasses.root}`]: {
                        borderRadius: 8,
                        background: colors.maskColor.input,
                        '&.Mui-disabled': {
                            background: colors.maskColor.input,
                            opacity: 0.5,
                        },
                    },
                    [`& .${formHelperTextClasses.root}`]: {
                        marginLeft: 0,
                    },

                    [`& .${inputBaseClasses.input}.Mui-disabled`]: {
                        opacity: 0.5,
                        background: colors.maskColor.input,
                        color: colors.maskColor.third,
                    },
                },
            },
        },
    },
})

export const Select: ThemeOverride = (mode, colors) => ({
    components: {
        MuiSelect: {
            defaultProps: {
                input: <MuiInputBase />,
                IconComponent: Icons.ArrowDrop,
            },
            styleOverrides: {
                icon: {
                    width: 22.5,
                    height: 22.5,
                    top: 'calc(50% - 11.25px)',
                    color: colors.maskColor.second,
                },
            },
        },
    },
})

export const Slider: ThemeOverride = (mode, colors) => ({
    components: {
        MuiSlider: {
            styleOverrides: {
                root: {
                    color: colors.maskColor.primary,
                },
                rail: {
                    opacity: 1,
                    backgroundColor: colors.maskColor.thirdMain,
                },
            },
        },
    },
})

export const Switch: ThemeOverride = (mode, colors) => ({
    components: {
        MuiSwitch: {
            defaultProps: {
                disableTouchRipple: true,
            },
            styleOverrides: {
                root: {
                    padding: 8,
                },
                switchBase: {
                    padding: 12,
                    '&:hover': {
                        backgroundColor: 'transparent',
                    },
                    [`&.${switchClasses.checked}`]: {
                        color: colors.maskColor.white,
                        '&:hover': {
                            backgroundColor: 'transparent',
                        },
                        [`&+.${switchClasses.track}`]: {
                            backgroundColor: colors.maskColor.success,
                            opacity: 1,
                        },
                        [`&.${switchClasses.disabled}`]: {
                            color: colors.maskColor.white,
                        },
                    },
                    [`&.${switchClasses.disabled}`]: {
                        color: colors.maskColor.white,
                        [`&+.${switchClasses.track}`]: {
                            opacity: 0.5,
                        },
                    },
                },
                track: {
                    borderRadius: 11,
                    backgroundColor: colors.maskColor.primaryMain,
                    opacity: 1,
                    '&:before, &:after': {
                        content: '""',
                        position: 'absolute',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 16,
                        height: 16,
                    },
                },
                thumb: {
                    width: 14,
                    height: 14,
                },
            },
        },
    },
})

export const Tooltip: ThemeOverride = (mode, colors) => ({
    components: {
        MuiTooltip: {
            defaultProps: {
                arrow: true,
            },
            styleOverrides: {
                tooltip: {
                    maxWidth: 300,
                    padding: 10,
                    fontSize: 14,
                    borderRadius: 4,
                    lineHeight: '18px',
                    backgroundColor: colors.maskColor.tips,
                    color: colors.maskColor.bottom,
                    boxShadow:
                        mode === 'dark' ? '0px 0px 20px rgba(255, 255, 255, 0.12)' : '0px 0px 20px rgba(0, 0, 0, 0.05)',
                    '& > *': {
                        fontSize: 14,
                        lineHeight: '18px',
                    },
                },
                arrow: {
                    color: colors.maskColor.tips,
                },
            },
        },
    },
})

export const Alert: ThemeOverride = (mode, colors) => ({
    components: {
        MuiAlert: {
            defaultProps: {
                iconMapping: {
                    info: <Icons.Info size={20} />,
                    warning: <Icons.WarningTriangle size={20} />,
                    success: <Icons.FillSuccess size={20} />,
                    error: <Icons.Warning size={20} />,
                },
                variant: 'standard',
            },
            styleOverrides: {
                root: {
                    padding: '4px 12px',
                    backdropFilter: 'blur(10px)',
                },
                standardInfo: {
                    backgroundColor: colors.maskColor.bg,
                    color: colors.maskColor.main,
                    [`& .${alertClasses.icon}`]: {
                        color: colors.maskColor.main,
                    },
                },
                standardWarning: {
                    backgroundColor: alpha(colors.maskColor.warn, 0.1),
                    color: colors.maskColor.warn,
                },
                standardError: {
                    backgroundColor: alpha(colors.maskColor.danger, 0.1),
                    color: colors.maskColor.danger,
                },
                standardSuccess: {
                    backgroundColor: alpha(colors.maskColor.success, 0.1),
                    color: colors.maskColor.success,
                },
                icon: {
                    padding: '8px 0',
                    marginRight: 6,
                    width: 20,
                    height: 20,
                },
            },
        },
    },
})

export const LinearProgress: ThemeOverride = (mode, colors) => ({
    components: {
        MuiLinearProgress: {
            styleOverrides: {
                determinate: {
                    height: 6,
                    borderRadius: 8,
                    backgroundColor: colors.maskColor.bg,
                    [`& .${linearProgressClasses.bar}`]: {
                        backgroundColor: colors.maskColor.success,
                    },
                },
            },
        },
    },
})
