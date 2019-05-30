import * as React from 'react'
import { geti18nString } from '../../utils/i18n'
import { makeStyles, Paper, Typography } from '@material-ui/core'

const useStyles = makeStyles(theme => ({
    paper: {
        padding: '2rem 1rem 1rem 1rem',
        textAlign: 'center',
        width: 600,
        boxSizing: 'border-box',
        '& > *': {
            marginBottom: theme.spacing(3),
        },
    },
}))
export default function Welcome() {
    const classes = useStyles()
    return (
        <Paper elevation={2} className={classes.paper}>
            <Typography variant="h5">{geti18nString('welcome_2_title')}</Typography>
            <Typography variant="subtitle1">{geti18nString('welcome_2_greeting')}</Typography>
        </Paper>
    )
}
