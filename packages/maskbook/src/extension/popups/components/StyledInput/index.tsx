import { forwardRef, memo } from 'react'
import { TextFieldProps, TextField } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { useStylesExtends } from '@masknet/shared'

const useStyles = makeStyles()(({ palette }) => ({
    textField: {
        width: '100%',
    },
    textFieldInput: {
        backgroundColor: palette.background.default,
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
            />
        )
    }),
)
