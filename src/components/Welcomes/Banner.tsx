import * as React from 'react'
import CloseIcon from '@material-ui/icons/Close'
import { geti18nString } from '../../utils/i18n'
import { makeStyles } from '@material-ui/styles'
import { AppBar, Toolbar, Typography, Button, IconButton, Box } from '@material-ui/core'

interface Props {
    getStarted(): void
    close(): void
    disabled?: boolean
}
const useStyles = makeStyles({
    root: {
        border: '1px solid #ccc',
        borderRadius: 4,
        marginBottom: 10,
    },
    toolbar: {
        display: 'flex',
        paddingRight: 0,
    },
    button: {
        padding: '4px 3em',
    },
    close: {
        margin: 6,
        padding: 6,
    },
})
export function Banner(props: Props) {
    const classes = useStyles()
    return (
        <AppBar position="static" color="default" elevation={0} classes={{ root: classes.root }}>
            <Toolbar className={classes.toolbar}>
                <Box flex={1}>
                    <Typography variant="subtitle1" color="inherit">
                        {props.disabled ? geti18nString('banner_collecting_identity') : geti18nString('banner_title')}
                    </Typography>
                </Box>
                <Button
                    onClick={props.getStarted}
                    classes={{ root: classes.button }}
                    variant="contained"
                    disabled={props.disabled}
                    color="primary">
                    {geti18nString('banner_get_started')}
                </Button>
                <IconButton
                    aria-label={geti18nString('banner_dismiss_aria')}
                    onClick={props.close}
                    classes={{ root: classes.close }}>
                    <CloseIcon />
                </IconButton>
            </Toolbar>
        </AppBar>
    )
}
