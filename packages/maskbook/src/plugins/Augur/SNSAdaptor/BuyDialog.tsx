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
    useFungibleTokenBalance,
} from '@masknet/web3-shared-evm'
import { CircularProgress, DialogContent, IconButton, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useMemo, useState } from 'react'
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
import { WalletMessages } from '../../Wallet/messages'
import type { AmmOutcome, Market } from '../types'
import { useBuyCallback } from '../hooks/useBuyCallback'
import { toBips } from '../../Trader/helpers'
import TuneIcon from '@material-ui/icons/Tune'
import { BALANCE_DECIMALS, MINIMUM_BALANCE, SHARE_DECIMALS } from '../constants'
import { estimateBuyTrade, getRawFee } from '../utils'
import { useAmmExchange } from '../hooks/useAmmExchange'
import { usePostLink } from '../../../components/DataSource/usePostInfo'
import { currentSlippageSettings } from '../../Trader/settings'
import { RefreshIcon } from '@masknet/icons'

const useStyles = makeStyles()((theme) => ({
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
        margin: `${theme.spacing(1)} auto`,
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
    message: {
        textAlign: 'center',
    },
    refresh: {
        bottom: theme.spacing(1),
        right: theme.spacing(1),
        fontSize: 'inherit',
    },
    progress: {
        bottom: theme.spacing(1),
        right: theme.spacing(1),
        padding: theme.spacing(1),
    },
}))

interface BuyDialogProps {
    open: boolean
    onClose: () => void
    market: Market
    outcome: AmmOutcome | undefined
    token: FungibleTokenDetailed
}

export function BuyDialog(props: BuyDialogProps) {
    const { open, onClose, market, outcome, token } = props
    const { t } = useI18N()
    const { classes } = useStyles()
    const [inputAmount, setInputAmount] = useState('')
    const [significant, setSignificant] = useState(4)

    const onDialogClose = () => {
        setInputAmount('')
        onClose()
    }

    // context
    const account = useAccount()

    //#region amount
    const amount = new BigNumber(inputAmount || '0').multipliedBy(pow10(token?.decimals ?? 0))
    const {
        value: _tokenBalance = '0',
        loading: loadingTokenBalance,
        error: errorTokenBalance,
        retry: retryTokenBalance,
    } = useFungibleTokenBalance(token?.type ?? EthereumTokenType.Native, token?.address ?? '')

    useEffect(() => {
        retryTokenBalance()
    }, [open])

    // set balance to 0 if less than minimum amount
    const tokenBalance = useMemo(() => {
        const formattedBalance = new BigNumber(formatBalance(_tokenBalance, token?.decimals ?? 0))
        if (formattedBalance.isLessThan(MINIMUM_BALANCE)) return '0'
        return _tokenBalance
    }, [_tokenBalance])
    //#endregion

    // calc the significant
    useEffect(() => {
        const formattedBalance = new BigNumber(formatBalance(tokenBalance, token?.decimals ?? 0))
        if (formattedBalance.isGreaterThanOrEqualTo(MINIMUM_BALANCE)) setSignificant(1)
        if (formattedBalance.isGreaterThanOrEqualTo(MINIMUM_BALANCE * 10)) setSignificant(2)
        if (formattedBalance.isGreaterThanOrEqualTo(MINIMUM_BALANCE * 100)) setSignificant(3)
        if (formattedBalance.isGreaterThanOrEqualTo(MINIMUM_BALANCE * 1000)) setSignificant(4)
    }, [tokenBalance])
    //#endregion

    //#region AmmExchange
    const { value: ammExchange, loading: loadingAmm, error: errorAmm, retry: retryAmm } = useAmmExchange(market)
    const rawFee = getRawFee(market?.swapFee ?? '')
    const estimatedResult = useMemo(() => {
        if (!ammExchange || !token || !outcome) return
        return estimateBuyTrade(ammExchange, inputAmount, outcome, rawFee, token, SHARE_DECIMALS)
    }, [token, inputAmount, outcome, rawFee, ammExchange])

    const isTradeable = useMemo(() => {
        return estimatedResult && estimatedResult.outputValue !== '0'
    }, [estimatedResult])
    //#endregion

    //#region calc min output
    const minTokenOut = new BigNumber(formatAmount(estimatedResult?.outputValue ?? 0, SHARE_DECIMALS))
        .multipliedBy(1 - currentSlippageSettings.value / 10000)
        .toFixed(0)
    //#endregion

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
        PluginTraderMessages.swapDialogUpdated,
        useCallback(
            (ev) => {
                if (!ev.open) {
                    retryTokenBalance()
                }
            },
            [retryTokenBalance],
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
    const postLink = usePostLink()
    const shareLink = activatedSocialNetworkUI.utils
        .getShareLinkURL?.(
            [
                t('plugin_augur_share', {
                    amount: inputAmount,
                    cashTag,
                    symbol: token?.symbol,
                    outcome: outcome?.name,
                }),
                postLink,
            ].join('\n'),
        )
        .toString()

    // on close transaction dialog
    const { setDialog: setTransactionDialogOpen } = useRemoteControlledDialog(
        WalletMessages.events.transactionDialogUpdated,
        useCallback(
            (ev) => {
                if (!ev.open) {
                    retryTokenBalance()
                    openSwapDialog({ open: false })
                    if (buyState.type === TransactionStateType.HASH) onDialogClose()
                }
                if (buyState.type === TransactionStateType.HASH) setInputAmount('')
                resetBuyCallback()
            },
            [buyState, openSwapDialog, retryTokenBalance, onDialogClose],
        ),
    )

    // open the transaction dialog
    useEffect(() => {
        if (!token || !market) return
        if (buyState.type === TransactionStateType.UNKNOWN) return
        if (buyState.type === TransactionStateType.CONFIRMED) {
            market.dirtyAmmExchange = true
            return
        }
        setTransactionDialogOpen({
            open: true,
            shareLink,
            state: buyState,
            summary: `Buying ${inputAmount} ${token.symbol} ${outcome?.name}'s shares.`,
        })
    }, [buyState /* update tx dialog only if state changed */])
    //#endregion

    //#region submit button
    const validationMessage = useMemo(() => {
        if (!account) return t('plugin_wallet_connect_a_wallet')
        if (!amount || amount.isZero()) return t('plugin_dhedge_enter_an_amount')
        if (!loadingAmm && !isTradeable) return t('plugin_trader_error_insufficient_lp')
        if (amount.isGreaterThan(tokenBalance))
            return t('plugin_dhedge_insufficient_balance', {
                symbol: token?.symbol,
            })
        return ''
    }, [account, amount.toFixed(), token, tokenBalance, estimatedResult])
    //#endregion

    //#region remote controlled swap settings dialog
    const { openDialog: openSettingDialog } = useRemoteControlledDialog(PluginTraderMessages.swapSettingsUpdated)
    //#endregion

    if (!token || !market || (!loadingAmm && !errorAmm && !ammExchange) || !outcome) return null
    return (
        <InjectedDialog
            className={classes.root}
            open={open}
            onClose={onDialogClose}
            title={market.title + ' ' + outcome?.name ?? ''}
            maxWidth="xs">
            <DialogContent>
                {loadingAmm ? (
                    <div className={classes.message}>
                        <CircularProgress className={classes.progress} color="primary" size={15} />
                    </div>
                ) : errorAmm || errorTokenBalance ? (
                    <Typography className={classes.message} color="textPrimary">
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
                                label="Amount"
                                amount={inputAmount}
                                balance={tokenBalance ?? '0'}
                                token={token}
                                onAmountChange={setInputAmount}
                                significant={significant}
                            />
                        </form>
                        <EthereumWalletConnectedBoundary>
                            {estimatedResult && (isZero(tokenBalance) || amount.isGreaterThan(tokenBalance)) ? (
                                <ActionButton
                                    className={classes.button}
                                    fullWidth
                                    onClick={openSwap}
                                    variant="contained"
                                    loading={loadingTokenBalance || loadingAmm}>
                                    {t('plugin_dhedge_buy_token', { symbol: token.symbol })}
                                </ActionButton>
                            ) : (
                                <EthereumERC20TokenApprovedBoundary
                                    amount={amount.toFixed()}
                                    spender={ammExchange?.address}
                                    token={token?.type === EthereumTokenType.ERC20 ? token : undefined}>
                                    <ActionButton
                                        className={classes.button}
                                        fullWidth
                                        disabled={!!validationMessage}
                                        onClick={buyCallback}
                                        variant="contained"
                                        loading={loadingTokenBalance || loadingAmm}>
                                        {validationMessage || t('buy')}
                                    </ActionButton>
                                </EthereumERC20TokenApprovedBoundary>
                            )}
                        </EthereumWalletConnectedBoundary>
                        <div className={classes.section}>
                            <div className={classes.status}>
                                <Typography className={classes.label} color="textSecondary" variant="body2">
                                    {t('plugin_trader_slippage_tolerance')}{' '}
                                    {formatPercentage(toBips(currentSlippageSettings.value))}
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
                                    {isTradeable
                                        ? formatPrice(estimatedResult?.averagePrice ?? '', 2) + ' ' + token.symbol
                                        : '-'}
                                </Typography>
                            </div>
                            <div className={classes.status}>
                                <Typography className={classes.label} color="textSecondary" variant="body2">
                                    {t('plugin_augur_est_shares')}
                                </Typography>
                                <Typography className={classes.value} color="textSecondary" variant="body2">
                                    {isTradeable
                                        ? formatPrice(estimatedResult?.outputValue ?? '', BALANCE_DECIMALS)
                                        : '-'}
                                </Typography>
                            </div>
                            <div className={classes.status}>
                                <Typography className={classes.label} color="textSecondary" variant="body2">
                                    {t('plugin_augur_max_profit')}
                                </Typography>
                                <Typography className={classes.value} color="textSecondary" variant="body2">
                                    {isTradeable
                                        ? formatPrice(estimatedResult?.maxProfit ?? '', 2) + ' ' + token.symbol
                                        : '-'}
                                </Typography>
                            </div>
                            <div className={classes.status}>
                                <Typography className={classes.label} color="textSecondary" variant="body2">
                                    {t('plugin_augur_est_buy_fee')}
                                </Typography>
                                <Typography className={classes.value} color="textSecondary" variant="body2">
                                    {isTradeable
                                        ? formatPrice(estimatedResult?.tradeFees ?? '', 2) + ' ' + token.symbol
                                        : '-'}
                                </Typography>
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </InjectedDialog>
    )
}
