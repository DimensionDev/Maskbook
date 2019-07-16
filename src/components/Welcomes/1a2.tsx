import * as React from 'react'
import { getUrl } from '../../utils/utils'
import { geti18nString } from '../../utils/i18n'
import { Typography, Button, makeStyles } from '@material-ui/core'
import WelcomeContainer from './WelcomeContainer'

interface Props {
    next(): void
}
const useStyles = makeStyles(theme => ({
    paper: {
        padding: '2rem 1rem 1rem 1rem',
        textAlign: 'center',
        '& > *': {
            marginBottom: theme.spacing(3),
        },
    },
    button: {
        minWidth: 180,
    },
    img: {
        border: '1px solid #ddd',
        borderRadius: 5,
    },
}))
export default function Welcome({ next }: Props) {
    const classes = useStyles()
    return (
        <WelcomeContainer className={classes.paper}>
            <Typography variant="h5">{geti18nString('welcome_1a2_title')}</Typography>
            <img
                alt={geti18nString('welcome_1a2_imgalt')}
                src={getUrl(require('./1a2.jpg'))}
                width="75%"
                className={classes.img}
            />
            <Typography variant="subtitle1">{geti18nString('welcome_1a2_description')}</Typography>
            <Button onClick={next} variant="contained" color="primary" className={classes.button}>
                {geti18nString('welcome_1a2_done_button')}
            </Button>
        </WelcomeContainer>
    )
}
