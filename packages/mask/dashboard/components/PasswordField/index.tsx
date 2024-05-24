import { useState } from 'react'
import { type MaskTextFieldProps } from '@masknet/theme'
import { IconButton, InputAdornment, TextField } from '@mui/material'
import { Icons } from '@masknet/icons'

interface PasswordFieldProps extends Exclude<MaskTextFieldProps, 'type'> {
    show?: boolean
}

export default function PasswordField({ show = true, ...props }: PasswordFieldProps) {
    const [showPassword, setShowPassword] = useState(false)

    return (
        <TextField
            {...props}
            type={showPassword ? 'text' : 'password'}
            size="medium"
            InputProps={{
                ...props.InputProps,
                size: 'medium',
                disableUnderline: true,
                endAdornment:
                    show ?
                        <InputAdornment position="end">
                            <IconButton
                                aria-label="toggle password visibility"
                                onClick={() => setShowPassword(!showPassword)}
                                onMouseDown={(event) => event.preventDefault()}
                                edge="end"
                                size="small">
                                {showPassword ?
                                    <Icons.EyeOff size={18} />
                                :   <Icons.Eye size={18} />}
                            </IconButton>
                        </InputAdornment>
                    :   null,
            }}
        />
    )
}
