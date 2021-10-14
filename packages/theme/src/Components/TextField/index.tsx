import { ForwardedRef, forwardRef } from 'react'
import { Box, formHelperTextClasses, TextField, StandardTextFieldProps, InputProps, Typography } from '@mui/material'
import { makeStyles } from '../../makeStyles'
import { getMaskColor, MaskColorVar } from '../../constants'

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
            marginTop: theme.spacing(0.8),
            paddingLeft: theme.spacing(0.5),
            borderLeft: 'solid 2px',
            borderRadius: '2px',
            fontSize: 12,
            lineHeight: '16px',
        },
    },
    input: {
        padding: theme.spacing(1),
        background: theme.palette.mode === 'dark' ? '#2B2E4C' : '#F6F6F8',
        fontSize: 13,
        lineHeight: '16px',
        borderRadius: 6,
        [`&.${formHelperTextClasses.error}`]: {
            boxShadow: `0 0 0 ${theme.spacing(0.5)} ${MaskColorVar.redMain.alpha(0.2)}`,
            border: `1px solid ${MaskColorVar.redMain.alpha(0.8)}`,
        },
    },
    inputDisabled: {
        opacity: 0.5,
        color: 'rgba(255, 255, 255, 0.4)',
    },
    inputFocused: {
        background: MaskColorVar.primaryBackground,
        padding: 7,
        boxShadow: `0 0 0 2px ${theme.palette.mode === 'dark' ? '#4F5378' : 'rgba(28, 104, 243, 0.2)'}`,
    },
}))

export type MaskTextFieldProps = Exclude<StandardTextFieldProps, 'variant'>

export const MaskTextField = forwardRef((props: MaskTextFieldProps, ref: ForwardedRef<any>) => {
    const { label, sx, required = false, ...rest } = props
    const inputProps = (props.InputProps as InputProps) ?? {}
    const { classes } = useStyles()
    return (
        <Box sx={sx}>
            {label && typeof label === 'string' && (
                <Typography sx={{ mb: 1 }} variant="body2" className={classes.label}>
                    {label}
                    {required && (
                        <Typography className={classes.required} component="span">
                            *
                        </Typography>
                    )}
                </Typography>
            )}
            {label && typeof label !== 'string' && label}
            <TextField
                ref={ref}
                {...rest}
                classes={{ root: classes.field }}
                variant="standard"
                required={required}
                InputProps={{
                    disableUnderline: true,
                    className: classes.input,
                    classes: { disabled: classes.inputDisabled, focused: classes.inputFocused, ...inputProps.classes },
                    ...inputProps,
                }}
            />
        </Box>
    )
})
