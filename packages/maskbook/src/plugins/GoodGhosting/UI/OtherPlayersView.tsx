import { makeStyles, Grid, Box, Typography, Button } from '@material-ui/core'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import type { GoodGhostingInfo, Player, PlayerStandings } from '../types'
import { getPlayerStatus, PlayerStatus } from '../utils'
import { CircularDataDisplay } from './CircularDataDisplay'

const useStyles = makeStyles((theme) => ({
    infoRow: {
        paddingBottom: theme.spacing(1),
    },
    circularDataSection: {
        paddingTop: theme.spacing(2),
    },
    circularDataWrapper: {
        minWidth: '80px',
    },
    circularData: {
        padding: theme.spacing(1),
        maxWidth: '100px',
        margin: 'auto',
    },
}))

interface OtherPlayersViewProps {
    info: GoodGhostingInfo
    otherPlayerResult: AsyncStateRetry<Player[]>
}

export function OtherPlayersView(props: OtherPlayersViewProps) {
    const classes = useStyles()
    const { value: players, loading, error, retry } = props.otherPlayerResult

    if (loading) {
        return (
            <Typography variant="h6" color="textSecondary">
                Loading other players' stats
            </Typography>
        )
    } else if (error || !players) {
        return (
            <Box display="flex" flexDirection="column" alignItems="center">
                <Typography color="textPrimary">Something went wrong.</Typography>
                <Button sx={{ marginTop: 1 }} size="small" onClick={retry}>
                    Retry
                </Button>
            </Box>
        )
    }

    let playerInfo: PlayerStandings = {
        winning: 0,
        waiting: 0,
        ghosts: 0,
        dropouts: 0,
    }

    if (players.length) {
        players.forEach((player, i) => {
            const playerStatus = getPlayerStatus(player, props.info.currentSegment)

            if (playerStatus === PlayerStatus.Dropout) playerInfo.dropouts += 1
            else if (playerStatus === PlayerStatus.Ghost) playerInfo.ghosts += 1
            else if (playerStatus === PlayerStatus.Waiting) playerInfo.waiting += 1
            else if (playerStatus === PlayerStatus.Winning) playerInfo.winning += 1
        })
    }

    return (
        <div className={classes.circularDataSection}>
            <Grid className={classes.infoRow} container justifyContent={'center'}>
                <Grid className={classes.circularDataWrapper} item xs={6}>
                    <div className={classes.circularData}>
                        <CircularDataDisplay header={'Winning'} title={`${playerInfo.winning}`} />
                    </div>
                </Grid>
                <Grid className={classes.circularDataWrapper} item xs={6}>
                    <div className={classes.circularData}>
                        <CircularDataDisplay header={'Waiting'} title={`${playerInfo.waiting}`} />
                    </div>
                </Grid>
            </Grid>
            <Grid className={classes.infoRow} container justifyContent={'center'}>
                <Grid className={classes.circularDataWrapper} item xs={6}>
                    <div className={classes.circularData}>
                        <CircularDataDisplay header={'Ghosts'} title={`${playerInfo.ghosts}`} />
                    </div>
                </Grid>
                <Grid className={classes.circularDataWrapper} item xs={6}>
                    <div className={classes.circularData}>
                        <CircularDataDisplay header={'Drop-outs'} title={`${playerInfo.dropouts}`} />
                    </div>
                </Grid>
            </Grid>
        </div>
    )
}
