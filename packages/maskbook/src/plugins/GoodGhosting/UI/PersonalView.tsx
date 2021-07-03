import { makeStyles, Grid, Typography, Box, Button } from '@material-ui/core'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import { useI18N } from '../../../utils'
import type { GoodGhostingInfo, Player } from '../types'
import { getPlayerStatus, PlayerStatus } from '../utils'

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

interface PersonalViewProps {
    info: GoodGhostingInfo
    currentPlayerResult: AsyncStateRetry<Player>
}

export function PersonalView(props: PersonalViewProps) {
    const classes = useStyles()
    const { t } = useI18N()

    const { value: currentPlayer, loading, error, retry } = props.currentPlayerResult

    if (loading) {
        return (
            <Typography variant="h6" color="textSecondary">
                Loading game stats
            </Typography>
        )
    } else if (error) {
        return (
            <Box display="flex" flexDirection="column" alignItems="center">
                <Typography color="textPrimary">Something went wrong.</Typography>
                <Button sx={{ marginTop: 1 }} size="small" onClick={retry}>
                    Retry
                </Button>
            </Box>
        )
    } else if (!currentPlayer) {
        return (
            <Typography variant="h6" color="textSecondary">
                {t('plugin_good_ghosting_not_a_participant')}
            </Typography>
        )
    }

    let status = t('plugin_good_ghosting_status_unknown')

    switch (getPlayerStatus(currentPlayer, props.info.currentSegment)) {
        case PlayerStatus.Winning:
            status = t('plugin_good_ghosting_status_winning')
            break
        case PlayerStatus.Waiting:
            status = t('plugin_good_ghosting_status_waiting')
            break
        case PlayerStatus.Ghost:
            status = t('plugin_good_ghosting_status_ghost')
            break
        case PlayerStatus.Dropout:
            status = t('plugin_good_ghosting_status_dropout')
            break
    }

    return (
        <>
            <Grid className={classes.infoRow} container spacing={2}>
                <Grid item container xs={6} spacing={1}>
                    <Grid item>
                        <Typography variant="body1" color="textPrimary">
                            {t('plugin_good_ghosting_status')}:
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Typography variant="body1" color="textSecondary">
                            {status}
                        </Typography>
                    </Grid>
                </Grid>
                <Grid item container xs={6} spacing={1}>
                    <Grid item>
                        <Typography variant="body1" color="textPrimary">
                            {t('plugin_good_ghosting_deposits')}:
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Typography variant="body1" color="textSecondary">
                            {Number.parseInt(currentPlayer.mostRecentSegmentPaid) + 1} / {props.info.lastSegment}
                        </Typography>
                    </Grid>
                </Grid>
            </Grid>
        </>
    )
}
