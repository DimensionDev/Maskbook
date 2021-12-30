import {
    formatBalance,
    formatEthereumAddress,
    resolveTransactionLinkOnExplorer,
    TransactionStateType,
    useChainId,
} from '@masknet/web3-shared-evm'
import { Grid, Typography, Button, Link } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useState } from 'react'
import { useI18N } from '../../../utils'
import { useEarlyWithdraw } from '../hooks/useGameActions'
import { useGameToken } from '../hooks/usePoolData'
import type { GoodGhostingInfo, Player } from '../types'
import { getPlayerStatus, isGameActionError, PlayerStatus } from '../utils'
import BigNumber from 'bignumber.js'
import { FormattedBalance } from '@masknet/shared'

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
    withdraw: {
        marginTop: theme.spacing(5),
        textAlign: 'center',
    },
}))

interface PersonalViewProps {
    info: GoodGhostingInfo
}

export function PersonalView(props: PersonalViewProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const chainId = useChainId()
    const gameToken = useGameToken()
    const { canEarlyWithdraw, earlyWithdraw } = useEarlyWithdraw(props.info)
    const [buttonEnabled, setButtonEnabled] = useState(true)
    const [errorState, setErrorState] = useState<{ message?: string; link?: string }>({})

    const status = usePlayerStatusMessage(props.info, props.info.currentPlayer)

    if (!props.info.currentPlayer) {
        return (
            <Typography variant="h6" color="textSecondary">
                {t('plugin_good_ghosting_not_a_participant')}
            </Typography>
        )
    }

    const withdraw = async () => {
        setButtonEnabled(false)
        setErrorState({})
        try {
            await earlyWithdraw()
        } catch (error) {
            if (isGameActionError(error) && error.transactionHash) {
                const link = resolveTransactionLinkOnExplorer(chainId, error.transactionHash)
                if (error.gameActionStatus === TransactionStateType.CONFIRMED) {
                    setErrorState({
                        message: t('plugin_good_ghosting_tx_fail'),
                        link,
                    })
                } else {
                    setErrorState({
                        message: t('plugin_good_ghosting_tx_timeout'),
                        link,
                    })
                }
            } else {
                setErrorState({
                    message: t('plugin_good_ghosting_something_went_wrong'),
                })
            }
        } finally {
            setButtonEnabled(true)
        }
    }

    const earlyWithdrawalFee = new BigNumber(props.info.currentPlayer.amountPaid)
        .multipliedBy(props.info.earlyWithdrawalFee)
        .dividedBy(100)

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
                            <FormattedBalance
                                value={props.info.currentPlayer.amountPaid}
                                decimals={gameToken.decimals}
                                symbol={gameToken.symbol}
                                formatter={formatBalance}
                            />
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
                            {Number.parseInt(props.info.currentPlayer.mostRecentSegmentPaid, 10) + 1} /{' '}
                            {props.info.lastSegment}
                        </Typography>
                    </Grid>
                </Grid>
            </Grid>
            {canEarlyWithdraw && (
                <div className={classes.withdraw}>
                    <Typography variant="subtitle2" color="textSecondary">
                        {t('plugin_good_ghosting_early_withdraw_info', {
                            amount: formatBalance(earlyWithdrawalFee, gameToken.decimals),
                            token: gameToken.symbol,
                        })}
                    </Typography>
                    <Button color="primary" disabled={!buttonEnabled} onClick={() => withdraw()}>
                        {t('plugin_good_ghosting_leave_game')}
                    </Button>
                    <Typography variant="body1" color="textPrimary">
                        {errorState.message}
                    </Typography>
                    {errorState.link && (
                        <Link color="primary" target="_blank" rel="noopener noreferrer" href={errorState.link}>
                            <Typography variant="subtitle1">{t('plugin_good_ghosting_view_on_explorer')}</Typography>
                        </Link>
                    )}
                </div>
            )}
        </>
    )
}

function usePlayerStatusMessage(info: GoodGhostingInfo, player?: Player) {
    const { t } = useI18N()

    switch (getPlayerStatus(info, player)) {
        case PlayerStatus.Winning:
            return t('plugin_good_ghosting_status_winning')
        case PlayerStatus.Waiting:
            return t('plugin_good_ghosting_status_waiting')
        case PlayerStatus.Ghost:
            return t('plugin_good_ghosting_status_ghost')
        case PlayerStatus.Dropout:
            return t('plugin_good_ghosting_status_dropout')
        default:
            return t('plugin_good_ghosting_status_unknown')
    }
}
