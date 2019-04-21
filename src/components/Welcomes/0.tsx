import * as React from 'react'
import Paper from '@material-ui/core/Paper/Paper'
import Typography from '@material-ui/core/Typography/Typography'
import { withStylesTyped } from '../../utils/theme'
import createStyles from '@material-ui/core/styles/createStyles'
import Button from '@material-ui/core/Button/Button'
import { VerticalCenter, FullWidth, createBox } from '../../utils/components/Flex'

import Close from '@material-ui/icons/Close'

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
export default withStylesTyped(theme =>
    createStyles({
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
            marginBottom: theme.spacing.unit * 3,
        },
        subtitle: {
            maxWidth: '24rem',
            margin: 'auto',
        },
        button: {
            minWidth: 180,
            marginLeft: theme.spacing.unit * 2,
        },
        nav: {
            paddingTop: theme.spacing.unit,
            paddingRight: theme.spacing.unit,
            textAlign: 'right',
        },
        navButton: {
            color: theme.palette.text.hint,
        },
        navButtonIcon: {
            marginLeft: theme.spacing.unit,
        },
    }),
)<Props>(function Welcome({ classes, create, restore, close }) {
    return (
        <Paper className={classes.paper}>
            <nav className={classes.nav}>
                <Button onClick={close} disableFocusRipple disableRipple className={classes.navButton}>
                    I'll do it later
                    <Close className={classes.navButtonIcon} />
                </Button>
            </nav>
            <article>
                <Typography variant="h5" className={classes.title}>
                    Welcome to Maskbook
                </Typography>
                <Typography variant="subtitle1" className={classes.subtitle}>
                    You can post on Facebook without allowing Facebook to stalk, analyze, and peep into you.
                </Typography>
                <LinedBox>
                    <FullWidth>
                        <Typography variant="body1">New user?</Typography>
                        <Typography variant="h6">Connect Facebook Account</Typography>
                    </FullWidth>
                    <VerticalCenter>
                        <Button onClick={create} variant="contained" color="primary" className={classes.button}>
                            Connect Facebook
                        </Button>
                    </VerticalCenter>
                </LinedBox>
                <LinedBox>
                    <FullWidth>
                        <Typography variant="body1">Returning user?</Typography>
                        <Typography variant="h6">Restore Keyparis</Typography>
                    </FullWidth>
                    <VerticalCenter>
                        <Button onClick={restore} variant="outlined" className={classes.button}>
                            Restore
                        </Button>
                    </VerticalCenter>
                </LinedBox>
                <Typography variant="caption" className={classes.title}>
                    Lost your keystore backup? No worry. Simply start as a new user.
                </Typography>
            </article>
        </Paper>
    )
})
