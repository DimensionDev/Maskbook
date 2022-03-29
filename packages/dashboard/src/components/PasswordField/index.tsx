import { MaskTextField, MaskTextFieldProps } from '@masknet/theme'
import { IconButton, InputAdornment } from '@mui/material'
import { ForwardedRef, useState, forwardRef } from 'react'
import { EyeIcon, EyeOffIcon } from '@masknet/icons'

export type PasswordFieldProps = Exclude<MaskTextFieldProps, 'type'>

const PasswordField = forwardRef((props: PasswordFieldProps, ref: ForwardedRef<any>) => {
    const [visiblePassword, setVisiblePassword] = useState(false)
    return (
        <MaskTextField
            {...props}
            ref={ref}
            type={visiblePassword ? 'text' : 'password'}
            InputProps={{
                ...props.InputProps,
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
})

export default PasswordField
