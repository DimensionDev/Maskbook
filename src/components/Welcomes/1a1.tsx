import * as React from 'react'
import { Paper, Typography, Button, makeStyles } from '@material-ui/core'

interface Props {
    next(): void
}
const useStyles = makeStyles(theme => ({
    paper: {
        padding: '2rem 4rem 1rem 4rem',
        textAlign: 'center',
        width: 600,
        boxSizing: 'border-box',
        '& > *': {
            marginBottom: theme.spacing(3),
        },
    },
    button: {
        minWidth: 180,
    },
}))
export default function Welcome({ next }: Props) {
    const classes = useStyles()
    return (
        <Paper elevation={2} className={classes.paper}>
            <Typography variant="h5">Log in to your account</Typography>
            <Typography variant="subtitle1">Further instructions will show up after you log in.</Typography>
            <Button onClick={next} variant="contained" color="primary" className={classes.button}>
                OK
            </Button>
        </Paper>
    )
}
