import {
    EthereumTokenType,
    formatAmount,
    isZero,
    TransactionStateType,
    useAccount,
    useFungibleTokenBalance,
    useRealityCardsConstants,
} from '@masknet/web3-shared-evm'
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
import { PluginTraderMessages } from '../../Trader/messages'
import type { Coin } from '../../Trader/types'
import { WalletMessages } from '../../Wallet/messages'
import { RefreshIcon } from '@masknet/icons'
import { DialogContent, Typography } from '@mui/material'
import { useDepositCallback } from '../hooks/useDepositCallback'
import { useBaseToken } from '../hooks/useBaseToken'

const useStyles = makeStyles()((theme) => ({
    form: {
        '& > *': {
            margin: theme.spacing(1, 0),
        },
    },
    root: {
        margin: theme.spacing(2, 0),
    },
    button: {
        margin: theme.spacing(1.5, 0, 0),
        padding: 12,
    },
    label: {
        flex: 1,
        textAlign: 'left',
    },
    message: {
        textAlign: 'center',
    },
    refresh: {
        bottom: theme.spacing(1),
        right: theme.spacing(1),
        fontSize: 'inherit',
    },
}))

interface DepositDialogProps {
    open: boolean
    onClose: () => void
}

export function DepositDialog(props: DepositDialogProps) {
    const { open, onClose } = props
    const { t } = useI18N()
    const { classes } = useStyles()
    const [_inputAmount, setInputAmount] = useState('')
    const { REALITY_CARD_ADDRESS } = useRealityCardsConstants()

    const onDialogClose = () => {
        setInputAmount('')
        onClose()
    }

    //#region context
    const account = useAccount()
    //#endregion

    const token = useBaseToken()
    //#region balance
    const {
        value: tokenBalance = '0',
        loading: loadingTokenBalance,
        error: errorTokenBalance,
        retry: tokenBalanceRetry,
    } = useFungibleTokenBalance(token.type, token.address)
    //#endregion

    //#region amount
    const amount = new BigNumber(formatAmount(new BigNumber(_inputAmount ?? 0), token.decimals))
    //#endregion

    //#region blocking
    const [depositState, depositCallback, resetDepositCallback] = useDepositCallback(amount.toString())
    //#endregion

    //#region Swap
    const { setDialog: openSwapDialog } = useRemoteControlledDialog(
        PluginTraderMessages.swapDialogUpdated,
        useCallback(
            (ev) => {
                if (!ev.open) {
                    tokenBalanceRetry()
                }
            },
            [tokenBalanceRetry],
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
    }, [token])
    //#endregion

    //#region on close transaction dialog
    const { setDialog: setTransactionDialogOpen } = useRemoteControlledDialog(
        WalletMessages.events.transactionDialogUpdated,
        useCallback(
            (ev) => {
                if (!ev.open) {
                    tokenBalanceRetry()
                    openSwapDialog({ open: false })
                    if (
                        depositState.type === TransactionStateType.HASH ||
                        depositState.type === TransactionStateType.CONFIRMED
                    )
                        onDialogClose()
                }
                if (depositState.type === TransactionStateType.CONFIRMED) onDialogClose()
                resetDepositCallback()
            },
            [depositState],
        ),
    )
    //#endregion

    //#region open the transaction dialog
    useEffect(() => {
        if (!token || !open) return
        if (depositState.type === TransactionStateType.UNKNOWN) {
            return
        }

        setTransactionDialogOpen({
            open: true,
            state: depositState,
            summary: t('plugin_realitycards_deposit_summary', { amount: _inputAmount, symbol: token.symbol }),
        })
    }, [depositState, token, _inputAmount])
    //#endregion

    //#region submit button
    const validationMessage = useMemo(() => {
        if (!account) return t('plugin_wallet_connect_a_wallet')
        if (!amount || amount.isZero()) return t('wallet_transfer_error_amount_absence')
        if (amount.isGreaterThan(tokenBalance))
            return t('wallet_transfer_error_insufficient_balance', {
                symbol: token.symbol,
            })
        return ''
    }, [account, amount, token, tokenBalance])
    //#endregion

    if (!token) return null
    return (
        <InjectedDialog
            className={classes.root}
            open={open}
            onClose={onDialogClose}
            title={t('plugin_realitycards_deposit')}
            maxWidth="xs"
            sx={{ textTransform: 'uppercase' }}>
            <DialogContent>
                {errorTokenBalance ? (
                    <Typography className={classes.message} color="textPrimary">
                        {t('plugin_realitycards_error_something_went_wrong')}
                        <RefreshIcon className={classes.refresh} color="primary" onClick={tokenBalanceRetry} />
                    </Typography>
                ) : (
                    <>
                        <form className={classes.form} noValidate autoComplete="off">
                            <TokenAmountPanel
                                label="Amount"
                                amount={_inputAmount}
                                balance={tokenBalance ?? '0'}
                                token={token}
                                onAmountChange={setInputAmount}
                            />
                        </form>
                        <EthereumWalletConnectedBoundary>
                            {isZero(tokenBalance) || amount.isGreaterThan(tokenBalance) ? (
                                <ActionButton
                                    className={classes.button}
                                    fullWidth
                                    onClick={openSwap}
                                    variant="contained"
                                    loading={loadingTokenBalance}
                                    sx={{ textTransform: 'uppercase' }}>
                                    {t('plugin_realitycards_buy_token', { symbol: token.symbol })}
                                </ActionButton>
                            ) : (
                                <EthereumERC20TokenApprovedBoundary
                                    amount={amount.toFixed()}
                                    spender={REALITY_CARD_ADDRESS}
                                    token={token?.type === EthereumTokenType.ERC20 ? token : undefined}>
                                    <ActionButton
                                        className={classes.button}
                                        fullWidth
                                        disabled={!!validationMessage}
                                        onClick={depositCallback}
                                        variant="contained"
                                        loading={loadingTokenBalance}
                                        sx={{ textTransform: 'uppercase' }}>
                                        {validationMessage || t('plugin_realitycards_deposit')}
                                    </ActionButton>
                                </EthereumERC20TokenApprovedBoundary>
                            )}
                        </EthereumWalletConnectedBoundary>
                    </>
                )}
            </DialogContent>
        </InjectedDialog>
    )
}
