import { formatBalance, formatEthereumAddress } from '@masknet/web3-shared'
import { makeStyles, Grid, Typography } from '@material-ui/core'
import { useI18N } from '../../../utils'
import { useGameToken } from '../hooks/usePoolData'
import type { GoodGhostingInfo } from '../types'
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
}

export function PersonalView(props: PersonalViewProps) {
    const classes = useStyles()
    const { t } = useI18N()
    const gameToken = useGameToken()

    if (!props.info.currentPlayer) {
        return (
            <Typography variant="h6" color="textSecondary">
                {t('plugin_good_ghosting_not_a_participant')}
            </Typography>
        )
    }

    let status = t('plugin_good_ghosting_status_unknown')

    switch (getPlayerStatus(props.info.currentPlayer, props.info.currentSegment)) {
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
                            {t('plugin_good_ghosting_address')}:
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Typography variant="body1" color="textSecondary">
                            {formatEthereumAddress(props.info.currentPlayer.addr, 4)}
                        </Typography>
                    </Grid>
                </Grid>
                <Grid item container xs={6} spacing={1}>
                    <Grid item>
                        <Typography variant="body1" color="textPrimary">
                            {t('plugin_good_ghosting_total_deposited')}:
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Typography variant="body1" color="textSecondary">
                            {formatBalance(props.info.currentPlayer.amountPaid, gameToken.decimals)} {gameToken.symbol}
                        </Typography>
                    </Grid>
                </Grid>
            </Grid>
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
                            {Number.parseInt(props.info.currentPlayer.mostRecentSegmentPaid) + 1} /{' '}
                            {props.info.lastSegment}
                        </Typography>
                    </Grid>
                </Grid>
            </Grid>
        </>
    )
}
