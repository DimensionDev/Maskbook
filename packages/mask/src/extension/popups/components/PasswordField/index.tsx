import { forwardRef, memo, useState } from 'react'
import { IconButton, InputAdornment, TextFieldProps } from '@mui/material'
import { StyledInput } from '../StyledInput/index.js'
import { Icons } from '@masknet/icons'

export const PasswordField = memo(
    forwardRef<{}, TextFieldProps & { show?: boolean }>((props, ref) => {
        const [showPassword, setShowPassword] = useState(false)
        const { show = true } = props
        return (
            <StyledInput
                {...props}
                type={showPassword ? 'text' : 'password'}
                ref={ref}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            {show ? (
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={() => setShowPassword(!showPassword)}
                                    onMouseDown={(event) => event.preventDefault()}
                                    edge="end"
                                    size="small">
                                    {showPassword ? <Icons.EyeOff /> : <Icons.Eye />}
                                </IconButton>
                            ) : undefined}
                        </InputAdornment>
                    ),
                }}
            />
        )
    }),
)
