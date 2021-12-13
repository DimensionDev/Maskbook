import { formatBalance } from '@masknet/web3-shared-evm'
import { Grid, Typography, Box, Button } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import type { GameAssets, GoodGhostingInfo, LendingPoolData, Player } from '../types'
import { CircularDataDisplay } from './CircularDataDisplay'
import BigNumber from 'bignumber.js'
import { useGameToken, useRewardToken } from '../hooks/usePoolData'
import { useI18N } from '../../../utils'
import { getGameFinancialData, getPlayerStandings, getReadableInterval } from '../utils'

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
    otherPlayerResult: AsyncStateRetry<Player[]>
    poolAssetsResult: AsyncStateRetry<GameAssets>
}

export function GameStatsView(props: GameStatsViewProps) {
    const { classes } = useStyles()
    const { value: financialData, loading, error, retry } = props.finDataResult
    const {
        value: otherPlayerData,
        loading: otherPlayerLoading,
        error: otherPlayerError,
        retry: otherPlayerRetry,
    } = props.otherPlayerResult
    const gameToken = useGameToken()
    const rewardToken = useRewardToken()
    const {
        value: poolAssetsValue,
        loading: poolAssetsLoading,
        error: poolAssetsError,
        retry: poolAssetsRetry,
    } = props.poolAssetsResult
    const { t } = useI18N()

    if ((loading && !financialData) || otherPlayerLoading || poolAssetsLoading) {
        return (
            <Typography variant="h6" color="textSecondary">
                {t('plugin_good_ghosting_loading_game_stats')}
            </Typography>
        )
    } else if (error || !financialData || otherPlayerError || !otherPlayerData || poolAssetsError || !poolAssetsValue) {
        const retryFailed = () => {
            if (error || !financialData) retry()
            else if (otherPlayerError || !otherPlayerData) otherPlayerRetry()
            else if (poolAssetsError || !poolAssetsValue) poolAssetsRetry()
        }
        return (
            <Box display="flex" flexDirection="column" alignItems="center">
                <Typography color="textPrimary">{t('go_wrong')}</Typography>
                <Button sx={{ marginTop: 1 }} size="small" onClick={retryFailed}>
                    {t('retry')}
                </Button>
            </Box>
        )
    }
    const gameLengthFormatted = getReadableInterval(props.info.segmentLength * (props.info.lastSegment + 1))
    const segmentLengthFormatted = getReadableInterval(props.info.segmentLength)
    const playerStandings = getPlayerStandings(otherPlayerData, props.info)
    const { poolAPY, poolEarnings, extraRewards } = getGameFinancialData(
        props.info,
        financialData,
        playerStandings,
        poolAssetsValue,
    )

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
                                title={poolAPY.toFixed(2)}
                                subtitle="%"
                            />
                        </div>
                    </Grid>
                    <Grid className={classes.circularDataWrapper} item xs={6}>
                        <div className={classes.circularData}>
                            <CircularDataDisplay
                                header={t('plugin_good_ghosting_pool_earnings')}
                                title={new BigNumber(formatBalance(poolEarnings, gameToken.decimals)).toFixed(2)}
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
                                title={new BigNumber(formatBalance(extraRewards, rewardToken.decimals)).toFixed(2)}
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
