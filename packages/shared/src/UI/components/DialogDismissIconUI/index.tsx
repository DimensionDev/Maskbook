import { useTheme, useMediaQuery } from '@mui/material'
import { Close as CloseIcon, ArrowBackRounded as ArrowBackRoundedIcon } from '@mui/icons-material'

interface DialogDismissIconUIProps {
    style?: 'auto' | 'back' | 'close'
}

export function DialogDismissIconUI(props: DialogDismissIconUIProps) {
    const close = <CloseIcon color="inherit" />
    const back = <ArrowBackRoundedIcon />
    const auto = useMediaQuery(`(min-width: ${useTheme().breakpoints.values.sm}px)`)
    if (!props.style || props.style === 'auto') return auto ? close : back
    if (props.style === 'back') return back
    return close
}
