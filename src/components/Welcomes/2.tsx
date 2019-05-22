import * as React from 'react'
import Paper from '@material-ui/core/Paper/Paper'
import Typography from '@material-ui/core/Typography/Typography'
import { withStylesTyped } from '../../utils/theme'
import createStyles from '@material-ui/core/styles/createStyles'
import { geti18nString } from '../../utils/i18n'

interface Props {}
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
    }),
)<Props>(function Welcome({ classes }) {
    return (
        <Paper className={classes.paper}>
            <Typography variant="h5">{geti18nString('welcome-2-title')}</Typography>
            <Typography variant="subtitle1">{geti18nString('welcome-2-greeting')}</Typography>
        </Paper>
    )
})
