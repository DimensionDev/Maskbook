import {
    EthereumTokenType,
    formatAmount,
    formatBalance,
    FungibleTokenDetailed,
    pow10,
    TransactionStateType,
    useTokenBalance,
} from '@masknet/web3-shared'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
    DialogContent,
    DialogContentText,
    DialogActions,
    Typography,
    Grid,
    Divider,
    CircularProgress,
} from '@material-ui/core'
import { makeStyles } from '@masknet/theme'

import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { useI18N } from '../../../utils/i18n-next-ui'
import { TokenAmountPanel } from '../../../web3/UI/TokenAmountPanel'
import { AmmOutcome, LiquidityActionType, Market } from '../types'
import { MINIMUM_BALANCE, MINIMUM_INITIAL_LP, OUTCOME_PRICE_PRECISION, SHARE_DECIMALS } from '../constants'
import { useAmmExchange } from '../hooks/useAmmExchange'
import { useEstimateAddLiquidityPool } from '../hooks/useEstimateAddLiquidity'
import { calcPricesFromOdds, significantOfAmount } from '../utils'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import { EthereumERC20TokenApprovedBoundary } from '../../../web3/UI/EthereumERC20TokenApprovedBoundary'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { Trans } from 'react-i18next'
import { useAddLiquidityCallback } from '../hooks/useAddLiquidity'
import { useRemoteControlledDialog } from '@masknet/shared'
import { WalletMessages } from '@masknet/plugin-wallet'
import { RefreshIcon } from '@masknet/icons'

const useStyles = makeStyles()((theme) => ({
    form: {
        '& > *': {
            margin: theme.spacing(1, 0),
        },
    },
    root: {
        margin: theme.spacing(2, 0),
    },
    section: {
        margin: `${theme.spacing(1)} auto`,
    },
    spacing: {
        padding: theme.spacing(2),
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
    },
    predictions: {
        gridGap: '.5rem',
        marginBottom: theme.spacing(1),
        '& > .MuiGrid-item': {
            padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
            border: `solid .0625rem ${theme.palette.divider}`,
            borderRadius: '.5rem',
        },
    },
    inputBase: {
        height: 16,
    },
    lable: {
        textAlign: 'right',
    },
    divider: {
        marginTop: `-${theme.spacing(1)}`,
        marginBottom: `-${theme.spacing(1)}`,
    },
    button: {
        margin: theme.spacing(1.5, 0),
        padding: 12,
    },
    footer: {
        marginTop: theme.spacing(1.5),
    },
    estimate: {
        textAlign: 'center',
    },
    refresh: {
        bottom: theme.spacing(1),
        right: theme.spacing(1),
        fontSize: 'inherit',
    },
    progress: {
        textAlign: 'center',
        bottom: theme.spacing(1),
        right: theme.spacing(1),
        padding: theme.spacing(1),
    },
}))

interface LiquidityDialogProps {
    open: boolean
    onClose: () => void
    market: Market
    token: FungibleTokenDetailed
    ammOutcomes: AmmOutcome[]
    onConfirm?: () => void
}

export function LiquidityDialog(props: LiquidityDialogProps) {
    const { open, market, token, ammOutcomes, onConfirm, onClose } = props
    const { classes } = useStyles()
    const { t } = useI18N()
    const [inputAmount, setInputAmount] = useState('')
    const [significant, setSignificant] = useState(4)
    const amount = new BigNumber(formatAmount(inputAmount || '0', token?.decimals ?? 0))

    const { value: ammExchange, loading: loadingAmm, error: errorAmm, retry: retryAmm } = useAmmExchange(market)

    const chainInputAmount = formatAmount(inputAmount || '0', token.decimals)

    const {
        value: estimatedResult,
        loading: loadingEstimatedResult,
        error: errorEstimatedResult,
        retry: retryEstimatedResult,
    } = useEstimateAddLiquidityPool(market, ammExchange, chainInputAmount)

    const formattedLpTokens = formatBalance(
        estimatedResult?.amount ?? '0',
        SHARE_DECIMALS,
        significantOfAmount(new BigNumber(estimatedResult?.amount ?? 0).dividedBy(pow10(SHARE_DECIMALS))),
    )
    //#region amount
    const {
        value: _tokenBalance = '0',
        loading: loadingTokenBalance,
        error: errorTokenBalance,
        retry: retryTokenBalance,
    } = useTokenBalance(token.type, token.address ?? '')
    // Reduce balance accuracy to $BALANCE_DECIMALS
    const tokenBalance = useMemo(() => {
        const formattedBalance = new BigNumber(formatBalance(_tokenBalance, token?.decimals ?? 0))
        if (formattedBalance.isLessThan(MINIMUM_BALANCE)) return '0'
        return _tokenBalance
    }, [_tokenBalance])
    //#endregion

    // region populate outcome prices when this is create action
    const populatedOutcomes = useMemo(() => {
        if (estimatedResult?.type === LiquidityActionType.Create || ammOutcomes.some((o) => o.rate.isZero()))
            return calcPricesFromOdds(
                market.initialOdds,
                ammOutcomes.sort((a, b) => a.id - b.id),
            )
        return ammOutcomes
    }, [ammOutcomes, market.initialOdds, estimatedResult])

    // calc the significant
    useEffect(() => {
        const formattedBalance = new BigNumber(formatBalance(tokenBalance, token?.decimals ?? 0))
        setSignificant(significantOfAmount(formattedBalance))
    }, [tokenBalance])
    //#endregion

    const onDialogClose = () => {
        setInputAmount('')
        onClose()
    }

    //#region blocking
    const [addLiquidityState, addLiquidityCallback, resetAddLiquidityCallback] = useAddLiquidityCallback(
        amount.toFixed(),
        estimatedResult,
        market,
        token,
    )
    //#endregion

    // on close transaction dialog
    const { setDialog: setTransactionDialogOpen } = useRemoteControlledDialog(
        WalletMessages.events.transactionDialogUpdated,
        useCallback(
            (ev) => {
                if (!ev.open) {
                    retryTokenBalance()
                    if (addLiquidityState.type === TransactionStateType.HASH) onDialogClose()
                }
                if (addLiquidityState.type === TransactionStateType.HASH) setInputAmount('')
                resetAddLiquidityCallback()
            },
            [addLiquidityState, retryTokenBalance, onDialogClose],
        ),
    )

    // open the transaction dialog
    useEffect(() => {
        if (!token || !market) return
        if (addLiquidityState.type === TransactionStateType.UNKNOWN) return
        if (addLiquidityState.type === TransactionStateType.CONFIRMED) {
            onConfirm ? onConfirm() : null
            return
        }
        setTransactionDialogOpen({
            open: true,
            state: addLiquidityState,
            summary: `Adding ${inputAmount} ${token.symbol} liquidity to ${market.description} pool.`,
        })
    }, [addLiquidityState /* update tx dialog only if state changed */])
    //#endregion

    //#region submit button
    const validationMessage = useMemo(() => {
        if (!amount || amount.isZero()) return t('plugin_dhedge_enter_an_amount')
        if (amount.isGreaterThan(tokenBalance))
            return t('plugin_dhedge_insufficient_balance', {
                symbol: token?.symbol,
            })
        if (
            estimatedResult?.type === LiquidityActionType.Create &&
            amount.isLessThan(formatAmount(MINIMUM_INITIAL_LP, token.decimals))
        )
            return t('plugin_dhedge_low_initial_lp', { amount: MINIMUM_INITIAL_LP, symbol: token.symbol })
        return ''
    }, [amount.toFixed(), token, tokenBalance, ammExchange, estimatedResult])
    //#endregion

    return (
        <InjectedDialog
            className={classes.root}
            open={open}
            onClose={onDialogClose}
            title={t('plugin_augur_add_liquidity')}
            maxWidth="xs">
            <DialogContent>
                {loadingAmm ? (
                    <Typography textAlign="center">
                        <CircularProgress className={classes.progress} color="primary" size={15} />
                    </Typography>
                ) : errorAmm || errorTokenBalance ? (
                    <Typography textAlign="center" color="textPrimary">
                        {t('plugin_augur_smt_wrong')}
                        <RefreshIcon
                            className={classes.refresh}
                            color="primary"
                            onClick={errorAmm ? retryAmm : retryTokenBalance}
                        />
                    </Typography>
                ) : (
                    <>
                        <form className={classes.form} noValidate autoComplete="off">
                            <TokenAmountPanel
                                label={t('wallet_transfer_amount')}
                                amount={inputAmount}
                                balance={tokenBalance ?? '0'}
                                token={token}
                                onAmountChange={setInputAmount}
                                significant={significant}
                            />
                        </form>
                        <div className={classes.section}>
                            <Typography variant="body1" color="textPrimary">
                                {t('plugin_augur_current_prices')}
                            </Typography>
                            <Grid container direction="column" className={`${classes.spacing} ${classes.predictions}`}>
                                <Grid item container justifyContent="space-between">
                                    {populatedOutcomes
                                        .sort((a, b) => b.id - a.id)
                                        .map((v, i) => (
                                            <Grid item container key={v.id}>
                                                <Grid item flex={7}>
                                                    <Typography variant="body2">
                                                        {market.outcomes[v.id].name}
                                                    </Typography>
                                                </Grid>
                                                <Divider
                                                    orientation="vertical"
                                                    flexItem
                                                    classes={{ root: classes.divider }}
                                                />
                                                <Grid item flex={1}>
                                                    <Typography variant="body2" className={classes.lable}>
                                                        {'$' + v.rate.toFixed(OUTCOME_PRICE_PRECISION)}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        ))}
                                </Grid>
                            </Grid>
                            <Typography variant="h6" color="textPrimary">
                                {t('plugin_augur_you_receive')}
                            </Typography>
                            <div className={classes.estimate}>
                                {loadingEstimatedResult ? (
                                    <CircularProgress className={classes.progress} color="primary" size={15} />
                                ) : errorEstimatedResult ? (
                                    <RefreshIcon
                                        className={classes.refresh}
                                        color="primary"
                                        onClick={retryEstimatedResult}
                                    />
                                ) : (
                                    <>
                                        <Grid item container justifyContent="space-between">
                                            {estimatedResult?.minAmounts
                                                ?.filter((v) => !v.hide)
                                                .map((v, i) => (
                                                    <Grid item container key={v.outcomeId}>
                                                        <Grid item>
                                                            <Typography color="textSecondary" variant="body2">
                                                                {market.outcomes[v.outcomeId].name}
                                                            </Typography>
                                                        </Grid>
                                                        <Divider
                                                            orientation="vertical"
                                                            flexItem
                                                            classes={{ root: classes.divider }}
                                                        />
                                                        <Grid item flex={1}>
                                                            <Typography variant="body2" className={classes.lable}>
                                                                {formatBalance(
                                                                    v.amount,
                                                                    SHARE_DECIMALS,
                                                                    significantOfAmount(
                                                                        new BigNumber(v.amount).dividedBy(
                                                                            pow10(SHARE_DECIMALS),
                                                                        ),
                                                                    ),
                                                                )}
                                                            </Typography>
                                                        </Grid>
                                                    </Grid>
                                                ))}
                                        </Grid>
                                        <Grid container justifyContent="space-between">
                                            <Grid item>
                                                <Typography variant="body1" color="textSecondary">
                                                    {t('plugin_augur_lp_tokens')}
                                                </Typography>
                                            </Grid>
                                            <Grid item>
                                                <Typography variant="body1" color="textPrimary  ">
                                                    {estimatedResult?.amount ? formattedLpTokens : '-'}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                        <Grid container justifyContent="space-between">
                                            <Grid item>
                                                <Typography variant="body1" color="textSecondary">
                                                    {t('plugin_augur_pool_share_pct')}
                                                </Typography>
                                            </Grid>
                                            <Grid item>
                                                <Typography variant="body1" color="textPrimary  ">
                                                    {estimatedResult?.poolPct ?? '-'}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </>
                                )}
                            </div>
                            <DialogActions>
                                <EthereumWalletConnectedBoundary>
                                    <EthereumERC20TokenApprovedBoundary
                                        amount={amount.toFixed()}
                                        spender={market.ammExchange?.address}
                                        token={token?.type === EthereumTokenType.ERC20 ? token : undefined}>
                                        <ActionButton
                                            className={classes.button}
                                            fullWidth
                                            disabled={!!validationMessage}
                                            onClick={errorTokenBalance ? retryTokenBalance : addLiquidityCallback}
                                            variant="contained"
                                            loading={loadingTokenBalance || loadingAmm}>
                                            {errorTokenBalance
                                                ? t('plugin_augur_balance_wrong')
                                                : validationMessage || t('plugin_augur_add_liquidity')}
                                        </ActionButton>
                                    </EthereumERC20TokenApprovedBoundary>
                                </EthereumWalletConnectedBoundary>
                            </DialogActions>
                            <Divider />
                            <DialogContentText classes={{ root: classes.footer }}>
                                <Trans i18nKey="plugin_augur_add_liquidity_footer" />
                            </DialogContentText>
                        </div>
                    </>
                )}
            </DialogContent>
        </InjectedDialog>
    )
}
