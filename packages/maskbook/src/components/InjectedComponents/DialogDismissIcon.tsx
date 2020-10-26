import * as React from 'react'
import { useTheme, useMediaQuery } from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import ArrowBackRoundedIcon from '@material-ui/icons/ArrowBackRounded'

export interface DialogDismissIconUIProps {}

export function DialogDismissIconUI(props: DialogDismissIconUIProps) {
    return useMediaQuery(`(min-width: ${useTheme().breakpoints.width('sm')}px)`) ? (
        <CloseIcon />
    ) : (
        <ArrowBackRoundedIcon />
    )
}
