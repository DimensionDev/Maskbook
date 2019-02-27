import * as React from 'react'
import Paper from '@material-ui/core/Paper/Paper'
import Typography from '@material-ui/core/Typography/Typography'
import { withStylesTyped } from '../../utils/theme'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'
import Button from '@material-ui/core/Button/Button'

interface Props {
    next(): void
}
export default withStylesTyped((theme: Theme) =>
    createStyles({
        paper: {
            padding: '2rem 4rem 1rem 4rem',
            textAlign: 'center',
            maxWidth: '25rem',
            '& > *': {
                marginBottom: theme.spacing.unit * 3,
            },
        },
        button: {
            minWidth: 180,
        },
    }),
)<Props>(function Welcome({ classes, next }) {
    return (
        <Paper className={classes.paper}>
            <Typography variant="h5">Log in to your account</Typography>
            <Typography variant="subtitle1">Further instructions will show up after you log in.</Typography>
            <Button onClick={next} variant="contained" color="primary" className={classes.button}>
                OK
            </Button>
        </Paper>
    )
})
