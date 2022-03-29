import { forwardRef, memo, useState } from 'react'
import { IconButton, InputAdornment, TextFieldProps } from '@mui/material'
import { StyledInput } from '../StyledInput'
import { EyeIcon, EyeOffIcon } from '@masknet/icons'

export const PasswordField = memo(
    forwardRef<{}, TextFieldProps>((props, ref) => {
        const [visiblePassword, setVisiblePassword] = useState(false)

        return (
            <StyledInput
                {...props}
                type={visiblePassword ? 'text' : 'password'}
                ref={ref}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                aria-label="toggle password visibility"
                                onClick={() => setVisiblePassword(!visiblePassword)}
                                onMouseDown={(event) => event.preventDefault()}
                                edge="end"
                                size="small">
                                {visiblePassword ? <EyeOffIcon /> : <EyeIcon />}
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />
        )
    }),
)
