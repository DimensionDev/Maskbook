import { MaskTextField, MaskTextFieldProps } from '@masknet/theme'
import { IconButton, InputAdornment } from '@material-ui/core'
import Visibility from '@material-ui/icons/Visibility'
import VisibilityOff from '@material-ui/icons/VisibilityOff'
import { useState } from 'react'

export type PasswordFieldProps = Exclude<MaskTextFieldProps, 'type'>

export default function PasswordField(props: PasswordFieldProps) {
    const [showPassword, setShowPassword] = useState(false)
    return (
        <MaskTextField
            {...props}
            type={showPassword ? 'text' : 'password'}
            InputProps={{
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            onMouseDown={(event) => event.preventDefault()}
                            edge="end"
                            size="small">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    </InputAdornment>
                ),
            }}
        />
    )
}
