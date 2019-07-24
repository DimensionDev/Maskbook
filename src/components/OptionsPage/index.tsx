import React from 'react'
import {
    makeStyles,
    createStyles,
    Card,
    CardMedia,
    CardContent,
    Typography,
    CardActions,
    Button,
} from '@material-ui/core'
import { geti18nString } from '../../utils/i18n'
const useStyles = makeStyles(
    createStyles({
        card: {
            maxWidth: '30em',
            margin: 'auto',
            marginTop: '2em',
        },
        media: {
            background: '#232D36 url(https://maskbook.com/img/bg--warai-kamen.svg) fixed repeat',
            backgroundSize: '50%',
            height: '14em',
        },
    }),
)

export function OptionsPage(props: { linkComponent?: any; title: string; buttonTitle: string; to: string }) {
    const { linkComponent, title, buttonTitle, to } = props
    const classes = useStyles()

    return (
        <Card className={classes.card}>
            <CardMedia className={classes.media} />
            <CardContent>
                <Typography gutterBottom variant="h5" component="h2">
                    {title}
                </Typography>
            </CardContent>
            <CardActions>
                <Button component={linkComponent} to={to} color="primary" variant="contained">
                    {buttonTitle}
                </Button>
            </CardActions>
        </Card>
    )
}
