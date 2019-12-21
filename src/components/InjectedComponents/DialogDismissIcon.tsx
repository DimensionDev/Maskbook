import * as React from 'react'
import { useTheme, useMediaQuery } from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import ArrowBackRoundedIcon from '@material-ui/icons/ArrowBackRounded'

export interface DialogDismissIconUIProps {}

export function DialogDismissIconUI(props: DialogDismissIconUIProps) {
    const theme = useTheme()
    const matched = useMediaQuery(`(min-width: ${theme.breakpoints.width('sm')}px)`)
    return matched ? <CloseIcon /> : <ArrowBackRoundedIcon />
}
