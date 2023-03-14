import { ForwardedRef, useState, forwardRef } from 'react'
import { MaskTextField, MaskTextFieldProps } from '@masknet/theme'
import { IconButton, InputAdornment } from '@mui/material'
import { Icons } from '@masknet/icons'

export type PasswordFieldProps = Exclude<MaskTextFieldProps, 'type'> & { show?: boolean }

const PasswordField = forwardRef(({ show = true, ...props }: PasswordFieldProps, ref: ForwardedRef<any>) => {
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
                        {show ? (
                            <IconButton
                                aria-label="toggle password visibility"
                                onClick={() => setShowPassword(!showPassword)}
                                onMouseDown={(event) => event.preventDefault()}
                                edge="end"
                                size="small">
                                {showPassword ? <Icons.EyeOff /> : <Icons.Eye />}
                            </IconButton>
                        ) : null}
                    </InputAdornment>
                ),
            }}
        />
    )
})

export default PasswordField
