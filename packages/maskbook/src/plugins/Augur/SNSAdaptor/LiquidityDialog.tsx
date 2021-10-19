import {
    EthereumTokenType,
    formatAmount,
    formatBalance,
    FungibleTokenDetailed,
    pow10,
    TransactionStateType,
    useFungibleTokenBalance,
    useTransactionState,
    ZERO,
} from '@masknet/web3-shared-evm'
import { BigNumber as BN } from 'bignumber.js'
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
import { useEstimateLiquidityPool } from '../hooks/useEstimateLiquidity'
import { calcPricesFromOdds, significantOfAmount } from '../utils'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import { EthereumERC20TokenApprovedBoundary } from '../../../web3/UI/EthereumERC20TokenApprovedBoundary'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { Trans } from 'react-i18next'
import { useAddLiquidityCallback } from '../hooks/useAddLiquidity'
import { useRemoteControlledDialog } from '@masknet/shared'
import { WalletMessages } from '@masknet/plugin-wallet'
import { RefreshIcon } from '@masknet/icons'
import { useRemoveLiquidityCallback } from '../hooks/useRemoveLiquidity'

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
    label: {
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
    cashToken: FungibleTokenDetailed
    ammOutcomes: AmmOutcome[]
    type: LiquidityActionType
    onConfirm?: () => void
}

export function LiquidityDialog(props: LiquidityDialogProps) {
    const { open, market, cashToken, ammOutcomes, type, onConfirm, onClose } = props
    const { classes } = useStyles()
    const { t } = useI18N()
    const [inputAmount, setInputAmount] = useState('')
    const [significant, setSignificant] = useState(4)
    const [token, setToken] = useState<FungibleTokenDetailed>(cashToken)
    const [state, setState] = useTransactionState()

    const outputDecimals = type === LiquidityActionType.Remove ? cashToken.decimals : SHARE_DECIMALS
    const { value: ammExchange, loading: loadingAmm, error: errorAmm, retry: retryAmm } = useAmmExchange(market)
    useEffect(() => {
        if (type === LiquidityActionType.Remove && ammExchange?.lpToken) setToken(ammExchange.lpToken)
        else setToken(cashToken)
    }, [type, ammExchange])

    const amount = new BN(formatAmount(inputAmount || '0', token?.decimals ?? 0))
    const chainInputAmount = formatAmount(inputAmount || '0', token.decimals)
    const {
        value: estimatedResult,
        loading: loadingEstimatedResult,
        error: errorEstimatedResult,
        retry: retryEstimatedResult,
    } = useEstimateLiquidityPool(market, ammExchange, chainInputAmount, ammOutcomes, type)

    const displayEstimatedAmount = new BN(formatBalance(estimatedResult?.amount ?? 0, outputDecimals))
    const formattedReceiveToken = formatBalance(
        estimatedResult?.amount ?? '0',
        outputDecimals,
        significantOfAmount(displayEstimatedAmount),
    )

    //#region amount
    const {
        value: _tokenBalance = '0',
        loading: loadingTokenBalance,
        error: errorTokenBalance,
        retry: retryTokenBalance,
    } = useFungibleTokenBalance(token.type, token.address ?? '')

    // Reduce balance accuracy to $BALANCE_DECIMALS
    const _formattedBalance = new BN(formatBalance(_tokenBalance, token?.decimals ?? 0))
    const tokenBalance = useMemo(() => {
        if (_formattedBalance.isLessThan(MINIMUM_BALANCE)) return ZERO
        return new BN(_tokenBalance)
    }, [_tokenBalance])

    const formattedBalance = formatBalance(tokenBalance, token?.decimals ?? 0)
    useEffect(() => {
        if (type === LiquidityActionType.Remove) setInputAmount(formattedBalance)
    }, [open, formattedBalance])

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
        const formattedBalance = new BN(formatBalance(tokenBalance, token?.decimals ?? 0))
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
    const [removeLiquidityState, removeLiquidityCallback, resetRemoveLiquidityCallback] = useRemoveLiquidityCallback(
        amount.toFixed(),
        market,
        ammExchange,
        token,
    )

    useEffect(() => {
        if (type === LiquidityActionType.Remove) {
            setState(removeLiquidityState)
        } else {
            setState(addLiquidityState)
        }
    }, [type, addLiquidityState, removeLiquidityState])

    const callback = useMemo(() => {
        if (type === LiquidityActionType.Remove) {
            return removeLiquidityCallback
        } else {
            return addLiquidityCallback
        }
    }, [type, addLiquidityCallback, removeLiquidityCallback])

    const resetCallback = useMemo(() => {
        if (type === LiquidityActionType.Remove) {
            return resetRemoveLiquidityCallback
        } else {
            return resetAddLiquidityCallback
        }
    }, [type, resetRemoveLiquidityCallback, resetAddLiquidityCallback])
    //#endregion

    // on close transaction dialog
    const { setDialog: setTransactionDialogOpen } = useRemoteControlledDialog(
        WalletMessages.events.transactionDialogUpdated,
        useCallback(
            (ev) => {
                if (!ev.open) {
                    retryTokenBalance()
                    if (state.type === TransactionStateType.HASH) onDialogClose()
                }
                if (state.type === TransactionStateType.HASH) setInputAmount('')
                resetCallback()
            },
            [state, retryTokenBalance, onDialogClose],
        ),
    )

    const DATA = useMemo(
        () => ({
            [LiquidityActionType.Add]: {
                summary: t('plugin_augur_add_liquidity_summary', {
                    amount: inputAmount,
                    symbol: token.symbol,
                    title: market.description,
                }),
                setInputAmount: setInputAmount,
                disableBalance: false,
                title: t('plugin_augur_add_liquidity'),
                receiveTokenTitle: t('plugin_augur_lp_tokens'),
                receiveToken: formattedReceiveToken,
                poolPct: estimatedResult?.poolPct,
                button: t('plugin_augur_add_liquidity'),
                footer: <Trans i18nKey="plugin_augur_add_liquidity_footer" />,
            },
            [LiquidityActionType.Create]: {
                summary: t('plugin_augur_add_liquidity_summary', {
                    amount: inputAmount,
                    symbol: token.symbol,
                    title: market.description,
                }),
                setInputAmount: setInputAmount,
                disableBalance: false,
                title: t('plugin_augur_add_liquidity'),
                receiveTokenTitle: t('plugin_augur_lp_tokens'),
                receiveToken: formattedReceiveToken,
                poolPct: estimatedResult?.poolPct,
                button: t('plugin_augur_add_liquidity'),
                footer: <Trans i18nKey="plugin_augur_add_liquidity_footer" />,
            },
            [LiquidityActionType.Remove]: {
                summary: t('plugin_augur_remove_liquidity_summary', {
                    amount: inputAmount,
                    title: market.description,
                }),
                setInputAmount: () => {},
                disableBalance: true,
                title: t('plugin_augur_all_remove_liquidity'),
                receiveTokenTitle: cashToken.symbol,
                receiveToken: formattedReceiveToken,
                poolPct: estimatedResult?.poolPct,
                button: t('plugin_augur_all_remove_liquidity'),
                footer: <Trans i18nKey="plugin_augur_remove_liquidity_footer" />,
            },
        }),
        [inputAmount, token, market, displayEstimatedAmount, estimatedResult],
    )

    // open the transaction dialog
    useEffect(() => {
        if (!token || !market) return
        if (state.type === TransactionStateType.UNKNOWN) return
        if (state.type === TransactionStateType.CONFIRMED) {
            onConfirm ? onConfirm() : null
            return
        }
        setTransactionDialogOpen({
            open: true,
            state: state,
            summary: DATA[type].summary,
        })
    }, [state /* update tx dialog only if state changed */])
    //#endregion

    //#region submit button
    const validationMessage = useMemo(() => {
        if (amount.isGreaterThan(tokenBalance) || tokenBalance.isZero())
            return t('plugin_dhedge_insufficient_balance', {
                symbol: token?.symbol,
            })
        if (!amount || amount.isZero()) return t('plugin_dhedge_enter_an_amount')
        if (
            estimatedResult?.type === LiquidityActionType.Create &&
            amount.isLessThan(formatAmount(MINIMUM_INITIAL_LP, token.decimals))
        )
            return t('plugin_dhedge_low_initial_lp', { amount: MINIMUM_INITIAL_LP, symbol: token.symbol })
        return ''
    }, [amount, token, tokenBalance, ammExchange, estimatedResult])
    //#endregion

    return (
        <InjectedDialog
            className={classes.root}
            open={open}
            onClose={onDialogClose}
            title={DATA[type].title}
            maxWidth="xs">
            <DialogContent>
                {loadingAmm || loadingTokenBalance ? (
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
                                balance={tokenBalance.toString() ?? '0'}
                                token={token}
                                onAmountChange={DATA[type].setInputAmount}
                                significant={significant}
                                disableBalance={DATA[type].disableBalance}
                            />
                        </form>
                        <div className={classes.section}>
                            {type === LiquidityActionType.Add || type === LiquidityActionType.Create ? (
                                <>
                                    <Typography variant="body1" color="textPrimary">
                                        {t('plugin_augur_current_prices')}
                                    </Typography>
                                    <Grid
                                        container
                                        direction="column"
                                        className={`${classes.spacing} ${classes.predictions}`}>
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
                                                            <Typography variant="body2" className={classes.label}>
                                                                {'$' + v.rate.toFixed(OUTCOME_PRICE_PRECISION)}
                                                            </Typography>
                                                        </Grid>
                                                    </Grid>
                                                ))}
                                        </Grid>
                                    </Grid>
                                </>
                            ) : null}
                            <Typography variant="h6" color="textPrimary">
                                {t('plugin_augur_you_receive')}
                            </Typography>
                            <div className={classes.estimate}>
                                {loadingEstimatedResult && !validationMessage ? (
                                    <CircularProgress className={classes.progress} color="primary" size={15} />
                                ) : errorEstimatedResult && !validationMessage ? (
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
                                                            <Typography variant="body2" className={classes.label}>
                                                                {formatBalance(
                                                                    v.amount,
                                                                    SHARE_DECIMALS,
                                                                    significantOfAmount(
                                                                        new BN(v.amount).dividedBy(
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
                                                <Typography variant="body2" color="textSecondary">
                                                    {DATA[type].receiveTokenTitle}
                                                </Typography>
                                            </Grid>
                                            <Grid item>
                                                <Typography variant="body2" color="textPrimary  ">
                                                    {estimatedResult?.amount ? DATA[type].receiveToken : '-'}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                        <Grid container justifyContent="space-between">
                                            <Grid item>
                                                <Typography variant="body2" color="textSecondary">
                                                    {t('plugin_augur_pool_share_pct')}
                                                </Typography>
                                            </Grid>
                                            <Grid item>
                                                <Typography variant="body2" color="textPrimary  ">
                                                    {DATA[type].poolPct ?? '-'}
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
                                        spender={market.ammAddress}
                                        token={token?.type === EthereumTokenType.ERC20 ? token : undefined}>
                                        <ActionButton
                                            className={classes.button}
                                            fullWidth
                                            disabled={!!validationMessage}
                                            onClick={errorTokenBalance ? retryTokenBalance : callback}
                                            variant="contained"
                                            loading={loadingTokenBalance || loadingAmm}>
                                            {errorTokenBalance
                                                ? t('plugin_augur_balance_wrong')
                                                : validationMessage || DATA[type].button}
                                        </ActionButton>
                                    </EthereumERC20TokenApprovedBoundary>
                                </EthereumWalletConnectedBoundary>
                            </DialogActions>
                            <Divider />
                            <DialogContentText classes={{ root: classes.footer }}>
                                {DATA[type].footer}
                            </DialogContentText>
                        </div>
                    </>
                )}
            </DialogContent>
        </InjectedDialog>
    )
}
