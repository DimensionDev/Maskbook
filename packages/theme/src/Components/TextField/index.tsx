import { omit } from 'lodash-es'
import type { BoxProps } from '@mui/system'
import {
    Box,
    formHelperTextClasses,
    TextField,
    type StandardTextFieldProps,
    type InputProps,
    Typography,
    InputBase,
    inputBaseClasses,
    alpha,
} from '@mui/material'
import { Sniffings } from '@masknet/shared-base'
import { makeStyles } from '../../UIHelper/makeStyles.js'
import { MaskColorVar, getMaskColor } from '../../CSSVariables/vars.js'

const useStyles = makeStyles()((theme) => ({
    label: {
        fontSize: 12,
        lineHeight: '16px',
        fontWeight: 'bolder',
    },
    required: {
        fontSize: 12,
        lineHeight: '16px',
        fontWeight: 'bolder',
        color: getMaskColor(theme).redMain,
        paddingLeft: theme.spacing(0.5),
    },
    field: {
        width: '100%',
        [`& > .${formHelperTextClasses.root}`]: {
            paddingTop: theme.spacing(1),
            borderRadius: '2px',
            fontSize: 14,
            lineHeight: '16px',
        },
        '& input[type=number]': {
            MozAppearance: 'textfield',
            WebkitAppearance: 'none',
        },
        '& input[type=number]::-webkit-outer-spin-button': {
            WebkitAppearance: 'none',
        },
        '& input[type=number]::-webkit-inner-spin-button': {
            WebkitAppearance: 'none',
        },
        '& input::-webkit-input-placeholder': {
            color: theme.palette.maskColor.third,
        },
        [`&.${inputBaseClasses.focused}`]: {
            background: 'transparent',
        },
    },
    input: {
        padding: theme.spacing(1),
        background: theme.palette.maskColor.input,
        fontSize: 13,
        lineHeight: '16px',
        borderRadius: 6,
        border: '1px solid transparent',
        [`&.${formHelperTextClasses.error}`]: {
            boxShadow: `0 0 0 ${theme.spacing(0.5)} ${MaskColorVar.redMain.alpha(0.2)}`,
            borderColor: MaskColorVar.redMain.alpha(0.8),
        },
        [`&.${formHelperTextClasses.focused}`]: {
            borderColor: Sniffings.is_dashboard_page ? alpha(theme.palette.maskColor.primary, 0.5) : 'transparent',
        },
    },
    inputDisabled: {
        opacity: 0.5,
        color: 'rgba(255, 255, 255, 0.4)',
    },
    inputFocused: {
        background: 'transparent',
        ...(Sniffings.is_dashboard_page ?
            {
                outline: `2px solid ${alpha(theme.palette.maskColor.primary, 0.2)}`,
                borderColor: alpha(theme.palette.maskColor.primary, 0.5),
            }
        :   { boxShadow: `0 0 0 2px ${theme.palette.mode === 'dark' ? '#4F5378' : 'rgba(28, 104, 243, 0.2)'}` }),
    },
}))

export interface MaskTextFieldProps extends Exclude<StandardTextFieldProps, 'variant'> {
    wrapperProps?: BoxProps
}

export function MaskTextField(props: MaskTextFieldProps) {
    const { label, sx, required = false, className, wrapperProps, helperText, ...rest } = props
    const InputProps = (props.InputProps as InputProps) ?? {}
    const { classes, cx } = useStyles()
    return (
        <Box sx={sx} {...wrapperProps}>
            {label && typeof label === 'string' ?
                <Typography sx={{ mb: 1 }} variant="body2" className={classes.label}>
                    {label}
                    {required ?
                        <Typography className={classes.required} component="span">
                            *
                        </Typography>
                    :   null}
                </Typography>
            :   null}
            {label && typeof label !== 'string' ? label : null}
            {Sniffings.is_dashboard_page ?
                <TextField
                    {...rest}
                    classes={{ root: classes.field }}
                    variant="standard"
                    required={required}
                    helperText={helperText}
                    InputProps={{
                        disableUnderline: true,
                        classes: {
                            disabled: classes.inputDisabled,
                            focused: classes.inputFocused,
                            ...InputProps.classes,
                        },
                        ...InputProps,
                        className: cx(classes.input, InputProps.className),
                    }}
                />
            :   <InputBase
                    className={classes.field}
                    {...omit(InputProps, 'disableUnderline')}
                    {...omit(
                        rest,
                        'margin',
                        'onKeyDown',
                        'onKeyUp',
                        'InputProps',
                        'inputProps',
                        'FormHelperTextProps',
                        'onInvalid',
                    )}
                />
            }
        </Box>
    )
}

MaskTextField.displayName = 'MaskTextField'
