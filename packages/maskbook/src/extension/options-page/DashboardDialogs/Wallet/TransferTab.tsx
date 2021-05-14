import { Button, makeStyles, TextField } from '@material-ui/core'
import BigNumber from 'bignumber.js'
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { EthereumAddress } from 'wallet.ts'
import { useRemoteControlledDialog, useI18N } from '../../../../utils'
import { EthereumMessages } from '../../../../plugins/Ethereum/messages'
import type { WalletRecord } from '../../../../plugins/Wallet/database/types'
import { formatBalance, formatEthereumAddress } from '@dimensiondev/maskbook-shared'
import { useTokenBalance } from '../../../../web3/hooks/useTokenBalance'
import { useTokenTransferCallback } from '../../../../web3/hooks/useTokenTransferCallback'
import { TransactionStateType } from '../../../../web3/hooks/useTransactionState'
import type { NativeTokenDetailed, ERC20TokenDetailed } from '../../../../web3/types'
import { EthereumTokenType } from '../../../../web3/types'
import { TokenAmountPanel } from '../../../../web3/UI/TokenAmountPanel'

const useTransferTabStyles = makeStyles((theme) => ({
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
    wallet: WalletRecord
    token: NativeTokenDetailed | ERC20TokenDetailed
    onClose: () => void
}

export function TransferTab(props: TransferTabProps) {
    const { token, onClose } = props

    const { t } = useI18N()
    const classes = useTransferTabStyles()

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
        if (/^\d+[\.]?\d*$/.test(_amount)) setAmount(_amount)
    }, [])

    //#region transfer tokens
    const transferAmount = new BigNumber(amount || '0').multipliedBy(new BigNumber(10).pow(token.decimals))
    const [transferState, transferCallback, resetTransferCallback] = useTokenTransferCallback(
        token.type,
        token.address,
        transferAmount.toFixed(),
        address,
        memo,
    )

    const onTransfer = useCallback(async () => {
        await transferCallback()
    }, [transferCallback])
    //#endregion

    //#region remote controlled transaction dialog
    const { setDialog: setTransactionDialog } = useRemoteControlledDialog(
        EthereumMessages.events.transactionDialogUpdated,
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
        if (!transferAmount || new BigNumber(transferAmount).isZero()) return t('wallet_transfer_error_amount_absence')
        if (new BigNumber(transferAmount).isGreaterThan(tokenBalance))
            return t('wallet_transfer_error_insufficent_balance', {
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
