import { forwardRef, memo, useState } from 'react'
import { IconButton, InputAdornment, TextFieldProps } from '@mui/material'
import { StyledInput } from '../StyledInput'
import { EyeIcon, EyeOffIcon } from '@masknet/icons'

export const PasswordField = memo(
    forwardRef<{}, TextFieldProps>((props, ref) => {
        const [showPassword, setShowPassword] = useState(false)

        return (
            <StyledInput
                {...props}
                type={showPassword ? 'text' : 'password'}
                ref={ref}
                InputProps={{
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
    }),
)
