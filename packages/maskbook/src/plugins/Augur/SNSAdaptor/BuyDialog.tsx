import {
    EthereumTokenType,
    formatAmount,
    formatBalance,
    formatPercentage,
    formatPrice,
    FungibleTokenDetailed,
    isZero,
    pow10,
    TransactionStateType,
    useAccount,
    useTokenBalance,
} from '@masknet/web3-shared'
import { DialogContent, IconButton, makeStyles, Typography } from '@material-ui/core'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { v4 as uuid } from 'uuid'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { activatedSocialNetworkUI } from '../../../social-network'
import { isTwitter } from '../../../social-network-adaptor/twitter.com/base'
import { useRemoteControlledDialog } from '@masknet/shared'
import { useI18N } from '../../../utils/i18n-next-ui'
import { EthereumERC20TokenApprovedBoundary } from '../../../web3/UI/EthereumERC20TokenApprovedBoundary'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import { TokenAmountPanel } from '../../../web3/UI/TokenAmountPanel'
import { PluginTraderMessages } from '../../Trader/messages'
import type { Coin } from '../../Trader/types'
import { SelectTokenDialogEvent, WalletMessages } from '../../Wallet/messages'
import { PluginAugurMessages } from '../messages'
import type { AMMOutcome, Market, EstimateTradeResult } from '../types'
import { useBuyCallback } from '../hooks/useBuyCallback'
import { toBips } from '../../Trader/helpers'
import { currentSlippageTolerance } from '../../Trader/settings'
import TuneIcon from '@material-ui/icons/Tune'
import { SWAP_FEE_DECIMALS } from '../constants'
import { estimateBuyTrade } from '../utils'

const useStyles = makeStyles((theme) => ({
    paper: {
        width: '450px !important',
    },
    form: {
        '& > *': {
            margin: theme.spacing(1, 0),
        },
    },
    root: {
        margin: theme.spacing(2, 0),
    },
    tip: {
        fontSize: 12,
        color: theme.palette.text.secondary,
        padding: theme.spacing(2, 2, 0, 2),
    },
    button: {
        margin: theme.spacing(1.5, 0, 0),
        padding: 12,
    },
    section: {
        textAlign: 'center',
        margin: `${theme.spacing(1)}px auto`,
    },
    status: {
        marginTop: theme.spacing(0.5),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    label: {
        flex: 1,
        textAlign: 'left',
    },
    value: {
        flex: 1,
        textAlign: 'right',
    },
    icon: {
        marginLeft: theme.spacing(0.5),
    },
}))

export function BuyDialog() {
    const { t } = useI18N()
    const classes = useStyles()

    const [id] = useState(uuid())
    const [market, setMarket] = useState<Market>()
    const [token, setToken] = useState<FungibleTokenDetailed>()
    const [outcome, setOutcome] = useState<AMMOutcome>()
    const [estimatedResult, setEstimatedResult] = useState<EstimateTradeResult>()

    // context
    const account = useAccount()

    //#region remote controlled dialog
    const { open, closeDialog } = useRemoteControlledDialog(PluginAugurMessages.events.ConfirmDialogUpdated, (ev) => {
        if (ev.open) {
            setMarket(ev.market)
            setOutcome(ev.outcome)
            setToken(ev.cashToken)
        }
    })
    const onClose = useCallback(() => {
        closeDialog()
    }, [closeDialog])
    //#endregion

    //#region select token
    const { setDialog: setSelectTokenDialogOpen } = useRemoteControlledDialog(
        WalletMessages.events.selectTokenDialogUpdated,
        useCallback(
            (ev: SelectTokenDialogEvent) => {
                if (ev.open || !ev.token || ev.uuid !== id) return
                setToken(ev.token)
            },
            [id],
        ),
    )
    const onSelectTokenChipClick = useCallback(() => {
        if (!token) return
        setSelectTokenDialogOpen({
            open: true,
            uuid: id,
            disableNativeToken: true,
            FixedTokenListProps: {
                selectedTokens: [token.address],
                whitelist: [token.address],
            },
        })
    }, [id, token?.address])
    //#endregion

    //#region amount
    const [rawAmount, setRawAmount] = useState('')
    const amount = new BigNumber(rawAmount || '0').multipliedBy(pow10(token?.decimals ?? 0))
    const {
        value: tokenBalance = '0',
        loading: loadingTokenBalance,
        retry: retryLoadTokenBalance,
    } = useTokenBalance(token?.type ?? EthereumTokenType.Native, token?.address ?? '')
    //#endregion

    const rawFee = formatAmount(new BigNumber(market?.swapFee ?? ''), SWAP_FEE_DECIMALS - 2)
    useEffect(() => {
        if (!market || !token || !market.ammExchange || !outcome) return
        const estimateTradeResult = estimateBuyTrade(market.ammExchange, rawAmount, outcome, rawFee, token, 18)
        setEstimatedResult(estimateTradeResult)
        console.log(estimateTradeResult)
    }, [token, market, rawAmount, outcome, rawFee])

    const minTokenOut = (estimatedResult?.outputValue ?? 0 * (1 - currentSlippageTolerance.value)).toString()

    //#region blocking
    const [buyState, buyCallback, resetBuyCallback] = useBuyCallback(
        amount.toFixed(),
        minTokenOut,
        market,
        outcome,
        token,
    )
    //#endregion

    //#region Swap
    const { setDialog: openSwapDialog } = useRemoteControlledDialog(
        PluginTraderMessages.events.swapDialogUpdated,
        useCallback(
            (ev) => {
                if (!ev.open) {
                    retryLoadTokenBalance()
                }
            },
            [retryLoadTokenBalance],
        ),
    )
    const openSwap = useCallback(() => {
        if (!token) return
        openSwapDialog({
            open: true,
            traderProps: {
                coin: {
                    id: token.address,
                    name: token.name ?? '',
                    symbol: token.symbol ?? '',
                    contract_address: token.address,
                    decimals: token.decimals,
                } as Coin,
            },
        })
    }, [token, openSwapDialog])
    //#endregion

    //#region transaction dialog
    const cashTag = isTwitter(activatedSocialNetworkUI) ? '$' : ''
    const shareLink = activatedSocialNetworkUI.utils
        .getShareLinkURL?.(
            token
                ? [
                      `I just bought ${formatBalance(amount, token.decimals)} ${cashTag}${token.symbol} share of ${
                          outcome?.name
                      }, can I win? Follow @realMaskbook (mask.io) to bet on Augur's markets.`,
                      '#mask_io #augur',
                  ].join('\n')
                : '',
        )
        .toString()

    // on close transaction dialog
    const { setDialog: setTransactionDialogOpen } = useRemoteControlledDialog(
        WalletMessages.events.transactionDialogUpdated,
        useCallback(
            (ev) => {
                if (!ev.open) {
                    retryLoadTokenBalance()
                    openSwapDialog({ open: false })
                    if (buyState.type === TransactionStateType.HASH) onClose()
                }
                if (buyState.type === TransactionStateType.HASH) setRawAmount('')
                resetBuyCallback()
            },
            [id, buyState, openSwapDialog, retryLoadTokenBalance, retryLoadTokenBalance, onClose],
        ),
    )

    // open the transaction dialog
    useEffect(() => {
        if (!token || !market) return
        if (buyState.type === TransactionStateType.UNKNOWN) return
        setTransactionDialogOpen({
            open: true,
            shareLink,
            state: buyState,
            summary: `Buying ${formatBalance(amount, token.decimals)}${token.symbol} ${outcome?.name}'s shares.`,
        })
    }, [buyState /* update tx dialog only if state changed */])
    //#endregion

    //#region submit button
    const validationMessage = useMemo(() => {
        if (!account) return t('plugin_wallet_connect_a_wallet')
        if (!amount || amount.isZero()) return t('plugin_dhedge_enter_an_amount')
        if (!estimatedResult) return t('plugin_trader_error_insufficient_lp')
        if (amount.isGreaterThan(tokenBalance))
            return t('plugin_dhedge_insufficient_balance', {
                symbol: token?.symbol,
            })
        return ''
    }, [account, amount.toFixed(), token, tokenBalance, estimatedResult])
    //#endregion

    //#region remote controlled swap settings dialog
    const { openDialog: openSettingDialog } = useRemoteControlledDialog(PluginTraderMessages.events.swapSettingsUpdated)
    //#endregion

    if (!token || !market || !market.ammExchange || !outcome) return null
    return (
        <div className={classes.root}>
            <InjectedDialog open={open} onClose={onClose} title={market.title + ' ' + outcome?.name} maxWidth="xs">
                <DialogContent>
                    <form className={classes.form} noValidate autoComplete="off">
                        <TokenAmountPanel
                            label="Amount"
                            amount={rawAmount}
                            balance={tokenBalance ?? '0'}
                            token={token}
                            onAmountChange={setRawAmount}
                            SelectTokenChip={{
                                loading: loadingTokenBalance,
                                ChipProps: {
                                    onClick: onSelectTokenChipClick,
                                },
                            }}
                        />
                    </form>
                    <EthereumWalletConnectedBoundary>
                        {isZero(tokenBalance) || (amount.isGreaterThan(tokenBalance) && !!estimatedResult) ? (
                            <ActionButton
                                className={classes.button}
                                fullWidth
                                onClick={openSwap}
                                variant="contained"
                                loading={loadingTokenBalance}>
                                {t('plugin_dhedge_buy_token', { symbol: token.symbol })}
                            </ActionButton>
                        ) : (
                            <EthereumERC20TokenApprovedBoundary
                                amount={amount.toFixed()}
                                spender={market.address}
                                token={token?.type === EthereumTokenType.ERC20 ? token : undefined}>
                                <ActionButton
                                    className={classes.button}
                                    fullWidth
                                    disabled={!!validationMessage}
                                    onClick={buyCallback}
                                    variant="contained"
                                    loading={loadingTokenBalance}>
                                    {validationMessage || t('buy')}
                                </ActionButton>
                            </EthereumERC20TokenApprovedBoundary>
                        )}
                    </EthereumWalletConnectedBoundary>
                    <div className={classes.section}>
                        <div className={classes.status}>
                            <Typography className={classes.label} color="textSecondary" variant="body2">
                                {t('plugin_trader_slipage_tolerance')}{' '}
                                {formatPercentage(toBips(currentSlippageTolerance.value))}
                            </Typography>
                            <IconButton className={classes.icon} size="small" onClick={openSettingDialog}>
                                <TuneIcon fontSize="small" />
                            </IconButton>
                        </div>
                        <div className={classes.status}>
                            <Typography className={classes.label} color="textSecondary" variant="body2">
                                {t('plugin_augur_avg_price')}
                            </Typography>
                            <Typography className={classes.value} color="textSecondary" variant="body2">
                                {estimatedResult
                                    ? formatPrice(estimatedResult.averagePrice, 2) + ' ' + token.symbol
                                    : '-'}
                            </Typography>
                        </div>
                        <div className={classes.status}>
                            <Typography className={classes.label} color="textSecondary" variant="body2">
                                {t('plugin_augur_est_shares')}
                            </Typography>
                            <Typography className={classes.value} color="textSecondary" variant="body2">
                                {estimatedResult ? formatPrice(estimatedResult.outputValue, 4) : '-'}
                            </Typography>
                        </div>
                        <div className={classes.status}>
                            <Typography className={classes.label} color="textSecondary" variant="body2">
                                {t('plugin_augur_max_profit')}
                            </Typography>
                            <Typography className={classes.value} color="textSecondary" variant="body2">
                                {estimatedResult ? formatPrice(estimatedResult.maxProfit, 2) + ' ' + token.symbol : '-'}
                            </Typography>
                        </div>
                        <div className={classes.status}>
                            <Typography className={classes.label} color="textSecondary" variant="body2">
                                {t('plugin_augur_est_fee')}
                            </Typography>
                            <Typography className={classes.value} color="textSecondary" variant="body2">
                                {estimatedResult ? formatPrice(estimatedResult.tradeFees, 2) + ' ' + token.symbol : '-'}
                            </Typography>
                        </div>
                    </div>
                </DialogContent>
            </InjectedDialog>
        </div>
    )
}
