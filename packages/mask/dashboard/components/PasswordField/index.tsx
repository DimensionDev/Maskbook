import { type ForwardedRef, useState, forwardRef } from 'react'
import { type MaskTextFieldProps } from '@masknet/theme'
import { IconButton, InputAdornment, TextField } from '@mui/material'
import { Icons } from '@masknet/icons'

export type PasswordFieldProps = Exclude<MaskTextFieldProps, 'type'> & { show?: boolean }

const PasswordField = forwardRef(({ show = true, ...props }: PasswordFieldProps, ref: ForwardedRef<any>) => {
    const [showPassword, setShowPassword] = useState(false)

    return (
        <TextField
            {...props}
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            size="small"
            InputProps={{
                ...props.InputProps,
                size: 'small',
                disableUnderline: true,
                endAdornment: show ? (
                    <InputAdornment position="end">
                        <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            onMouseDown={(event) => event.preventDefault()}
                            edge="end"
                            size="small">
                            {showPassword ? <Icons.EyeOff size={18} /> : <Icons.Eye size={18} />}
                        </IconButton>
                    </InputAdornment>
                ) : null,
            }}
        />
    )
})

PasswordField.displayName = 'PasswordField'

export default PasswordField
