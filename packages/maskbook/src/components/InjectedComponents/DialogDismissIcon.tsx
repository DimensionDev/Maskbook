import { useTheme, useMediaQuery } from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import ArrowBackRoundedIcon from '@material-ui/icons/ArrowBackRounded'
import { getActivatedUI } from '../../social-network/ui'

export interface DialogDismissIconUIProps {}

export function DialogDismissIconUI(props: DialogDismissIconUIProps) {
    return useMediaQuery(`(min-width: ${useTheme().breakpoints.width('sm')}px)`) ? (
        <CloseIcon color={getActivatedUI().internalName === 'twitter' ? 'primary' : 'inherit'} />
    ) : (
        <ArrowBackRoundedIcon />
    )
}
