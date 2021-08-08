import {
    EthereumTokenType,
    formatBalance,
    formatPrice,
    FungibleTokenDetailed,
    pow10,
    TransactionStateType,
    useAccount,
    useAugurConstants,
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
import { WalletMessages } from '../../Wallet/messages'
import { PluginAugurMessages } from '../messages'
import type { AmmOutcome, Market } from '../types'
import { SHARE_DECIMALS } from '../constants'
import { useSellCallback } from '../hooks/useSellCallback'
import { estimateSellTrade, getRawFee } from '../utils'
import { useAmmExchange } from '../hooks/useAmmExchange'
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
    const [cashToken, setCashToken] = useState<FungibleTokenDetailed>()
    const [token, setToken] = useState<FungibleTokenDetailed>()
    const [outcome, setOutcome] = useState<AmmOutcome>()
    const [rawAmount, setRawAmount] = useState('')
    const { AMM_FACTORY_ADDRESS } = useAugurConstants()

    // context
    const account = useAccount()

    //#region remote controlled dialog
    const { open, closeDialog } = useRemoteControlledDialog(PluginAugurMessages.SellDialogUpdated, (ev) => {
        if (ev.open) {
            setMarket(ev.market)
            setOutcome(ev.outcome)
            setCashToken(ev.cashToken)
            setToken({
                address: ev.outcome.shareToken,
                symbol: ev.outcome.name,
                decimals: SHARE_DECIMALS,
            } as FungibleTokenDetailed)
        }
    })
    const onClose = useCallback(() => {
        closeDialog()
        setMarket(undefined)
        setOutcome(undefined)
        setRawAmount('')
        setCashToken(undefined)
    }, [closeDialog])
    //#endregion

    //#region amount
    const amount = new BigNumber(rawAmount || '0').multipliedBy(pow10(SHARE_DECIMALS))
    const { value: tokenBalance = '0', loading: loadingTokenBalance } = useTokenBalance(
        EthereumTokenType.ERC20,
        outcome?.shareToken ?? '',
    )
    //#endregion

    //#region AmmExchange
    const { value: ammExchange, loading: loadingAmm } = useAmmExchange(market?.address ?? '', market?.id ?? '')
    const rawFee = getRawFee(market?.swapFee ?? '')
    const estimatedResult = useMemo(() => {
        if (!ammExchange || !outcome || !tokenBalance || !rawAmount || !rawFee) return
        return estimateSellTrade(ammExchange, rawAmount, outcome, tokenBalance, SHARE_DECIMALS, rawFee)
    }, [rawAmount, outcome, rawFee, tokenBalance, ammExchange])
    //#endregion

    //#region blocking
    const [sellState, sellCallback, resetSellCallback] = useSellCallback(
        market,
        outcome,
        estimatedResult?.outcomeShareTokensIn,
        amount.toString(),
        rawFee,
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
        if (sellState.type === TransactionStateType.UNKNOWN) return
        setTransactionDialogOpen({
            open: true,
            state: sellState,
            summary: `Selling ${formatBalance(amount, SHARE_DECIMALS)} ${outcome?.name} share.`,
        })
    }, [sellState /* update tx dialog only if state changed */])
    //#endregion

    //#region submit button
    const validationMessage = useMemo(() => {
        if (!account) return t('plugin_wallet_connect_a_wallet')
        if (!amount || amount.isZero()) return t('plugin_dhedge_enter_an_amount')
        if (!loadingAmm && (!estimatedResult || estimatedResult?.outputValue === '0'))
            return t('plugin_augur_sell_too_low')
        if (amount.isGreaterThan(tokenBalance)) return t('plugin_augur_insufficient_balance')
        return ''
    }, [account, amount, tokenBalance, estimatedResult])
    //#endregion

    if (!market || !market.ammExchange || !outcome || !cashToken) return null
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
                                loading={loadingTokenBalance || loadingAmm}>
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
                                {estimatedResult ? estimatedResult.remainingShares : '-'}
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
