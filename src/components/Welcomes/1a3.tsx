import * as React from 'react'
import Paper from '@material-ui/core/Paper/Paper'
import Typography from '@material-ui/core/Typography/Typography'
import { withStylesTyped } from '../../utils/theme'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'
import Button from '@material-ui/core/Button/Button'
import { fileReference } from '../../utils/utils'

interface Props {
    next(): void
}
export default withStylesTyped((theme: Theme) =>
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
    const date = new Date()
    const today = date.getFullYear() + '' + (date.getMonth() + 1) + '' + date.getDate()
    const filename = `maskbook-keystore-backup-${today}.json`
    return (
        <Paper className={classes.paper}>
            <Typography variant="h5">Keep your backups carefully</Typography>
            <img src={fileReference(require('./1a3.jpg'))} width="auto" height={160} />
            <Typography variant="caption">{filename}</Typography>
            <Typography variant="subtitle1">
                The first backup has been put in your Downloads folder.
                <br />
                And export backups frequently!
            </Typography>
            <Button onClick={next} variant="contained" color="primary" className={classes.button}>
                Got it!
            </Button>
        </Paper>
    )
})
