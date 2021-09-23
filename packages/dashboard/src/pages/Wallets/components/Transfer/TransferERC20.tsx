import { MaskTextField } from '@masknet/theme'
import { Box, Button, Stack } from '@material-ui/core'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import {
    EthereumTokenType,
    FungibleTokenDetailed,
    isGreaterThan,
    isZero,
    pow10,
    TransactionStateType,
    useFungibleTokenBalance,
    useGasPrice,
    useTokenTransferCallback,
} from '@masknet/web3-shared'
import BigNumber from 'bignumber.js'
import { TokenAmountPanel } from '@masknet/shared'
import { SelectTokenDialog } from '../SelectTokenDialog'
import { useDashboardI18N } from '../../../../locales'
import { EthereumAddress } from 'wallet.ts'

interface TransferERC20Props {
    token: FungibleTokenDetailed
}

export const TransferERC20 = memo<TransferERC20Props>(({ token }) => {
    const t = useDashboardI18N()
    const [amount, setAmount] = useState('')
    const [address, setAddress] = useState('')
    const [memo, setMemo] = useState('')
    const [selectedToken, setToken] = useState<FungibleTokenDetailed>(token)
    const [isOpenSelectTokenDialog, openSelectTokenDialog] = useState(false)

    // gas price
    const { value: gasPrice = '0' } = useGasPrice()

    // balance
    const { value: tokenBalance = '0', retry: tokenBalanceRetry } = useFungibleTokenBalance(
        selectedToken?.type ?? EthereumTokenType.Native,
        selectedToken?.address ?? '',
    )

    // transfer amount
    const transferAmount = new BigNumber(amount || '0').multipliedBy(pow10(token.decimals)).toFixed()
    const maxAmount = useMemo(() => {
        let amount_ = new BigNumber(tokenBalance || '0')
        amount_ =
            selectedToken.type === EthereumTokenType.Native
                ? amount_.minus(new BigNumber(30000).multipliedBy(gasPrice))
                : amount_
        return amount_.toFixed()
    }, [tokenBalance, gasPrice, selectedToken?.type, amount])

    const [transferState, transferCallback, resetTransferCallback] = useTokenTransferCallback(
        selectedToken.type,
        selectedToken.address,
    )

    const onTransfer = useCallback(async () => {
        await transferCallback(
            new BigNumber(amount).multipliedBy(pow10(selectedToken.decimals)).toFixed(),
            address,
            undefined,
            memo,
        )
    }, [amount, address, memo, selectedToken.decimals, transferCallback])

    //#region validation
    const validationMessage = useMemo(() => {
        if (!transferAmount || isZero(transferAmount)) return t.wallets_transfer_error_amount_absence()
        if (isGreaterThan(new BigNumber(amount).multipliedBy(pow10(selectedToken.decimals)).toFixed(), maxAmount))
            return t.wallets_transfer_error_insufficient_balance({ symbol: selectedToken.symbol ?? '' })
        if (!address) return t.wallets_transfer_error_address_absence()
        if (!EthereumAddress.isValid(address)) return t.wallets_transfer_error_invalid_address()
        return ''
    }, [transferAmount, maxAmount, address, tokenBalance, selectedToken, amount])
    //#endregion

    useEffect(() => {
        if (transferState.type === TransactionStateType.FAILED || transferState.type === TransactionStateType.HASH) {
            setMemo('')
            setAddress('')
            setAmount('')
            resetTransferCallback()
        }
    }, [transferState])

    return (
        <Stack direction="row" justifyContent="center" mt={4}>
            <Stack maxWidth={640} minWidth={500} alignItems="center">
                <Box width="100%">
                    <MaskTextField
                        value={address}
                        onChange={(e) => setAddress(e.currentTarget.value)}
                        label={t.wallets_transfer_to_address()}
                    />
                </Box>
                <Box mt={2} width="100%">
                    <TokenAmountPanel
                        amount={amount}
                        maxAmount={maxAmount}
                        balance={tokenBalance}
                        label={t.wallets_transfer_amount()}
                        token={selectedToken}
                        onAmountChange={setAmount}
                        SelectTokenChip={{
                            loading: false,
                            ChipProps: {
                                onClick: () => openSelectTokenDialog(true),
                            },
                        }}
                    />
                </Box>
                <Box mt={2} width="100%">
                    <MaskTextField
                        value={memo}
                        placeholder={t.wallets_transfer_memo_placeholder()}
                        disabled={selectedToken.type === EthereumTokenType.ERC20}
                        onChange={(e) => setMemo(e.currentTarget.value)}
                        label={t.wallets_transfer_memo()}
                    />
                </Box>
                <Box mt={4}>
                    <Button
                        sx={{ width: 240 }}
                        disabled={
                            !!validationMessage || transferState.type === TransactionStateType.WAIT_FOR_CONFIRMING
                        }
                        onClick={onTransfer}>
                        {validationMessage || t.wallets_transfer_send()}
                    </Button>
                </Box>
            </Stack>
            {isOpenSelectTokenDialog && (
                <SelectTokenDialog
                    onSelect={(token) => {
                        setToken(token!)
                        openSelectTokenDialog(false)
                    }}
                    open={isOpenSelectTokenDialog}
                    onClose={() => openSelectTokenDialog(false)}
                />
            )}
        </Stack>
    )
})
