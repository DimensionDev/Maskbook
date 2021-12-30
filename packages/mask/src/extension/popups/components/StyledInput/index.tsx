import { forwardRef, memo } from 'react'
import { TextFieldProps, TextField } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'

const useStyles = makeStyles()(({ palette }) => ({
    textField: {
        width: '100%',
    },
    textFieldInput: {
        backgroundColor: palette.mode === 'light' ? '#F7F9FA' : palette.background.default,
        borderRadius: 6,
    },
    input: {
        padding: '11px 9px',
        fontSize: 12,
        borderRadius: 6,
    },
}))

export const StyledInput = memo(
    forwardRef<{}, TextFieldProps>((props, ref) => {
        const classes = useStylesExtends(useStyles(), props)

        return (
            <TextField
                {...props}
                inputRef={ref}
                variant="filled"
                className={classes.textField}
                autoComplete="off"
                inputProps={{ className: classes.input, 'aria-autocomplete': 'none' }}
                InputProps={{ ...props.InputProps, disableUnderline: true, classes: { root: classes.textFieldInput } }}
                FormHelperTextProps={{ ...props.FormHelperTextProps, style: { marginLeft: 0 } }}
            />
        )
    }),
)
