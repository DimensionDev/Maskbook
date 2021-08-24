import { useTheme, useMediaQuery } from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import ArrowBackRoundedIcon from '@material-ui/icons/ArrowBackRounded'
import { activatedSocialNetworkUI } from '../../social-network'
import { isTwitter } from '../../social-network-adaptor/twitter.com/base'

export interface DialogDismissIconUIProps {
    style?: 'auto' | 'back' | 'close'
}

export function DialogDismissIconUI(props: DialogDismissIconUIProps) {
    const close = <CloseIcon color={isTwitter(activatedSocialNetworkUI) ? 'primary' : 'inherit'} />
    const back = <ArrowBackRoundedIcon />
    const auto = useMediaQuery(`(min-width: ${useTheme().breakpoints.values.sm}px)`)
    if (!props.style || props.style === 'auto') return auto ? close : back
    if (props.style === 'back') return back
    return close
}
