import { Button, makeStyles, TextField } from '@material-ui/core'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { EthereumAddress } from 'wallet.ts'
import type { TransactionConfig } from 'web3-core'
import { EthereumMessages } from '../../../../plugins/Ethereum/messages'
import type { WalletRecord } from '../../../../plugins/Wallet/database/types'
import { formatBalance, formatEthereumAddress } from '@dimensiondev/maskbook-shared'
import { useRemoteControlledDialog } from '../../../../utils/hooks/useRemoteControlledDialog'
import { useI18N } from '../../../../utils/i18n-next-ui'
import { CONSTANTS } from '../../../../web3/constants'
import { useAccount } from '../../../../web3/hooks/useAccount'
import { useChainId } from '../../../../web3/hooks/useBlockNumber'
import { useConstant } from '../../../../web3/hooks/useConstant'
import { useTokenBalance } from '../../../../web3/hooks/useTokenBalance'
import { useTokenTransferCallback } from '../../../../web3/hooks/useTokenTransferCallback'
import { TransactionStateType } from '../../../../web3/hooks/useTransactionState'
import type { ChainId, ERC20TokenDetailed, EtherTokenDetailed } from '../../../../web3/types'
import { EthereumTokenType } from '../../../../web3/types'
import { TokenAmountPanel } from '../../../../web3/UI/TokenAmountPanel'
import Services from '../../../service'
import Web3Utils from 'web3-utils'

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
    token: EtherTokenDetailed | ERC20TokenDetailed
    onClose: () => void
}

async function getFee(chainId: ChainId, account: string, address: string, amount: string) {
    const config: TransactionConfig = {
        from: account,
        to: address,
        value: amount,
    }
    const estimatedGas = await Services.Ethereum.estimateGas(config, chainId)
    const gasPrice = await Services.Ethereum.getGasPrice(chainId)

    return new BigNumber(estimatedGas).multipliedBy(gasPrice)
}

export function TransferTab(props: TransferTabProps) {
    const { token, onClose } = props

    const { t } = useI18N()
    const account = useAccount()
    const chainId = useChainId()

    const classes = useTransferTabStyles()

    const [amount, setAmount] = useState('')
    const [address, setAddress] = useState('')
    const [memo, setMemo] = useState('')
    const [insufficientBalance, setInsufficientBalance] = useState(false)

    // balance
    const { value: tokenBalance = '0', retry: tokenBalanceRetry } = useTokenBalance(
        token?.type ?? EthereumTokenType.Ether,
        token?.address ?? '',
    )

    const onChangeAmount = useCallback((amount: string) => {
        setInsufficientBalance(false)
        setAmount(amount)
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

    const ETH_ADDRESS = useConstant(CONSTANTS, 'ETH_ADDRESS')

    const onClick = useCallback(async () => {
        const fee = await getFee(chainId, account, ETH_ADDRESS, tokenBalance)
        const balance = new BigNumber(Web3Utils.toWei(formatBalance(tokenBalance, token.decimals), 'ether')).minus(fee)
        if (balance.isLessThan(0)) {
            setAmount('')
            setInsufficientBalance(true)
            return
        }
        setAmount(Web3Utils.fromWei(balance.toFixed()))
    }, [tokenBalance])

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
        if (insufficientBalance) {
            return t('wallet_transfer_error_insufficent_balance', { token: token.symbol })
        }
        if (!transferAmount || new BigNumber(transferAmount).isZero()) return t('wallet_transfer_error_amount_absence')
        if (new BigNumber(transferAmount).isGreaterThan(tokenBalance))
            return t('wallet_transfer_error_insufficent_balance', {
                token: token.symbol,
            })
        if (!address) return t('wallet_transfer_error_address_absence')
        if (!EthereumAddress.isValid(address)) return t('wallet_transfer_error_invalid_address')
        return ''
    }, [transferAmount, address, tokenBalance, token, insufficientBalance])
    //#endregion

    return (
        <div className={classes.root}>
            <TokenAmountPanel
                amount={amount}
                balance={tokenBalance}
                label={t('wallet_transfer_amount')}
                token={token}
                onAmountChange={onChangeAmount}
                SelectTokenChip={{
                    readonly: true,
                }}
                MaxChipProps={{
                    classes: {
                        root: classes.maxChipRoot,
                        label: classes.maxChipLabel,
                    },
                    onClick,
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
