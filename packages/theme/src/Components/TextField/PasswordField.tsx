import { MaskTextField, MaskTextFieldProps } from '.'
import { memo, useState } from 'react'
import { Visibility, VisibilityOff } from '@material-ui/icons'
import { IconButton, InputAdornment } from '@material-ui/core'

export const MaskPasswordTextField = memo<MaskTextFieldProps>((props) => {
    const [isShowPassword, setIsShowPassword] = useState(false)

    return (
        <MaskTextField
            {...props}
            type={isShowPassword ? 'text' : 'password'}
            InputProps={{
                endAdornment: (
                    <InputAdornment position="end" sx={{ mr: 1 }}>
                        <IconButton
                            onClick={() => setIsShowPassword(!isShowPassword)}
                            onMouseDown={() => setIsShowPassword(!isShowPassword)}
                            edge="end">
                            {isShowPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                    </InputAdornment>
                ),
            }}
        />
    )
})
