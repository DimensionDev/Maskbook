import { forwardRef, memo } from 'react'
import { TextFieldProps, TextField } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import classNames from 'classnames'

const useStyles = makeStyles()(({ palette }) => ({
    textField: {
        width: '100%',
    },
    textFieldInput: {
        backgroundColor: palette.mode === 'light' ? '#F7F9FA' : palette.background.default,
        borderRadius: 6,
    },
    inputFocused: {
        backgroundColor: `${palette.mode === 'light' ? '#FFFFFF' : palette.background.default} !important`,
        boxShadow: `0 0 0 2px ${palette.mode === 'dark' ? '#4F5378' : 'rgba(28, 104, 243, 0.2)'}`,
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
                className={classNames(classes.textField, props.className)}
                autoComplete="off"
                inputProps={{ className: classes.input, 'aria-autocomplete': 'none', ...props.inputProps }}
                InputProps={{
                    ...props.InputProps,
                    disableUnderline: true,
                    classes: {
                        root: classes.textFieldInput,
                        focused: classes.inputFocused,
                        ...props.InputProps?.classes,
                    },
                }}
                FormHelperTextProps={{ ...props.FormHelperTextProps, style: { marginLeft: 0, color: '#ff5f5f' } }}
            />
        )
    }),
)
