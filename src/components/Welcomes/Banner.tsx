import * as React from 'react'
import CloseIcon from '@material-ui/icons/Close'
import { geti18nString } from '../../utils/i18n'
import { makeStyles } from '@material-ui/styles'
import { AppBar, Typography, Button, IconButton, Hidden, SnackbarContent, Theme } from '@material-ui/core'
import { useLastRecognizedIdentity } from '../DataSource/useActivatedUI'
import { setStorage } from '../../utils/browser.storage'
import Services from '../../extension/service'
import { useCallback } from 'react'

interface Props {
    getStarted(): void
    close(): void
    disabled?: boolean
}
const useStyles = makeStyles((theme: Theme) => ({
    root: {
        border: '1px solid #ccc',
        borderRadius: 4,
        marginBottom: 10,
    },
    snackbar: {
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        boxShadow: 'none',
    },
    button: {
        padding: '4px 3em',
    },
    close: {
        margin: 6,
        padding: 6,
    },
}))
export function BannerUI(props: Props) {
    const classes = useStyles()
    const Title = (
        <Typography variant="subtitle1" color="inherit">
            {props.disabled ? geti18nString('banner_collecting_identity') : geti18nString('banner_title')}
        </Typography>
    )
    const GetStarted = (
        <Button
            onClick={props.getStarted}
            classes={{ root: classes.button }}
            variant="contained"
            disabled={props.disabled}
            color="primary">
            {geti18nString('banner_get_started')}
        </Button>
    )
    const DismissIcon = (
        <IconButton
            aria-label={geti18nString('banner_dismiss_aria')}
            onClick={props.close}
            classes={{ root: classes.close }}>
            <CloseIcon />
        </IconButton>
    )
    return (
        <AppBar position="static" color="default" elevation={0} classes={{ root: classes.root }}>
            <SnackbarContent
                classes={{ root: classes.snackbar }}
                message={Title}
                action={
                    <>
                        {GetStarted}
                        <Hidden smDown>{DismissIcon}</Hidden>
                    </>
                }
            />
        </AppBar>
    )
}

export function Banner({ unmount, ...props }: { unmount: () => void } & Partial<Props>) {
    const id = useLastRecognizedIdentity().identifier
    const closeDefault = useCallback(() => {
        setStorage({ userDismissedWelcome: true })
        unmount()
    }, [unmount])
    const getStartedDefault = useCallback(() => {
        unmount()
        Services.Welcome.openWelcomePage(id)
    }, [unmount])
    return <BannerUI disabled={id.isUnknown} close={closeDefault} getStarted={getStartedDefault} {...props} />
}
