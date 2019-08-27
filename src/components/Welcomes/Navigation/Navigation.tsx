import * as React from 'react'

import Close from '@material-ui/icons/Close'
import ArrowBack from '@material-ui/icons/ArrowBack'
import { geti18nString } from '../../../utils/i18n'
import { makeStyles, Button, Theme } from '@material-ui/core'

interface Props {
    back?: () => void
    close?: () => void
}
const useStyles = makeStyles<Theme>(theme => ({
    nav: {
        paddingTop: theme.spacing(1),
        paddingLeft: theme.spacing(1),
        display: 'flex',
    },
    navBackButton: {
        color: theme.palette.text.hint,
        marginLeft: theme.spacing(1),
        marginRight: 'auto',
    },
    navCloseButton: {
        color: theme.palette.text.hint,
        marginRight: theme.spacing(1),
        marginLeft: 'auto',
    },
    navBackIcon: {
        marginRight: theme.spacing(1),
    },
    navCloseIcon: {
        marginLeft: theme.spacing(1),
    },
}))
export default function Navigation({ back, close }: Props) {
    const classes = useStyles()
    return (
        <nav className={classes.nav}>
            {back ? (
                <Button onClick={back} disableFocusRipple disableRipple className={classes.navBackButton}>
                    <ArrowBack className={classes.navBackIcon} />
                    {geti18nString('back')}
                </Button>
            ) : null}
            {close ? (
                <Button onClick={close} disableFocusRipple disableRipple className={classes.navCloseButton}>
                    {geti18nString('welcome_0_close_button')}
                    <Close className={classes.navCloseIcon} />
                </Button>
            ) : null}
        </nav>
    )
}
