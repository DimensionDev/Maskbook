import { Grid, Box, Typography, Button } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import { useI18N } from '../../../utils/index.js'
import type { GoodGhostingInfo, Player } from '../types.js'
import { getPlayerStandings } from '../utils.js'
import { CircularDataDisplay } from './CircularDataDisplay.js'

const useStyles = makeStyles()((theme) => ({
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
    const { classes } = useStyles()
    const { t } = useI18N()
    const { value: players, loading, error, retry } = props.otherPlayerResult

    if (loading) {
        return (
            <Typography variant="h6" color="textSecondary">
                {t('plugin_good_ghosting_loading_other_player_stats')}
            </Typography>
        )
    } else if (error || !players) {
        return (
            <Box display="flex" flexDirection="column" alignItems="center">
                <Typography color="textPrimary">{t('go_wrong')}</Typography>
                <Button sx={{ marginTop: 1 }} size="small" onClick={retry}>
                    {t('retry')}
                </Button>
            </Box>
        )
    }

    const playerStandings = getPlayerStandings(players, props.info)

    return (
        <div className={classes.circularDataSection}>
            <Grid className={classes.infoRow} container justifyContent="center">
                <Grid className={classes.circularDataWrapper} item xs={6}>
                    <div className={classes.circularData}>
                        <CircularDataDisplay
                            header={t('plugin_good_ghosting_all_players_status_winning')}
                            title={playerStandings.winning}
                        />
                    </div>
                </Grid>
                <Grid className={classes.circularDataWrapper} item xs={6}>
                    <div className={classes.circularData}>
                        <CircularDataDisplay
                            header={t('plugin_good_ghosting_all_players_status_waiting')}
                            title={playerStandings.waiting}
                        />
                    </div>
                </Grid>
            </Grid>
            <Grid className={classes.infoRow} container justifyContent="center">
                <Grid className={classes.circularDataWrapper} item xs={6}>
                    <div className={classes.circularData}>
                        <CircularDataDisplay
                            header={t('plugin_good_ghosting_all_players_status_ghost')}
                            title={playerStandings.ghosts}
                        />
                    </div>
                </Grid>
                <Grid className={classes.circularDataWrapper} item xs={6}>
                    <div className={classes.circularData}>
                        <CircularDataDisplay
                            header={t('plugin_good_ghosting_all_players_status_dropout')}
                            title={playerStandings.dropouts}
                        />
                    </div>
                </Grid>
            </Grid>
        </div>
    )
}
