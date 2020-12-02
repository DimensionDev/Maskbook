import type { TextFieldProps } from '@material-ui/core/TextField'
import { useState } from 'react'
import { TextField } from '@material-ui/core'

export function useTextField(label: string, props?: TextFieldProps) {
    const { defaultValue = '', value: _, ..._props } = props || {}
    const [value, setValue] = useState<string>(String(defaultValue))
    return [
        value,
        <TextField
            fullWidth
            label={label}
            value={value}
            onChange={(e) => setValue(e.currentTarget.value)}
            margin="normal"
            {..._props}
            variant="outlined"
        />,
    ] as const
}
