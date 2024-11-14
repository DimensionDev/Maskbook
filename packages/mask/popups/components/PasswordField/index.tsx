import { memo, useState } from 'react'
import { IconButton, InputAdornment, type TextFieldProps } from '@mui/material'
import { StyledInput } from '../StyledInput/index.js'
import { Icons } from '@masknet/icons'

export const PasswordField = memo(function PasswordField({
    show = true,
    ...rest
}: TextFieldProps & { show?: boolean }) {
    const [showPassword, setShowPassword] = useState(false)
    return (
        <StyledInput
            {...rest}
            type={showPassword ? 'text' : 'password'}
            autoComplete="off"
            InputProps={{
                ...rest.InputProps,
                endAdornment: (
                    <InputAdornment position="end">
                        {show ?
                            <IconButton
                                aria-label="toggle password visibility"
                                onClick={() => setShowPassword(!showPassword)}
                                onMouseDown={(event) => event.preventDefault()}
                                edge="end"
                                size="small">
                                {showPassword ?
                                    <Icons.EyeOff />
                                :   <Icons.Eye />}
                            </IconButton>
                        :   undefined}
                    </InputAdornment>
                ),
            }}
        />
    )
})
