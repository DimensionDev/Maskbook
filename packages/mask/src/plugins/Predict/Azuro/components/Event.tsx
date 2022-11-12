import { Card, CardContent, Grid } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../../utils'
import { Market } from './Market'
import { League } from './League'
import { Teams } from './Teams'
import { EventDate } from './EventDate'
import { Odds } from './Odds.js'
import type { Event as EventType } from '../types.js'

const useStyles = makeStyles()((theme) => ({
    metas: { padding: theme.spacing(0, 2, 0, 0) },
    game: {
        backgroundColor: theme.palette.background.default,
        border: '1px solid var(--mask-twitter-border-line)',
        borderRadius: 8,
        '& .MuiCardContent-root:last-child': {
            paddingBottom: theme.spacing(2),
        },
    },
    choicesContainer: {
        width: 460,
        borderLeft: '1px solid var(--mask-twitter-border-line)',
        padding: theme.spacing(0, 1, 0, 3),
    },
}))

interface EventProps {
    key: string
    event: EventType
    isUserBet?: boolean
}

export function Event(props: EventProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const { event } = props

    return (
        <Card className={classes.game}>
            <CardContent>
                <Grid container direction="row" justifyContent="space-between" wrap="nowrap">
                    <Grid
                        className={classes.metas}
                        container
                        direction="row"
                        justifyContent="center"
                        alignItems="center">
                        <League name={event.titleLeague} />
                        <Teams participants={event.participants} />
                        <EventDate date={event.startDate} />
                        <Market {...event} />
                    </Grid>
                    <Grid
                        container
                        justifyContent="center"
                        direction="column"
                        className={classes.choicesContainer}
                        wrap="nowrap">
                        <Odds event={event} />
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    )
}
