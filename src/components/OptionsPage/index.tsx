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

export function OptionsPage({ linkComponent }: { linkComponent?: any }) {
    const classes = useStyles()

    return (
        <Card className={classes.card}>
            <CardMedia className={classes.media} />
            <CardContent>
                <Typography gutterBottom variant="h5" component="h2">
                    {geti18nString('options_index_welcome')}
                </Typography>
            </CardContent>
            <CardActions>
                <Button component={linkComponent} to="/welcome" color="primary" variant="contained">
                    {geti18nString('options_index_setup')}
                </Button>
            </CardActions>
        </Card>
    )
}
