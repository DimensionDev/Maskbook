import * as React from 'react'
import Paper from '@material-ui/core/Paper/Paper'
import Typography from '@material-ui/core/Typography/Typography'
import { withStylesTyped } from '../../utils/theme'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'
import Button from '@material-ui/core/Button/Button'
import { VerticalCenter, FullWidth, createBox } from '../../utils/Flex'

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
}
export default withStylesTyped((theme: Theme) =>
    createStyles({
        paper: {
            padding: '3rem 3rem 1rem 3rem',
            textAlign: 'center',
            maxWidth: '35rem',
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
        },
    }),
)<Props>(function Welcome({ classes, create, restore }) {
    return (
        <Paper className={classes.paper}>
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
        </Paper>
    )
})
