import { Card, CardContent, Grid } from '@mui/material'
import type { UserBet } from '../types'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../../utils/i18n-next-ui'
import { BetInfos } from './BetInfos'
import { League } from './League'
import { Teams } from './Teams'
import { EventDate } from './EventDate'
import { Market } from './Market'

const useStyles = makeStyles()((theme) => ({
    container: {
        backgroundColor: theme.palette.background.default,
        border: '1px solid var(--mask-twitter-border-line)',
        borderRadius: 8,
        '& .MuiCardContent-root:last-child': {
            paddingBottom: theme.spacing(2),
        },
    },
    metas: { padding: theme.spacing(0, 2, 0, 0) },
}))

interface BetProps {
    bet: UserBet
    retry: () => void
}

export function Bet(props: BetProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const { bet, retry } = props

    return (
        <Card className={classes.container}>
            <CardContent>
                <Grid container direction="row" justifyContent="space-between" wrap="nowrap">
                    <Grid
                        className={classes.metas}
                        container
                        direction="row"
                        justifyContent="center"
                        alignItems="center">
                        <League name={bet.gameInfo.league} />
                        <Teams participants={bet.gameInfo.participants} />
                        <Market marketRegistryId={bet.marketRegistryId} />
                        <EventDate date={bet.gameInfo.startsAt} />
                    </Grid>
                    <BetInfos bet={bet} retry={retry} />
                </Grid>
            </CardContent>
        </Card>
    )
}
