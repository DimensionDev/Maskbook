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
            padding: '2rem 1rem 1rem 1rem',
            textAlign: 'center',
            maxWidth: '35rem',
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
            <Typography variant="h5">Check this box when you post</Typography>
            <img src={require('./1a2.jpg')} width="100%" />
            <Typography variant="subtitle1">Then only your friends with Maskbook can see the post content</Typography>
            <Button onClick={next} variant="contained" color="primary" className={classes.button}>
                Nice!
            </Button>
        </Paper>
    )
})
