import { formatBalance } from '@masknet/web3-shared'
import { Grid, Typography, Box, Button } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import type { GoodGhostingInfo, LendingPoolData } from '../types'
import { CircularDataDisplay } from './CircularDataDisplay'
import BigNumber from 'bignumber.js'
import { useGameToken, useRewardToken } from '../hooks/usePoolData'
import { useI18N } from '../../../utils'
import { getReadableInterval } from '../utils'

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

interface GameStatsViewProps {
    info: GoodGhostingInfo
    finDataResult: AsyncStateRetry<LendingPoolData>
}

export function GameStatsView(props: GameStatsViewProps) {
    const { classes } = useStyles()
    const { value: financialData, loading, error, retry } = props.finDataResult
    const gameToken = useGameToken()
    const rewardToken = useRewardToken()
    const { t } = useI18N()

    if (loading && !financialData) {
        return (
            <Typography variant="h6" color="textSecondary">
                Loading game stats
            </Typography>
        )
    } else if (error || !financialData) {
        return (
            <Box display="flex" flexDirection="column" alignItems="center">
                <Typography color="textPrimary">Something went wrong.</Typography>
                <Button sx={{ marginTop: 1 }} size="small" onClick={retry}>
                    Retry
                </Button>
            </Box>
        )
    }
    const gameLengthFormatted = getReadableInterval(props.info.segmentLength * (props.info.lastSegment + 1))
    const segmentLengthFormatted = getReadableInterval(props.info.segmentLength)
    return (
        <>
            <Grid className={classes.infoRow} container spacing={2}>
                <Grid item container xs={6} spacing={1}>
                    <Grid item>
                        <Typography variant="body1" color="textPrimary">
                            {t('plugin_good_ghosting_game_duration')}:
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Typography variant="body1" color="textSecondary">
                            {gameLengthFormatted}
                        </Typography>
                    </Grid>
                </Grid>
                <Grid item container xs={6} spacing={1}>
                    <Grid item>
                        <Typography variant="body1" color="textPrimary">
                            {t('plugin_good_ghosting_current_round')}:
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Typography variant="body1" color="textSecondary">
                            {Math.min(props.info.currentSegment + 1, props.info.lastSegment)} / {props.info.lastSegment}
                        </Typography>
                    </Grid>
                </Grid>
            </Grid>
            <Grid className={classes.infoRow} container spacing={2}>
                <Grid item container xs={6} spacing={1}>
                    <Grid item>
                        <Typography variant="body1" color="textPrimary">
                            {t('plugin_good_ghosting_recurring_deposit')}:
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Typography variant="body1" color="textSecondary">
                            {formatBalance(props.info.segmentPayment, gameToken.decimals)} {gameToken.symbol}
                        </Typography>
                    </Grid>
                </Grid>
                <Grid item container xs={6} spacing={1}>
                    <Grid item>
                        <Typography variant="body1" color="textPrimary">
                            {t('plugin_good_ghosting_round_length')}:
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Typography variant="body1" color="textSecondary">
                            {segmentLengthFormatted}
                        </Typography>
                    </Grid>
                </Grid>
            </Grid>

            <div className={classes.circularDataSection}>
                <Grid className={classes.infoRow} container justifyContent="center">
                    <Grid className={classes.circularDataWrapper} item xs={6}>
                        <div className={classes.circularData}>
                            <CircularDataDisplay
                                header={t('plugin_good_ghosting_pool_apy')}
                                title={financialData.poolAPY.toFixed(1)}
                                subtitle="%"
                            />
                        </div>
                    </Grid>
                    <Grid className={classes.circularDataWrapper} item xs={6}>
                        <div className={classes.circularData}>
                            <CircularDataDisplay
                                header={t('plugin_good_ghosting_pool_earnings')}
                                title={new BigNumber(
                                    formatBalance(financialData.poolEarnings, gameToken.decimals),
                                ).toFixed(1)}
                                subtitle={gameToken.symbol}
                            />
                        </div>
                    </Grid>
                </Grid>
                <Grid className={classes.infoRow} container justifyContent="center">
                    <Grid className={classes.circularDataWrapper} item xs={6}>
                        <div className={classes.circularData}>
                            <CircularDataDisplay
                                header={t('plugin_good_ghosting_extra_rewards')}
                                title={new BigNumber(formatBalance(financialData.reward, rewardToken.decimals)).toFixed(
                                    4,
                                )}
                                subtitle={rewardToken.symbol}
                            />
                        </div>
                    </Grid>
                    <Grid className={classes.circularDataWrapper} item xs={6}>
                        <div className={classes.circularData}>
                            <CircularDataDisplay
                                header={t('plugin_good_ghosting_total_saved')}
                                title={formatBalance(props.info.totalGamePrincipal, gameToken.decimals)}
                                subtitle={gameToken.symbol}
                            />
                        </div>
                    </Grid>
                </Grid>
            </div>
        </>
    )
}
