import { Card, CardContent, Grid } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import type { Odds as Pick } from '../types'
import { useI18N } from '../../../../utils'
import type { AzuroGame } from '@azuro-protocol/sdk'
import { Market } from './Market'
import { League } from './League'
import { Teams } from './Teams'
import { EventDate } from './EventDate'
import { Odds } from './Odds'

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
    game: AzuroGame
    isUserBet?: boolean
    setOpenPlaceBetDialog: () => void
    setConditionPick: (condition: Pick | null) => void
    setGamePick: (game: AzuroGame | null) => void
}

export function Event(props: EventProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const { game, setOpenPlaceBetDialog, setConditionPick, setGamePick } = props

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
                        <League name={game.league} />
                        <Teams participants={game.participants} />
                        <EventDate date={game.startsAt} />
                        <Market marketRegistryId={game.marketRegistryId} />
                    </Grid>
                    <Grid
                        container
                        justifyContent="center"
                        direction="column"
                        className={classes.choicesContainer}
                        wrap="nowrap">
                        <Odds
                            game={game}
                            setOpenPlaceBetDialog={setOpenPlaceBetDialog}
                            setPick={setConditionPick}
                            setGamePick={setGamePick}
                        />
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    )
}
