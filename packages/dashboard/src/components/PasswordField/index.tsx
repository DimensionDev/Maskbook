import { MaskTextField, MaskTextFieldProps } from '@masknet/theme'
import { IconButton, InputAdornment } from '@mui/material'
import { ForwardedRef, useState, forwardRef } from 'react'
import { Eye as EyeIcon, EyeOff as EyeOffIcon } from '@masknet/icons'

export type PasswordFieldProps = Exclude<MaskTextFieldProps, 'type'>

const PasswordField = forwardRef((props: PasswordFieldProps, ref: ForwardedRef<any>) => {
    const [showPassword, setShowPassword] = useState(false)
    return (
        <MaskTextField
            {...props}
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            InputProps={{
                ...props.InputProps,
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            onMouseDown={(event) => event.preventDefault()}
                            edge="end"
                            size="small">
                            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </IconButton>
                    </InputAdornment>
                ),
            }}
        />
    )
})

export default PasswordField
