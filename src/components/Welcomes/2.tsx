import * as React from 'react'
import { geti18nString } from '../../utils/i18n'
import { makeStyles, Paper, Typography, Button } from '@material-ui/core'

const useStyles = makeStyles(theme => ({
    paper: {
        padding: '2rem 1rem 1rem 1rem',
        textAlign: 'center',
        maxWidth: 600,
        width: '100%',
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
            <Button variant="contained" onClick={() => window.close()}>
                {geti18nString('welcome_2_greeting')}
            </Button>
        </Paper>
    )
}
