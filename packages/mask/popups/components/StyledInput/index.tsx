import { forwardRef, memo } from 'react'
import { TextField, type TextFieldProps } from '@mui/material'

export const StyledInput = memo(
    forwardRef<{}, TextFieldProps>(function StyledInput(props, ref) {
        return (
            <TextField
                {...props}
                fullWidth
                inputRef={ref}
                variant="standard"
                autoComplete="off"
                inputProps={{ 'aria-autocomplete': 'none', ...props.inputProps }}
                InputProps={{
                    ...props.InputProps,
                    disableUnderline: true,
                }}
                FormHelperTextProps={{ ...props.FormHelperTextProps, style: { marginTop: 12 } }}
            />
        )
    }),
)
