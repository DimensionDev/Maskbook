import { useTheme, useMediaQuery } from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import ArrowBackRoundedIcon from '@material-ui/icons/ArrowBackRounded'

export interface DialogDismissIconUIProps {
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
