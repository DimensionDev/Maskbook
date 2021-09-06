import { Button, TextField } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import BigNumber from 'bignumber.js'
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { EthereumAddress } from 'wallet.ts'
import {
    EthereumTokenType,
    formatBalance,
    formatEthereumAddress,
    FungibleTokenDetailed,
    isGreaterThan,
    isZero,
    pow10,
    TransactionStateType,
    useTokenBalance,
    useTokenTransferCallback,
    Wallet,
} from '@masknet/web3-shared'
import { useI18N } from '../../../../utils'
import { useRemoteControlledDialog } from '@masknet/shared'
import { WalletMessages } from '../../../../plugins/Wallet/messages'
import { TokenAmountPanel } from '../../../../web3/UI/TokenAmountPanel'

const useTransferTabStyles = makeStyles()((theme) => ({
    root: {
        padding: theme.spacing(1),
    },
    button: {
        marginTop: theme.spacing(3),
    },
    maxChipRoot: {
        fontSize: 11,
        height: 21,
    },
    maxChipLabel: {
        paddingLeft: 6,
        paddingRight: 6,
    },
}))

interface TransferTabProps {
    wallet: Wallet
    token: FungibleTokenDetailed
    onClose: () => void
}

export function TransferTab(props: TransferTabProps) {
    const { token, onClose } = props

    const { t } = useI18N()
    const { classes } = useTransferTabStyles()
    const [amount, setAmount] = useState('')
    const [address, setAddress] = useState('')
    const [memo, setMemo] = useState('')

    // balance
    const { value: tokenBalance = '0', retry: tokenBalanceRetry } = useTokenBalance(
        token?.type ?? EthereumTokenType.Native,
        token?.address ?? '',
    )

    const onChangeAmount = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
        const _amount = ev.currentTarget.value
        if (_amount === '') setAmount('')
        if (/^\d+\.?\d*$/.test(_amount)) setAmount(_amount)
    }, [])

    //#region transfer tokens
    const transferAmount = new BigNumber(amount || '0').multipliedBy(pow10(token.decimals))
    const [transferState, transferCallback, resetTransferCallback] = useTokenTransferCallback(token.type, token.address)

    const onTransfer = useCallback(async () => {
        await transferCallback(transferAmount.toFixed(), address, undefined, memo)
    }, [transferCallback, transferAmount, address, memo])
    //#endregion

    //#region remote controlled transaction dialog
    const { setDialog: setTransactionDialog } = useRemoteControlledDialog(
        WalletMessages.events.transactionDialogUpdated,
        useCallback(
            (ev) => {
                if (ev.open) return
                resetTransferCallback()
                if (transferState.type !== TransactionStateType.HASH) return
                onClose()
                tokenBalanceRetry()
            },
            [transferState.type, tokenBalanceRetry],
        ),
    )

    // open the transaction dialog
    useEffect(() => {
        if (transferState.type === TransactionStateType.UNKNOWN) return
        setTransactionDialog({
            open: true,
            state: transferState,
            summary: `Transfer ${formatBalance(transferAmount, token.decimals ?? 0)} ${
                token.symbol
            } to ${formatEthereumAddress(address, 4)}.`,
        })
    }, [transferState /* update tx dialog only if state changed */])
    //#endregion

    //#region validation
    const validationMessage = useMemo(() => {
        if (!transferAmount || isZero(transferAmount)) return t('wallet_transfer_error_amount_absence')
        if (isGreaterThan(transferAmount, tokenBalance))
            return t('wallet_transfer_error_insufficient_balance', {
                token: token.symbol,
            })
        if (!address) return t('wallet_transfer_error_address_absence')
        if (!EthereumAddress.isValid(address)) return t('wallet_transfer_error_invalid_address')
        return ''
    }, [transferAmount, address, tokenBalance, token])
    //#endregion

    return (
        <div className={classes.root}>
            <TokenAmountPanel
                amount={amount}
                balance={tokenBalance}
                label={t('wallet_transfer_amount')}
                token={token}
                onAmountChange={setAmount}
                SelectTokenChip={{
                    readonly: true,
                }}
                MaxChipProps={{
                    classes: {
                        root: classes.maxChipRoot,
                        label: classes.maxChipLabel,
                    },
                }}
            />
            <TextField
                required
                label={t('wallet_transfer_to_address')}
                placeholder={t('wallet_transfer_to_address')}
                value={address}
                onChange={(ev) => setAddress(ev.target.value)}
            />
            <TextField
                label={t('wallet_transfer_memo')}
                placeholder={t('wallet_transfer_memo_placeholder')}
                value={memo}
                disabled={token.type === EthereumTokenType.ERC20}
                onChange={(ev) => setMemo(ev.target.value)}
            />
            <Button
                className={classes.button}
                variant="contained"
                color="primary"
                disabled={!!validationMessage || transferState.type === TransactionStateType.WAIT_FOR_CONFIRMING}
                onClick={onTransfer}>
                {validationMessage || t('wallet_transfer_send')}
            </Button>
        </div>
    )
}
