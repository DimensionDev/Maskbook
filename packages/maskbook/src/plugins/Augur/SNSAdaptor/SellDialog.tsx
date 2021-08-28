import {
    ERC20TokenDetailed,
    EthereumTokenType,
    formatBalance,
    formatPrice,
    FungibleTokenDetailed,
    isZero,
    pow10,
    TransactionStateType,
    useAccount,
    useTokenBalance,
} from '@masknet/web3-shared'
import { CircularProgress, DialogContent, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { useRemoteControlledDialog } from '@masknet/shared'
import { useI18N } from '../../../utils/i18n-next-ui'
import { EthereumERC20TokenApprovedBoundary } from '../../../web3/UI/EthereumERC20TokenApprovedBoundary'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import { TokenAmountPanel } from '../../../web3/UI/TokenAmountPanel'
import { WalletMessages } from '../../Wallet/messages'
import type { AmmOutcome, Market } from '../types'
import { BALANCE_DECIMALS, MINIMUM_BALANCE, SHARE_DECIMALS } from '../constants'
import { useSellCallback } from '../hooks/useSellCallback'
import { estimateSellTrade, getRawFee } from '../utils'
import { useAmmExchange } from '../hooks/useAmmExchange'
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
    const { classes } = useStyles()
    const [inputAmount, setInputAmount] = useState('')
    const [significant, setSignificant] = useState(4)

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
    const {
        value: _tokenBalance = '0',
        loading: loadingTokenBalance,
        error: errorTokenBalance,
        retry: retryTokenBalance,
    } = useTokenBalance(EthereumTokenType.ERC20, outcome?.shareToken ?? '')

    // Reduce balance accuracy to $BALANCE_DECIMALS
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
            [sellState, onDialogClose],
        ),
    )

    // open the transaction dialog
    useEffect(() => {
        if (sellState.type === TransactionStateType.UNKNOWN) return
        if (sellState.type === TransactionStateType.CONFIRMED) {
            market.dirtyAmmExchnage = true
            retryTokenBalance()
            return
        }
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

    if (!market || (!loadingAmm && !errorAmm && !ammExchange) || !outcome || !cashToken) return null
    return (
        <InjectedDialog
            className={classes.root}
            open={open}
            onClose={onDialogClose}
            title={market.title + ' ' + outcome?.name}
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
                            {isZero(tokenBalance) || amount.isGreaterThan(tokenBalance) ? (
                                <ActionButton
                                    className={classes.button}
                                    fullWidth
                                    disabled={true}
                                    variant="contained"
                                    loading={loadingTokenBalance || loadingAmm}>
                                    {t('plugin_augur_insufficient_balance')}
                                </ActionButton>
                            ) : (
                                <EthereumERC20TokenApprovedBoundary
                                    amount={amount.toFixed()}
                                    spender={ammExchange?.address}
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
                            )}
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
                                        ? formatPrice(estimatedResult?.outputValue ?? '', 2) + ' ' + cashToken.symbol
                                        : '-'}
                                </Typography>
                            </div>
                            <div className={classes.status}>
                                <Typography className={classes.label} color="textSecondary" variant="body2">
                                    {t('plugin_augur_remaining_shares')}
                                </Typography>
                                <Typography className={classes.value} color="textSecondary" variant="body2">
                                    {isTradeable
                                        ? formatPrice(estimatedResult?.remainingShares ?? '', BALANCE_DECIMALS)
                                        : '-'}
                                </Typography>
                            </div>
                            <div className={classes.status}>
                                <Typography className={classes.label} color="textSecondary" variant="body2">
                                    {t('plugin_augur_est_sell_fee')}
                                </Typography>
                                <Typography className={classes.value} color="textSecondary" variant="body2">
                                    {isTradeable
                                        ? formatPrice(estimatedResult?.tradeFees ?? '', BALANCE_DECIMALS)
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
