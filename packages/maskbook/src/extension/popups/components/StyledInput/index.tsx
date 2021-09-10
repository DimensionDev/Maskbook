import { forwardRef, memo } from 'react'
import { TextFieldProps, TextField } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { useStylesExtends } from '@masknet/shared'

const useStyles = makeStyles()({
    textField: {
        width: '100%',
    },
    textFieldInput: {
        backgroundColor: '#F7F9FA',
    },
    input: {
        padding: '11px 9px',
        fontSize: 12,
    },
})

export const StyledInput = memo(
    forwardRef<{}, TextFieldProps>((props, ref) => {
        const classes = useStylesExtends(useStyles(), props)

        return (
            <TextField
                {...props}
                inputRef={ref}
                variant="filled"
                className={classes.textField}
                inputProps={{ className: classes.input }}
                InputProps={{ ...props.InputProps, disableUnderline: true, classes: { root: classes.textFieldInput } }}
            />
        )
    }),
)
