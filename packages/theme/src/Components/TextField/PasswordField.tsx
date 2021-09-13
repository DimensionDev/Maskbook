import { MaskTextField, MaskTextFieldProps } from '.'
import { memo, useState } from 'react'
import { Visibility, VisibilityOff } from '@material-ui/icons'
import { IconButton, InputAdornment } from '@material-ui/core'

export const MaskPasswordTextField = memo<MaskTextFieldProps>((props) => {
    const [hidden, setHidden] = useState(false)

    return (
        <MaskTextField
            {...props}
            type={hidden ? 'text' : 'password'}
            InputProps={{
                endAdornment: (
                    <InputAdornment position="end" sx={{ mr: 1 }}>
                        <IconButton
                            onClick={() => setHidden(!hidden)}
                            onMouseDown={() => setHidden(!hidden)}
                            edge="end">
                            {hidden ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                    </InputAdornment>
                ),
            }}
        />
    )
})
