import { memo, useState } from 'react'
import { IconButton, InputAdornment, mergeSlotProps } from '@mui/material'
import { StyledInput, type StyledInputProps } from './StyledInput.js'
import { Icons } from '@masknet/icons'

export const PasswordField = memo(function PasswordField({
    show = true,
    ...rest
}: StyledInputProps & { show?: boolean }) {
    const [showPassword, setShowPassword] = useState(false)
    return (
        <StyledInput
            {...rest}
            type={showPassword ? 'text' : 'password'}
            autoComplete="off"
            slotProps={{
                ...rest.slotProps,
                input: mergeSlotProps(rest.slotProps?.input, {
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
                }),
            }}
        />
    )
})
