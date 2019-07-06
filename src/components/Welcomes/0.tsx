import * as React from 'react'
import Close from '@material-ui/icons/Close'
import { geti18nString } from '../../utils/i18n'
import { makeStyles, Paper, Button, Typography, Box, Theme, useTheme } from '@material-ui/core'
import { styled } from '@material-ui/styles'

const VerticalCenter = styled('div')({ display: 'flex', flexDirection: 'column', justifyContent: 'center' })
const LinedBox = styled('div')(({ theme }: { theme: Theme }) => ({
    border: '1px solid #ddd',
    borderRadius: theme.shape.borderRadius,
    textAlign: 'start',
    padding: '1rem 1.25rem',
    margin: '2rem 0',
    display: 'flex',
}))

interface Props {
    create(): void
    restore(): void
    close(): void
}
const useStyles = makeStyles(theme => ({
    paper: {
        paddingBottom: '1rem',
        maxWidth: 600,
        width: '100%',
        boxSizing: 'border-box',
        '& article': {
            padding: '0 3rem',
            textAlign: 'center',
        },
    },
    title: {
        marginBottom: theme.spacing(3),
        color: theme.palette.grey[500],
    },
    subtitle: {
        maxWidth: '24rem',
        margin: 'auto',
    },
    button: {
        minWidth: 180,
        marginLeft: theme.spacing(2),
    },
    nav: {
        paddingTop: theme.spacing(1),
        paddingRight: theme.spacing(1),
        textAlign: 'right',
    },
    navButton: {
        color: theme.palette.text.hint,
    },
    navButtonIcon: {
        marginLeft: theme.spacing(1),
    },
}))
export default function Welcome({ create, restore, close }: Props) {
    const theme = useTheme()
    const classes = useStyles()
    return (
        <Paper elevation={2} className={classes.paper}>
            <nav className={classes.nav}>
                <Button onClick={close} disableFocusRipple disableRipple className={classes.navButton}>
                    {geti18nString('welcome_0_close_button')}
                    <Close className={classes.navButtonIcon} />
                </Button>
            </nav>
            <article>
                <Typography variant="h5" className={classes.title}>
                    {geti18nString('welcome_0_title')}
                </Typography>
                <Typography variant="subtitle1" className={classes.subtitle}>
                    {geti18nString('welcome_0_description')}
                </Typography>
                <LinedBox theme={theme}>
                    <Box flex={1}>
                        <Typography variant="body1">{geti18nString('welcome_0_new_user')}</Typography>
                        <Typography variant="h6">{geti18nString('welcome_0_connect_facebook')}</Typography>
                    </Box>
                    <VerticalCenter>
                        <Button onClick={create} variant="contained" color="primary" className={classes.button}>
                            {geti18nString('welcome_0_connect_facebook')}
                        </Button>
                    </VerticalCenter>
                </LinedBox>
                <LinedBox theme={theme}>
                    <Box flex={1}>
                        <Typography variant="body1">{geti18nString('welcome_0_old_user')}</Typography>
                        <Typography variant="h6">{geti18nString('welcome_0_restore_key')}</Typography>
                    </Box>
                    <VerticalCenter>
                        <Button onClick={restore} variant="outlined" className={classes.button}>
                            {geti18nString('restore')}
                        </Button>
                    </VerticalCenter>
                </LinedBox>
                <Typography variant="caption" className={classes.title}>
                    {geti18nString('welcome_0_caption')}
                </Typography>
            </article>
        </Paper>
    )
}
