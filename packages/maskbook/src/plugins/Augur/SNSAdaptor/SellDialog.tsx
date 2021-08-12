import {
    ERC20TokenDetailed,
    EthereumTokenType,
    formatPrice,
    FungibleTokenDetailed,
    pow10,
    TransactionStateType,
    useAccount,
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
import type { AmmOutcome, Market } from '../types'
import { BALANCE_DECIMALS, SHARE_DECIMALS } from '../constants'
import { useSellCallback } from '../hooks/useSellCallback'
import { estimateSellTrade, getRawFee, rawToFixed } from '../utils'
import { useAmmExchange } from '../hooks/useAmmExchange'

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

interface SellDialogProps {
    open: boolean
    onClose: () => void
    market: Market
    outcome: AmmOutcome | undefined
    cashToken: FungibleTokenDetailed
}

export function SellDialog(props: SellDialogProps) {
    const { open, onClose, market, outcome, cashToken } = props

    const { t } = useI18N()
    const classes = useStyles()

    const [id] = useState(uuid())
    const [inputAmount, setInputAmount] = useState('')

    const token = {
        address: outcome?.shareToken,
        symbol: outcome?.name,
        decimals: SHARE_DECIMALS,
    } as ERC20TokenDetailed

    const onDialogClose = () => {
        setInputAmount('')
        onClose()
    }

    // context
    const account = useAccount()

    //#region amount
    const amount = new BigNumber(inputAmount || '0').multipliedBy(pow10(SHARE_DECIMALS))
    const { value: _tokenBalance = '0', loading: loadingTokenBalance } = useTokenBalance(
        EthereumTokenType.ERC20,
        outcome?.shareToken ?? '',
    )

    // Reduce balance accuracy to $BALANCE_DECIMALS
    const tokenBalance = useMemo(
        () => rawToFixed(_tokenBalance, token?.decimals ?? 0, BALANCE_DECIMALS),
        [_tokenBalance],
    )
    //#endregion

    //#region AmmExchange
    const { value: ammExchange, loading: loadingAmm } = useAmmExchange(market)
    const inputFee = getRawFee(market?.swapFee ?? '')

    const estimatedResult = useMemo(() => {
        if (!ammExchange || !outcome || !tokenBalance || !inputAmount || !inputFee) return
        return estimateSellTrade(ammExchange, inputAmount, outcome, tokenBalance, SHARE_DECIMALS, inputFee)
    }, [inputAmount, outcome, inputFee, tokenBalance, ammExchange])

    const isTradeable = useMemo(() => {
        return estimatedResult && estimatedResult.outputValue !== '0'
    }, [estimatedResult])
    //#endregion

    //#region blocking
    const [sellState, sellCallback, resetSellCallback] = useSellCallback(
        market,
        outcome,
        estimatedResult?.outcomeShareTokensIn,
    )
    //#endregion

    // on close transaction dialog
    const { setDialog: setTransactionDialogOpen } = useRemoteControlledDialog(
        WalletMessages.events.transactionDialogUpdated,
        useCallback(
            (ev) => {
                if (!ev.open) {
                    if (sellState.type === TransactionStateType.HASH) onDialogClose()
                }
                if (sellState.type === TransactionStateType.HASH) setInputAmount('')
                resetSellCallback()
            },
            [id, sellState, onDialogClose],
        ),
    )

    // open the transaction dialog
    useEffect(() => {
        if (sellState.type === TransactionStateType.UNKNOWN) return
        setTransactionDialogOpen({
            open: true,
            state: sellState,
            summary: `Selling ${inputAmount} ${outcome?.name} share.`,
        })
    }, [sellState /* update tx dialog only if state changed */])
    //#endregion

    //#region submit button
    const validationMessage = useMemo(() => {
        if (!account) return t('plugin_wallet_connect_a_wallet')
        if (!amount || amount.isZero()) return t('plugin_dhedge_enter_an_amount')
        if (amount.isGreaterThan(tokenBalance)) return t('plugin_augur_insufficient_balance')
        if (!loadingAmm && !isTradeable) return t('plugin_augur_sell_too_low')
        return ''
    }, [account, amount, tokenBalance, estimatedResult])
    //#endregion

    if (!market || !market.ammExchange || !outcome || !cashToken) return null
    return (
        <InjectedDialog
            className={classes.root}
            open={open}
            onClose={onDialogClose}
            title={market.title + ' ' + outcome?.name}
            maxWidth="xs">
            <DialogContent>
                <form className={classes.form} noValidate autoComplete="off">
                    <TokenAmountPanel
                        label="Amount"
                        amount={inputAmount}
                        balance={tokenBalance ?? '0'}
                        token={token}
                        onAmountChange={setInputAmount}
                    />
                </form>
                <EthereumWalletConnectedBoundary>
                    <EthereumERC20TokenApprovedBoundary
                        amount={amount.toFixed()}
                        spender={market.ammExchange.address}
                        token={token}>
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
                            {isTradeable
                                ? formatPrice(estimatedResult?.averagePrice ?? '', 2) + ' ' + cashToken.symbol
                                : '-'}
                        </Typography>
                    </div>
                    <div className={classes.status}>
                        <Typography className={classes.label} color="textSecondary" variant="body2">
                            {t('plugin_augur_receive_amount')}
                        </Typography>
                        <Typography className={classes.value} color="textSecondary" variant="body2">
                            {isTradeable
                                ? formatPrice(estimatedResult?.outputValue ?? '', 4) + ' ' + cashToken.symbol
                                : '-'}
                        </Typography>
                    </div>
                    <div className={classes.status}>
                        <Typography className={classes.label} color="textSecondary" variant="body2">
                            {t('plugin_augur_remaining_shares')}
                        </Typography>
                        <Typography className={classes.value} color="textSecondary" variant="body2">
                            {isTradeable ? estimatedResult?.remainingShares : '-'}
                        </Typography>
                    </div>
                    <div className={classes.status}>
                        <Typography className={classes.label} color="textSecondary" variant="body2">
                            {t('plugin_augur_est_sell_fee')}
                        </Typography>
                        <Typography className={classes.value} color="textSecondary" variant="body2">
                            {isTradeable ? formatPrice(estimatedResult?.tradeFees ?? '', 2) : '-'}
                        </Typography>
                    </div>
                </div>
            </DialogContent>
        </InjectedDialog>
    )
}
