import {
    EthereumTokenType,
    formatAmount,
    formatBalance,
    formatPrice,
    FungibleTokenDetailed,
    pow10,
    TransactionStateType,
    useAccount,
    useAugurConstants,
    useERC20TokenDetailed,
    useTokenBalance,
} from '@masknet/web3-shared'
import { DialogContent, makeStyles, Typography } from '@material-ui/core'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { v4 as uuid } from 'uuid'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { useRemoteControlledDialog } from '@masknet/shared'
import { useI18N } from '../../../utils/i18n-next-ui'
import { EthereumERC20TokenApprovedBoundary } from '../../../web3/UI/EthereumERC20TokenApprovedBoundary'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import { TokenAmountPanel } from '../../../web3/UI/TokenAmountPanel'
import { SelectTokenDialogEvent, WalletMessages } from '../../Wallet/messages'
import { PluginAugurMessages } from '../messages'
import type { AMMOutcome, Market, EstimateTradeResult } from '../types'
import { SWAP_FEE_DECIMALS } from '../constants'
import { useSellCallback } from '../hooks/useSellCallback'
import { estimateSellTrade } from '../utils'
// import { estimateSellTrade } from '../utils'

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

export function SellDialog() {
    const { t } = useI18N()
    const classes = useStyles()

    const [id] = useState(uuid())
    const [market, setMarket] = useState<Market>()
    const [token, setToken] = useState<FungibleTokenDetailed>()
    const [cashToken, setCashToken] = useState<FungibleTokenDetailed>()
    const [outcome, setOutcome] = useState<AMMOutcome>()
    const [estimatedResult, setEstimatedResult] = useState<EstimateTradeResult>()
    const [rawAmount, setRawAmount] = useState('')
    const [userBalances, setUserBalances] = useState<string[]>()
    const { AMM_FACTORY_ADDRESS } = useAugurConstants()

    // context
    const account = useAccount()

    //#region remote controlled dialog
    const { open, closeDialog } = useRemoteControlledDialog(PluginAugurMessages.events.SellDialogUpdated, (ev) => {
        if (ev.open) {
            setMarket(ev.market)
            setOutcome(ev.outcome)
            setUserBalances(ev.userBalances)
            setCashToken(ev.cashToken)
        }
    })
    const onClose = useCallback(() => {
        closeDialog()
        setMarket(undefined)
        setToken(undefined)
        setOutcome(undefined)
        setEstimatedResult(undefined)
        setRawAmount('')
        setCashToken(undefined)
    }, [closeDialog])
    //#endregion

    const {
        value: shareToken,
        loading: loadingToken,
        error: errorToken,
        retry: retryToken,
    } = useERC20TokenDetailed(outcome?.shareToken ?? '')

    useEffect(() => {
        setToken(shareToken)
    }, [shareToken])

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
    const amount = new BigNumber(rawAmount || '0').multipliedBy(pow10(token?.decimals ?? 0))
    const {
        value: tokenBalance = '0',
        loading: loadingTokenBalance,
        retry: retryLoadTokenBalance,
    } = useTokenBalance(token?.type ?? EthereumTokenType.Native, token?.address ?? '')
    //#endregion

    const rawFee = formatAmount(new BigNumber(market?.swapFee ?? ''), SWAP_FEE_DECIMALS - 2)
    useEffect(() => {
        if (!market || !token || !market.ammExchange || !outcome || !userBalances) return
        const estimateTradeResult = estimateSellTrade(
            market.ammExchange,
            rawAmount,
            outcome,
            userBalances,
            token,
            rawFee,
        )
        setEstimatedResult(estimateTradeResult)
    }, [token, market, rawAmount, outcome, rawFee, userBalances])

    //#region blocking
    const [sellState, sellCallback, resetSellCallback] = useSellCallback(
        amount.toString(),
        market,
        outcome,
        shareToken,
        estimatedResult?.outcomeShareTokensIn,
    )
    //#endregion

    // on close transaction dialog
    const { setDialog: setTransactionDialogOpen } = useRemoteControlledDialog(
        WalletMessages.events.transactionDialogUpdated,
        useCallback(
            (ev) => {
                if (!ev.open) {
                    if (sellState.type === TransactionStateType.HASH) onClose()
                }
                if (sellState.type === TransactionStateType.HASH) setRawAmount('')
                resetSellCallback()
            },
            [id, sellState, onClose],
        ),
    )

    // open the transaction dialog
    useEffect(() => {
        if (!token || !market) return
        if (sellState.type === TransactionStateType.UNKNOWN) return
        setTransactionDialogOpen({
            open: true,
            state: sellState,
            summary: `Selling ${formatBalance(amount, token.decimals)} ${outcome?.name}'s shares.`,
        })
    }, [sellState /* update tx dialog only if state changed */])
    //#endregion

    //#region submit button
    const validationMessage = useMemo(() => {
        if (!account) return t('plugin_wallet_connect_a_wallet')
        if (!amount || amount.isZero()) return t('plugin_dhedge_enter_an_amount')
        if (amount.isGreaterThan(tokenBalance))
            return t('plugin_dhedge_insufficient_balance', {
                symbol: token?.symbol,
            })
        return ''
    }, [account, amount.toFixed(), token, tokenBalance, estimatedResult])
    //#endregion

    if (!token || !market || !market.ammExchange || !outcome || !cashToken) return null
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
                                loading: loadingToken || loadingTokenBalance,
                                ChipProps: {
                                    onClick: onSelectTokenChipClick,
                                },
                            }}
                        />
                    </form>
                    <EthereumWalletConnectedBoundary>
                        <EthereumERC20TokenApprovedBoundary
                            amount={amount.toFixed()}
                            spender={AMM_FACTORY_ADDRESS}
                            token={token?.type === EthereumTokenType.ERC20 ? token : undefined}>
                            <ActionButton
                                className={classes.button}
                                fullWidth
                                disabled={!!validationMessage}
                                onClick={sellCallback}
                                variant="contained"
                                loading={loadingToken || loadingTokenBalance}>
                                {validationMessage || t('sell')}
                            </ActionButton>
                        </EthereumERC20TokenApprovedBoundary>
                    </EthereumWalletConnectedBoundary>
                    <div className={classes.section}>
                        <div className={classes.status}>
                            <Typography className={classes.label} color="textSecondary" variant="body2">
                                {t('plugin_augur_avg_price')}
                            </Typography>
                            <Typography className={classes.value} color="textSecondary" variant="body2">
                                {estimatedResult
                                    ? formatPrice(estimatedResult.averagePrice, 2) + ' ' + cashToken.symbol
                                    : '-'}
                            </Typography>
                        </div>
                        <div className={classes.status}>
                            <Typography className={classes.label} color="textSecondary" variant="body2">
                                {t('plugin_augur_receive_amount')}
                            </Typography>
                            <Typography className={classes.value} color="textSecondary" variant="body2">
                                {estimatedResult
                                    ? formatPrice(estimatedResult.outputValue, 4) + ' ' + cashToken.symbol
                                    : '-'}
                            </Typography>
                        </div>
                        <div className={classes.status}>
                            <Typography className={classes.label} color="textSecondary" variant="body2">
                                {t('plugin_augur_remaining_shares')}
                            </Typography>
                            <Typography className={classes.value} color="textSecondary" variant="body2">
                                {estimatedResult && estimatedResult.remainingShares
                                    ? estimatedResult.remainingShares
                                    : '-'}
                            </Typography>
                        </div>
                        <div className={classes.status}>
                            <Typography className={classes.label} color="textSecondary" variant="body2">
                                {t('plugin_augur_est_sell_fee')}
                            </Typography>
                            <Typography className={classes.value} color="textSecondary" variant="body2">
                                {estimatedResult ? formatPrice(estimatedResult.tradeFees, 2) : '-'}
                            </Typography>
                        </div>
                    </div>
                </DialogContent>
            </InjectedDialog>
        </div>
    )
}
