import * as React from 'react'
import { getUrl } from '../../utils/utils'
import { geti18nString } from '../../utils/i18n'
import { Paper, Typography, Button, makeStyles } from '@material-ui/core'

interface Props {
    next(): void
}
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
    button: {
        minWidth: 180,
    },
}))
export default function Welcome({ next }: Props) {
    const classes = useStyles()
    const date = new Date()
    const today = date.getFullYear() + '' + (date.getMonth() + 1) + '' + date.getDate()
    const filename = `maskbook-keystore-backup-${today}.json`
    return (
        <Paper elevation={2} className={classes.paper}>
            <Typography variant="h5">{geti18nString('welcome_1a3_title')}</Typography>
            <img alt="" src={getUrl(require('./1a3.jpg'))} width="auto" height={160} />
            <Typography variant="caption">{filename}</Typography>
            <Typography variant="subtitle1">
                {geti18nString('welcome_1a3_description1')}
                <br />
                {geti18nString('welcome_1a3_description2')}
            </Typography>
            <Button onClick={next} variant="contained" color="primary" className={classes.button}>
                {geti18nString('welcome_1a3_done_button')}
            </Button>
        </Paper>
    )
}
