import * as React from 'react'
import Paper from '@material-ui/core/Paper/Paper'
import Typography from '@material-ui/core/Typography/Typography'
import { withStylesTyped } from '../../utils/theme'
import createStyles from '@material-ui/core/styles/createStyles'
import Button from '@material-ui/core/Button/Button'
import { getUrl } from '../../utils/utils'

interface Props {
    next(): void
}
export default withStylesTyped(theme =>
    createStyles({
        paper: {
            padding: '2rem 1rem 1rem 1rem',
            textAlign: 'center',
            width: 600,
            boxSizing: 'border-box',
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
            <Typography variant="h5">Encrypt message use this postbox</Typography>
            <img src={getUrl(require('./1a2.jpg'))} width="75%" style={{ border: '1px solid #ddd', borderRadius: 5 }} />
            <Typography variant="subtitle1">
                Then only people you selected with Maskbook can see the post content
            </Typography>
            <Button onClick={next} variant="contained" color="primary" className={classes.button}>
                Nice!
            </Button>
        </Paper>
    )
})
