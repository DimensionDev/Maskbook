import { memo, type RefAttributes } from 'react'
import { mergeSlotProps, TextField, type TextFieldProps } from '@mui/material'

export type StyledInputProps = TextFieldProps

export const StyledInput = memo(function StyledInput({
    ref,
    slotProps,
    ...props
}: TextFieldProps & RefAttributes<unknown>) {
    return (
        <TextField
            {...props}
            fullWidth
            inputRef={ref}
            variant="standard"
            autoComplete="off"
            slotProps={{
                ...slotProps,
                htmlInput: mergeSlotProps(slotProps?.htmlInput, { 'aria-autocomplete': 'none' }),
                input: mergeSlotProps(slotProps?.input, { disableUnderline: true }),
                formHelperText: mergeSlotProps(slotProps?.formHelperText, { style: { marginTop: 12 } }),
            }}
        />
    )
})
