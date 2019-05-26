import * as React from 'react'
import { VerticalCenter, FullWidth, createBox } from '../../utils/components/Flex'

import Close from '@material-ui/icons/Close'
import { geti18nString } from '../../utils/i18n'
import { makeStyles, Paper, Button, Typography } from '@material-ui/core'

const LinedBox = createBox(theme => ({
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
        width: 600,
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
    const classes = useStyles()
    return (
        <Paper elevation={2} className={classes.paper}>
            <nav className={classes.nav}>
                <Button onClick={close} disableFocusRipple disableRipple className={classes.navButton}>
                    {geti18nString('welcome_0_title')}
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
                <LinedBox>
                    <FullWidth>
                        <Typography variant="body1">{geti18nString('welcome_0_new_user')}</Typography>
                        <Typography variant="h6">{geti18nString('welcome_0_connect_facebook')}</Typography>
                    </FullWidth>
                    <VerticalCenter>
                        <Button onClick={create} variant="contained" color="primary" className={classes.button}>
                            {geti18nString('welcome_0_connect_facebook')}
                        </Button>
                    </VerticalCenter>
                </LinedBox>
                <LinedBox>
                    <FullWidth>
                        <Typography variant="body1">{geti18nString('welcome_0_old_user')}</Typography>
                        <Typography variant="h6">{geti18nString('welcome_0_restore_key')}</Typography>
                    </FullWidth>
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
