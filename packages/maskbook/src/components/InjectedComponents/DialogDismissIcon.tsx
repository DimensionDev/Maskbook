import { useTheme, useMediaQuery } from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import ArrowBackRoundedIcon from '@material-ui/icons/ArrowBackRounded'
import { activatedSocialNetworkUI } from '../../social-network'
import { isTwitter } from '../../social-network-adaptor/twitter.com/base'

export interface DialogDismissIconUIProps {
    disableArrowBack?: boolean
}

export function DialogDismissIconUI(props: DialogDismissIconUIProps) {
    return useMediaQuery(`(min-width: ${useTheme().breakpoints.values.sm}px)`) || props.disableArrowBack ? (
        <CloseIcon color={isTwitter(activatedSocialNetworkUI) ? 'primary' : 'inherit'} />
    ) : (
        <ArrowBackRoundedIcon />
    )
}
